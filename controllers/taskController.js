const asyncHandler = require("express-async-handler");
const { Task, validateCreateTask, validateUpdateTask } = require("../models/Task");

// ---------------------- Create New Task ------------------------
module.exports.createTaskCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateTask(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const task = await Task.create({
        ...req.body,
        createdBy: req.user.id,
    });

    res.status(201).json({
        message: "Task created successfully",
        task
    });
});

// ---------------------- Get All Tasks ------------------------
module.exports.getAllTasksCtrl = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ createdBy: req.user.id })
        .sort({ dueDate: 1 });

    // لو مفيش أي داتا
    if (tasks.length === 0) {
        return res.status(404).json({ message: "No tasks found" });
    }

    res.status(200).json({
        message: "Tasks fetched successfully",
        count: tasks.length,
        tasks,
    });
});

// ---------------------- Update Task ------------------------
module.exports.updateTaskCtrl = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const { error } = validateUpdateTask(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const task = await Task.findOne({ _id: taskId, createdBy: req.user.id });
    if (!task) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $set: req.body },
        { new: true }
    );

    res.status(200).json({
        message: "Task updated successfully",
        task: updatedTask
    });
});

// ---------------------- Delete Task ------------------------
module.exports.deleteTaskCtrl = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const task = await Task.findOne({ _id: taskId, createdBy: req.user.id });
    if (!task) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task deleted successfully" });
});

// ---------------------- filter Tasks ------------------------
module.exports.getFilteredTasksCtrl = asyncHandler(async (req, res) => {
    const { search, isCompleted, fromDate, toDate, sort } = req.query;

    const query = {
        createdBy: req.user.id,
    };

    // بحث بالنص داخل الوصف
    if (search) {
        query.description = { $regex: search, $options: "i" };
    }

    // فلترة بالحالة (true / false)
    if (isCompleted === "true" || isCompleted === "false") {
        query.isCompleted = isCompleted === "true";
    }

    // فلترة بالتاريخ
    if (fromDate || toDate) {
        query.dueDate = {};
        if (fromDate) query.dueDate.$gte = new Date(fromDate);
        if (toDate) query.dueDate.$lte = new Date(toDate);
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
        case "due_asc":
            sortOption = { dueDate: 1 };
            break;
        case "due_desc":
            sortOption = { dueDate: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const tasks = await Task.find(query).sort(sortOption);

    if (tasks.length === 0) {
        return res.status(404).json({ message: "No tasks found" });
    }

    res.status(200).json({
        message: "Filtered tasks fetched successfully",
        count: tasks.length,
        tasks,
    });
});