const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    User,
    validateRegisterUser,
    validateLoginUser
} = require("../models/User");
const { cloudinaryUploadImage } = require("../utils/cloudinary");
const fs = require("fs");

// ---------------------- Register New User ------------------------
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
    console.log("Uploaded file:", req.file);
    // Joi Validation
    const { error } = validateRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default profilePhoto
    let profilePhoto = {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        publicId: null,
    };

    // لو المستخدم رفع صورة بالفعل
    if (req.file) {
        const imagePath = req.file.path;
        const uploadedImage = await cloudinaryUploadImage(imagePath);
        profilePhoto = {
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
        };

        // امسح الصوره من السيرفر بعد ما تترفعت
        fs.unlinkSync(imagePath);
    }

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        profilePhoto,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePhoto: user.profilePhoto,
        },
    });
});

// ---------------------- Login User ------------------------
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
});