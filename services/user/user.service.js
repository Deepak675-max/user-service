const UserModel = require("../../models/user/user.model");
const AddressModel = require("../../models/address/address.model");
const jwtModule = require("../../middlewares/auth.middleware");
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');


class UserService {

    async signUp(userDetails, userRole) {
        try {
            const user = await UserModel.findOne({
                email: userDetails.email,
                phoneNumber: userDetails.phoneNumber,
                isDeleted: false
            });

            if (user)
                throw httpErrors.Conflict(`User with email: ${userDetails.email} and phone number: ${userDetails.phoneNumber} already exist`);

            userDetails.password = await bcrypt.hash(userDetails.password, 10);

            const newUser = new UserModel({
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
                phoneNumber: userDetails.phoneNumber,
                gender: userDetails.gender,
                password: userDetails.password,
                role: userRole,
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
                throw httpErrors.Unauthorized('invalid username or password');

            const isPasswordMatch = await bcrypt.compare(password, user.password).catch(error => {
                throw httpErrors.Unauthorized("Inavalid username or password");
            });

            if (!isPasswordMatch)
                throw httpErrors.Unauthorized('invalid username or password.');

            return user;

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

    async createAddress(addressDetails, userId) {
        try {
            const user = await this.getUser(userId);

            const newAddress = new AddressModel({
                streetAddressLine: addressDetails.streetAddressLine,
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
        } catch (error) {
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const userProfile = await UserModel.findOne({
                _id: userId,
                isDeleted: false
            }).select('-createdAt -updatedAt -isDeleted').populate({
                path: 'address',
                select: '-createdAt -updatedAt'
            });

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