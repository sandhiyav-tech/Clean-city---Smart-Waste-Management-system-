const express = require('express');
const { uploadMiddleware, uploadImage } = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', uploadMiddleware.single('image'), uploadImage);

module.exports = router;

