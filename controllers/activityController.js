const asyncHandler = require("express-async-handler");
const { Activity, validateCreateActivity, validateUpdateActivity } = require("../models/Activity");

// ---------------------- Create New Activity ------------------------
module.exports.createActivityCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateActivity(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { description, date, images } = req.body;

    const newActivity = await Activity.create({
        description,
        date,
        images,
        createdBy: req.user.id,
    });

    res.status(201).json({
        message: "Activity created successfully",
        activity: newActivity,
    });
});

// ---------------------- Get All Activities ------------------------
module.exports.getAllActivitiesCtrl = asyncHandler(async (req, res) => {
    const activities = await Activity.find({ createdBy: req.user.id })
        .sort({ date: 1 });

    // لو مفيش أي داتا
    if (activities.length === 0) {
        return res.status(404).json({ message: "No activities found" });
    }

    res.status(200).json({
        message: "Activities fetched successfully",
        count: activities.length,
        activities,
    });
});

// ---------------------- Update Activity ------------------------
module.exports.updateActivityCtrl = asyncHandler(async (req, res) => {
    const activityId = req.params.id;

    const { error } = validateUpdateActivity(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const activity = await Activity.findOne({ _id: activityId, createdBy: req.user.id });
    if (!activity) {
        return res.status(404).json({ message: "Activity not found or unauthorized" });
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
        activityId,
        { $set: req.body },
        { new: true }
    );

    res.status(200).json({
        message: "Activity updated successfully",
        activity: updatedActivity
    });
});

// ---------------------- Delete Activity ------------------------
module.exports.deleteActivityCtrl = asyncHandler(async (req, res) => {
    const activityId = req.params.id;

    const activity = await Activity.findOne({ _id: activityId, createdBy: req.user.id });
    if (!activity) {
        return res.status(404).json({ message: "Activity not found or unauthorized" });
    }

    await Activity.findByIdAndDelete(activityId);

    res.status(200).json({ message: "Activity deleted successfully" });
});

// ---------------------- filter Activities ------------------------
module.exports.getFilteredActivitiesCtrl = asyncHandler(async (req, res) => {
    const { search, fromDate, toDate, sort } = req.query;

    const query = {
        createdBy: req.user.id,
    };

    // بحث بالكلمة جوه الوصف
    if (search) {
        query.description = { $regex: search, $options: "i" };
    }

    // فلترة بالتاريخ من / إلى
    if (fromDate || toDate) {
        query.date = {};
        if (fromDate) query.date.$gte = new Date(fromDate);
        if (toDate) query.date.$lte = new Date(toDate);
    }

    // ترتيب النتائج
    let sortOption = {};
    switch (sort) {
        case "latest":
            sortOption = { createdAt: -1 };
            break;
        case "oldest":
            sortOption = { createdAt: 1 };
            break;
        case "date_asc":
            sortOption = { date: 1 };
            break;
        case "date_desc":
            sortOption = { date: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const activities = await Activity.find(query).sort(sortOption);

    if (activities.length === 0) {
        return res.status(404).json({ message: "No activities found" });
    }

    res.status(200).json({
        message: "Filtered activities fetched successfully",
        count: activities.length,
        activities,
    });
});