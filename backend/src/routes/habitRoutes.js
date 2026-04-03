import { Router } from "express";
import {
  completeHabitToday,
  createHabit,
  deleteHabit,
  getHabit,
  getHabits,
  incrementHabitProgress,
  resetDailyHabits,
  updateHabitProgress
} from "../controllers/habitController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Habit tracker routes
router.post("/", authMiddleware, createHabit);
router.get("/", authMiddleware, getHabits);
router.get("/:habitId", authMiddleware, getHabit);
router.patch("/:habitId/progress", authMiddleware, updateHabitProgress);
router.patch("/:habitId/increment", authMiddleware, incrementHabitProgress);
router.patch("/:habitId/complete-today", authMiddleware, completeHabitToday);
router.post("/reset-daily", authMiddleware, resetDailyHabits);
router.delete("/:habitId", authMiddleware, deleteHabit);

export default router;
