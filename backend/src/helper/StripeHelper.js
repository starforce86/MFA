const config = require('../config/config');
const stripe = require("stripe")(config.stripe.sk_token);
const log = require('./logger').getLogger('StripeHelper');
const _ = require('lodash');
const moment = require('moment');

async function getCharges() {
    return await stripe.charges.list({limit: 100});
}

async function getSubscriptions() {
    return await stripe.subscriptions.list({limit: 100});
}

async function createCustomer(stripe_tok_token, email, metadata) {
    return await stripe.customers.create({
        email: email,
        source: stripe_tok_token,
        metadata: metadata
    });
}

async function subscribeUser(customer_id, planId, metadata) {
    return await stripe.subscriptions.create({
        customer: customer_id,
        items: [{plan: planId}],
        metadata: metadata
    });
}

async function unsubscribeUser(sub_id) {
    return await stripe.subscriptions.del(sub_id);
}

async function transfer(amount, destination) {
    return await stripe.transfers.create({
        amount: amount,
        currency: "usd",
        destination: destination
    });
}

async function createCustomConnectAccount(firstname, lastname, email, birthdate, phone, external_account, account_number, routing_number, token, ssn, product_description, tos_ip) {
    if (external_account == "BANK_ACCOUNT") {
        const data = {
            type: 'custom',
            country: 'US',
            business_type: 'individual',
            email: email,
            individual: {
                first_name: firstname,
                last_name: lastname,
                email: email,
                phone: phone,
                dob: {
                    year: moment(birthdate).format('YYYY'),
                    month: moment(birthdate).format('MM'),
                    day: moment(birthdate).format('DD')
                },
                ssn_last_4: ssn
            },
            external_account: {
                object: 'bank_account',
                country: 'US',
                currency: 'usd',
                account_number: account_number,
                routing_number: routing_number
            },
            requested_capabilities: [
                'transfers',
            ],
            tos_acceptance: {
                date: moment().unix(),
                ip: tos_ip
            },
            business_profile: {
                product_description: product_description
            }
        };
        return await stripe.accounts.create(data);
    } else {
        const data = {
            type: 'custom',
            country: 'US',
            business_type: 'individual',
            email: email,
            individual: {
                first_name: firstname,
                last_name: lastname,
                email: email,
                phone: phone,
                dob: {
                    year: moment(birthdate).format('YYYY'),
                    month: moment(birthdate).format('MM'),
                    day: moment(birthdate).format('DD')
                },
                ssn_last_4: ssn
            },
            external_account: token,
            requested_capabilities: [
                'transfers',
            ],
            tos_acceptance: {
                date: moment().unix(),
                ip: tos_ip
            },
            business_profile: {
                product_description: product_description
            }
        };
        return await stripe.accounts.create(data);
    }
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
    getCharges: getCharges,
    getSubscriptions: getSubscriptions,
    createCustomConnectAccount: createCustomConnectAccount,
    transfer: transfer
};
