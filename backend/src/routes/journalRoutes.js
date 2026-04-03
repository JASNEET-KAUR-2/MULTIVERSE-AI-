import { Router } from "express";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  getJournalEntry,
  getMoodStats,
  updateJournalEntry
} from "../controllers/journalController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Journal routes
router.post("/", authMiddleware, createJournalEntry);
router.get("/", authMiddleware, getJournalEntries);
router.get("/stats/mood", authMiddleware, getMoodStats);
router.get("/:entryId", authMiddleware, getJournalEntry);
router.patch("/:entryId", authMiddleware, updateJournalEntry);
router.delete("/:entryId", authMiddleware, deleteJournalEntry);

export default router;
