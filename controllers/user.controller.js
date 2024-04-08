const UserModel = require("../models/user/user.model");
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');
const joiUser = require('../utils/joi/user/user.joi_validation');
const { logger } = require("../../Product_Service/utils/error_logger/winston");
const AddressModel = require("../models/address/address.model");
const UserService = require("../services/user/user.service");

const userService = new UserService();

const registerMerchant = async (req, res, next) => {
    try {
        const merchantDetails = await joiUser.userRegistrationSchema.validateAsync(req.body);

        await userService.signUp(merchantDetails, "MERCHANT");

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    message: "Merchant Register successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const registerClient = async (req, res, next) => {
    try {
        const clientDetails = await joiUser.userRegistrationSchema.validateAsync(req.body);

        await userService.signUp(clientDetails, "CLIENT");

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    message: "Client Register successfully",
                },
            });
        }

    } catch (error) {
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const createUserAddress = async (req, res, next) => {
    try {
        const addressDetails = await joiUser.createUserAddressSchema.validateAsync(req.body);

        await userService.createAddress(addressDetails, req.payloadData.userId);

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    message: "User Address created successfully",
                },
            });
        }

    } catch (error) {
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const loginUser = async (req, res, next) => {
    try {
        const userDetails = await joiUser.loginUserSchema.validateAsync(req.body);

        const user = await userService.login(userDetails.email, userDetails.password);

        const jwtAccessToken = await userService.getJWTAccessToken(user._id, user.email);

        const jwtRefreshToken = await userService.getJWTRefreshToken(user._id, user.email);

        if (res.headersSent === false) {
            res.cookie('access-token', jwtAccessToken, { httpOnly: true, maxAge: 86400000, sameSite: 'None', secure: true });
            res.cookie('refresh-token', jwtRefreshToken, { httpOnly: true, maxAge: 86400000, sameSite: 'None', secure: true });
            res.status(200).send({
                error: false,
                data: {
                    user: {
                        id: user._id,
                        email: user.email
                    },
                    accessToken: jwtAccessToken,
                    refreshToken: jwtRefreshToken,
                    message: "User login successfully",
                },
            });
        }

    } catch (error) {
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const refreshUser = async (req, res, next) => {
    try {
        const user = req.payloadData;

        const jwtAccessToken = await userService.getJWTAccessToken(user.email, user.userId)

        if (res.headersSent === false) {
            res.cookie('access-token', jwtAccessToken, { httpOnly: true, maxAge: 86400000, sameSite: 'None', secure: true });
            res.status(200).send({
                error: false,
                data: {
                    accessToken: jwtAccessToken,
                    message: "User refereshed successfully",
                },
            });
        }

    } catch (error) {
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const getUserProfile = async (req, res, next) => {
    try {
        const { id } = await joiUser.getUserProfileSchema.validateAsync(req.params);

        const userProfile = await userService.getUserProfile(id);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    userProfile: userProfile,
                    message: "User profiile fetched successfully",
                },
            });
        }
    } catch (error) {
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const logoutUser = async (req, res, next) => {
    try {

        // Check if Payload contains appAgentId
        if (!req.payloadData.userId) {
            throw httpErrors.UnprocessableEntity(
                `JWT Refresh Token error : Missing Payload Data`
            );
        }

        if (res.headersSent === false) {
            res.clearCookie('access-token');
            res.clearCookie('access-token');
            res.status(200).send({
                error: false,
                data: {
                    message: "User logged out successfully.",
                },
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerMerchant,
    registerClient,
    loginUser,
    logoutUser,
    refreshUser,
    getUserProfile,
    createUserAddress
}
