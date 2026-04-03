import User from "../models/User.js";

/**
 * Create a notification
 */
export const createNotification = async (req, res, next) => {
  try {
    const { type, title, message, icon } = req.body;

    if (!type || !title || !message) {
      const error = new Error("Type, title, and message are required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const notification = {
      type,
      title: title.trim(),
      message: message.trim(),
      icon: icon || "INFO",
      read: false,
      createdAt: new Date()
    };

    if (!user.notifications) {
      user.notifications = [];
    }
    user.notifications.push(notification);
    await user.save();

    res.status(201).json({
      message: "Notification created successfully.",
      notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    let notifications = user.notifications || [];

    if (unreadOnly === "true") {
      notifications = notifications.filter((n) => !n.read);
    }

    // Sort by newest first
    notifications = notifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      notifications,
      total: notifications.length,
      unread: (user.notifications || []).filter((n) => !n.read).length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const notification = user.notifications?.id(notificationId);
    if (!notification) {
      const error = new Error("Notification not found.");
      error.status = 404;
      throw error;
    }

    notification.read = true;
    await user.save();

    res.json({
      message: "Notification marked as read.",
      notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    if (user.notifications) {
      user.notifications.forEach((n) => {
        n.read = true;
      });
    }
    await user.save();

    res.json({
      message: "All notifications marked as read."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    user.notifications = (user.notifications || []).filter(
      (n) => n._id.toString() !== notificationId
    );
    await user.save();

    res.json({
      message: "Notification deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    user.notifications = [];
    await user.save();

    res.json({
      message: "All notifications cleared."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create notifications for deadline alerts (called by system)
 */
export const checkAndNotifyDeadlines = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const now = new Date();
    const alertedTasks = new Set();
    let newNotifications = 0;

    user.plannerTasks?.forEach((task) => {
      if (!task.completed && task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);

        // Alert 24 hours before and 1 hour before
        if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 23 && !alertedTasks.has(task._id.toString())) {
          if (!user.notifications) user.notifications = [];
          user.notifications.push({
            type: "deadline",
            title: "Task Deadline Approaching",
            message: `"${task.title}" is due in 24 hours!`,
            icon: "WARNING",
            read: false,
            createdAt: new Date()
          });
          alertedTasks.add(task._id.toString());
          newNotifications++;
        } else if (hoursUntilDeadline <= 1 && hoursUntilDeadline > 0 && !alertedTasks.has(task._id.toString())) {
          if (!user.notifications) user.notifications = [];
          user.notifications.push({
            type: "deadline",
            title: "Task Due Soon!",
            message: `"${task.title}" is due in less than 1 hour!`,
            icon: "ERROR",
            read: false,
            createdAt: new Date()
          });
          alertedTasks.add(task._id.toString());
          newNotifications++;
        }
      }
    });

    if (newNotifications > 0) {
      await user.save();
    }

    res.json({
      message: `${newNotifications} deadline notifications created.`,
      newNotifications
    });
  } catch (error) {
    next(error);
  }
};
