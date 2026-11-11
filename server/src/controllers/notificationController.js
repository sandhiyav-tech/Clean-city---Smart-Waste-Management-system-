const { z } = require('zod');
const notificationService = require('../services/notificationService');
const User = require('../models/User');

const createNotificationSchema = z.object({
  message: z.string().min(2, 'Message must be at least 2 characters').max(500),
  type: z.enum(['STATUS_UPDATE', 'ASSIGNMENT', 'BROADCAST', 'SYSTEM']).default('BROADCAST'),
  targetRole: z.enum(['ALL', 'CITIZEN', 'DRIVER', 'ADMIN']).optional().default('ALL'),
  userId: z.string().optional(),
});

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user._id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const updated = await notificationService.markAsRead(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification: updated },
    });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
}

async function broadcastNotification(req, res, next) {
  try {
    const { message, type, targetRole, userId } = createNotificationSchema.parse(req.body);

    // Direct single user notification
    if (userId) {
      const single = await notificationService.createNotification({
        user: userId,
        message,
        type,
      });
      return res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: { notification: single },
      });
    }

    // Role-filtered or All broadcast
    if (targetRole === 'ALL') {
      const broadcast = await notificationService.createNotification({
        user: null, // null means all users
        message,
        type: 'BROADCAST',
      });
      return res.status(201).json({
        success: true,
        message: 'Broadcast notification dispatched to all citizens and drivers',
        data: { notification: broadcast },
      });
    } else {
      // Find all users in target role
      const users = await User.find({ role: targetRole }).select('_id');
      const docs = users.map((u) => ({
        user: u._id,
        message,
        type: 'BROADCAST',
        isRead: false,
      }));
      await require('../models/Notification').insertMany(docs);

      return res.status(201).json({
        success: true,
        message: `Notification broadcasted to ${users.length} ${targetRole.toLowerCase()}s`,
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createNotificationSchema,
  getNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
};

