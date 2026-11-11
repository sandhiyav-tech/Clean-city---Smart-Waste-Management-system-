const Notification = require('../models/Notification');

async function createNotification({ user = null, message, type = 'SYSTEM', reportId = null }) {
  return Notification.create({
    user,
    message,
    type,
    reportId,
    isRead: false,
  });
}

async function getNotificationsForUser(userId) {
  // Return notifications targeted to this user OR global broadcasts (user is null)
  return Notification.find({
    $or: [{ user: userId }, { user: null }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('reportId', 'title status');
}

async function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, $or: [{ user: userId }, { user: null }] },
    { isRead: true },
    { new: true }
  );
}

async function markAllAsRead(userId) {
  return Notification.updateMany(
    { $or: [{ user: userId }, { user: null }], isRead: false },
    { isRead: true }
  );
}

module.exports = {
  createNotification,
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
};

