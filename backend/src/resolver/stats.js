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
            videos = await prisma.videos({
                where: {
                    deleted: false
                }
            });
        } else if (user.role == "USER_PUBLISHER") {
            videos = await prisma.videos({
                where: {
                    author: {id: userId},
                    deleted: false
                }
            });
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
                    if (uniqueUserIds.indexOf(history.user.id) < 0) {
                        uniqueUserIds.push(history.user.id);
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
                const histories = await prisma.chargeHistories({where: {chargeId: c.id}});
                if (!histories || histories.length == 0) {
                    await prisma.createChargeHistory({
                        amount: c.amount,
                        user: {
                            connect: {id: user.id}
                        },
                        chargeDate: moment(c.created * 1000),
                        chargeId: c.id,
                        refunded: false
                    });
                }
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

async function availableBalance(root, args, ctx, info) {
    try {
        const balanceObj = await stripeHelper.availableBalance();
        const usdBalance = balanceObj.available.find(d => d.currency == "usd");
        return usdBalance.amount;
    } catch (e) {
        log.error('availableBalance error:', e);
        return null;
    }
}

async function artistFactorses(root, args, ctx, info) {
    try {
        const artistFactorsSettings = await prisma.artistFactorsSettings();
        if (artistFactorsSettings.length == 0) {
            throw new GQLError({message: 'Artist Factors Setting empty.', code: 402});
        }
        const artistFactorsSetting = artistFactorsSettings[0];
        let artists = await prisma.users({
            where: {
                role: 'USER_PUBLISHER',
                approved: true
            }
        });
        const mfa = await prisma.users({
            where: {
                role: 'MFA',
            }
        });
        artists = [...artists, ...mfa];

        await Promise.all(artists.map(async (artist) => {
            const records = await prisma.artistFactorses({
                where: {
                    artist: { id: artist.id }
                }
            });
            if (records.length == 0) {
                await prisma.createArtistFactors({
                    artist: {
                        connect: { id: artist.id }
                    },
                    promotion_factor: artistFactorsSetting.promotion_factor,
                    minutes_exponent: artistFactorsSetting.minutes_exponent,
                    finder_fee_factor: artistFactorsSetting.finder_fee_factor,
                    monthly_fee_duration: artistFactorsSetting.monthly_fee_duration,
                    monthly_fee_amount_per_month: artistFactorsSetting.monthly_fee_amount_per_month,
                    annual_fee_amount_per_month: artistFactorsSetting.annual_fee_amount_per_month,
                });
            }
        }));
        
        return await prisma.artistFactorses({
            where: {
                artist: { approved: true }
            }
        });
    } catch (e) {
        log.error('artistFactorses resolver error:', e);
        return null;
    }
}

async function videoParameterses(root, args, ctx, info) {
    try {
        const videos = await prisma.videos({
            where: {
                deleted: false
            }
        });
        await Promise.all(videos.map(async (video) => {
            const records = await prisma.videoParameterses({
                where: {
                    video: { id: video.id }
                }
            });
            if (records.length == 0) {
                const author = await prisma.video({id: video.id}).author();
                await prisma.createVideoParameters({
                    video: {
                        connect: { id: video.id }
                    },
                    owner1: {
                        connect: { id: author.id }
                    },
                    owner1_percentage: 100,
                    owner2_percentage: 0,
                    owner3_percentage: 0
                });
            }
        }));
        
        return await prisma.videoParameterses(args);
    } catch (e) {
        log.error('videoParameterses resolver error:', e);
        return null;
    }
}

async function videoDataForMonthStats(root, args, ctx, info) {

    try {
        const year = args.year;
        const month = args.month;

        const beginTime = moment(`${year}-${month}-01 00:00:00`);
        const endTime = moment(beginTime).endOf('month');

        const b = beginTime.format('YYYY-MM-DD HH:mm:ss');
        const e = endTime.format('YYYY-MM-DD HH:mm:ss');

        const videoTotalParameters = await prisma.videoTotalParameterses({
            orderBy: 'createdAt_DESC'
        });

        if(videoTotalParameters.length == 0) {
            throw new GQLError({message: 'There is no total video parameters!', code: 401});
        }

        const videoTotalParameter = videoTotalParameters[0];

        videos = await prisma.videos({
            where: {
                deleted: false
            }
        });

        for (v of videos) {

            let uniqueUserIds = [];
            let totalRealPlaySeconds = 0;
            
            const histories = (await prisma.playHistories({
                where: {
                    video: { id: v.id },
                    createdAt_gte: beginTime,
                    createdAt_lt: endTime
                }
            }));

            for (const history of histories) {
                try {
                    const historyUser = await prisma.playHistory({ id: history.id }).user();

                    if (uniqueUserIds.indexOf(historyUser.id) < 0) {
                        uniqueUserIds.push(historyUser.id);
                    }
                } catch (e) {
                    log.error('videoDataForMonthStats playHistory.user() error:', e);
                }
                
                totalRealPlaySeconds += history.realPlaySeconds;
            }
                
            const realMinutesWatched = Math.floor(totalRealPlaySeconds / 60);
            let avgMinutesWatched = uniqueUserIds.length ? (Math.floor(realMinutesWatched / uniqueUserIds.length)).toFixed(2) : 0;
            avgMinutesWatched = parseFloat(avgMinutesWatched);
            let exponentApplied = Math.pow(avgMinutesWatched, videoTotalParameter.exponent_for_minutes_watched).toFixed(2);
            exponentApplied = parseFloat(exponentApplied);
            const totalMinutesWatched = exponentApplied * uniqueUserIds.length;

            const videoDataForMonths = await prisma.videoDataForMonths({
                where: {
                    year: parseInt(year),
                    month: parseInt(month),
                    video: { id: v.id }
                }
            });

            if (videoDataForMonths.length == 0) {
                await prisma.createVideoDataForMonth({
                    year: parseInt(year),
                    month: parseInt(month),
                    video: { connect: { id: v.id } },
                    video_length: v.video_duration ? v.video_duration : 0,
                    unique_users: uniqueUserIds.length,
                    real_minutes_watched: realMinutesWatched,
                    avg_minutes_watched: avgMinutesWatched,
                    exponent_applied: exponentApplied,
                    minutes_after_exponent: totalMinutesWatched
                });
            } else {
                const videoDataForMonth = videoDataForMonths[0];
                await prisma.updateVideoDataForMonth({
                    where: {
                        id: videoDataForMonth.id
                    },
                    data: {
                        video_length: v.video_duration ? v.video_duration : 0,
                        unique_users: uniqueUserIds.length,
                        real_minutes_watched: realMinutesWatched,
                        avg_minutes_watched: avgMinutesWatched,
                        exponent_applied: exponentApplied,
                        minutes_after_exponent: totalMinutesWatched
                    }
                });
            }
        }
        
        return await prisma.videoDataForMonths({
            where: {
                year: parseInt(year),
                month: parseInt(month)
            }
        });
    } catch (e) {
        log.error('videoDataForMonthStats error:', e);
        return null;
    }
}

async function videoParametersForMonthStats(root, args, ctx, info) {

    try {
        const year = parseInt(args.year);
        const month = parseInt(args.month);

        const cur_year = moment().format('YYYY');
        const cur_month = moment().format('MM');

        if (year == cur_year && month == cur_month) {

            const videoData = await prisma.videoDataForMonths({
                where: {
                    year: year,
                    month: month
                }
            });
    
            for (videoDatum of videoData) {

                const video = await prisma.videoDataForMonth({id: videoDatum.id}).video();

                const videoParameters = await prisma.videoParameterses({
                    where: {
                        video: { id: video.id }
                    }
                });

                if (!videoParameters || videoParameters.length == 0) {
                    throw new GQLError({message: `There is no video parameters set for video: ${video.id}`, code: 401});
                }

                const videoParameter = videoParameters[0];
                const owner1 = await prisma.videoParameters({id: videoParameter.id}).owner1();
                const owner2 = await prisma.videoParameters({id: videoParameter.id}).owner2();
                const owner3 = await prisma.videoParameters({id: videoParameter.id}).owner3();

                const owner1_minutes = parseFloat((videoDatum.minutes_after_exponent * videoParameter.owner1_percentage / 100).toFixed(2))
                const owner2_minutes = parseFloat((videoDatum.minutes_after_exponent * videoParameter.owner2_percentage / 100).toFixed(2))
                const owner3_minutes = parseFloat((videoDatum.minutes_after_exponent * videoParameter.owner3_percentage / 100).toFixed(2))

                const videosApplied = await prisma.videoParametersForMonths({
                    where: {
                        year: year,
                        month: month,
                        video: { id: video.id }
                    }
                });
                
                let videoParametersForMonth;

                if (videosApplied.length == 0) {
                    videoParametersForMonth = await prisma.createVideoParametersForMonth({
                        year: year,
                        month: month,
                        video: {
                            connect: { id: video.id }
                        },
                        owner1_percentage: videoParameter.owner1_percentage,
                        owner2_percentage: videoParameter.owner2_percentage,
                        owner3_percentage: videoParameter.owner3_percentage,
                        total_minutes: videoDatum.minutes_after_exponent,
                        owner1_minutes: owner1_minutes,
                        owner2_minutes: owner2_minutes,
                        owner3_minutes: owner3_minutes
                    });
                } else {
                    videoParametersForMonth = videosApplied[0];
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner1_percentage: videoParameter.owner1_percentage,
                            owner2_percentage: videoParameter.owner2_percentage,
                            owner3_percentage: videoParameter.owner3_percentage,
                            total_minutes: video.minutes_after_exponent,
                            owner1_minutes: owner1_minutes,
                            owner2_minutes: owner2_minutes,
                            owner3_minutes: owner3_minutes
                        }
                    });
                }

                if (owner1) {
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner1: {
                                connect: { id: owner1.id }
                            }
                        }
                    });
                } else if (await prisma.videoParametersForMonth({id: videoParametersForMonth.id}).owner1()) {
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner1: {
                                disconnect: true
                            }
                        }
                    });
                }

                if (owner2) {
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner2: {
                                connect: { id: owner2.id }
                            }
                        }
                    });
                } else if (await prisma.videoParametersForMonth({id: videoParametersForMonth.id}).owner2()) {
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner2: {
                                disconnect: true
                            }
                        }
                    });
                }

                if (owner3) {
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner3: {
                                connect: { id: owner3.id }
                            }
                        }
                    });
                } else if (await prisma.videoParametersForMonth({id: videoParametersForMonth.id}).owner3()) {
                    await prisma.updateVideoParametersForMonth({
                        where: { id: videoParametersForMonth.id },
                        data: {
                            owner3: {
                                disconnect: true
                            }
                        }
                    });
                }
            }
        }

        return await prisma.videoParametersForMonths({
            where: {
                year: year,
                month: month
            }
        });
    } catch (e) {
        log.error('videoParametersForMonthStats error:', e);
        let err_msg;
        if (typeof e.message === 'object') {
            err_msg = e.message.message;
        } else {
            err_msg = e.message;
        }
        throw new GQLError({message: err_msg, code: 409});
    }
}

