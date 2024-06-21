const joi = require('joi');

const createTaskSchema = joi.object({
    name: joi.string().trim().required(),
    description: joi.string().trim().required(),
    status: joi.string().trim().valid("Pending", "Completed").default("Pending"),
    isDeleted: joi.boolean().allow(null).default(false)
});

const getTasksSchema = joi.object({
    status: joi.string().trim().valid("Pending", "Completed").optional().default(null),
    search: joi.string().trim().optional().allow('').default(null),
    metaData: joi.object({
        sortBy: joi.string().trim().optional().default(null),
        sortOrder: joi.string().trim().optional().default(null),
        offset: joi.number().optional().default(null),
        limit: joi.number().optional().default(null),
    }).optional().default(null)
});

const getTaskDetailSchema = joi.object({
    id: joi.string().trim().hex().length(24).required()
});

const updateTaskSchema = joi.object({
    taskId: joi.string().trim().hex().length(24).required(),
    name: joi.string().trim().required(),
    description: joi.string().trim().required(),
    status: joi.string().trim().valid("Pending", "Completed").required(),
    userId: joi.string().trim().hex().length(24),
    isDeleted: joi.boolean().allow(null).default(false)
});

const deleteTaskSchema = joi.object({
    id: joi.string().trim().hex().length(24).required()
});

module.exports = {
    createTaskSchema,
    getTasksSchema,
    getTaskDetailSchema,
    updateTaskSchema,
    deleteTaskSchema
}

