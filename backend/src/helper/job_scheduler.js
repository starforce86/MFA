const log = require('./logger').getLogger('job_scheduler');
const Agenda = require('agenda');
const Agendash = require('agendash');
const config = require('../config/config');
const cluster = require('cluster');
const stripe = require('../helper/StripeHelper');
const prisma = require('../helper/prisma_helper').prisma;
const userResolver = require('../resolver/user');
const moment = require('moment');

function getAgenda(expressServer = null, protectAccessMiddleware = null) {
    const agenda = new Agenda();
    agenda.database(`${config.mongodb.host}:${config.mongodb.port}/${config.job_scheduler.database_name}`, null, {
        useNewUrlParser: true
    });
    agenda.processEvery(config.job_scheduler.process_every);
    agenda.defaultLockLifetime(config.job_scheduler.timeout_in_ms);

    if (config.job_scheduler.enable_web_interface && expressServer) {
        expressServer.use(config.job_scheduler.web_interface_path, protectAccessMiddleware, Agendash(agenda));
    }

    addGracefulExitHandler(agenda);
    return agenda;
}

function addGracefulExitHandler(agenda) {
    async function gracefulExit() {
        log.debug('Graceful agenda exit...');
        await agenda.stop();
        process.exit(0);
    }

    if (cluster.isWorker) {
        cluster.worker.on('exit', gracefulExit);
        cluster.worker.on('disconnect', gracefulExit);
    }

    process.on('SIGTERM', gracefulExit);
    process.on('SIGINT', gracefulExit);
}

const agenda = getAgenda();

(async () => {
    await agenda.start();
})();

async function addUserCheckPurchaseEvent(user_id) {
    log.trace(`addUserCheckPurchaseEvent(${user_id})`);

    const task_name = `check_user_purchase_${user_id}`;
    agenda.define(task_name, async (job, done) => {
        const {user_id} = job.attrs.data;
        try {
            const customer_id = await prisma.user({id: user_id}).stripe_customer_id();
            const subs = await stripe.isSubscriptionActive(customer_id);
            log.trace(`Check purchase job: ${task_name}, result: ${subs}`);
            await prisma.updateUser({
                where: {id: user_id},
                data: {billing_subscription_active: subs.result, stripe_subsciption_json: subs.json}
            });
        } catch (e) {
            log.error('Check purchase job error:', e);
            await prisma.updateUser({
                where: {id: user_id},
                data: {billing_subscription_active: false, stripe_subsciption_json: null}
            });
        } finally {
            done();
        }
    });

    await agenda.every('1 hour', task_name, {user_id: user_id});
}

async function removeUserCheckPurchaseEvent(user_id) {
    const task_name = `check_user_purchase_${user_id}`;
    return await agenda.cancel({name: task_name});
}

async function addPullChargeHistoryEvent() {
    log.trace(`addPullChargeHistoryEvent`);

    const task_name = `pull_charge_history`;
    agenda.define(task_name, async (job, done) => {
        try {
            const charges = await stripeHelper.getCharges();

            for (charge of charges.data) {

                // if (charge.paid == true) {

                    const users = await prisma.users({where: {stripe_customer_id: charge.customer}});

                    if(users && users.length > 0) {

                        const user = users[0];

                        const histories = await prisma.chargeHistories({where: {chargeId: charge.id}});

                        if (!histories || histories.length == 0) {

                            await prisma.createChargeHistory({
                                amount: charge.amount,
                                user: {
                                    connect: {id: user.id}
                                },
                                chargeDate: moment(charge.created * 1000),
                                chargeId: charge.id,
                                paid: charge.paid,
                                refunded: charge.refunded,
                                status: charge.status,
                                charge_json: JSON.stringify(charge)
                            });
                        }
                    }
                // }
            }

            log.trace(`PullChargeHistory job: ${task_name}`);
        } catch (e) {
            log.error('PullChargeHistory job error:', e);
        } finally {
            done();
        }
    });

    await agenda.every(config.job_scheduler.process_every_generate_transfer_plan, task_name);
}

async function addPopulateTransferPlanEvent() {
    log.trace(`addPopulateTransferPlanEvent`);

    const task_name = `populate_transfer_plan`;
    agenda.define(task_name, async (job, done) => {
        try {

            log.trace(`Populate transfer plan job: ${task_name}`);
        } catch (e) {
            log.error('Populate transfer plan job error:', e);
        } finally {
            done();
        }
    });

    await agenda.every(config.job_scheduler.process_every_generate_transfer_plan, task_name);
}

async function addTransferEvent() {
    log.trace(`addTransferEvent`);

    const task_name = `transfer`;
    agenda.define(task_name, async (job, done) => {
        try {
            // const result = await userResolver.transfer();

            const year = parseInt(moment().subtract(1, 'M').format('YYYY'));
            const month = parseInt(moment().subtract(1, 'M').format('MM'));

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
                                const result = await stripe.transfer(transferAmount, artist.stripe_customer_id);
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

            log.trace(`transfer job: ${task_name}`);
        } catch (e) {
            log.error('transfer job error:', e);
        } finally {
            done();
        }
    });

    await agenda.every(config.job_scheduler.process_every_transfer, task_name);
}

module.exports = {
    getAgenda: getAgenda,
    addUserCheckPurchaseEvent: addUserCheckPurchaseEvent,
    removeUserCheckPurchaseEvent: removeUserCheckPurchaseEvent,
    addPopulateTransferPlanEvent: addPopulateTransferPlanEvent,
    addTransferEvent: addTransferEvent,
    addPullChargeHistoryEvent: addPullChargeHistoryEvent
};
