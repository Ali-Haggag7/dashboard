const router = require("express").Router()
const { registerUserCtrl, loginUserCtrl } = require("../controllers/authController");
const { singleUpload, clearUploadedFiles } = require("../middlewares/photoUpload");

// api/auth/register
router.post("/register", singleUpload("profilePhoto"), registerUserCtrl, clearUploadedFiles);

// api/auth/login
router.post("/login", loginUserCtrl);

module.exports = router;
