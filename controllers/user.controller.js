const httpErrors = require('http-errors');
const joiUser = require('../utils/joi/user/user.joi_validation');
const UserService = require("../services/user/user.service");

const userService = new UserService();

const registerUser = async (req, res, next) => {
    try {
        const userDetails = await joiUser.userRegistrationSchema.validateAsync(req.body);

        await userService.signUp(userDetails, false);

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    message: "User SignUp successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
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
            res
                .header('refresh-token', jwtRefreshToken)
                .header('access-token', jwtAccessToken)
                .status(200).send({
                    error: false,
                    data: {
                        user: {
                            id: user._id,
                            email: user.email
                        },
                        message: "User login successfully",
                    },
                });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
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
        next(error);
    }
}

const logoutUser = async (req, res, next) => {
    try {
        // Check if Payload contains appAgentId
        if (!req.user._id) {
            throw httpErrors.UnprocessableEntity(
                `JWT Access Token error : Missing Payload Data`
            );
        }
        await userService.logoutUser(req.user.id);
        if (res.headersSent === false) {
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

const updateUser = async (req, res, next) => {
    try {
        const userDetails = await joiUser.updateUserSchema.validateAsync(req.body);
        const updatedUser = await userService.updateUser(userDetails);
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    user: updatedUser,
                    message: "User is updated successfully",
                },
            });
        }
    } catch (error) {
        next(error);

    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUser
}
