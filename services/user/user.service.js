const UserModel = require("../../models/user/user.model");
const jwtModule = require("../../middlewares/auth.middleware");
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');

class UserService {

    async signUp(userDetails, isAdmin) {
        try {
            const user = await UserModel.findOne({
                email: userDetails.email,
                isDeleted: false
            });

            if (user)
                throw httpErrors.Conflict(`User with email: ${userDetails.email} already exist`);

            userDetails.password = await bcrypt.hash(userDetails.password, 10);

            const newUser = new UserModel({
                name: userDetails.name,
                email: userDetails.email,
                password: userDetails.password,
                isAdmin: isAdmin,
            });

            await newUser.save();
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const user = await UserModel.findOne({
                email: email,
                isDeleted: false
            });

            if (!user)
                throw httpErrors.Unauthorized("invalid username or password");

            const isPasswordMatch = await bcrypt.compare(password, user.password).catch(error => {
                throw httpErrors.Unauthorized("Inavalid username or password");
            });

            if (!isPasswordMatch)
                throw httpErrors.Unauthorized("invalid username or password");

            return user;

        } catch (error) {
            throw error;
        }
    }

    async logoutUser(userId) {
        try {
            await jwtModule
                .removeToken({
                    userId: userId,
                })
                .catch((error) => {
                    throw httpErrors.InternalServerError(
                        `JWT Access Token error : ${error.message}`
                    );
                });

        } catch (error) {
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const user = await UserModel.findOne({
                _id: userId,
                isDeleted: false
            });

            if (!user) throw httpErrors.NotFound("User does not exist");

            return user;
        } catch (error) {
            throw error;
        }
    }

    async getUsers() {
        const users = await UserModel.find({
            isDeleted: false
        });
        return users;
    }

    async updateUser(userDetails) {
        try {
            const updatedUser = await UserModel.findOneAndUpdate({ _id: userDetails.userId, isDeleted: false }, userDetails, {
                new: true
            });
            if (!updatedUser) throw httpErrors.NotFound('User not found');
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }


    async getUserProfile(userId) {
        try {
            const userProfile = await UserModel.findOne({
                _id: userId,
                isDeleted: false
            }).select('-createdAt -updatedAt -isDeleted -password');

            if (!userProfile) throw httpErrors.NotFound('User profile does not exist');

            return userProfile;
        } catch (error) {
            throw error;
        }
    }

    async getJWTAccessToken(userId, email) {
        const jwtAccessToken = await jwtModule.signAccessToken({
            userId: userId,
            email: email
        });
        return jwtAccessToken;
    }

    async getJWTRefreshToken(userId, email) {
        const jwtRefreshToken = await jwtModule.signRefreshToken({
            userId: userId,
            email: email,
        });
        return jwtRefreshToken;
    }
}

module.exports = UserService;