const router = require("express").Router();
const { createTaskCtrl, getAllTasksCtrl, updateTaskCtrl, deleteTaskCtrl, getFilteredTasksCtrl } = require("../controllers/taskController");
const verifyToken = require("../middlewares/verifyToken");

// api/tasks
router.post("/", verifyToken, createTaskCtrl);

// api/tasks
router.get("/", verifyToken, getAllTasksCtrl);

// api/tasks/:id
router.put("/:id", verifyToken, updateTaskCtrl);

// api/tasks/:id
router.delete("/:id", verifyToken, deleteTaskCtrl);

// api/tasks/filtered
router.get("/filtered", verifyToken, getFilteredTasksCtrl);

module.exports = router;