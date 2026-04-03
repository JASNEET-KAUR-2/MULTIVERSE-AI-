import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  analyzeEmotion,
  getEmotionSummary,
  getHabitEmotionInsights,
  getJournalEmotionContext
} from "../controllers/emotionController.js";

const router = Router();

router.post("/analyze", authMiddleware, analyzeEmotion);
router.get("/summary", authMiddleware, getEmotionSummary);
router.get("/journal-context", authMiddleware, getJournalEmotionContext);
router.get("/habit-insights", authMiddleware, getHabitEmotionInsights);

export default router;