async function totalMinutesForArtistStats(root, args, ctx, info) {

    await populateChargeHistory();

    try {
        const year = parseInt(args.year);
        const month = parseInt(args.month);

        const cur_year = moment().format('YYYY');
        const cur_month = moment().format('MM');

        if (year == cur_year && month == cur_month) {

            const artistFactors = await prisma.artistFactorses({
                where: {
                    artist: { approved: true }
                }
            });

            let sumFinalMinutes = 0;
            let totalProfitPool = 0;

            for (artistFactor of artistFactors) {

                const artist = await prisma.artistFactors({id: artistFactor.id}).artist();

                const videoParametersForMonthsAsOwner1 = await prisma.videoParametersForMonths({
                    where: {
                        year: year,
                        month: month,
                        owner1: { id: artist.id }
                    }
                });

                const videoParametersForMonthsAsOwner2 = await prisma.videoParametersForMonths({
                    where: {
                        year: year,
                        month: month,
                        owner2: { id: artist.id }
                    }
                });

                const videoParametersForMonthsAsOwner3 = await prisma.videoParametersForMonths({
                    where: {
                        year: year,
                        month: month,
                        owner3: { id: artist.id }
                    }
                });

                const minutesAsOwner1 = videoParametersForMonthsAsOwner1.length > 0 ? videoParametersForMonthsAsOwner1.reduce((sum, x) => sum + x.owner1_minutes, 0) : 0;
                const minutesAsOwner2 = videoParametersForMonthsAsOwner2.length > 0 ? videoParametersForMonthsAsOwner2.reduce((sum, x) => sum + x.owner2_minutes, 0) : 0;
                const minutesAsOwner3 = videoParametersForMonthsAsOwner3.length > 0 ? videoParametersForMonthsAsOwner3.reduce((sum, x) => sum + x.owner3_minutes, 0) : 0;
                const totalMinutes = minutesAsOwner1 + minutesAsOwner2 + minutesAsOwner3;
                const finalMinutes = totalMinutes * artistFactor.promotion_factor;
                sumFinalMinutes += finalMinutes;

                const totalMinutesForArtists = await prisma.totalMinutesForArtists({
                    where: {
                        year: year,
                        month: month,
                        artist: { id: artist.id }
                    }
                });

                // Profit Pool Calculation
                let annual_quantity = 0;
                let monthly_quantity = 0;
                const start_time_of_month = moment(`${year}-${month}-01 00:00:00`);
                const end_time_of_month = moment(start_time_of_month).endOf('month');

                const subscribers = await prisma.user({id: artist.id}).users();
                
                for (subscriber of subscribers) {
                    const chargeHistories = await prisma.chargeHistories({
                        where: {
                            user: {id: subscriber.id},
                            chargeDate_gte: start_time_of_month,
                            chargeDate_lte: end_time_of_month
                        }
                    });
                    if (chargeHistories && chargeHistories.length > 0) {
                        if (chargeHistories[0].amount >= 30000) {
                            annual_quantity ++;
                        } else {
                            if (artistFactor.monthly_fee_duration > 0) {
                                const monthly_fee_expire_date = moment(subscriber.createdAt).add(artistFactor.monthly_fee_duration - 1, 'M').endOf('month');
                                if (moment(chargeHistories[0].chargeDate) <= monthly_fee_expire_date) {
                                    monthly_quantity ++;
                                }
                            }
                        }
                    }
                }
    
                const finder_fee = (annual_quantity * artistFactor.annual_fee_amount_per_month + monthly_quantity * artistFactor.monthly_fee_amount_per_month) * artistFactor.finder_fee_factor;
                totalProfitPool += finder_fee;

                if (!totalMinutesForArtists || totalMinutesForArtists.length == 0) {
                    await prisma.createTotalMinutesForArtist({
                        year: year,
                        month: month,
                        artist: {
                            connect: { id: artist.id }
                        },
                        minutes_as_owner1: minutesAsOwner1,
                        minutes_as_owner2: minutesAsOwner2,
                        minutes_as_owner3: minutesAsOwner3,
                        total_minutes: totalMinutes,
                        artist_rating_factor: artistFactor.promotion_factor,
                        final_minutes: finalMinutes,
                        monthly_quantity: monthly_quantity,
                        annual_quantity: annual_quantity,
                        finder_fee: finder_fee
                    });
                } else {
                    await prisma.updateTotalMinutesForArtist({
                        where: { id: totalMinutesForArtists[0].id },
                        data: {
                            minutes_as_owner1: minutesAsOwner1,
                            minutes_as_owner2: minutesAsOwner2,
                            minutes_as_owner3: minutesAsOwner3,
                            total_minutes: totalMinutes,
                            artist_rating_factor: artistFactor.promotion_factor,
                            final_minutes: finalMinutes,
                            monthly_quantity: monthly_quantity,
                            annual_quantity: annual_quantity,
                            finder_fee: finder_fee
                        }
                    });
                }
            }

            for (artistFactor of artistFactors) {

                const artist = await prisma.artistFactors({id: artistFactor.id}).artist();

                const totalMinutesForArtists = await prisma.totalMinutesForArtists({
                    where: {
                        year: year,
                        month: month,
                        artist: { id: artist.id }
                    }
                });
                
                const percent_of_profit_pool = sumFinalMinutes > 0 ? parseFloat((totalMinutesForArtists[0].final_minutes * 100 / sumFinalMinutes).toFixed(3)) : 0;
                const payment_from_profit_pool = parseFloat((percent_of_profit_pool * totalProfitPool / 100).toFixed(2));

                await prisma.updateTotalMinutesForArtist({
                    where: { id: totalMinutesForArtists[0].id },
                    data: {
                        percent_of_profit_pool: percent_of_profit_pool,
                        payment_from_profit_pool: payment_from_profit_pool,
                        total_payment: payment_from_profit_pool + totalMinutesForArtists[0].finder_fee
                    }
                });
            }

            // Insert/Update TransferPlan

            for (artistFactor of artistFactors) {

                const artist = await prisma.artistFactors({id: artistFactor.id}).artist();

                if (artist.id == config.user_id.MFA || artist.id == config.user_id.quangho) {
                    continue;
                }

                const totalMinutesForArtists = await prisma.totalMinutesForArtists({
                    where: {
                        year: year,
                        month: month,
                        artist: { id: artist.id }
                    }
                });

                if (totalMinutesForArtists && totalMinutesForArtists.length > 0) {

                    const transferPlans = await prisma.transferPlans({
                        where: {
                            year: year,
                            month: month,
                            artist: { id: artist.id }
                        }
                    });

                    if (!transferPlans || transferPlans.length == 0) {
        
                        await prisma.createTransferPlan({
                            year: year,
                            month: month,
                            artist: {
                                connect: { id: artist.id }
                            },
                            amount: totalMinutesForArtists[0].total_payment * 100,
                            paid_status: false,
                            ignore_status: false
                        });

                    } else {

                        if (transferPlans[0].paid_status == false) {
                            await prisma.updateTransferPlan({
                                where: { id: transferPlans[0].id },
                                data: {
                                    amount: totalMinutesForArtists[0].total_payment * 100
                                }
                            });
                        }
                    }
                }
            }
        }

        return await prisma.totalMinutesForArtists({
            where: {
                year: year,
                month: month
            }
        });
    } catch (e) {
        log.error('totalMinutesForArtistStats error:', e);
        let err_msg;
        if (typeof e.message === 'object') {
            err_msg = e.message.message;
        } else {
            err_msg = e.message;
        }
        throw new GQLError({message: err_msg, code: 409});
    }
}

