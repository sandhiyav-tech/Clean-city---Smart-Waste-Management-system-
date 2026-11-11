const { z } = require('zod');
const userService = require('../services/userService');

const updateRoleSchema = z.object({
  role: z.enum(['CITIZEN', 'ADMIN', 'DRIVER']),
});

async function getUsers(req, res, next) {
  try {
    const data = await userService.getUsers(req.query);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = updateRoleSchema.parse(req.body);
    const updatedUser = await userService.updateUserRole(req.params.id, role);

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
}

async function getDrivers(req, res, next) {
  try {
    const drivers = await userService.getDrivers();
    return res.status(200).json({
      success: true,
      data: { drivers },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateRoleSchema,
  getUsers,
  updateUserRole,
  getDrivers,
};

