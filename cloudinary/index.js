const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "SriDeekshithaDesigns",
    resource_type: "image",
    allowed_formats: ["jpeg", "png", "jpg", "webp"],

    // Basic image optimization for faster loading
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto"
      }
    ]
  }
});

module.exports = {
  cloudinary,
  storage
};
