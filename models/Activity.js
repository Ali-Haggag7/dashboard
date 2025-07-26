const mongoose = require("mongoose");
const Joi = require("joi");

const activitySchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "Activity description is required"],
    },
    date: {
        type: Date,
        required: [true, "Activity date is required"],
    },
    images: {
        type: [String],
        default: [],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});

// Activity model
const Activity = mongoose.model("Activity", activitySchema);

// Validate Create Activity
function validateCreateActivity(data) {
    const schema = Joi.object({
        description: Joi.string().min(3).max(500).required(),
        date: Joi.date().required(),
        images: Joi.array().items(Joi.string().uri()).optional(),
    });

    return schema.validate(data);
}

// Validate Update Activity
function validateUpdateActivity(data) {
    const schema = Joi.object({
        description: Joi.string().min(3).max(500).optional(),
        date: Joi.date().optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
    });

    return schema.validate(data);
}

module.exports = {
    Activity,
    validateCreateActivity,
    validateUpdateActivity
};
