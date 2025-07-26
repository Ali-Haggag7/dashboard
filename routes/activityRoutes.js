const router = require("express").Router();
const { createActivityCtrl, getAllActivitiesCtrl, updateActivityCtrl, deleteActivityCtrl, getFilteredActivitiesCtrl } = require("../controllers/activityController");
const verifyToken = require("../middlewares/verifyToken");

// api/activities
router.post("/", verifyToken, createActivityCtrl);

// api/activities
router.get("/", verifyToken, getAllActivitiesCtrl);

// api/activities/:id
router.put("/:id", verifyToken, updateActivityCtrl);

// api/activities/:id
router.delete("/:id", verifyToken, deleteActivityCtrl);

// api/activities/filtered
router.get("/filtered", verifyToken, getFilteredActivitiesCtrl);

module.exports = router;