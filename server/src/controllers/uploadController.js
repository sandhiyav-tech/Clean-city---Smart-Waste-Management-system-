const multer = require('multer');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Multer memory storage (up to 5MB)
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'), false);
    }
  },
});

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    // 1. If Cloudinary credentials are provided, upload to Cloudinary
    if (isConfigured) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'cleancity_reports',
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const result = await uploadPromise;

      return res.status(200).json({
        success: true,
        message: 'Image uploaded to Cloudinary successfully',
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      });
    }

    // 2. Safe fallback: base64 Data URL (ensures local & demo zero-configuration works flawlessly)
    const base64Data = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      message: 'Image stored as base64 asset (Cloudinary credentials not configured)',
      data: {
        url: dataUri,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadMiddleware,
  uploadImage,
};

