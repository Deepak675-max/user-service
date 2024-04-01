const UserModel = require("../models/user/user.model");
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');
const jwtModule = require('../middlewares/auth.middleware')
const joiUser = require('../helper/joi/user/user.joi_validation');

const { logger } = require("../helper/common/winston");
const AddressModel = require("../models/address/address.model");

const registerMerchant = async (req, res, next) => {
    try {
        const merchantDetails = await joiUser.userRegistrationSchema.validateAsync(req.body);

        const doesMerchantExist = await UserModel.findOne({
            email: merchantDetails.email,
            phoneNumber: merchantDetails.phoneNumber,
            isDeleted: false
        });

        if (doesMerchantExist)
            throw httpErrors.Conflict(`Merchant with email: ${merchantDetails.email} and phone number: ${merchantDetails.phoneNumber} already exist`);


        const newMerchant = new UserModel({
            firstName: merchantDetails.firstName,
            lastName: merchantDetails.lastName,
            email: merchantDetails.email,
            phoneNumber: merchantDetails.phoneNumber,
            gender: merchantDetails.gender,
            password: merchantDetails.password,
            role: "MERCHANT",
        });

        await newMerchant.save();

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

        const doesClientExist = await UserModel.findOne({
            email: clientDetails.email,
            phoneNumber: clientDetails.phoneNumber,
            isDeleted: false
        });

        if (doesClientExist)
            throw httpErrors.Conflict(`Client with email: ${clientDetails.email} and phone number: ${clientDetails.phoneNumber} already exist`);

        clientDetails.password = await bcrypt.hash(clientDetails.password, 10);

        const newClient = new UserModel({
            firstName: clientDetails.firstName,
            lastName: clientDetails.lastName,
            email: clientDetails.email,
            phoneNumber: clientDetails.phoneNumber,
            gender: clientDetails.gender,
            password: clientDetails.password,
            role: "CLIENT",
        });

        await newClient.save();

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

const addUserAddress = async (req, res, next) => {
    try {
        const addressDetails = await joiUser.addUserAddressSchema.validateAsync(req.body);
        const user = await UserModel.findOne({
            _id: addressDetails.userId,
            isDeleted: false
        });

        if (!user) throw httpErrors.NotFound("User does not exist");

        const newAddress = new AddressModel({
            addressLine: addressDetails.addressLine,
            city: addressDetails.city,
            state: addressDetails.state,
            country: addressDetails.country,
            postalCode: addressDetails.postalCode,
            type: addressDetails.type
        });

        const userAddress = await newAddress.save();

        await user.updateOne({
            $set: {
                address: userAddress._id
            },
        }, {
            new: true
        });

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

        const user = await UserModel.findOne({
            email: userDetails.email,
            isDeleted: false
        });

        if (!user)
            throw httpErrors.Unauthorized('invalid username or password');

        const isPasswordMatch = await bcrypt.compare(userDetails.password, user.password).catch(error => {
            throw httpErrors.Unauthorized("Inavalid username or password");
        });

        if (!isPasswordMatch)
            throw httpErrors.Unauthorized('invalid username or password.');

        const jwtAccessToken = await jwtModule.signAccessToken({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });

        const jwtRefreshToken = await jwtModule.signRefreshToken({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });

        req.session.userId = user._id;

        if (res.headersSent === false) {
            res.cookie('access-token', jwtAccessToken, { httpOnly: true, maxAge: 86400000, sameSite: 'None', secure: true });
            res.cookie('refresh-token', jwtRefreshToken, { httpOnly: true, maxAge: 86400000, sameSite: 'None', secure: true });
            res.status(200).send({
                error: false,
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
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

        const jwtAccessToken = await jwtModule.signAccessToken({
            userId: user.userId,
            email: user.email
        });

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

const getUserDetails = async (req, res, next) => {
    try {
        const userDetailsSchema = await joiUser.getUserDetailsSchema.validateAsync(req.params);
        const user = await UserModel.findOne({
            _id: userDetailsSchema.userId,
            isDeleted: false
        }).populate('address');
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    user: user,
                    message: "User fetched successfully",
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
    getUserDetails,
    addUserAddress
}
