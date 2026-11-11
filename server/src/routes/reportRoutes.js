const express = require('express');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// All report endpoints require authentication
router.use(requireAuth);

router.post('/', reportController.createReport);
router.get('/', reportController.getReports);
router.get('/:id', reportController.getReportById);

// Admin driver assignment
router.patch('/:id/assign', requireRole('ADMIN'), reportController.assignDriver);

// Admin and Driver status updates
router.patch('/:id/status', requireRole('ADMIN', 'DRIVER'), reportController.updateStatus);

// Delete report (Citizen creator or Admin)
router.delete('/:id', reportController.deleteReport);

module.exports = router;

