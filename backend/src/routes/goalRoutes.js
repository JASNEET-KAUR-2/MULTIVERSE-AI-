import { Router } from "express";
import {
  createGoal,
  deleteGoal,
  getGoal,
  getGoals,
  updateGoal
} from "../controllers/goalController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Goal routes
router.post("/", authMiddleware, createGoal);
router.get("/", authMiddleware, getGoals);
router.get("/:goalId", authMiddleware, getGoal);
router.patch("/:goalId", authMiddleware, updateGoal);
router.delete("/:goalId", authMiddleware, deleteGoal);

export default router;
