const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

// Stats can be publicly visible for landing page & open data
router.get('/', statsController.getStats);

module.exports = router;

