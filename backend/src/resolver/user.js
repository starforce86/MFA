const log = require('../helper/logger').getLogger('user_resolver');
const prisma = require('../helper/prisma_helper').prisma;
const userCore = require('../core/user');
const GQLError = require('../helper/GQLError');
const emailHelper = require('../helper/email_helper');
const password_helper = require('../helper/password_helper');
const token = require('../helper/token');
const stripeHelper = require('../helper/StripeHelper');
const job_scheduler = require('../helper/job_scheduler');
const config = require('../config/config');
const stripe = require("stripe")(config.stripe.sk_token);
const moment = require('moment');

async function signUp(root, {email, firstname, lastname, phone, password, promo_code, step, activation_code, role, external_account_type, account_number, routing_number, token, birthdate, ssn}, ctx, info) {
    return userCore.signUp(email, firstname, lastname, phone, password, promo_code, step, activation_code, role, external_account_type, account_number, routing_number, token, birthdate, ssn, ctx.userIp);
}

async function signIn(root, {email, password}, ctx, info) {
    return userCore.signIn(email, password);
}

async function change_password(root, {old_password, new_password}, ctx, info) {
    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }
    const userId = ctx.user.id;
    return userCore.change_password(userId, old_password, new_password);
}

async function changePromoCode(root, {promo_code}, ctx, info) {
    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }
    const userId = ctx.user.id;
    return userCore.changePromoCode(userId, promo_code);
}

async function restore_password(root, {email, restore_code, new_password, step}, ctx, info) {
    const userExists = await prisma.$exists.user({
        email: email
    });

    if (!userExists) {
        throw new GQLError({message: 'User not found', code: 404});
    }

    if (step === 'GENERATE_RESTORE_CODE') {
        const result = await emailHelper.generateRestoreCode(email);

        await emailHelper.sendRestoreEmail(email, result.code);

        return {
            status: 'ok'
        };
    } else if (step === 'CHECK_RESTORE_CODE') {
        if (!new_password) {
            throw new GQLError({message: 'Password is required', code: 400});
        }

        const email_verified = await emailHelper.verityRestoreCode(email, restore_code);
        if (!email_verified) {
            throw new GQLError({message: 'Wrong restore code', code: 403});
        } else {
            const user = await prisma.user({email: email});

            const password_hash = await password_helper.hashPassword(new_password, user.password_salt);

            const result = await prisma.updateUser({
                where: {email: email},
                data: {password_hash: password_hash}
            }).$fragment(`
                {
                    id
                    createdAt
                    updatedAt
                    email
                    role
                    avatar
                    last_login_date
                }
            `);

            return {
                token: token.createToken(result),
                user: result
            };
        }
    } else {
        return false;
    }
}

async function purchase(root, {stripe_tok_token, plan}, ctx, info) {
    
    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }
    log.trace(`Stripe purchase: ${ctx.user.id} (${ctx.user.email})`);

    const user = await prisma.user({email: ctx.user.email});

    await job_scheduler.addUserCheckPurchaseEvent(user.id);

    const stripe_metadata = {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        phone: user.phone
    };

    const customer_id = !user.stripe_customer_id ? (await stripeHelper.createCustomer(stripe_tok_token, ctx.user.email, stripe_metadata)).id : user.stripe_customer_id;

    await prisma.updateUser({where: {email: ctx.user.email}, data: {stripe_customer_id: customer_id}});

    // const isSubsActive = await stripeHelper.isSubscriptionActive(customer_id).result;
    const customer = await stripe.customers.retrieve(customer_id);

    let isSubsActive = false;
    customer.subscriptions.data.forEach(item => {
        if (item.status.toLowerCase() === 'active') {
            isSubsActive = true;
        }
    });

    if (isSubsActive) {
        log.trace('Resubscribe');

        await stripeHelper.changeCard(customer_id, stripe_tok_token);

        if (!user.stripe_subsciption_json && customer.subscriptions.data.length == 0) throw new GQLError({ message: 'You have not any subscriptions' });
        let subs_id;
        if(user.stripe_subsciption_json) {
            subs_id = user.stripe_subsciption_json.id;
        }
        else {
            customer.subscriptions.data.forEach(item => {
                if (item.plan.id == config.stripe.plans.monthly_plan_id || item.plan.id == config.stripe.plans.yearly_plan_id) {
                    subs_id = item.id;
                }
            });
        }
        const result = await stripeHelper.unsubscribeUser(subs_id);
        if (result.status !== 'canceled') throw new GQLError({ message: "Stripe unsubscribe result status != 'canceled'" });
    }

    let STRIPE_PLAN_ID = '';
    switch (plan) {
        case 'MONTHLY':
            STRIPE_PLAN_ID = config.stripe.plans.monthly_plan_id;
            break;
        case 'YEARLY':
            STRIPE_PLAN_ID = config.stripe.plans.yearly_plan_id;
            break;
        default:
            throw new GQLError({message: 'Wrong plan', code: 400});
    }

    const subscription = await stripeHelper.subscribeUser(customer_id, STRIPE_PLAN_ID, stripe_metadata);
    log.trace('New Stripe subscription: ', subscription);

    await prisma.updateUser({
        where: {email: ctx.user.email},
        data: {
            billing_subscription_active: true,
            stripe_subsciption_json: JSON.parse(JSON.stringify(subscription)) //parse(stringify) hack for check circular json
        }
    });

    const result = await stripeHelper.isSubscriptionActive(customer_id);
    return result.result;
}

