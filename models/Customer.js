const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
    avatar: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null
        }
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true,
        unique: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

// Customer Model
const Customer = mongoose.model("Customer", customerSchema);

// Validate Create Customer
function validateCreateCustomer(obj) {
    const schema = Joi.object({
        firstName: Joi.string().trim().required(),
        lastName: Joi.string().trim().required(),
        email: Joi.string().email().trim().allow(""),
        phone: Joi.string().trim().allow(""),
        address: Joi.object({
            street: Joi.string().trim().allow(""),
            city: Joi.string().trim().allow(""),
            state: Joi.string().trim().allow(""),
            zipCode: Joi.string().trim().allow(""),
        })
    });
    return schema.validate(obj);
}

// Validate Update Customer
function validateUpdateCustomer(obj) {
    const schema = Joi.object({
        firstName: Joi.string().trim().min(1),
        lastName: Joi.string().trim().min(1),
        email: Joi.string().email().trim(),
        phone: Joi.string().trim(),
        address: Joi.object({
            street: Joi.string().trim(),
            city: Joi.string().trim(),
            state: Joi.string().trim(),
            zipCode: Joi.string().trim()
        })
    });
    return schema.validate(obj);
}

module.exports = {
    Customer,
    validateCreateCustomer,
    validateUpdateCustomer
};