const express = require("express");

const userServiceRouter = express.Router();

const authMiddleware = require('../../middlewares/auth.middleware');

const userController = require("../../controllers/user.controller");

userServiceRouter.post('/signup', userController.registerUser);
userServiceRouter.post('/login', userController.loginUser);
userServiceRouter.get('/:id/profile', authMiddleware.verifyAccessToken, userController.getUserProfile);
userServiceRouter.get('/logout', authMiddleware.verifyAccessToken, userController.logoutUser);

module.exports = userServiceRouter;