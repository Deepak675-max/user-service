const express = require("express");

const taskServiceRouter = express.Router();

const authMiddleware = require('../../middlewares/auth.middleware');

const taskController = require("../../controllers/task.controller");

taskServiceRouter.post('/create', authMiddleware.verifyAccessToken, taskController.createTask);
taskServiceRouter.post('/', authMiddleware.verifyAccessToken, taskController.getTasks);
taskServiceRouter.get('/:id/details', authMiddleware.verifyAccessToken, taskController.getTasksDetails);
taskServiceRouter.put('/update', authMiddleware.verifyAccessToken, taskController.updateTask);
taskServiceRouter.delete('/:id/delete', authMiddleware.verifyAccessToken, taskController.deleteTask);

module.exports = taskServiceRouter;