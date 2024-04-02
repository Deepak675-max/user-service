const joi = require('joi');

const userRegistrationSchema = joi.object({
    firstName: joi.string().trim().required(),
    lastName: joi.string().trim().required(),
    email: joi.string().trim().email().required(),
    phoneNumber: joi.string().length(10).trim().required(),
    password: joi.string().trim().required(),
    gender: joi.string().trim().required(),
});

const loginUserSchema = joi.object({
    email: joi.string().trim().email().required(),
    password: joi.string().trim().required()
});

const createUserAddressSchema = joi.object({
    streetAddressLine: joi.string().trim().required(),
    city: joi.string().trim().required(),
    state: joi.string().trim().required(),
    country: joi.string().trim().required(),
    postalCode: joi.number().required(),
});

const getUserProfileSchema = joi.object({
    id: joi.string().trim().hex().length(24).required()
})

module.exports = {
    userRegistrationSchema,
    loginUserSchema,
    createUserAddressSchema,
    getUserProfileSchema
}

