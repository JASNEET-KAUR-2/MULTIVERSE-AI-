import { Router } from "express";
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  reorderTasks,
  searchTasks,
  updateTask
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Task management routes
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.get("/search", authMiddleware, searchTasks);
router.get("/:taskId", authMiddleware, getTask);
router.patch("/:taskId", authMiddleware, updateTask);
router.patch("/:taskId/complete", authMiddleware, completeTask);
router.delete("/:taskId", authMiddleware, deleteTask);
router.post("/reorder", authMiddleware, reorderTasks);

export default router;
