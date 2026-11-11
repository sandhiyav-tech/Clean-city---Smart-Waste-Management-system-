const express = require('express');
const routeController = require('../controllers/routeController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(requireAuth);

// Admin and Driver can optimize routes
router.post('/optimize', requireRole('ADMIN', 'DRIVER'), routeController.optimizeRoute);

module.exports = router;

