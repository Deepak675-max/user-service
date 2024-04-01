const express = require("express");

const userServiceRouter = express.Router();

const authMiddleware = require('../../middlewares/auth.middleware');

const userController = require("../../controllers/user.controller");

userServiceRouter.post('/merchant/register', userController.registerMerchant);
userServiceRouter.post('/login', userController.loginUser);
userServiceRouter.post('/client/register', userController.registerClient);
userServiceRouter.post('/add-address', userController.addUserAddress);
userServiceRouter.get('/profile/:userId', authMiddleware.verifyAccessToken, userController.getUserDetails);
userServiceRouter.get('/logout', authMiddleware.verifyAccessToken, userController.logoutUser);
userServiceRouter.get('/refresh', authMiddleware.verifyRefreshToken, userController.refreshUser);

module.exports = userServiceRouter;