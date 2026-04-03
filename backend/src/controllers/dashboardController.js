import Quest from "../models/Quest.js";
import User from "../models/User.js";

export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("guilds", "name focus");
    const quests = await Quest.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(6);

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
      analysis: user.analysis,
      simulation: user.simulation,
      scannerHistory: user.scannerHistory || [],
      activityLog: user.activityLog || [],
      simulationHistory: user.simulationHistory || [],
      quests
    });
  } catch (error) {
    next(error);
  }
};
