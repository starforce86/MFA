"use strict";

const log = require('./helper/logger').getLogger('app');
const config = require('./config/config');
const userResolver = require('./resolver/user');
const statsResolver = require('./resolver/stats');
const prisma = require('./helper/prisma_helper').prisma;
const roleHelper = require('./helper/roles_helper');
const {rule, shield, and, or, not, allow, deny} = require('graphql-shield');
const systemResolver = require('./resolver/system_resolver');
const redis = require('redis');
const redisClient = redis.createClient(config.redis);
const GQLError = require('./helper/GQLError');
const product_core = require('./core/product');
const _ = require('lodash');
const moment = require('moment');
const InputShieldFilter = require('./helper/InputSheldFilter');
const yup = require('yup');
const stripeHelper = require('./helper/StripeHelper');

const resolvers = {
    Query: {
        systemInfo: systemResolver.systemInfo,
        isPurchaseActive: userResolver.isPurchaseActive,

        activationCode: (root, args) => prisma.activationCode(args.where),
        activationCodes: (root, args) => prisma.activationCodes(args),
        activationCodesConnection: async (root, args) => {
            return {aggregate: await prisma.activationCodesConnection(args).aggregate()}
        },

        category: (root, args) => prisma.category(args.where),
        categories: (root, args) => prisma.categories(args),
        categoriesConnection: async (root, args) => {
            return {aggregate: await prisma.categoriesConnection(args).aggregate()}
        },

        post: (root, args) => prisma.post(args.where),
        posts: (root, args) => prisma.posts(args),
        postsConnection: async (root, args) => {
            return {aggregate: await prisma.postsConnection(args).aggregate()}
        },

        restoreCode: (root, args) => prisma.restoreCode(args.where),
        restoreCodes: (root, args) => prisma.restoreCodes(args),
        restoreCodesConnection: async (root, args) => {
            return {aggregate: await prisma.restoreCodesConnection(args).aggregate()}
        },

        user: (root, args) => prisma.user(args.where),
        users: (root, args) => prisma.users(args),
        usersConnection: async (root, args) => {
            return {aggregate: await prisma.usersConnection(args).aggregate()}
        },

        tag: (root, args) => prisma.tag(args.where),
        tags: (root, args) => prisma.tags(args),
        tagsConnection: async (root, args) => {
            return {aggregate: await prisma.tagsConnection(args).aggregate()}
        },

        featured_videos: (root, args, {pgPool}) => {
            return new Promise((resolve, reject) => {
                pgPool.query(`
                select
                   vid.* 
                from
                   "default$default"."Video" as vid 
                   join
                      "default$default"."_VideoLikeUsersRel" as rel 
                      on vid.id = rel."B" 
                group by
                   vid.id 
                order by
                   count(vid.*) desc
                limit 10
            `, null, (err, res) => {
                    console.log({err, res});
                    if (err)
                        reject(err);
                    else
                        resolve(res.rows);
                })
            });
        },
        video: (root, args) => prisma.video(args.where),
        videos: (root, args) => prisma.videos(args),
        videosConnection: async (root, args) => {
            return {aggregate: await prisma.videosConnection(args).aggregate()}
        },
        curriculum: (root, args) => prisma.curriculum(args.where),
        curricula: (root, args) => prisma.curricula(args),
        curriculaConnection: async (root, args) => {
            return {aggregate: await prisma.curriculaConnection(args).aggregate()}
        },
        watchedVideoUser: userResolver.watchedVideoUser,
        signupStats: statsResolver.signupStats,
        videoStats: statsResolver.videoStats,
        artistStats: statsResolver.artistStats,
        chargeStats: statsResolver.chargeStats,
        subscriptionStats: statsResolver.subscriptionStats,
        populateChargeHistory: statsResolver.populateChargeHistory,
        populateSubscriptionHistory: statsResolver.populateSubscriptionHistory,
        populateTransferPlan: userResolver.populateTransferPlan,
        payoutStats: statsResolver.payoutStats,
        availableBalance: statsResolver.availableBalance,
        artistFactorses: statsResolver.artistFactorses,
    },
    Mutation: {
        sign_up: userResolver.signUp,
        sign_in: userResolver.signIn,
        change_password: userResolver.change_password,
        restore_password: userResolver.restore_password,
        purchase: userResolver.purchase,
        changeCard: userResolver.changeCard,
        delete_subscription: userResolver.delete_subscription,
        addContactUsMessage: (root, args) => {
            const {email, text} = args;
            log.error(`STUB. Implement: addContactUsMessage(${email}:${text})`);
            return true;
        },
        addWatchedVideo: userResolver.addWatchedVideo,
        updateWatchedVideo: userResolver.updateWatchedVideo,
        transfer: userResolver.transfer,

        createActivationCode: (root, args) => prisma.createActivationCode(args.data),
        updateActivationCode: (root, args) => prisma.updateActivationCode(args),
        updateManyActivationCodes: (root, args) => prisma.updateManyActivationCodes(args),
        upsertActivationCode: (root, args) => prisma.upsertActivationCode(args),
        deleteActivationCode: (root, args) => prisma.deleteActivationCode(args.where),
        deleteManyActivationCodes: (root, args) => prisma.deleteManyActivationCodes(args.where),

        createCategory: (root, args) => prisma.createCategory(args.data),
        updateCategory: (root, args) => prisma.updateCategory(args),
        updateManyCategories: (root, args) => prisma.updateManyCategories(args),
        upsertCategory: (root, args) => prisma.upsertCategory(args),
        deleteCategory: (root, args) => prisma.deleteCategory(args.where),
        deleteManyCategories: (root, args) => prisma.deleteManyCategories(args.where),

        createPlayHistory: (root, args) => prisma.createPlayHistory(args.data),
        updatePlayHistory: (root, args) => prisma.updatePlayHistory(args),
        updateManyPlayHistories: (root, args) => prisma.updateManyPlayHistories(args),
        upsertPlayHistory: (root, args) => prisma.upsertPlayHistory(args),
        deletePlayHistory: (root, args) => prisma.deletePlayHistory(args.where),
        deleteManyPlayHistories: (root, args) => prisma.deleteManyPlayHistories(args.where),

        createPost: (root, args) => prisma.createPost(args.data),
        updatePost: (root, args) => prisma.updatePost(args),
        updateManyPosts: (root, args) => prisma.updateManyPosts(args),
        upsertPost: (root, args) => prisma.upsertPost(args),
        deletePost: (root, args) => prisma.deletePost(args.where),
        deleteManyPosts: (root, args) => prisma.deleteManyPosts(args.where),

        createRestoreCode: (root, args) => prisma.createRestoreCode(args.data),
        updateRestoreCode: (root, args) => prisma.updateRestoreCode(args),
        updateManyRestoreCodes: (root, args) => prisma.updateManyRestoreCodes(args),
        upsertRestoreCode: (root, args) => prisma.upsertRestoreCode(args),
        deleteRestoreCode: (root, args) => prisma.deleteRestoreCode(args.where),
        deleteManyRestoreCodes: (root, args) => prisma.deleteManyRestoreCodes(args.where),

        createTag: (root, args) => prisma.createTag(args.data),
        updateTag: (root, args) => prisma.updateTag(args),
        updateManyTags: (root, args) => prisma.updateManyTags(args),
        upsertTag: (root, args) => prisma.upsertTag(args),
        deleteTag: (root, args) => prisma.deleteTag(args.where),
        deleteManyTags: (root, args) => prisma.deleteManyTags(args.where),

        createUser: (root, args) => prisma.createUser(args.data),
        updateUser: (root, args) => prisma.updateUser(args),
        updateManyUsers: (root, args) => prisma.updateManyUsers(args),
        upsertUser: (root, args) => prisma.upsertUser(args),
        deleteUser: (root, args) => prisma.deleteUser(args.where),
        deleteManyUsers: (root, args) => prisma.deleteManyUsers(args.where),

        createVideo: (root, args) => prisma.createVideo({ ...args.data, publish_date: moment() }),
        updateVideo: (root, args) => prisma.updateVideo(args),
        updateManyVideos: (root, args) => prisma.updateManyVideos(args),
        upsertVideo: (root, args) => prisma.upsertVideo(args),
        deleteVideo: (root, args) => prisma.deleteVideo(args.where),
        deleteManyVideos: (root, args) => prisma.deleteManyVideos(args.where),

        createCurriculum: (root, args) => prisma.createCurriculum(args.data),
        updateCurriculum: (root, args) => prisma.updateCurriculum(args),
        updateManyCurricula: (root, args) => prisma.updateManyCurricula(args),
        upsertCurriculum: (root, args) => prisma.upsertCurriculum(args),
        deleteCurriculum: (root, args) => prisma.deleteCurriculum(args.where),
        deleteManyCurricula: (root, args) => prisma.deleteManyCurricula(args.where),
    },
    User: {
        artist: (root, args) => prisma.user({id: root.id}).artist(args),
        users: (root, args) => prisma.user({id: root.id}).users(args),
        my_videos: (root, args) => prisma.user({id: root.id}).my_videos(args),
        liked_videos: (root, args) => prisma.user({id: root.id}).liked_videos(args),
        watched_videos: (root, args) => prisma.user({id: root.id}).watched_videos(args),
        my_subscription_users: (root, args) => prisma.user({id: root.id}).my_subscription_users(args),
        subscribed_users: (root, args) => prisma.user({id: root.id}).subscribed_users(args),
        subscribed_users_count: root => prisma.usersConnection({where: {my_subscription_users_some: {id: root.id}}}).aggregate().count(),
        last4: root => stripeHelper.getLast4(root.stripe_customer_id)
    },
    Video: {
        author: (root, args) => prisma.video({id: root.id}).author(args),
        categories: (root, args) => prisma.video({id: root.id}).categories(args),
        like_users: (root, args) => prisma.video({id: root.id}).like_users(args),
        tags: (root, args) => prisma.video({id: root.id}).tags(args),
        watched_users: (root, args) => prisma.video({id: root.id}).watched_users(args),
        likes_count: root => prisma.usersConnection({where: {liked_videos_some: {id: root.id}}}).aggregate().count(),
    },
    Tag: {
        videos: (root, args) => prisma.tag({id: root.id}).videos(args),
    },
    Category: {
        videos: (root, args) => prisma.category({id: root.id}).videos(args),
    },
    Post: {
        author: (root, args) => prisma.post({id: root.id}).author(args),
    },
    WatchedVideoUser: {
        user: (root, args) => prisma.watchedVideoUser({id: root.id}).user(args),
        video: (root, args) => prisma.watchedVideoUser({id: root.id}).video(args),
    },
    ArtistFactors: {
        artist: (root, args) => prisma.artistFactors({id: root.id}).artist(args),
    },
    Node: { // to remove warning "Type "Node" is missing a "__resolveType" resolver. Pass false into "resolverValidationOptions.requireResolversForResolveType" to disable this warning."
        __resolveType() {
            return null;
        }
    }
};

