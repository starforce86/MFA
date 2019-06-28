const log = require('./logger').getLogger('job_scheduler');
const Agenda = require('agenda');
const Agendash = require('agendash');
const config = require('../config/config');
const cluster = require('cluster');
const stripe = require('../helper/StripeHelper');
const prisma = require('../helper/prisma_helper').prisma;

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

module.exports = {
    getAgenda: getAgenda,
    addUserCheckPurchaseEvent: addUserCheckPurchaseEvent,
    removeUserCheckPurchaseEvent: removeUserCheckPurchaseEvent,
};
