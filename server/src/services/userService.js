const User = require('../models/User');

async function getUsers({ search, role, page = 1, limit = 50 }) {
  const filter = {};

  if (role && role !== 'ALL') {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  };
}

async function updateUserRole(userId, newRole) {
  if (!['CITIZEN', 'ADMIN', 'DRIVER'].includes(newRole)) {
    const error = new Error('Invalid user role');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true }
  ).select('-passwordHash');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function getDrivers() {
  return User.find({ role: 'DRIVER' }).select('name email phone');
}

module.exports = {
  getUsers,
  updateUserRole,
  getDrivers,
};

