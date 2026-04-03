import { Router } from "express";
import { analyzeFutureState, analyzeUser, simulateFuture } from "../controllers/analysisController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/analyze-user", authMiddleware, analyzeUser);
router.post("/future-self-scan", authMiddleware, analyzeFutureState);
router.post("/simulate-future", authMiddleware, simulateFuture);

export default router;
