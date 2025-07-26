const asyncHandler = require("express-async-handler");
const { Deal, validateCreateDeal, validateUpdateDeal } = require("../models/Deal");
const { cloudinaryUploadImage } = require("../utils/cloudinary");

// ---------------------- Create New Deal ------------------------
module.exports.createDealCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateDeal(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let roomImages = [];

    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            const imagePath = file.path;
            const uploadedImage = await cloudinaryUploadImage(imagePath);
            return {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id
            };
        });

        roomImages = await Promise.all(uploadPromises);
    }

    const deal = await Deal.create({
        ...req.body,
        roomImages,
        createdBy: req.user.id
    });

    res.status(201).json({
        message: "Deal created successfully",
        deal
    });
});

// ---------------------- Get All Deals ------------------------
module.exports.getAllDealsCtrl = asyncHandler(async (req, res) => {
    const deals = await Deal.find({ createdBy: req.user.id })
        .populate("customer", "firstName lastName email")
        .sort({ createdAt: -1 });

    // لو مفيش أي داتا
    if (deals.length === 0) {
        return res.status(404).json({ message: "No deals found" });
    }

    res.status(200).json(deals);
});

// ---------------------- Update Deal ------------------------
module.exports.updateDealCtrl = asyncHandler(async (req, res) => {
    const dealId = req.params.id;

    const { error } = validateUpdateDeal(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const deal = await Deal.findOne({ _id: dealId, createdBy: req.user.id });
    if (!deal) {
        return res.status(404).json({ message: "Deal not found or unauthorized" });
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
        dealId,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        message: "Deal updated successfully",
        deal: updatedDeal
    });
});

// ---------------------- Delete Deal ------------------------
module.exports.deleteDealCtrl = asyncHandler(async (req, res) => {
    const dealId = req.params.id;

    const deal = await Deal.findOne({ _id: dealId, createdBy: req.user.id });
    if (!deal) {
        return res.status(404).json({ message: "Deal not found or unauthorized" });
    }

    // لو فيه صور roomImages احذفها كلها من Cloudinary
    if (deal.roomImages && deal.roomImages.length > 0) {
        for (const image of deal.roomImages) {
            if (image.publicId) {
                await cloudinaryRemoveImage(image.publicId);
            }
        }
    }

    // بعد ما حذفنا الصور احذف الديل
    await Deal.findByIdAndDelete(dealId);

    res.status(200).json({ message: "Deal deleted successfully" });
});

// ---------------------- filter Deals ------------------------
module.exports.getFilteredDealsCtrl = asyncHandler(async (req, res) => {
    const {
        search, city, state, progress, sort,
        minPrice, maxPrice,
        minArea, maxArea,
        minPeople, maxPeople,
        fromDate, toDate,
        roomAccess
    } = req.query;

    const query = {
        createdBy: req.user.id,
    };

    // بحث عام
    if (search) {
        query.$or = [
            { specialInstructions: { $regex: search, $options: "i" } },
            { "address.street": { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.state": { $regex: search, $options: "i" } },
        ];
    }

    if (city) query["address.city"] = { $regex: city, $options: "i" };
    if (state) query["address.state"] = { $regex: state, $options: "i" };
    if (progress) query.progress = progress;
    if (roomAccess) query.roomAccess = roomAccess;

    // فلترة بالسعر
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // فلترة بالمساحة
    if (minArea || maxArea) {
        query.roomArea = {};
        if (minArea) query.roomArea.$gte = Number(minArea);
        if (maxArea) query.roomArea.$lte = Number(maxArea);
    }

    // فلترة بعدد الأفراد
    if (minPeople || maxPeople) {
        query.numberOfPeople = {};
        if (minPeople) query.numberOfPeople.$gte = Number(minPeople);
        if (maxPeople) query.numberOfPeople.$lte = Number(maxPeople);
    }

    // فلترة بالتاريخ
    if (fromDate || toDate) {
        query.appointmentDate = {};
        if (fromDate) query.appointmentDate.$gte = new Date(fromDate);
        if (toDate) query.appointmentDate.$lte = new Date(toDate);
    }

    // الترتيب
    let sortOption = {};
    switch (sort) {
        case "latest":
            sortOption = { createdAt: -1 };
            break;
        case "oldest":
            sortOption = { createdAt: 1 };
            break;
        case "price_asc":
            sortOption = { price: 1 };
            break;
        case "price_desc":
            sortOption = { price: -1 };
            break;
        case "area_asc":
            sortOption = { roomArea: 1 };
            break;
        case "area_desc":
            sortOption = { roomArea: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const deals = await Deal.find(query)
        .populate("customer", "firstName lastName")
        .sort(sortOption);

    // لو مفيش أي داتا
    if (deals.length === 0) {
        return res.status(404).json({ message: "No deals found" });
    }

    res.status(200).json({
        message: "Filtered deals fetched successfully",
        count: deals.length,
        deals,
    });
});