const log = require('../helper/logger').getLogger('stats_resolver');
const prisma = require('../helper/prisma_helper').prisma;
const moment = require('moment');
const GQLError = require('../helper/GQLError');
const token = require('../helper/token');
const config = require('../config/config');

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

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
            const stepCnt = Math.ceil(diffDays / 365);
            let startTime = beginDate.clone();
            let tmpTime = beginDate.clone();
            for (var i = 0; i < stepCnt; i++) {
                endTime = tmpTime.add(moment.duration(365, 'days')).clone();
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

module.exports = {
    videoStats: videoStats
};