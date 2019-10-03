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

async function signUp(root, {email, firstname, lastname, phone, password, promo_code, step, activation_code, role}, ctx, info) {
    return userCore.signUp(email, firstname, lastname, phone, password, promo_code, step, activation_code, role);
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

module.exports = {
    signUp: signUp,
    change_password: change_password,
    restore_password: restore_password,
    purchase: purchase,
    changeCard: changeCard,
    delete_subscription: delete_subscription,
    isPurchaseActive: isPurchaseActive,
    signIn: signIn,
    addWatchedVideo: addWatchedVideo,
    updateWatchedVideo: updateWatchedVideo,
    watchedVideoUser: watchedVideoUser
};
