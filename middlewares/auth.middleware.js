const httpErrors = require('http-errors');
const JWT = require('jsonwebtoken');
const notAuthorized = "Request not Authorized";
const redisClient = require('../utils/database/init_redis');
const User = require("../models/user/user.model");

const {
    JWT_ACCESS_TOKEN_HEADER,
    JWT_ACCESS_TOKEN_SECRET_KEY,
    JWT_ACCESS_EXPIRATION_MINUTES,
    JWT_REFRESH_EXPIRATION_DAYS,
    JWT_REFRESH_TOKEN_SECRET_KEY
} = require("../config/index")

const signAccessToken = (payloadData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const jwtAccessToken = JWT.sign(
                {
                    userId: payloadData.userId,
                    email: payloadData.email,
                },
                JWT_ACCESS_TOKEN_SECRET_KEY,
                {
                    expiresIn: `${JWT_ACCESS_EXPIRATION_MINUTES}m`
                }
            );
            await redisClient.SET(`access_token:${payloadData.userId}`, jwtAccessToken);
            resolve(jwtAccessToken);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

const signRefreshToken = (payloadData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const jwtRefreshToken = JWT.sign(
                {
                    userId: payloadData.userId,
                    email: payloadData.email,
                },
                JWT_REFRESH_TOKEN_SECRET_KEY,
                {
                    expiresIn: `${JWT_REFRESH_EXPIRATION_DAYS}d`
                }
            );
            await redisClient.SET(`refresh_token:${payloadData.userId}`, jwtRefreshToken);

            resolve(jwtRefreshToken);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

const verifyAccessToken = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers[JWT_ACCESS_TOKEN_HEADER];

        if (!authorizationHeader) {
            throw httpErrors[401]('Unauthorized');
        }

        // Split the header value to separate the "Bearer" keyword from the token
        const [bearer, accessToken] = authorizationHeader.split(' ');

        if (bearer !== 'Bearer' || accessToken === null) {
            throw httpErrors[401]('Invalid jwtAccessToken format.');
        }

        const payloadData = JWT.verify(accessToken, JWT_ACCESS_TOKEN_SECRET_KEY);

        const cachedAccessToken = await redisClient.GET(`access_token:${payloadData.userId}`);

        if (accessToken !== cachedAccessToken) {
            throw httpErrors[401](notAuthorized)
        }
        const userDetails = await User.findOne({
            _id: payloadData.userId,
            isDeleted: false
        })

        req.user = userDetails;

        next();

    } catch (error) {
        console.log(error);
        next(error);
    }
}

const removeToken = (payloadData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const accessTokenKey = `access_token:${payloadData.userId}`;
            const refreshTokenKey = `refresh_token:${payloadData.userId}`;
            await redisClient.DEL(accessTokenKey);
            await redisClient.DEL(refreshTokenKey);
            resolve();
        } catch (error) {
            console.log(error);
            reject(httpErrors.InternalServerError(error));
        }
    })

}

module.exports = {
    verifyAccessToken,
    signAccessToken,
    signRefreshToken,
    removeToken
}