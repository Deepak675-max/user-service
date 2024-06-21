const joiTask = require('../utils/joi/task/task.joi_validation.js');
const TaskService = require("../services/task/task.service");
const { DEFAULT_LIMIT, DEFAULT_OFFSET, DEFAULT_SORT_BY, DEFAULT_SORT_ORDER } = require("../config/index.js");

const taskService = new TaskService();

const createTask = async (req, res, next) => {
    try {
        const taskDetails = await joiTask.createTaskSchema.validateAsync(req.body);

        taskDetails.userId = req.user._id;

        const newTask = await taskService.createTask(taskDetails);

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    taskDetails: newTask,
                    message: "Task is created successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }

}

const getTasks = async (req, res, next) => {
    try {
        const querySchema = await joiTask.getTasksSchema.validateAsync(req.body);
        const page = querySchema.metaData?.offset || DEFAULT_OFFSET;
        const pageSize = querySchema.metaData?.limit || DEFAULT_LIMIT;
        const sortBy = querySchema.metaData?.sortBy || DEFAULT_SORT_BY;
        const sortOrder = querySchema.metaData?.sortOrder || DEFAULT_SORT_ORDER;
        const sort = {};
        sort[sortBy] = sortOrder;

        const queryDetails = {
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort: sort,
            where: { isDeleted: false }
        };

        if (querySchema.status) {
            queryDetails.where.status = querySchema.status;
        }

        if (querySchema.search) {
            queryDetails.where.$or = [
                { name: { $regex: searchValue } },
                { description: { $regex: searchValue } },
                { status: { $regex: searchValue } }
            ];
        }

        const tasks = await taskService.getTasks(queryDetails);

        // Send the response
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    tasks: tasks,
                    metaDate: {
                        sortBy,
                        sortOrder,
                        limit: pageSize,
                        offset: page,
                    },
                    message: "Tasks fetched successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const getTasksDetails = async (req, res, next) => {
    try {
        const { id: taskId } = await joiTask.getTaskDetailSchema.validateAsync(req.params);

        const task = await taskService.getTaskDetails(taskId);

        // Send the response
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    task: task,
                    message: "Task Details fetched successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const updateTask = async (req, res, next) => {
    try {
        const taskDetails = await joiTask.updateTaskSchema.validateAsync(req.body);

        taskDetails.userId = req.user._id;

        const updatedTask = await taskService.updateTask(taskDetails);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    task: updatedTask,
                    message: "Task is updated successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const deleteTask = async (req, res, next) => {
    try {
        const { id: taskId } = await joiTask.deleteTaskSchema.validateAsync(req.params);

        await taskService.deleteTask(taskId);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Task is deleted successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

module.exports = {
    createTask,
    getTasks,
    getTasksDetails,
    updateTask,
    deleteTask,
}