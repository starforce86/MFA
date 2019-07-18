const log = require('../helper/logger').getLogger('user_router');
const fs = require('fs');
const path = require('path');
const prisma = require('../helper/prisma_helper').prisma;
const config = require('../config/config');
const token = require('../helper/token');
const multer = require('multer');
const router = require('express').Router();
var AWS = require("aws-sdk");
const moment = require('moment');

const production = process.env.NODE_ENV === 'production';

const UPLOADS_DIR = `${__dirname}/../../uploads/user_avatars`;

const upload = multer({
    dest: UPLOADS_DIR,
    limits: {
        fileSize: config.uploads.max_user_avatar_size_in_bytes,
        files: 1
    }
});

// var storage = multer.memoryStorage();
var awsUpload = multer({ 
    // storage: storage,
    limits: { fileSize: config.uploads.max_video_size_in_bytes }
});

//todo fix multer error sending to client

router.post('/avatar', upload.single('avatar'), async function (req, res) {
    if (!req.file) {
        res.status(401).json({
            result: 'Avatar in body parameter "avatar" is required'
        });
        return;
    }

    let user;
    try {
        user = await token.validateToken(req.body.token);

    } catch (e) {
        res.status(401).json({
            result: 'Token in body parameter "token" is required'
        });
        return;
    }
    const userId = user.id;
    log.trace('Change user avatar request', {user_id: user.id});

    try {
        const result = await prisma.updateUser({
            where: {id: userId},
            data: {avatar: `/user/avatar?file_id=${req.file.filename}`}
        });

    } catch (e) {
        res.status(404).json({
            result: 'User not found'
        });
        try {
            fs.unlinkSync(`./uploads/user_avatars/${req.file.filename}`);
        } catch (e) {
            log.warn(`Can't delete file:`, e);
        }
        return;
    }

    res.status(200).json({
        result: 'ok',
        file_url: `/user/avatar?file_id=${req.file.filename}`
    });
});

router.get('/avatar', function (req, res) {
    const file_id = req.query.file_id.replace(/([^a-z0-9\s]+)/gi, '_');

    const fn = path.normalize(`${UPLOADS_DIR}/${file_id}`);

    if (!fs.existsSync(fn) || !fs.lstatSync(fn).isFile()) {
        return res.status(404).json({
            message: 'File not found'
        });
    }

    res.sendFile(
        fn,
        {
            headers: {
                'Content-Type': 'image/jpeg'
            }
        }
    );
});

router.post('/backgroundImage', upload.single('backgroundImage'), async function (req, res) {
    if (!req.file) {
        res.status(401).json({
            result: 'BackgroundImage in body parameter "backgroundImage" is required'
        });
        return;
    }

    let user;
    try {
        user = await token.validateToken(req.body.token);
    } catch (e) {
        res.status(401).json({
            result: 'Token in body parameter "token" is required'
        });
        return;
    }
    const userId = user.id;
    log.trace('Change user background_image request', {user_id: user.id});

    try {
        const result = await prisma.updateUser({
            where: {id: userId},
            data: {background_image: `/user/avatar?file_id=${req.file.filename}`}
        });

    } catch (e) {
        res.status(404).json({
            result: 'User not found'
        });
        try {
            fs.unlinkSync(`./uploads/user_avatars/${req.file.filename}`);
        } catch (e) {
            log.warn(`Can't delete file:`, e);
        }
        return;
    }

    res.status(200).json({
        result: 'ok',
        file_url: `/user/avatar?file_id=${req.file.filename}`
    });
});

router.get('/backgroundImage', function (req, res) {
    const file_id = req.query.file_id.replace(/([^a-z0-9\s]+)/gi, '_');

    const fn = path.normalize(`${UPLOADS_DIR}/${file_id}`);

    if (!fs.existsSync(fn) || !fs.lstatSync(fn).isFile()) {
        return res.status(404).json({
            message: 'File not found'
        });
    }

    res.sendFile(
        fn,
        {
            headers: {
                'Content-Type': 'image/jpeg'
            }
        }
    );
});

router.post('/sign_s3', function (req, res) {

    let s3bucket = new AWS.S3({
        accessKeyId: config.aws.aws_access_key_id,
        secretAccessKey: config.aws.aws_secret_access_key,
        region: config.aws.aws_region
    });

    const fileName = req.body.fileName;
    const fileType = req.body.fileType;
    const curTime = moment().format('YYYYMMDDhhmmss');
    const s3FileName = `${curTime}_${fileName}.${fileType}`;

    var params = {
        Bucket: config.aws.aws_bucket_name,
        Key: s3FileName,
        Expires: 500,
        ContentType: fileType,
        ACL: "public-read"
    };

    s3bucket.getSignedUrl('putObject', params, (err, data) => {
        if (err) {
            log.error('getSignedUrl error : ', err);
            res.json({ success: false, error: err })
        }
        const returnData = {
            signedRequest: data,
            // url: `https://${config.aws.aws_bucket_name}.s3.amazonaws.com/${s3FileName}`
            url: `${config.cloudfront_url}/${s3FileName}`
        }
        res.json({success:true, data:{returnData}});
    })
});

router.post('/video', awsUpload.single('video'), async function (req, res) {
    if (!req.file) {
        res.status(401).json({
            result: 'Video in body parameter "video" is required'
        });
        return;
    }

    let user;
    try {
        user = await token.validateToken(req.body.token);
    } catch (e) {
        res.status(401).json({
            result: 'Token in body parameter "token" is required'
        });
        return;
    }
    const userId = user.id;
    log.trace('Upload artist user video request', {user_id: user.id});

    const file = req.file;
    const s3FileURL = config.aws.aws_uploaded_file_url_link;

    let s3bucket = new AWS.S3({
        accessKeyId: config.aws.aws_access_key_id,
        secretAccessKey: config.aws.aws_secret_access_key,
        region: config.aws.aws_region
    });

    const curTime = moment().format('YYYYMMDDhhmmss');

    var params = {
        Bucket: config.aws.aws_bucket_name,
        Key: `${curTime}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
    };

    s3bucket.upload(params, function (err, data) {
        if (err) {
            res.status(500).json({ result: err });
        } else {
            res.status(200).json({
                result: 'ok',
                file_url: s3FileURL + params.Key
            });
        }
    });
});

router.post('/videoPreviewImage', awsUpload.single('videoPreviewImage'), async function (req, res) {
    if (!req.file) {
        res.status(401).json({
            result: 'VideoPreviewImage in body parameter "videoPreviewImage" is required'
        });
        return;
    }

    let user;
    try {
        user = await token.validateToken(req.body.token);
    } catch (e) {
        res.status(401).json({
            result: 'Token in body parameter "token" is required'
        });
        return;
    }
    const userId = user.id;
    log.trace('Upload artist user video preview image request', {user_id: user.id});

    const file = req.file;
    const s3FileURL = config.aws.aws_uploaded_file_url_link;

    let s3bucket = new AWS.S3({
        accessKeyId: config.aws.aws_access_key_id,
        secretAccessKey: config.aws.aws_secret_access_key,
        region: config.aws.aws_region
    });

    const curTime = moment().format('YYYYMMDDhhmmss');

    var params = {
        Bucket: config.aws.aws_bucket_name,
        Key: `${curTime}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
    };

    s3bucket.upload(params, function (err, data) {
        if (err) {
            res.status(500).json({ result: err });
        } else {
            res.status(200).json({
                result: 'ok',
                file_url: s3FileURL + params.Key
            });
        }
    });
});

module.exports = {
    router: router,
    path: '/user'
};
