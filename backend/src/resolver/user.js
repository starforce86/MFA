const log = require('../helper/logger').getLogger('user_resolver');
const prisma = require('../helper/prisma_helper').prisma;
const userCore = require('../core/user');
const GQLError = require('../helper/GQLError');
const emailHelper = require('../helper/email_helper');
const password_helper = require('../helper/password_helper');
const token = require('../helper/token');
const stripe = require('../helper/StripeHelper');
const job_scheduler = require('../helper/job_scheduler');
const config = require('../config/config');

async function signUp(root, {email, firstname, lastname, phone, password, step, activation_code, role}, ctx, info) {
    return userCore.signUp(email, firstname, lastname, phone, password, step, activation_code, role);
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

    const customer_id = !user.stripe_customer_id ? (await stripe.createCustomer(stripe_tok_token, ctx.user.email)).id : user.stripe_customer_id;

    await prisma.updateUser({where: {email: ctx.user.email}, data: {stripe_customer_id: customer_id}});

    const isSubsActive = await stripe.isSubscriptionActive(customer_id).result;

    if (isSubsActive) {
        log.trace('isSubsActive === true');
        return true;
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

    const subscription = await stripe.subscribeUser(customer_id, STRIPE_PLAN_ID);
    log.trace('New Stripe subscription: ', subscription);

    await prisma.updateUser({
        where: {email: ctx.user.email},
        data: {
            billing_subscription_active: true,
            stripe_subsciption_json: JSON.parse(JSON.stringify(subscription)) //parse(stringify) hack for check circular json
        }
    });

    return await stripe.isSubscriptionActive(customer_id).result;
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

    const result = await stripe.unsubscribeUser(subs_id);

    if (result.status !== 'canceled') throw new GQLError({message: "Stripe unsubscribe result status != 'canceled'"});

    await prisma.updateUser({
        where: {email: ctx.user.email},
        data: {
            stripe_customer_id: null,
            stripe_subsciption_json: null,
            billing_subscription_active: false
        }
    });

    const isSubsActive = await stripe.isSubscriptionActive(user.stripe_customer_id).result;

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
    log.trace(`changeCard: ${ctx.user.id} (${ctx.user.email})`);

    const {newStripeTokToken} = args;

    const user = await prisma.user({email: ctx.user.email});

    if (!user.stripe_customer_id) {
        throw new GQLError({message: 'Stripe customer id not found in DB', code: 404});
    }

    try {
        await stripe.changeCard(user.stripe_customer_id, newStripeTokToken);
        return true
    } catch (e) {
        log.error('Change card error:', e);
        return false;
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
    signIn: signIn
};
