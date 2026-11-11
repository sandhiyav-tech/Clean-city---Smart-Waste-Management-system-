const Report = require('../models/Report');
const { createNotification } = require('./notificationService');

async function createReport({ user, title, description, imageUrl, location, wasteType }) {
  const report = await Report.create({
    user,
    title,
    description,
    imageUrl: imageUrl || '',
    location,
    wasteType: wasteType || 'MIXED',
    status: 'PENDING',
    statusHistory: [
      {
        status: 'PENDING',
        changedBy: user,
        at: new Date(),
        note: 'Report submitted by citizen',
      },
    ],
  });

  return report;
}

async function getReports(query = {}, user) {
  const {
    status,
    wasteType,
    search,
    startDate,
    endDate,
    driverId,
    page = 1,
    limit = 50,
  } = query;

  const filter = {};

  // Role scoping
  if (user.role === 'CITIZEN') {
    filter.user = user._id;
  } else if (user.role === 'DRIVER') {
    filter.assignedDriver = user._id;
  } else if (user.role === 'ADMIN' && driverId) {
    filter.assignedDriver = driverId;
  }

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  if (wasteType && wasteType !== 'ALL') {
    filter.wasteType = wasteType;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedDriver', 'name email phone')
      .populate('statusHistory.changedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  };
}

async function getReportById(id) {
  return Report.findById(id)
    .populate('user', 'name email phone')
    .populate('assignedDriver', 'name email phone')
    .populate('statusHistory.changedBy', 'name role');
}

async function assignDriver(reportId, driverId, adminUser) {
  const report = await Report.findById(reportId);
  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  report.assignedDriver = driverId;
  if (report.status === 'PENDING') {
    report.status = 'ASSIGNED';
  }

  report.statusHistory.push({
    status: report.status,
    changedBy: adminUser._id,
    at: new Date(),
    note: `Assigned to driver by admin ${adminUser.name}`,
  });

  await report.save();
  await report.populate('assignedDriver', 'name email phone');

  // Notify driver
  if (driverId) {
    await createNotification({
      user: driverId,
      message: `New pickup assigned to you: "${report.title}" at ${report.location.address || 'Chennai'}`,
      type: 'ASSIGNMENT',
      reportId: report._id,
    });
  }

  // Notify citizen
  await createNotification({
    user: report.user,
    message: `Your waste report "${report.title}" has been assigned to driver ${report.assignedDriver?.name || 'Driver'}.`,
    type: 'STATUS_UPDATE',
    reportId: report._id,
  });

  return report;
}

async function updateReportStatus(reportId, newStatus, user, note = '') {
  const report = await Report.findById(reportId);
  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  report.status = newStatus;
  report.statusHistory.push({
    status: newStatus,
    changedBy: user._id,
    at: new Date(),
    note: note || `Status updated to ${newStatus} by ${user.role}`,
  });

  await report.save();
  await report.populate('assignedDriver', 'name email phone');

  // Notify citizen of the status transition
  const statusLabels = {
    PENDING: 'marked as Pending review',
    ASSIGNED: 'assigned for pickup',
    IN_PROGRESS: 'in progress! The driver is on their way',
    COLLECTED: 'successfully collected! Thank you for keeping Chennai clean.',
  };

  await createNotification({
    user: report.user,
    message: `Your report "${report.title}" is now ${statusLabels[newStatus] || newStatus}.`,
    type: 'STATUS_UPDATE',
    reportId: report._id,
  });

  return report;
}

async function deleteReport(reportId, user) {
  const report = await Report.findById(reportId);
  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  // Only Admin or the Citizen creator can delete
  if (user.role !== 'ADMIN' && report.user.toString() !== user._id.toString()) {
    const error = new Error('Unauthorized to delete this report');
    error.statusCode = 403;
    throw error;
  }

  await report.deleteOne();
  return { success: true };
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  assignDriver,
  updateReportStatus,
  deleteReport,
};