async function profitPoolCalculationStats(root, args, ctx, info) {
    try {
        const year = parseInt(args.year);
        const month = parseInt(args.month);

        const cur_year = moment().format('YYYY');
        const cur_month = moment().format('MM');

        if (year == cur_year && month == cur_month) {

            const active_subscribers = await prisma.users({
                where: {
                    role: "USER_VIEWER",
                    billing_subscription_active: true
                }
            });

            let cnt_annual = 0;
            let cnt_monthly = 0;
            const annual_subscription_rate = 300;
            const monthly_subscription_rate = 30;

            for (active_subscriber of active_subscribers) {
                if (!active_subscriber.stripe_subsciption_json) {
                    continue;
                }
                if (active_subscriber.stripe_subsciption_json.plan) {
                    if (active_subscriber.stripe_subsciption_json.plan.id == config.stripe.plans.monthly_plan_id) {
                        cnt_monthly ++;
                    } else if (active_subscriber.stripe_subsciption_json.plan.id == config.stripe.plans.yearly_plan_id) {
                        cnt_annual ++;
                    }
                }
            }

            const annual_pool_revenue = Math.floor(cnt_annual * annual_subscription_rate / 12);
            const monthly_pool_revenue = Math.floor(cnt_monthly * monthly_subscription_rate / 12);
            const total_revenue = annual_pool_revenue + monthly_pool_revenue;

            // Calc Total payments to artists
            const totalMinutesForArtists = await prisma.totalMinutesForArtists({
                where: {
                    year: year,
                    month: month
                }
            });

            let total_payments_to_artists = 0;

            for (totalMinutesForArtist of totalMinutesForArtists) {

                const artist = await prisma.totalMinutesForArtist({id: totalMinutesForArtist.id}).artist();
                if (artist.id == config.user_id.MFA || artist.id == config.user_id.quangho) {
                    continue;
                }

                total_payments_to_artists += totalMinutesForArtist.total_payment;
            }

            const net_revenue_mfa = total_revenue - total_payments_to_artists;

            const profitPoolCalculations = await prisma.profitPoolCalculations({
                where: {
                    year: year,
                    month: month
                }
            });

            if (!profitPoolCalculations || profitPoolCalculations.length == 0) {
                await prisma.createProfitPoolCalculation({
                    year: year,
                    month: month,
                    annual_active_subscribers: cnt_annual,
                    monthly_active_subscribers: cnt_monthly,
                    annual_subscription_rate: annual_subscription_rate,
                    monthly_subscription_rate: monthly_subscription_rate,
                    annual_pool_revenue: annual_pool_revenue,
                    monthly_pool_revenue: monthly_pool_revenue,
                    total_revenue: total_revenue,
                    total_payments_to_artists: total_payments_to_artists,
                    net_revenue_mfa: net_revenue_mfa
                });
            } else {
                await prisma.updateProfitPoolCalculation({
                    where: { id: profitPoolCalculations[0].id },
                    data: {
                        annual_active_subscribers: cnt_annual,
                        monthly_active_subscribers: cnt_monthly,
                        annual_subscription_rate: annual_subscription_rate,
                        monthly_subscription_rate: monthly_subscription_rate,
                        annual_pool_revenue: annual_pool_revenue,
                        monthly_pool_revenue: monthly_pool_revenue,
                        total_revenue: total_revenue,
                        total_payments_to_artists: total_payments_to_artists,
                        net_revenue_mfa: net_revenue_mfa
                    }
                });
            }
        }

        return await prisma.profitPoolCalculations({
            where: {
                year: year,
                month: month
            }
        });
    } catch (e) {
        log.error('profitPoolCalculationStats error:', e);
        let err_msg;
        if (typeof e.message === 'object') {
            err_msg = e.message.message;
        } else {
            err_msg = e.message;
        }
        throw new GQLError({message: err_msg, code: 409});
    }
}

