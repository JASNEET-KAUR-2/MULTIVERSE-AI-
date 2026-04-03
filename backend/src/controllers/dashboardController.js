import Quest from "../models/Quest.js";
import User from "../models/User.js";
import Emotion from "../models/Emotion.js";
import { buildEmotionSummary, buildHabitEmotionInsight, buildJournalContext, getMoodRecommendation } from "../services/emotionService.js";

export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const quests = await Quest.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(6);
    const recentEmotions = await Emotion.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(20).lean();
    const latestEmotion = recentEmotions[0] || null;

    res.json({
      user,
      stats: {
        xp: user.xp,
        streak: user.streak,
        prediction: user.mlPrediction?.label || "Unanalyzed",
        scannerStreak: user.scannerStreak || 0,
        confidence: user.mlPrediction?.confidence || user.analysis?.confidence || 0
      },
      prediction: user.mlPrediction,
      behaviorProfile: user.behaviorProfile,
      quizAssessment: user.quizAssessment,
      analysis: user.analysis,
      simulation: user.simulation,
      scannerHistory: user.scannerHistory || [],
      activityLog: user.activityLog || [],
      simulationHistory: user.simulationHistory || [],
      quests,
      emotions: {
        latest: latestEmotion,
        summary: buildEmotionSummary(recentEmotions),
        journalContext: buildJournalContext(latestEmotion),
        habitInsight: buildHabitEmotionInsight(recentEmotions, user.habitTracker || []),
        recommendation: getMoodRecommendation(latestEmotion?.emotion || "neutral")
      }
    });
  } catch (error) {
    next(error);
  }
};
