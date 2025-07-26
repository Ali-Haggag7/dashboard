const mongoose = require("mongoose");
const Joi = require("joi");

// Task Schema
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true });

// Task model
const Task = mongoose.model("Task", taskSchema);

// Validation for Create
function validateCreateTask(obj) {
    const schema = Joi.object({
        description: Joi.string().trim().required(),
        dueDate: Joi.date().required(),
    });

    return schema.validate(obj);
}

// Validation for Update
function validateUpdateTask(obj) {
    const schema = Joi.object({
        description: Joi.string().trim().optional(),
        dueDate: Joi.date().optional(),
        isCompleted: Joi.boolean().optional()
    });

    return schema.validate(obj);
}

module.exports = {
    Task,
    validateCreateTask,
    validateUpdateTask,
};