// async function payoutStats(root, args, ctx, info) {

//     try {
//         let beginDate = args.beginDate;
//         let endDate = args.endDate;

//         beginDate = moment(beginDate);
//         endDate = moment(endDate);
//         beginDate.set({'date': 1, 'hour': 0, 'minute': 0, 'second': 0});
//         endDate.set({ 'date': 1, 'hour': 0, 'minute': 0, 'second': 0 });
//         let tmpDate = beginDate.clone();
        
//         let timespans = [];
//         while (tmpDate < endDate) {
//             timespans.push({
//                 year: moment(tmpDate).format('YYYY'),
//                 month: moment(tmpDate).format('MM')
//             });
//             tmpDate = tmpDate.add(moment.duration(1, 'months')).clone();
//         }
        
//         let artists = await prisma.users({
//             where: {
//                 role: 'USER_PUBLISHER'
//             }
//         });

//         artists = await Promise.all(artists.map(async (artist) => {
//             const users = await prisma.user({id: artist.id}).users();
//             const promo_codes = await prisma.user({id: artist.id}).my_promo_codes();
//             const cur_promo_codes = promo_codes.find(d => d.current_promo_code == true);

//             artist.promo_code = cur_promo_codes ? cur_promo_codes.promo_code : '';
//             artist.promo_code_uses = users.length;
//             artist.timespans = await Promise.all(timespans.map(async (ts) => {
//                 let tspan = {...ts};
//                 const transferTrans = await prisma.transferTransactions({
//                     where: {
//                         artist: { id: artist.id },
//                         year: parseInt(tspan.year),
//                         month: parseInt(tspan.month)
//                     }
//                 });
//                 let transferAmount = 0;
//                 if (transferTrans.length > 0) {
//                     transferAmount = transferTrans[0].amount;
//                 }
//                 tspan.payout_amount = transferAmount;

