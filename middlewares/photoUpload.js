const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Photo Storage
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        if (file) {
            const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
            cb(null, filename);
        } else {
            cb(null, false);
        }
    }
});

// Create multer instance
const upload = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported file format" }, false);
        }
    },
    limits: { fileSize: 1024 * 1024 } // 1MB
});

//  Middleware لحذف الصور من uploads بعد الرفع
const clearUploadedFiles = async (req, res, next) => {
    try {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }

        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file.path) fs.unlinkSync(file.path);
            });
        }

        next();
    } catch (err) {
        console.error("Error while clearing uploaded files:", err);
        next(); // كمل عادي حتى لو فشل الحذف
    }
};

module.exports = {
    singleUpload: (fieldName) => upload.single(fieldName),
    multipleUpload: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
    clearUploadedFiles
};