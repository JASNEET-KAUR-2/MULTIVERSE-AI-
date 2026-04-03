import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createJournalEntry,
  createTask,
  deleteTask,
  getPlanner,
  markNotificationRead,
  reorderTasks,
  updateGoal,
  updateHabit,
  updateTask
} from "../controllers/plannerController.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getPlanner);
router.post("/tasks", createTask);
router.patch("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);
router.post("/tasks/reorder", reorderTasks);
router.patch("/notifications/:notificationId/read", markNotificationRead);
router.patch("/habits/:habitId", updateHabit);
router.post("/journal", createJournalEntry);
router.patch("/goals/:goalId", updateGoal);

export default router;
