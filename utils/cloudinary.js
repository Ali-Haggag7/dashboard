const cloudinary = require("cloudinary")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Cloudinary Upload Image
const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {  // دي الدالة اللي بترفع الصورة
            resource_type: 'auto'  // يحدد نوع الملف تلقائيًا (صورة، فيديو، الخ…) Cloudinary  معناها خلي
        })
        return data  // فيها كل حاجة عن الصورة (اللينك، الـ public_id، الحجم...)
    }
    catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (Cloudinary)")
    }
}

// Cloudinary Remove Image
const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        const data = await cloudinary.uploader.destroy(imagePublicId)
        return data
    }
    catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (Cloudinary)")
    }
}

module.exports = {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
}