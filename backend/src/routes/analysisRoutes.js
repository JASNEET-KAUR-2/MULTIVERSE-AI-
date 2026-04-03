import { Router } from "express";
import { analyzeFutureState, analyzeUser, detectProductivity, simulateFuture } from "../controllers/analysisController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/analyze-user", authMiddleware, analyzeUser);
router.post("/future-self-scan", authMiddleware, analyzeFutureState);
router.post("/productivity-detector", authMiddleware, detectProductivity);
router.post("/simulate-future", authMiddleware, simulateFuture);

export default router;