async function delete_subscription(root, args, ctx, info) {
    log.trace(`Stripe delete_subscription: ${ctx.user.id} (${ctx.user.email})`);

    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }

    const user = await prisma.user({email: ctx.user.email});

    if (!user.stripe_subsciption_json) throw new GQLError({message: 'You have not any subscriptions'});

    log.trace('stripe_subsciption_json', user.stripe_subsciption_json);

    const subs_id = user.stripe_subsciption_json.id;

    const result = await stripeHelper.unsubscribeUser(subs_id);

    if (result.status !== 'canceled') throw new GQLError({message: "Stripe unsubscribe result status != 'canceled'"});

    await prisma.updateUser({
        where: {email: ctx.user.email},
        data: {
            stripe_customer_id: null,
            stripe_subsciption_json: null,
            billing_subscription_active: false
        }
    });

    const isSubsActive = await stripeHelper.isSubscriptionActive(user.stripe_customer_id).result;

    if (!isSubsActive) {
        log.trace('isSubsActive === false');
        return true;
    } else {
        throw new GQLError({message: "Check 'isSubsActive' after cancel error"})
    }
}

async function isPurchaseActive(root, args, ctx, info) {
    log.trace(`Stripe isPurchaseActive: ${ctx.user.id} (${ctx.user.email})`);

    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }

    const user = await prisma.user({email: ctx.user.email});

    if (!user.stripe_customer_id) return false;
    return user.billing_subscription_active;
}

async function isPayExpiredForVideo(root, args, ctx, info) {
    log.trace(`isPayExpiredForVideo: ${ctx.user.id} (${ctx.user.email})`);

    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }

    const user = await prisma.user({email: ctx.user.email});

    const charges = await prisma.chargeHistories({
        where: {
            user: {id: user.id},
            refunded: false
        },
        orderBy: 'chargeDate_DESC'
    });
    if (charges && charges.length > 0) {
        const last_charge = charges[0];
        let expire_date = moment(last_charge.chargeDate).add(moment.duration(1, 'months'));
        if (parseInt(last_charge.amount) > 3000) {
            expire_date = moment(last_charge.chargeDate).add(moment.duration(1, 'years'));
        }
        const cur_date = moment();
        if (cur_date <= expire_date) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

async function changeCard(root, args, ctx, info) {
    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }

    const {newStripeTokToken} = args;

    log.trace(`changeCard: ${ctx.user.id} (${ctx.user.email}) ${newStripeTokToken}`);

    const user = await prisma.user({email: ctx.user.email});

    if (!user.stripe_customer_id) {
        // throw new GQLError({message: 'Stripe customer id not found in DB', code: 404});
        try {
            const stripe_metadata = {
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                phone: user.phone
            };
            const customer_id = (await stripeHelper.createCustomer(newStripeTokToken, ctx.user.email, stripe_metadata)).id;
            await prisma.updateUser({where: {email: ctx.user.email}, data: {stripe_customer_id: customer_id}});
            return true;
        } catch (e) {
            log.error('Change card error:', e);
            return false;
        }
    } else {
        try {
            await stripeHelper.changeCard(user.stripe_customer_id, newStripeTokToken);
            return true
        } catch (e) {
            log.error('Change card error:', e);
            return false;
        }
    }
}

