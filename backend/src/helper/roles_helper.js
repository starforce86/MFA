const log = require('./logger').getLogger('role_asserter');
const GQLError = require('./GQLError');
const prisma = require('./prisma_helper').prisma;

async function userHasRoles(roleForCheck, userId) {
    const foundUser = await prisma.user({
        id: userId
    });

    if (!foundUser || !foundUser.role) {
        log.info("Check user role, user or user's role not found");
        return false;
    }

    let result = false;

    return foundUser.role === roleForCheck;
}

async function assertWrongRoles(rolesForCheck, userId) {
    const result = await userHasRoles(rolesForCheck, userId);
    if (!result) {
        throw new GQLError({message: 'Permission denied', code: 403});
    }
}

module.exports = {
    assertWrongRoles: assertWrongRoles,
    userHasRoles: userHasRoles
};