const isAdmin = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    if (!ctx.user || !ctx.user.id) {
        log.error('isAdmin false, ctx:', ctx);
        return false;
    }
    return await roleHelper.userHasRoles(['ADMIN'], ctx.user.id);
});

const isAuthenticated = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    if (!ctx.user || !ctx.user.id) {
        log.error('isAuthenticated false, ctx:', ctx);
        return false;
    }
    return await prisma.$exists.user({
        id: ctx.user.id
    });
});

const isPurchaseActive = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    const result = await prisma.user({email: ctx.user.email}).billing_subscription_active();
    log.trace(`isPurchaseActive: ${result}, ctx:`, ctx);
    return result ? true : new GQLError({message: 'Billing subscription is not active', code: 405});
});

const isVideoAuthor = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    const videoAuthorId = await prisma.video({id: parent.id}).author().id();
    const result = ctx.user.id === videoAuthorId;
    log.trace(`isVideoAuthor: ${result}, ctx:`, ctx);
    return result ? true : new GQLError({message: 'You are not video author', code: 405});
});

const updateUserRule = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    if (!ctx.user || !ctx.user.id) {
        log.error('updateUserRule false, ctx:', ctx);
        return false;
    }

    const isUserOwner = args.where.id === ctx.user.id;

    const rules = {
        '*': false,
        data: {
            firstname: isUserOwner,
            lastname: isUserOwner,
            username: isUserOwner,
            email: isUserOwner,
            avatar: isUserOwner,
            background_image: isUserOwner,
            about_text: isUserOwner,
            my_videos: {
                create: true,
                delete: true,
            },
            liked_videos: {
                connect: true,
                disconnect: true,
            },
            watched_videos: {
                connect: true,
                disconnect: true,
            },
            my_subscription_users: isUserOwner,
            subscribed_users: {
                connect: {
                    id: args.data.subscribed_users ?
                        args.data.subscribed_users.connect ?
                            args.data.subscribed_users.connect.every(item => item.id === ctx.user.id)
                            : false
                        : false
                },
                disconnect: {
                    id: args.data.subscribed_users ?
                        args.data.subscribed_users.disconnect ?
                            args.data.subscribed_users.disconnect.every(item => item.id === ctx.user.id)
                            : false
                        : false
                },
            },
            last_login_date: isUserOwner,
        },
        where: {
            id: isUserOwner
        }
    };

    InputShieldFilter.filterArgs(rules, args);

    // console.log(JSON.stringify(args, null, 2));

    return true;
});

