const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Cloudinary storage setup with dynamic params
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "Coaching_dev",
    allowed_formats: ["jpg", "jpeg", "png", " webp "],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    transformation: [{ width: 1280, height: 720, crop: "limit" }],
  }),
});

// Multer setup to handle multiple image uploads (max 10)
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

//   console.log(upload);

// Export modules
module.exports = {
  cloudinary,
  storage,
  upload,
};
