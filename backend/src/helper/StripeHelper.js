const config = require('../config/config');
const stripe = require("stripe")(config.stripe.sk_token);
const log = require('./logger').getLogger('StripeHelper');
const _ = require('lodash');

async function createCustomer(stripe_tok_token, email) {
    return await stripe.customers.create({
        email: email,
        source: stripe_tok_token
    });
}

async function subscribeUser(customer_id, planId) {
    return await stripe.subscriptions.create({
        customer: customer_id,
        items: [{plan: planId}],
    });
}

async function unsubscribeUser(sub_id) {
    return await stripe.subscriptions.del(sub_id);
}

async function isSubscriptionActive(customer_id) {
    log.trace(`isSubscriptionActive(${customer_id})`);
    const customer = await stripe.customers.retrieve(customer_id);
    log.trace(`isSubscriptionActive(${customer_id}) customer:`, JSON.stringify(customer));

    let result = {
        result: false,
        json: null
    };
    customer.subscriptions.data.forEach(item => {
        if (item.status.toLowerCase() === 'active') {
            result.result = true;
            result.json = item
        }
    });

    return result;
}

async function getLast4(customer_id) {
    const customer = await stripe.customers.retrieve(customer_id);
    const last4 = _.get(customer, 'sources.data[0].last4', '');
    log.trace(`last4(${customer_id}):`, last4);
    return last4;
}

async function changeCard(customerId, newToken) {
    return await stripe.customers.update(customerId, {
        source: newToken,
    });
}

module.exports = {
    createCustomer: createCustomer,
    changeCard: changeCard,
    subscribeUser: subscribeUser,
    unsubscribeUser: unsubscribeUser,
    isSubscriptionActive: isSubscriptionActive,
    getLast4: getLast4,
};
