const asyncHandler = require("express-async-handler");
const { Customer, validateCreateCustomer, validateUpdateCustomer } = require("../models/Customer");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const fs = require("fs");

// ---------------------- Create New Customer ------------------------
module.exports.createCustomerCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateCustomer(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check for existing email or phone
    const existingCustomer = await Customer.findOne({
        $or: [
            { email: req.body.email },
            { phone: req.body.phone }
        ]
    });

    if (existingCustomer) {
        return res.status(400).json({ message: "Email or phone already exists" });
    }

    // 1. جهز الصورة (لو فيه صورة)
    let avatar = {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        publicId: null
    };

    if (req.file) {
        const imagePath = req.file.path;
        const uploadedImage = await cloudinaryUploadImage(imagePath);
        avatar = {
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id
        };

        // امسح الصورة من السيرفر المحلي
        fs.unlinkSync(imagePath);
    }

    // 2. أنشئ العميل
    const customer = await Customer.create({
        ...req.body,
        avatar,
        createdBy: req.user.id
    });

    res.status(201).json({
        message: "Customer created successfully",
        customer
    });
});

// ---------------------- Get All Customers ------------------------
module.exports.getAllCustomersCtrl = asyncHandler(async (req, res) => {
    const customers = await Customer.find({ createdBy: req.user.id })
        .sort({ createdAt: -1 });

    // لو مفيش أي داتا
    if (customers.length === 0) {
        return res.status(404).json({ message: "No customers found" });
    }

    res.status(200).json({
        message: "Customers fetched successfully",
        count: customers.length,
        customers
    });
});

// ---------------------- Update Customer ------------------------
module.exports.updateCustomerCtrl = asyncHandler(async (req, res) => {
    const customerId = req.params.id;

    const { error } = validateUpdateCustomer(req.body);  // استخدم التحقق الجديد
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const customer = await Customer.findOne({ _id: customerId, createdBy: req.user.id });
    if (!customer) {
        return res.status(404).json({ message: "Customer not found or unauthorized" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        { $set: req.body },
        { new: true }
    );

    res.status(200).json({
        message: "Customer updated successfully",
        customer: updatedCustomer
    });
});

// ---------------------- Delete Customer ------------------------
module.exports.deleteCustomerCtrl = asyncHandler(async (req, res) => {
    const customerId = req.params.id;

    // تأكد إن الكستمر موجود وتابع للمستخدم ده
    const customer = await Customer.findOne({ _id: customerId, createdBy: req.user.id });
    if (!customer) {
        return res.status(404).json({ message: "Customer not found or unauthorized" });
    }

    // احذف الصوره لو عنده
    if (customer.avatar && customer.avatar.publicId) {
        await cloudinaryRemoveImage(customer.avatar.publicId);
    }

    // احذف الكستمر من قاعدة البيانات
    await Customer.findByIdAndDelete(customerId);

    res.status(200).json({ message: "Customer deleted successfully" });
});

// ---------------------- filter Customers ------------------------
module.exports.getFilteredCustomersCtrl = asyncHandler(async (req, res) => {
    const { search, city, state, sort } = req.query;

    const query = {
        createdBy: req.user.id,
    };

    // هنا بنبحث بكل حاجه تخص الاسم اللي هنكتبه بعد السيرش
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ];
    }

    if (city) query["address.city"] = { $regex: city, $options: "i" };
    if (state) query["address.state"] = { $regex: state, $options: "i" };

    let sortOption = {};

    switch (sort) {
        case "latest":
            sortOption = { createdAt: -1 };
            break;
        case "oldest":
            sortOption = { createdAt: 1 };
            break;
        case "name_asc":
            sortOption = { firstName: 1 };
            break;
        case "name_desc":
            sortOption = { firstName: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const customers = await Customer.find(query).sort(sortOption);

    // لو مفيش أي داتا
    if (customers.length === 0) {
        return res.status(404).json({ message: "No customers found" });
    }

    res.status(200).json({
        message: "Filtered customers fetched",
        count: customers.length,
        customers,
    });
});
