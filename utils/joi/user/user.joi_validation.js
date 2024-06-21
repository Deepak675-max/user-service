const joi = require('joi');

const userRegistrationSchema = joi.object({
    name: joi.string().trim().required(),
    email: joi.string().trim().email().required(),
    isAdmin: joi.boolean().default(false),
    password: joi.string().trim().required(),
});

const updateUserSchema = joi.object({
    userId: joi.string().trim().hex().length(24).required(),
    name: joi.string().trim().required(),
    email: joi.string().trim().email().required(),
});

const loginUserSchema = joi.object({
    email: joi.string().trim().email().required(),
    password: joi.string().trim().required()
});

const getUserProfileSchema = joi.object({
    id: joi.string().trim().hex().length(24).required()
})

module.exports = {
    userRegistrationSchema,
    loginUserSchema,
    getUserProfileSchema,
    updateUserSchema
}

