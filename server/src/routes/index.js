const express = require('express');
const authRoutes = require('./authRoutes');
const reportRoutes = require('./reportRoutes');
const routeRoutes = require('./routeRoutes');
const notificationRoutes = require('./notificationRoutes');
const statsRoutes = require('./statsRoutes');
const userRoutes = require('./userRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CleanCity API',
  });
});

router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/routes', routeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stats', statsRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;

