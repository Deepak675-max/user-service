const httpErrors = require('http-errors');
const JWT = require('jsonwebtoken');
const notAuthorized = "Request not Authorized";
const { logger } = require("../helper/common/winston");

const signAccessToken = (payloadData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const jwtAccessToken = JWT.sign(
                {
                    userId: payloadData.userId,
                    firstName: payloadData.firstName,
                    lastName: payloadData.lastName,
                    email: payloadData.email,
                },
                process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
                {
                    expiresIn: `${process.env.JWT_ACCESS_EXPIRATION_MINUTES}m`
                }
            );

            resolve(jwtAccessToken);
        } catch (error) {
            logger.error(error.message, { status: 500, path: __filename })
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
                    firstName: payloadData.firstName,
                    lastName: payloadData.lastName,
                    email: payloadData.email,
                },
                process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
                {
                    expiresIn: `${process.env.JWT_REFRESH_EXPIRATION_DAYS}d`
                }
            );

            resolve(jwtRefreshToken);
        } catch (error) {
            logger.error(error.message, { status: 500, path: __filename });
            console.log(error);
            reject(error);
        }
    })
}

const verifyAccessToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies[process.env.JWT_ACCESS_TOKEN_HEADER];

        if (!accessToken) {
            throw httpErrors[401]('Unauthorized');
        }

        const payloadData = JWT.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);

        if (!payloadData) {
            throw httpErrors[401](notAuthorized);
        }

        req.payloadData = payloadData;

        next();

    } catch (error) {
        logger.error(error.message, { status: "500", path: __filename });
        console.log(error);
        next(error);
    }
}


const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies[process.env.JWT_REFRESH_TOKEN_HEADER];

        if (!refreshToken) {
            throw httpErrors[401]('Unauthorized');
        }

        const payloadData = JWT.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

        if (!payloadData) {
            throw httpErrors[401](notAuthorized);
        }

        req.payloadData = payloadData;

        next();

    } catch (error) {
        logger.error(error.message, { status: 500, path: __filename });
        console.log(error);
        next(error);
    }
}

// const removeToken = (payloadData) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const accessTokenKey = `access_token:${payloadData.userId}`;
//             const refreshTokenKey = `refresh_token:${payloadData.userId}`;
//             await redisClient.DEL(accessTokenKey);
//             await redisClient.DEL(refreshTokenKey);

//             resolve();
//         } catch (error) {
//             logger.error(error.message, { status: 500, path: __filename });
//             console.log(error);
//             reject(httpErrors.InternalServerError(error));
//         }
//     })

// }

module.exports = {
    verifyAccessToken,
    // removeToken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
}