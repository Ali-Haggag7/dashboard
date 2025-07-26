const mongoose = require("mongoose");
const Joi = require("joi");

const dealSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    roomImages: {
        type: [
            {
                url: String,
                publicId: String,
            }
        ],
        default: [],
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    roomArea: {
        type: Number
    },
    numberOfPeople: {
        type: Number
    },
    appointmentDate: {
        type: Date
    },
    specialInstructions: {
        type: String,
        trim: true
    },
    roomAccess: {
        type: String,
        enum: ["Keys with doorman", "Keys provided", "Other"]
    },
    price: {
        type: Number
    },
    progress: {
        type: String,
        enum: ["In Progress", "Completed", "Cancelled"],
        default: "In Progress"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

// Deal Model
const Deal = mongoose.model("Deal", dealSchema);

// Validate Create Deal
function validateCreateDeal(obj) {
    const schema = Joi.object({
        // Fالي Aيعني أرقام وحروف من) hexسلسلة فيها 24 حرف من النوع 
        customer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        roomImages: Joi.array().items(Joi.string().uri()).optional(),

        address: Joi.object({
            street: Joi.string().allow("").trim(),
            city: Joi.string().allow("").trim(),
            state: Joi.string().allow("").trim(),
            zipCode: Joi.string().allow("").trim(),
        }).optional(),

        roomArea: Joi.number().required(),
        numberOfPeople: Joi.number().required(),
        appointmentDate: Joi.date().required(),
        specialInstructions: Joi.string().allow("").trim(),

        roomAccess: Joi.string().valid("Keys with doorman", "Keys provided", "Other").required(),
        price: Joi.number().required(),

        progress: Joi.string().valid("In Progress", "Completed", "Cancelled").default("In Progress"),
    });
    return schema.validate(obj);
}

// Validate Update Deal
function validateUpdateDeal(obj) {
    const schema = Joi.object({
        roomImages: Joi.array().items(Joi.string().uri()).optional(),
        address: Joi.object({
            street: Joi.string().allow("").trim(),
            city: Joi.string().allow("").trim(),
            state: Joi.string().allow("").trim(),
            zipCode: Joi.string().allow("").trim(),
        }).optional(),
        roomArea: Joi.number().optional(),
        numberOfPeople: Joi.number().optional(),
        appointmentDate: Joi.date().optional(),
        specialInstructions: Joi.string().allow("").trim().optional(),
        roomAccess: Joi.string().valid("Keys with doorman", "Keys provided", "Other").optional(),
        price: Joi.number().optional(),
        progress: Joi.string().valid("In Progress", "Completed", "Cancelled").optional(),
    });
    return schema.validate(obj);
}

module.exports = {
    Deal,
    validateCreateDeal,
    validateUpdateDeal
};