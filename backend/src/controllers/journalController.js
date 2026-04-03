import User from "../models/User.js";
import Emotion from "../models/Emotion.js";
import { buildJournalContext, getJournalMoodFromEmotion } from "../services/emotionService.js";

/**
 * Create a new journal entry
 */
export const createJournalEntry = async (req, res, next) => {
  try {
    const { title, body, mood } = req.body;

    if (!title || !title.trim()) {
      const error = new Error("Journal title is required.");
      error.status = 400;
      throw error;
    }

    if (!body || !body.trim()) {
      const error = new Error("Journal body is required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const latestEmotion = await Emotion.findOne({ userId: req.user._id }).sort({ timestamp: -1 }).lean();
    const resolvedMood = mood || getJournalMoodFromEmotion(latestEmotion?.emotion);

    const newEntry = {
      title: title.trim(),
      body: body.trim(),
      mood: resolvedMood || "Reflective",
      createdAt: new Date()
    };

    if (!user.journalEntries) {
      user.journalEntries = [];
    }
    user.journalEntries.push(newEntry);
    await user.save();

    const createdEntry = user.journalEntries[user.journalEntries.length - 1];

    res.status(201).json({
      message: "Journal entry created successfully.",
      entry: createdEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all journal entries
 */
export const getJournalEntries = async (req, res, next) => {
  try {
    const { mood, limit } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    let entries = user.journalEntries || [];

    // Filter by mood
    if (mood) {
      entries = entries.filter((e) => e.mood === mood);
    }

    // Sort by newest first
    entries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply limit
    const limitNum = limit ? Math.min(Number(limit), 100) : entries.length;
    entries = entries.slice(0, limitNum);

    res.json({
      entries,
      total: user.journalEntries?.length || 0,
      returned: entries.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single journal entry
 */
export const getJournalEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const entry = user.journalEntries?.id(entryId);
    if (!entry) {
      const error = new Error("Journal entry not found.");
      error.status = 404;
      throw error;
    }

    res.json({ entry });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a journal entry
 */
export const updateJournalEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { title, body, mood } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const entry = user.journalEntries?.id(entryId);
    if (!entry) {
      const error = new Error("Journal entry not found.");
      error.status = 404;
      throw error;
    }

    if (title !== undefined) entry.title = title.trim();
    if (body !== undefined) entry.body = body.trim();
    if (mood !== undefined) entry.mood = mood;

    await user.save();

    res.json({
      message: "Journal entry updated successfully.",
      entry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    user.journalEntries = (user.journalEntries || []).filter(
      (e) => e._id.toString() !== entryId
    );
    await user.save();

    res.json({
      message: "Journal entry deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get mood statistics
 */
export const getMoodStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const entries = user.journalEntries || [];
    const moodStats = {
      Focused: 0,
      Balanced: 0,
      Drained: 0,
      Motivated: 0,
      Reflective: 0
    };

    entries.forEach((entry) => {
      if (moodStats.hasOwnProperty(entry.mood)) {
        moodStats[entry.mood]++;
      }
    });

    const latestEmotion = await Emotion.findOne({ userId: req.user._id }).sort({ timestamp: -1 }).lean();

    res.json({
      totalEntries: entries.length,
      moodStats,
      mostCommonMood: Object.entries(moodStats).reduce((a, b) => (a[1] > b[1] ? a : b))[0],
      journalContext: buildJournalContext(latestEmotion)
    });
  } catch (error) {
    next(error);
  }
};