//                 const transferPlans = await prisma.transferPlans({
//                     where: {
//                         artist: { id: artist.id },
//                         year: parseInt(tspan.year),
//                         month: parseInt(tspan.month),
//                         ignore_status: false,
//                         paid_status: false
//                     }
//                 });
//                 transferAmount = 0;
//                 transferPlans.forEach(tp => {
//                     transferAmount += tp.amount;
//                 });
//                 tspan.due_amount = transferAmount;

//                 return tspan;
//             }));
//             return artist;
//         }));

//         const months = await Promise.all(timespans.map(async (ts) => {
//             let tspan = {...ts};

//             let due_amount = 0;
//             artists.forEach(artist => {
//                 artist.timespans.forEach(t => {
//                     if (t.year == ts.year && t.month == ts.month) {
//                         due_amount += t.due_amount;
//                     }
//                 });
//             });
//             tspan.due_amount = due_amount;
            
//             return tspan;
//         }));

//         const due_months = months.filter(m => parseInt(m.due_amount) > 0);

//         return {
//             artists: artists,
//             due_months: due_months
//         };
//     } catch (e) {
        // log.error('payoutStats error:', e);
        // let err_msg;
        // if (typeof e.message === 'object') {
        //     err_msg = e.message.message;
        // } else {
        //     err_msg = e.message;
        // }
        // throw new GQLError({message: err_msg, code: 409});
