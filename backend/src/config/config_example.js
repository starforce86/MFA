const production = process.env.NODE_ENV === 'production';

const config = {
    token_secret: "EbzXNoaFtZjFBx955gQWJjfbCfsPN2kViuhq8e8WooprTQxn5W2n2friEbxWPUm3",
    token_expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    logger_config: {
        appenders: {
            out: {
                type: "stdout"
            },
            file_out_all: {
                type: 'file',
                filename: __dirname + '/../../logs/all/logs_all.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_all_filter: {
                type: 'logLevelFilter',
                level: 'trace',
                appender: 'file_out_all'
            },
            file_out_trace: {
                type: 'file',
                filename: __dirname + '/../../logs/trace/logs_trace.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_trace_filter: {
                type: 'logLevelFilter',
                level: 'trace',
                maxLevel: 'trace',
                appender: 'file_out_trace'
            },
            file_out_debug: {
                type: 'file',
                filename: __dirname + '/../../logs/debug/logs_debug.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_debug_filter: {
                type: 'logLevelFilter',
                level: 'debug',
                maxLevel: 'debug',
                appender: 'file_out_debug'
            },
            file_out_info: {
                type: 'file',
                filename: __dirname + '/../../logs/info/logs_info.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_info_filter: {
                type: 'logLevelFilter',
                level: 'info',
                maxLevel: 'info',
                appender: 'file_out_info'
            },
            file_out_warn: {
                type: 'file',
                filename: __dirname + '/../../logs/warn/logs_warn.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_warn_filter: {
                type: 'logLevelFilter',
                level: 'warn',
                maxLevel: 'warn',
                appender: 'file_out_warn'
            },
            file_out_error: {
                type: 'file',
                filename: __dirname + '/../../logs/error/logs_error.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_error_filter: {
                type: 'logLevelFilter',
                level: 'error',
                maxLevel: 'error',
                appender: 'file_out_error'
            },
            file_out_fatal: {
                type: 'file',
                filename: __dirname + '/../../logs/fatal/logs_fatal.log',
                maxLogSize: 25 * 1024 * 1024, // maximum size (in bytes) for the log file.
                backups: 100,
                compress: true
            },
            file_out_fatal_filter: {
                type: 'logLevelFilter',
                level: 'fatal',
                maxLevel: 'fatal',
                appender: 'file_out_fatal'
            },
            telegramAlert: {
                type: __dirname + '/../helper/log4js_telegram_appender',
                silentAlertLevel: 'error',
                audioAlertLevel: 'error',
                bottoken: '123',
                botchatid: 0 // Use @myidbot bot to get dialog id
            },
            telegramAlertDebug: {
                type: __dirname + '/../helper/log4js_telegram_appender',
                silentAlertLevel: 'debug',
                audioAlertLevel: 'error',
                bottoken: '123',
                botchatid: 0 // Use @myidbot bot to get dialog id
            }
        },
        categories: {
            default: {
                appenders: [
                    'out',
                    'file_out_all_filter',
                    'file_out_trace_filter',
                    'file_out_debug_filter',
                    'file_out_info_filter',
                    'file_out_warn_filter',
                    'file_out_error_filter',
                    'file_out_fatal_filter',
                    'telegramAlert',
                    'telegramAlertDebug'
                ],
                level: "trace"
            }
        }
    },
    port: 4000,
    logs_web_panel: {
        enabled: true,
        path: '/logs_web_panel',
        access_token: 'HKRXtyacnEi7eTFnERbop6AWsNCqW5dG4idyKTLQfYnQzIyioWbxqqhQzTn4EQRqn'
    },
    database: {
        host: process.env.POSTGRES_HOST || "localhost",
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "postgres",
        database: process.env.POSTGRES_DB || "prisma",
        port: process.env.POSTGRES_PORT || 5445,
        pool_settings: {
            max: 50,
            min: 4,
            idleTimeoutMillis: 1000
        }
    },
    redis: {
        host: production ? 'redis' : 'localhost',
        port: 6379
    },
    mongodb: {
        host: process.env.MONGODB_HOST || "localhost",
        port: process.env.MONGODB_PORT || 27017
    },
    job_scheduler: {
        database_name: 'agenda',
        process_every: '10 seconds',
        timeout_in_ms: 3 * 60 * 1000,
        enable_web_interface: true,
        web_interface_path: '/jobs_dashboard',
        access_token: 'yi9a35EcieFiLBYSx5YJhZKekbTXxUTxEez75ip4HqTHJD8FbLSotGGHcMzb2gv6h',
        process_every_generate_transfer_plan: '1 day',
        process_every_transfer: '1 day',
        process_every_pull_charge_history: '1 hour'
    },
    graphql: {
        endpoint_path: "/api",
        playground: "/api", // string or false
        tracing: true,
        maximumCost: 100,
        defaultCost: 1,
        mocks: false, // boolean or object
    },
    ddos_protection: {
        windowMs: 1000 * 60 * 15,
        max: 100000,
        message: '{ "error": "Too many requests" }'
    },
    mail_service: {
        MAILING_LIST: 'testlist@sandbox9d1c4d3839c8427bb50500539c00b96c.mailgun.org',
        API_KEY: '61f39eaf83cef66d1b26efe20fd31614-c8c889c9-87074d89',
        DOMAIN: 'varfaj.com',
        activation_code: {
            min_value: 111111,
            max_value: 999999
        },
        subject: "Your activation code",
        from: "MFA <postmaster@varfaj.com>",
        expiresInMs: 1000 * 60 * 60, //1h
    },
    uploads: {
        max_user_avatar_size_in_bytes: 2500 * 1024, // 2.5MB
        max_video_size_in_bytes: 5 * 1024 * 1024 * 1024 // 5GB
    },
    maintenance_mode: {
        maintenance_mode_enabled: false,
        message: 'Sorry, we are down for maintenance',
        allowed_hosts: [
            '127.1.0.1',
            '::1',
            '::ffff:127.0.0.1'
        ]
    },
    secure_memory_storage: {
        salt: 'wgEMdHhvzKfTGvEpXe9NExH9dS4rZT82nLyKe53sJQUWTYjh4UtpGzcD83USq223HuUU7Rc3ovr4oU97Af',
        storage_password: 'z3yoRJrLcQa3NfIq3aiHkMvWKrWuaiXFU3T8gh8tW5PeKEMjNziVu4yQtPnWWFD9uqyjSR553mMuqQqXgDKs6KT',
        // default access password is: precise-camera-afterlife-excavator-attentive-residence-imperfect
        access_password_hash: '$argon2i$v=19$m=4096,t=3,p=1$AKvnGjLpkRsgIHXYXdVxpw$Ik8DsudInTYtJ6v+H1zrAKiHRgfvrsNm72qCp5lqwbY',
        secure_memory_storage_server: {
            port: 9191,
            access_token: false //string or false
        }
    },
    compression: {
        level: -1 // https://github.com/expressjs/compression#level
    },
    stripe: {
        sk_token: 'sk_test_1RyzI0wW9CdUAiWuTte7jE4v',
        plans:{
            monthly_plan_id: 'plan_FKDSHOa4hi6uGZ',
            yearly_plan_id: 'plan_FKDShVVk9AyCsp',
        }
    },
    aws: {
        aws_bucket_name: 'mfa-video-bucket',
        aws_access_key_id: '',
        aws_secret_access_key: '',
        aws_region: 'us-east-2',
        aws_uploaded_file_url_link: 'https://s3.us-east-2.amazonaws.com/mfa-video-bucket/'
    },
    cloudfront_url: 'https://d1v7rt2mkfalrq.cloudfront.net',
    likelog: {
        enabled: true,
        path: '/log'
    },
    user_id: {
        MFA: 'ck3d3ol4f02de072031hbovc6',
        quangho: 'cjuy81v2p003h0749340t46q7'
    }
};

module.exports = config;
