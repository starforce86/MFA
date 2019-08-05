const log = require('../helper/logger').getLogger('stats_resolver');
const prisma = require('../helper/prisma_helper').prisma;
const moment = require('moment');
const GQLError = require('../helper/GQLError');
const stripeHelper = require('../helper/StripeHelper');
const token = require('../helper/token');
const config = require('../config/config');

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

async function signupStats(root, args, ctx, info) {
    try {
        let beginDate = args.beginDate;
        let endDate = args.endDate;
        const type = args.type;

        let timespans = [];
        beginDate = moment(beginDate)
        endDate = moment(endDate)

        if(type == 'daily') {
            beginDate.set({'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'days')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }
        else if(type == 'monthly') {
            beginDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'months')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }

        await Promise.all(timespans.map(async (ts) => {
            ts.signupCount = (await prisma.users({
                where: {
                    createdAt_gte: ts.begin,
                    createdAt_lt: ts.end
                }
            })).length;
        }));

        return timespans;
    } catch (e) {
        log.error('subscriptionStats error:', e);
        return null;
    }
}

async function subscriptionStats(root, args, ctx, info) {
    try {
        let beginDate = args.beginDate;
        let endDate = args.endDate;
        const type = args.type;

        let timespans = [];
        beginDate = moment(beginDate)
        endDate = moment(endDate)

        if(type == 'monthly') {
            beginDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'months')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }
        else if(type == 'yearly') {
            beginDate.set({'month': 0, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'month': 0, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'years')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }

        await Promise.all(timespans.map(async (ts) => {
            ts.monthlySubscriptionCount = (await prisma.subscriptionHistories({
                where: {
                    interval: "month",
                    subscriptionDate_gte: ts.begin,
                    subscriptionDate_lt: ts.end
                }
            })).length;
            
            ts.yearlySubscriptionCount = (await prisma.subscriptionHistories({
                where: {
                    interval: "year",
                    subscriptionDate_gte: ts.begin,
                    subscriptionDate_lt: ts.end
                }
            })).length;
            
            ts.totalSubscriptionCount = ts.monthlySubscriptionCount + ts.yearlySubscriptionCount;
        }));

        return timespans;
    } catch (e) {
        log.error('subscriptionStats error:', e);
        return null;
    }
}

async function chargeStats(root, args, ctx, info) {
    try {
        let beginDate = args.beginDate;
        let endDate = args.endDate;
        const type = args.type;

        let timespans = [];
        beginDate = moment(beginDate)
        endDate = moment(endDate)

        if(type == 'monthly') {
            beginDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'months')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }
        else if(type == 'yearly') {
            beginDate.set({'month': 0, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'month': 0, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'years')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }

        const monthlyCharge = 2999;
        const yearlyCharge = 30000;

        await Promise.all(timespans.map(async (ts) => {
            let histories = await prisma.chargeHistories({
                where: {
                    amount: monthlyCharge,
                    chargeDate_gte: ts.begin,
                    chargeDate_lt: ts.end
                }
            });
            let sumMonthly = 0;
            for (history of histories) {
                sumMonthly += history.amount;
            }
            ts.monthlyChargeCount = histories.length;
            ts.monthlyChargeAmount = sumMonthly;

            histories = await prisma.chargeHistories({
                where: {
                    amount: yearlyCharge,
                    chargeDate_gte: ts.begin,
                    chargeDate_lt: ts.end
                }
            });
            let sumYearly = 0;
            for (history of histories) {
                sumYearly += history.amount;
            }
            ts.yearlyChargeCount = histories.length;
            ts.yearlyChargeAmount = sumYearly;
            ts.totalChargeCount = ts.monthlyChargeCount + ts.yearlyChargeCount;
            ts.totalChargeAmount = sumMonthly + sumYearly;
        }));

        return timespans;
    } catch (e) {
        log.error('chargeStats error:', e);
        return null;
    }
}

async function videoStats(root, args, ctx, info) {

    try {
        const userId = args.userId;
        let beginDate = args.beginDate;
        let endDate = args.endDate;
        const type = args.type;
        
        let videos = [];
        let timespans = [];
        beginDate = moment(beginDate)
        endDate = moment(endDate)
        let diffDays = moment.duration(endDate.diff(beginDate)).asDays();
        if(type == "daily") {
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            for (var i = 0; i < diffDays; i++) {
                endTime = tmpTime.add(moment.duration(1, 'days')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endDate.clone()
            });
        }
        else if(type == 'weekly') {
            const stepCnt = diffDays / 7;
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            for (var i = 0; i < stepCnt; i++) {
                endTime = tmpTime.add(moment.duration(7, 'days')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endDate.clone()
            });
        }
        else if(type == 'monthly') {
            beginDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'months')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }
        else if(type == 'yearly') {
            beginDate.set({'month': 1, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            endDate.set({'month': 1, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            let endTime = null;
            while(!endTime || endTime <= endDate) {
                endTime = tmpTime.add(moment.duration(1, 'years')).clone();
                timespans.push({
                    begin: startTime,
                    end: endTime
                });
                startTime = endTime.clone();
            }
            timespans.push({
                begin: beginDate.clone(),
                end: endTime.clone()
            });
        }
        const user = await prisma.user({id: userId});
        if (user.role == "ADMIN") {
            videos = await prisma.videos();
        } else if (user.role == "USER_PUBLISHER") {
            videos = await prisma.videos({where: {author: {id: userId}}});
        }

        videos = await Promise.all(videos.map(async (v) => {
            v.timespans = await Promise.all(timespans.map(async (ts) => {
                let tspan = {...ts};
                
                const histories = (await prisma.playHistories({
                    where: {
                        video: { id: v.id },
                        createdAt_gte: tspan.begin,
                        createdAt_lt: tspan.end
                    }
                }));
                
                let uniqueUserIds = [];
                let totalPlaySeconds = 0;
                let totalRealPlaySeconds = 0;
                for (history of histories) {
                    if (uniqueUserIds.indexOf(history.id) < 0) {
                        uniqueUserIds.push(history.id);
                    }
                    totalPlaySeconds += history.playSeconds;
                    totalRealPlaySeconds += history.realPlaySeconds;
                }
                
                tspan.userEventCount = histories.length;
                tspan.uniqueUserCount = uniqueUserIds.length;
                tspan.playSeconds = totalPlaySeconds;
                tspan.realPlaySeconds = totalRealPlaySeconds;

                return tspan;
            }));
            return v;
        }));
        return videos;
    } catch (e) {
        log.error('videoStats error:', e);
        return null;
    }
}

async function artistStats(root, args, ctx, info) {

    try {
        const userId = args.userId;
        let beginDate = args.beginDate;
        let endDate = args.endDate;
        
        beginDate = moment(beginDate)
        endDate = moment(endDate)
        const user = await prisma.user({id: userId});
        if (user.role != "ADMIN") {
            return null;
        }

        let artists = await prisma.users({
            where: {
                role: "USER_PUBLISHER"
            }
        });
        artists = await Promise.all(artists.map(async (a) => {
            let artist = {...a};
            const histories = (await prisma.playHistories({
                where: {
                    video: { author: {id: a.id} },
                    createdAt_gte: beginDate,
                    createdAt_lt: endDate
                }
            }));
            let totalPlaySeconds = 0;
            let totalRealPlaySeconds = 0;
            for (history of histories) {
                totalPlaySeconds += history.playSeconds;
                totalRealPlaySeconds += history.realPlaySeconds;
            }

            artist.viewCount = histories.length;
            artist.playSeconds = totalPlaySeconds;
            artist.realPlaySeconds = totalRealPlaySeconds;

            return artist;
        }));
        return artists;
    } catch (e) {
        log.error('artistStats error:', e);
        return null;
    }
}

async function populateChargeHistory(root, args, ctx, info) {
    try {
        const charges = await stripeHelper.getCharges();
        await Promise.all(charges.data.map(async (c) => {
            const users = await prisma.users({where: {stripe_customer_id: c.customer}});
            if(users && users.length > 0) {
                const user = users[0];
                await prisma.createChargeHistory({
                    amount: c.amount,
                    user: {
                        connect: {id: user.id}
                    },
                    chargeDate: moment(c.created * 1000)
                });
            }
        }));
        return true;
    } catch (e) {
        log.error('populateChargeHistory error:', e);
        return false;
    }
}

async function populateSubscriptionHistory(root, args, ctx, info) {
    try {
        const subscriptions = await stripeHelper.getSubscriptions();
        await Promise.all(subscriptions.data.map(async (s) => {
            const users = await prisma.users({where: {stripe_customer_id: s.customer}});
            if(users && users.length > 0) {
                const user = users[0];
                await prisma.createSubscriptionHistory({
                    user: {
                        connect: {id: user.id}
                    },
                    interval: s.plan.interval,
                    amount: s.plan.amount,
                    subscriptionDate: moment(s.created * 1000)
                });
            }
        }));
        return true;
    } catch (e) {
        log.error('populateChargeHistory error:', e);
        return false;
    }
}

module.exports = {
    signupStats: signupStats,
    subscriptionStats: subscriptionStats,
    chargeStats: chargeStats,
    videoStats: videoStats,
    artistStats: artistStats,
    populateChargeHistory: populateChargeHistory,
    populateSubscriptionHistory: populateSubscriptionHistory
};