const TaskModel = require("../../models/task/task.model");
const httpErrors = require('http-errors');

class TaskService {

    async createTask(taskInput) {
        const newTask = new TaskModel(taskInput);
        const savedTask = await newTask.save();
        return savedTask;
    }

    async getTasks(queryDetails) {
        const { where, skip, limit, sort } = queryDetails;
        const tasks = await TaskModel
            .find(where)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .select("-isDeleted -createdAt -updatedAt")
            .lean()

        return tasks;
    }

    async getTaskDetails(taskId) {
        try {
            console.log(taskId);
            const task = await TaskModel.findOne({
                _id: taskId,
                isDeleted: false
            }).select("-isDeleted").lean();
            if (!task) throw httpErrors.NotFound(`Task not found`);
            return task;
        } catch (error) {
            throw error;
        }
    }

    async updateTask(taskDetails) {
        try {
            const updatedTask = await TaskModel.findOneAndUpdate({ _id: taskDetails.taskId, isDeleted: false }, taskDetails, {
                new: true
            });
            if (!updatedTask) throw httpErrors.NotFound('Task not found');
            return updatedTask;
        } catch (error) {
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            const task = await TaskModel.findOneAndUpdate(
                {
                    _id: taskId,
                    isDeleted: false
                },
                {
                    $set: {
                        isDeleted: true
                    }
                },
                { new: true }
            );
            console.log(task);
            if (!task) throw httpErrors.NotFound("Task not found");
        } catch (error) {
            throw error;
        }
    }



}

module.exports = TaskService;