const updateVideoRule = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    if (!ctx.user || !ctx.user.id) {
        log.error('updateVideoRule false, ctx:', ctx);
        return false;
    }

    const videoAuthorId = await prisma.video({id: args.where.id}).author().id();
    const isVideoAuthor = videoAuthorId === ctx.user.id;

    const rules = {
        '*': false,
        data: {
            title: isVideoAuthor,
            publish_date: isVideoAuthor,
            file_url: isVideoAuthor,
            preview_url: isVideoAuthor,
            categories: isVideoAuthor,
            like_users: {
                connect: {
                    id: args.data.like_users ?
                        args.data.like_users.connect ?
                            args.data.like_users.connect.every(item => item.id === ctx.user.id)
                            : false
                        : false
                },
                disconnect: {
                    id: args.data.like_users ?
                        args.data.like_users.disconnect ?
                            args.data.like_users.disconnect.every(item => item.id === ctx.user.id)
                            : false
                        : false
                },
            },
            watched_users: {
                connect: {
                    id: args.data.watched_users ?
                        args.data.watched_users.connect ?
                            args.data.watched_users.connect.every(item => item.id === ctx.user.id)
                            : false
                        : false,
                },
                disconnect: {
                    id: args.data.watched_users ?
                        args.data.watched_users.disconnect ?
                            args.data.watched_users.disconnect.every(item => item.id === ctx.user.id)
                            : false
                        : false,
                },
            },
        },
        where: {
            id: isVideoAuthor
        }
    };

    InputShieldFilter.filterArgs(rules, args);
    // console.log('ARGS:', JSON.stringify(args, null, 2));

    return true;
});