async function addWatchedVideo(root, args, ctx, info) {
    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }

    const { videoId } = args;

    const user = await prisma.user({email: ctx.user.email});

    try {
        let watchedVideos = await prisma
            .user({ id: ctx.user.id })
            .watched_videos();
        watchedVideos = await Promise.all(watchedVideos.map(async (d) => {
            d.video = await prisma
                .watchedVideoUser({ id: d.id })
                .video();
            return d;
        }));
        const watchedVideo = watchedVideos.find(v => v.video && v.video.id == videoId);
        if (!watchedVideo) {
            await prisma.createWatchedVideoUser({
                watched_seconds: watchedSeconds,
                user: {
                    connect: { id: ctx.user.id }
                },
                video: {
                    connect: { id: videoId }
                }
            });
        }
        
        return true;
    } catch (e) {
        log.error('addWatchedVideo error:', e);
        return false;
    }
}

async function updateWatchedVideo(root, args, ctx, info) {
    if (!ctx.user || !ctx.user.id) {
        throw new GQLError({message: 'Unauthorized', code: 401});
    }

    const { videoId, watchedSeconds } = args;

    const user = await prisma.user({email: ctx.user.email});

    try {
        let watchedVideos = await prisma
            .user({ id: ctx.user.id })
            .watched_videos();
        watchedVideos = await Promise.all(watchedVideos.map(async (d) => {
            d.video = await prisma
                .watchedVideoUser({ id: d.id })
                .video();
            return d;
        }));
        const watchedVideo = watchedVideos.find(v => v.video && v.video.id == videoId);
        if (watchedVideo) {
            await prisma.updateWatchedVideoUser({
                data: { 
                    watched_seconds: watchedSeconds,
                    user: {
                        connect: { id: ctx.user.id }
                    },
                    video: {
                        connect: { id: videoId }
                    }
                },
                where: {
                    id: watchedVideo.id
                }
            });
        } else {
            await prisma.createWatchedVideoUser({
                watched_seconds: watchedSeconds,
                user: {
                    connect: { id: ctx.user.id }
                },
                video: {
                    connect: { id: videoId }
                }
            });
        }
        
        return true;
    } catch (e) {
        log.error('updateWatchedVideo error:', e);
        return false;
    }
}

async function watchedVideoUser(root, args, ctx, info) {

    const { id, myId } = args.where;

    try {
        let watchedVideos = await prisma
            .user({ id: myId })
            .watched_videos();
        if(!watchedVideos) {
            return null;
        }
        watchedVideos = await Promise.all(watchedVideos.map(async (d) => {
            d.video = await prisma
                .watchedVideoUser({ id: d.id })
                .video();
            return d;
        }));
        const watchedVideo = watchedVideos.find(v => v.video && v.video.id == id);
        if (watchedVideo) {
            return await prisma.watchedVideoUser({ id: watchedVideo.id });
        } 
        return null;
    } catch (e) {
        log.error('watchedVideoUser error:', e);
        return null;
    }
}

