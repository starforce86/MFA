const log = require('../helper/logger').getLogger('user_core');
const prisma = require('../helper/prisma_helper').prisma;
const password_helper = require('../helper/password_helper');
const token = require('../helper/token');
const GQLError = require('../helper/GQLError');
const validator = require('validator');
const emailHelper = require('../helper/email_helper');

function safeUser(userObject) {
    if (!userObject) return null;

    const newUser = userObject;
    delete newUser.password_hash;
    delete newUser.password_salt;
    return newUser;
}

function makeRandStr(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

async function signUp(email, firstname, lastname, phone, password, promo_code, step, activation_code, role) {
    if (!email) {
        throw new GQLError({message: 'Email is required', code: 400});
    }
    if (!firstname) {
        throw new GQLError({message: 'Firstname is required', code: 400});
    }
    if (!lastname) {
        throw new GQLError({message: 'Firstname is required', code: 400});
    }
    if (!phone) {
        throw new GQLError({message: 'Phone is required', code: 400});
    }

    if (!validator.isEmail(email)) {
        throw new GQLError({message: 'Wrong email format', code: 400});
    }

    email = email.toLowerCase();

    if (step === 'GENERATE_ACTIVATION_CODE') {
        const result = await emailHelper.generateActivationCode(email);

        await emailHelper.sendActivationEmail(email, result.code);
        return {
            status: 'ok'
        };
    } else if (step === 'CHECK_ACTIVATION_CODE') {
        if (!password) {
            throw new GQLError({message: 'Password is required', code: 400});
        }

        const result = true; //todo, hardcode  // await emailHelper.verityActivationCode(email, activation_code);
        const promo_code_len = 6;

        if (!result) {
            throw new GQLError({message: 'Wrong activation code', code: 403});
        } else {
            const salt = password_helper.getSecureRandomString();

            const password_hash = await password_helper.hashPassword(password, salt);

            let newUser = null;

            const userRole = role === 'USER_PUBLISHER' ? 'USER_PUBLISHER' : 'USER_VIEWER';

            try {
                let newUserData = {
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                    phone: phone,
                    password_hash: password_hash,
                    password_salt: salt,
                    role: userRole,
                }
                if (userRole === 'USER_VIEWER' && promo_code) {
                    const artists = await prisma.users({
                        where: {
                            promo_code: promo_code
                        }
                    });
                    if(artists.length == 0) {
                        throw new GQLError({message: `No such promo code with '${promo_code}'`, code: 410});
                    }

                    newUserData.artist = {
                        connect: { id: artists[0].id }
                    };
                }
                if (userRole === 'USER_PUBLISHER') {
                    const promo_codes = (await prisma.users({
                        where: {
                            role: "USER_PUBLISHER"
                        }
                    })).map(d => d.promo_code);
        
                    let new_promo_code = makeRandStr(promo_code_len);
                    while(promo_codes.includes(new_promo_code)) {
                        new_promo_code = makeRandStr(promo_code_len);
                    }

                    newUserData.promo_code = new_promo_code;
                }
                newUser = await prisma.createUser(newUserData);
            } catch (e) {
                log.trace(e);
                throw new GQLError({message: e.message, code: 409});
            }

            log.trace('User created: ', newUser.email);
            await emailHelper.addUserToMailingList(newUser);

            return {
                token: token.createToken(safeUser(newUser)),
                user: newUser
            };
        }
    }
}

async function signIn(email, password) {
    if (!email || !password) {
        throw new GQLError({message: 'Email and password required', code: 400});
    }

    if (!validator.isEmail(email)) {
        throw new GQLError({message: 'Wrong email format', code: 400});
    }

    email = email.toLowerCase();

    const user = await prisma.user({
        email: email
    });

    if (!user) {
        throw new GQLError({message: 'Email is not associated with MFA account.', code: 402});
    }

    log.trace('Login attempt: ', user.email);

    const result = await password_helper.verifyHashPassword(user.password_hash, password, user.password_salt);

    if (!result) {
        throw new GQLError({message: 'Password used is incorrect.', code: 403});
    } else {
        await prisma.updateUser({
            where: {
                id: user.id
            },
            data: {
                last_login_date: new Date().toISOString()
            }
        });

        return {
            token: token.createToken(safeUser(user)),
            user: safeUser(user)
        };
    }
}

async function change_password(userId, oldPassword, newPassword) {
    const user = await prisma.user({
        id: userId
    }).$fragment('{ id password_hash password_salt }');

    const isPasswordCorrect = await password_helper.verifyHashPassword(user.password_hash, oldPassword, user.password_salt);
    if (!isPasswordCorrect) {
        throw new GQLError({message: 'Wrong password', code: 401});
    }

    const newPasswordHash = await password_helper.hashPassword(newPassword, user.password_salt);
    const result = await prisma.updateUser({
        where: {id: userId},
        data: {password_hash: newPasswordHash}
    });

    return {
        user: safeUser(result),
        status: 'ok'
    }
}

module.exports = {
    signUp: signUp,
    change_password: change_password,
    signIn: signIn
};