const deleteVideoRule = rule({cache: 'no_cache'})(async (parent, args, ctx, info) => {
    if (!ctx.user || !ctx.user.id) {
        log.error('updateVideoRule false, ctx:', ctx);
        return false;
    }

    const videoAuthorId = await prisma.video({id: args.where.id}).author().id();
    const isVideoAuthor = videoAuthorId === ctx.user.id;

    const rules = {
        '*': false,
        where: {
            id: isVideoAuthor
        }
    };

    InputShieldFilter.filterArgs(rules, args);

    return true;
});

const permissions = shield({
    Query: {
        systemInfo: and(isAuthenticated, isAdmin),
        cachedResponse: allow,
        clearCachedResponse: allow,

        // activationCode: and(isAuthenticated, isAdmin),
        // activationCodes: and(isAuthenticated, isAdmin),
        //
        // category: isAuthenticated,
        // categories: isAuthenticated,
        //
        // product: isAuthenticated,
        // products: isAuthenticated,
        //
        // user: isAuthenticated,
        // users: isAuthenticated,
    },
    Mutation: {
        change_password: isAuthenticated,

        createActivationCode: isAdmin,
        updateActivationCode: isAdmin,
        updateManyActivationCodes: isAdmin,
        upsertActivationCode: isAdmin,
        deleteActivationCode: isAdmin,
        deleteManyActivationCodes: isAdmin,

        createCategory: isAdmin,
        updateCategory: isAdmin,
        updateManyCategories: isAdmin,
        upsertCategory: isAdmin,
        deleteCategory: isAdmin,
        deleteManyCategories: isAdmin,

        createRestoreCode: isAdmin,
        updateRestoreCode: isAdmin,
        updateManyRestoreCodes: isAdmin,
        upsertRestoreCode: isAdmin,
        deleteRestoreCode: isAdmin,
        deleteManyRestoreCodes: isAdmin,

        createUser: isAdmin,
        updateUser: or(isAdmin, updateUserRule),
        updateManyUsers: isAdmin,
        upsertUser: isAdmin,
        deleteUser: isAdmin,
        deleteManyUsers: isAdmin,

        // createVideo: isAdmin,
        updateVideo: or(isAdmin, updateVideoRule),
        updateManyVideos: isAdmin,
        upsertVideo: isAdmin,
        deleteVideo: or(isAdmin, deleteVideoRule),
        deleteManyVideos: isAdmin,
    },
    Video: {
        file_url: and(isAuthenticated, or(isVideoAuthor, isPurchaseActive)),
    },
    // User: {
    //     id: allow,
    //     createdAt: allow,
    //     updatedAt: allow,
    //     email: allow,
    //     roles: allow,
    //     avatar: allow,
    //     last_login_date: allow,
    // },
    // Product: {
    //     id: allow,
    //     createdAt: allow,
    //     updatedAt: allow,
    //     title: allow,
    //     description: allow,
    //     categories: allow,
    // },
    // Category: {
    //     id: allow,
    //     createdAt: allow,
    //     updatedAt: allow,
    //     title: allow,
    //     description: allow,
    //     subcategories: allow,
    //     products: allow,
    // }
}, {
    fallbackError: new GQLError({message: 'Permission denied!', code: 403}),
});

module.exports = {
    resolvers: resolvers,
    permissions: permissions
};

// todo remove me
/*
const token = require('./helper/token');
(async () => {
    const user = await prisma.user({
        email: 'admin@admin.com'
    });

    console.log({user});
    log.error("REMOVE ME. Admin user's token:\n", `{"token":"${token.createToken(user)}"}`);
})();
*/
