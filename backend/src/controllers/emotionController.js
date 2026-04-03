import Emotion from "../models/Emotion.js";
import User from "../models/User.js";
import { detectEmotionViaService } from "../services/emotionClient.js";
import {
  awardEmotionXp,
  buildEmotionSummary,
  buildHabitEmotionInsight,
  buildJournalContext,
  createEmotionNotification,
  getEmotionMeta,
  getMoodRecommendation,
  normalizeEmotionLabel
} from "../services/emotionService.js";

const getEmotionWindow = (range = "7d") => {
  const normalized = String(range || "7d").toLowerCase();
  const now = new Date();
  const days = normalized === "24h" ? 1 : normalized === "30d" ? 30 : 7;
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return start;
};

export const analyzeEmotion = async (req, res, next) => {
  try {
    const { imageBase64, source = "webcam" } = req.body;

    if (!imageBase64) {
      const error = new Error("imageBase64 is required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const detection = await detectEmotionViaService({ imageBase64 });
    const normalizedEmotion = normalizeEmotionLabel(detection.emotion, detection.all_scores || {});

    const record = await Emotion.create({
      userId: req.user._id,
      emotion: normalizedEmotion,
      confidence: Number(detection.confidence || 0),
      allScores: detection.all_scores || {},
      source,
      timestamp: new Date()
    });

    const { xpAwarded, badges } = await awardEmotionXp(user, normalizedEmotion);
    createEmotionNotification(user, normalizedEmotion);
    await user.save();

    const recentRecords = await Emotion.find({
      userId: req.user._id,
      timestamp: { $gte: getEmotionWindow("7d") }
    })
      .sort({ timestamp: -1 })
      .lean();
    const habitInsight = buildHabitEmotionInsight(recentRecords, user.habitTracker || []);

    res.status(201).json({
      record,
      summary: buildEmotionSummary(recentRecords),
      journalContext: buildJournalContext(record),
      habitInsight,
      recommendation: getMoodRecommendation(normalizedEmotion),
      badges,
      gamification: {
        xpAwarded,
        totalXp: user.xp || 0
      },
      meta: getEmotionMeta(normalizedEmotion)
    });
  } catch (error) {
    next(error);
  }
};

export const getEmotionSummary = async (req, res, next) => {
  try {
    const start = getEmotionWindow(req.query.range);
    const records = await Emotion.find({
      userId: req.user._id,
      timestamp: { $gte: start }
    })
      .sort({ timestamp: -1 })
      .lean();

    const summary = buildEmotionSummary(records);
    const latestRecord = records[0] || null;
    const user = await User.findById(req.user._id).lean();

    res.json({
      records,
      summary,
      latest: latestRecord,
      journalContext: buildJournalContext(latestRecord),
      habitInsight: buildHabitEmotionInsight(records, user?.habitTracker || [])
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalEmotionContext = async (req, res, next) => {
  try {
    const latestRecord = await Emotion.findOne({ userId: req.user._id }).sort({ timestamp: -1 }).lean();
    res.json(buildJournalContext(latestRecord));
  } catch (error) {
    next(error);
  }
};

export const getHabitEmotionInsights = async (req, res, next) => {
  try {
    const [records, user] = await Promise.all([
      Emotion.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(20).lean(),
      User.findById(req.user._id).lean()
    ]);

    res.json(buildHabitEmotionInsight(records, user?.habitTracker || []));
  } catch (error) {
    next(error);
  }
};
