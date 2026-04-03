import { Router } from "express";
import {
  checkAndNotifyDeadlines,
  clearAllNotifications,
  createNotification,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Notification routes (specific routes before parameterized routes)
router.post("/", authMiddleware, createNotification);
router.post("/check-deadlines", authMiddleware, checkAndNotifyDeadlines);
router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);
router.patch("/:notificationId/read", authMiddleware, markNotificationAsRead);
router.delete("/:notificationId", authMiddleware, deleteNotification);
router.delete("/", authMiddleware, clearAllNotifications);

export default router;
