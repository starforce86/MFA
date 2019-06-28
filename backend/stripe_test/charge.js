const stripe = require("stripe")("sk_test_32950IcpD4TkM7p7xZskKMmA00Bvx5Yzum");

const token = 'tok_1EKolHHKXDvt1ZT0byCvayLb';

async function makeSubs() {
    const email = 'b22f8d80b9@mailboxy.fun';

    const product = await stripe.products.create({
        name: 'Weekly Car Wash Service',
        type: 'service',
    });

    const plan = await stripe.plans.create({
        nickname: "Standard Monthly",
        product: product.id,
        amount: 100,
        currency: "usd",
        interval: "month",
        usage_type: "licensed",
    });

    // const source = await stripe.sources.create({
    //     type: 'card',
    //     currency: 'usd',
    //     owner: {
    //         email: email
    //     }
    // });

    const customer = await stripe.customers.create({
        email: email,
        source: 'card_1EKrrgHKXDvt1ZT0tYjLcg00'//source.id,
    });

    const subs = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    plan: plan.id,
                    quantity: 2,
                },
            ]
        }
    );

    const invoiceItem = await stripe.invoiceItems.create({
        amount: 30,
        subscription: subs.id,
        currency: 'usd',
        customer: customer.id,
        description: 'One-time setup fee',
    });

    const invoice = await stripe.invoices.create({
        customer: customer.id,
        billing: 'charge_automatically',
        // due_date: 1554266703
    });

    console.log({invoice});
    // const sendInvoice = await stripe.invoices.sendInvoice(invoice.id);
    //
    // console.log({sendInvoice});
}

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
    const customer = await stripe.customers.retrieve(customer_id);

    let result = false;
    customer.subscriptions.data.forEach(item => {
        if (item.status.toLowerCase() === 'active') {
            result = true;
        }
    });

    return result;
}

async function f() {
    const customerId = 'cus_EoVwa3VaBnsZ7I'; //uxname@gmail.com
    const sourceId = 'card_1EKt0cHKXDvt1ZT0vXQLDv6X'; //visa 42
    const productId = 'prod_EoW8P5JXWsCsmC';
    const planId = 'plan_EoWWUP8CrYGuWl';
    const subscriptionId = 'sub_EoWAcJi6UKyVxL';

    const customer = await stripe.customers.retrieve(customerId);

    console.log(customer.subscriptions.data);

    // const subscription = await stripe.subscriptions.create({
    //     customer: customerId,
    //     items: [{plan: planId}],
    // });

    // console.log({subscription});
}

(async () => {
    const planId = 'plan_EoWWUP8CrYGuWl';

    const customer = await createCustomer('tok_1ENmVIHKXDvt1ZT0OhQI3wHF', `test_acc_${Math.random().toString()}@mail.com`);
    console.log({customer});
    const subs = await subscribeUser(customer.id, planId);
    console.log({subs});
    const isSubscribed = await isSubscriptionActive(customer.id);
    console.log({isSubscribed});
    const unsub = await unsubscribeUser(subs.id);
    console.log({unsub})


    // await makeSubs();

    // await f();

    // return;

    // const source = await stripe.sources.create({
    //     type: 'ach_credit_transfer',
    //     currency: 'usd',
    //     owner: {
    //         email: 'jenny.rosen@example.com'
    //     }
    // });
    //
    // const product = await stripe.products.create({
    //     name: 'My SaaS Platform',
    //     type: 'service',
    // });
    //
    // const plan = await stripe.plans.create({
    //     product: product.id,
    //     nickname: 'SaaS Platform USD',
    //     currency: 'usd',
    //     interval: 'month',
    //     amount: 10000,
    // });
    //
    // const customer = await stripe.customers.create({
    //     email: 'jenny.rosen@example.com',
    //     source: source.id,
    // });
    //
    // const subscription = await stripe.subscriptions.create({
    //     customer: customer.id,
    //     items: [{plan: plan.id}],
    // });
    //
    // console.log({source, product, plan, customer, subscription});
})();
