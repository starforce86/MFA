const log4js = require('log4js');
const config = require('../config/config');
const cluster = require('cluster');
const machineId = require('./machine_id');
const appinfo = require('../../appinfo');

log4js.configure(config.logger_config);


const basic_string = `[${appinfo.name} ${appinfo.version.major}.${appinfo.version.minor}.${appinfo.version.patch}-${appinfo.build.number} ${machineId.shortMachineId}]`;

/**
 * Add warning on using default console object
 */
function addWarnings() {
    const log = log4js.getLogger(`${basic_string} [console]`);

    ['trace', 'debug', 'log', 'info', 'warn', 'error'].forEach(function (method) {
        console[method] = function (...args) {
            log.warn('Console output is deprecated, please use Logger instead. [console.' + method + ']:', args);
        };
    });
}

// addWarnings();

/**
 * Returns log4js object.
 * @example
 * const logger = require('./logger').getLogger('cheese');
 * logger.trace('Entering cheese testing');
 * logger.debug('Got cheese.');
 * logger.info('Cheese is Comté.');
 * logger.warn('Cheese is quite smelly.');
 * logger.error('Cheese is too ripe!');
 * logger.fatal('Cheese was breeding ground for listeria.');
 *
 * @type {Logger}
 */
function getLogger(name) {
    if (!name) {
        throw Error('Logger name is required');
    }
    let cluster_id = cluster.isMaster ? `master` : `worker ${cluster.worker.id}`;
    return log4js.getLogger(`${basic_string} [${name}] [${cluster_id}]`)
}

module.exports.getLogger = getLogger;
module.exports.log4js = log4js;