async function populateTransferPlan(root, args, ctx, info) {
    try {
        const year = parseInt(moment().format('YYYY'));
        const month = parseInt(moment().format('MM'));

        const artists = await prisma.users({
            where: {
                role: 'USER_PUBLISHER',
                approved: true
            }
        });
        artists.forEach(async artist => {
            const users = await prisma.user({id: artist.id}).users();
            users.forEach(async subscriber => {
                const transferPlans = await prisma.transferPlans({
                    where: {
                        artist: { id: artist.id },
                        subscriber: { id: subscriber.id }
                    }
                });
                if (transferPlans.length < artist.payout_months_left) {
                    const curMonthTransferPlan = await prisma.transferPlans({
                        where: {
                            artist: { id: artist.id },
                            subscriber: { id: subscriber.id },
                            year: year,
                            month: month,
                        }
                    });
                    if (curMonthTransferPlan.length == 0) {
                        if (subscriber.billing_subscription_active) {
                            await prisma.createTransferPlan({
                                artist: {
                                    connect: { id: artist.id }
                                },
                                subscriber: {
                                    connect: { id: subscriber.id }
                                },
                                year: year,
                                month: month,
                                amount: artist.payout_amount,
                                ignore_status: false,
                                paid_status: false
                            }); 
                        }
                    } else {
                        if (subscriber.billing_subscription_active) {
                            await prisma.updateManyTransferPlans({
                                where: {
                                    artist: { id: artist.id },
                                    subscriber: { id: subscriber.id },
                                    year: year,
                                    month: month,
                                    paid_status: false
                                },
                                data: {
                                    ignore_status: false
                                }
                            });
                        } else {
                            await prisma.updateManyTransferPlans({
                                where: {
                                    artist: { id: artist.id },
                                    subscriber: { id: subscriber.id },
                                    year: year,
                                    month: month,
                                    paid_status: false
                                },
                                data: {
                                    ignore_status: true
                                }
                            });
                        }
                    }
                }
            });
        });
        return true;
    } catch (e) {
        log.error('populateTransferPlan error:', e);
        return false;
    }
}

async function transfer(root, args, ctx, info) {
    try {
        const prev_year = parseInt(moment().subtract(1, 'M').format('YYYY'));
        const prev_month = parseInt(moment().subtract(1, 'M').format('MM'));

        let { year, month } = args;
        
        year = parseInt(year);
        month = parseInt(month);

        const inputDate = moment(`${year}-${month}-01`);
        const prevDate = moment(`${prev_year}-${prev_month}-01`);

        if (inputDate > prevDate) {
            throw new GQLError({message: `Not allowed to payout for ${year}-${month}`, code: 401});
        }

        const artists = await prisma.users({
            where: {
                role: 'USER_PUBLISHER'
            }
        });
        artists.forEach(async artist => {
            const users = await prisma.user({id: artist.id}).users();
            if (users.length > 0) {
                const transferTransactions = await prisma.transferTransactions({
                    where: {
                        artist: { id: artist.id },
                        year: year,
                        month: month
                    }
                });
                if (transferTransactions.length == 0) {
                    const transferPlans = await prisma.transferPlans({
                        where: {
                            artist: { id: artist.id },
                            year: year,
                            month: month,
                            ignore_status: false,
                            paid_status: false
                        }
                    });
                    let transferAmount = 0;
                    transferPlans.forEach(tp => {
                        transferAmount += tp.amount;
                    });
    
                    if (transferAmount > 0 && artist.stripe_customer_id) {
                        try {
                            const result = await stripeHelper.transfer(transferAmount, artist.stripe_customer_id);
                            if (result) {
                                await prisma.createTransferTransaction({
                                    artist: {
                                        connect: { id: artist.id }
                                    },
                                    year: year,
                                    month: month,
                                    amount: transferAmount,
                                    paid_status: false,
                                    paid_date: moment().format('YYYY-MM-DD')
                                });

                                transferPlans.forEach(async tp => {
                                    await prisma.updateTransferPlan({
                                        where: { id: tp.id },
                                        data: {
                                            paid_status: true,
                                            paid_date: moment().format('YYYY-MM-DD')
                                        }
                                    });
                                });
                            }
                        } catch (error) {
                            log.error(`stripeHelper.transfer fail: (${artist.id}:${artist.stripe_customer_id}:${year}:${month}:${transferAmount}:${transferPlans.length})${error.message}`);
                        }
                    }
                }
            }
        });
        return true;
    } catch (e) {
        log.error('populateTransferPlan error:', e);
        return false;
    }
}

module.exports = {
    signUp: signUp,
    change_password: change_password,
    changePromoCode: changePromoCode,
    restore_password: restore_password,
    purchase: purchase,
    changeCard: changeCard,
    delete_subscription: delete_subscription,
    isPurchaseActive: isPurchaseActive,
    isPayExpiredForVideo: isPayExpiredForVideo,
    signIn: signIn,
    addWatchedVideo: addWatchedVideo,
    updateWatchedVideo: updateWatchedVideo,
    watchedVideoUser: watchedVideoUser,
    populateTransferPlan: populateTransferPlan,
    transfer: transfer
};
