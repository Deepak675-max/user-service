const dotEnv = require("dotenv");

const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev';
dotEnv.config({ path: envFile });

module.exports = {
    APP_PORT: process.env.APP_PORT,
    JWT_ACCESS_TOKEN_SECRET_KEY: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    JWT_ACCESS_TOKEN_HEADER: process.env.JWT_ACCESS_TOKEN_HEADER,
    JWT_REFRESH_TOKEN_SECRET_KEY: process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    JWT_REFRESH_TOKEN_HEADER: process.env.JWT_REFRESH_TOKEN_HEADER,
    JWT_ACCESS_EXPIRATION_MINUTES: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    JWT_REFRESH_EXPIRATION_DAYS: process.env.JWT_REFRESH_EXPIRATION_DAYS,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASS: process.env.REDIS_PASS,
    DEFAULT_OFFSET: process.env.DEFAULT_OFFSET,
    DEFAULT_LIMIT: process.env.DEFAULT_LIMIT,
    DEFAULT_SORT_BY: process.env.DEFAULT_SORT_BY,
    DEFAULT_SORT_ORDER: process.env.DEFAULT_SORT_ORDER
};