//     }
// }

async function payoutStats(root, args, ctx, info) {

    try {
        const year = parseInt(args.year);
        const month = parseInt(args.month);

        let paid = 0;
        let due = 0;

        const transferPlans = await prisma.transferPlans({
            where: {
                year: year,
                month: month
            }
        });

        for (transferPlan of transferPlans) {

            if (transferPlan.amount > 0 && transferPlan.paid_status == true) {
                paid += transferPlan.amount;
            }
            if (transferPlan.amount > 0 && transferPlan.paid_status == false && transferPlan.ignore_status == false) {
                due += transferPlan.amount;
            }
        }

        return {
            paid: paid,
            due: due
        };

    } catch (e) {
        log.error('payoutStats error:', e);
        let err_msg;
        if (typeof e.message === 'object') {
            err_msg = e.message.message;
        } else {
            err_msg = e.message;
        }
        throw new GQLError({message: err_msg, code: 409});
    }
}

module.exports = {
    signupStats: signupStats,
    subscriptionStats: subscriptionStats,
    chargeStats: chargeStats,
    videoStats: videoStats,
    artistStats: artistStats,
    payoutStats: payoutStats,
    availableBalance: availableBalance,
    populateChargeHistory: populateChargeHistory,
    populateSubscriptionHistory: populateSubscriptionHistory,
    artistFactorses: artistFactorses,
    videoParameterses: videoParameterses,
    videoDataForMonthStats: videoDataForMonthStats,
    videoParametersForMonthStats: videoParametersForMonthStats,
    totalMinutesForArtistStats: totalMinutesForArtistStats,
    profitPoolCalculationStats: profitPoolCalculationStats

};