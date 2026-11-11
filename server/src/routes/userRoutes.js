const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/', userController.getUsers);
router.get('/drivers', userController.getDrivers);
router.patch('/:id/role', userController.updateUserRole);

module.exports = router;

