import Quest from "../models/Quest.js";
import User from "../models/User.js";
import { appendActivityLog, getGamificationSnapshot, syncDailyActivity } from "../services/gamificationService.js";
import { buildQuestTemplates, getQuestXp, normalizeAiTasks } from "../services/questService.js";

export const generateQuests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.analysis && !user?.behaviorProfile) {
      const error = new Error("Complete the Soul Scan before generating quests.");
      error.status = 400;
      throw error;
    }

    const existing = await Quest.find({ user: user._id, completed: false }).sort({ createdAt: -1 });

    if (existing.length) {
      return res.json({ quests: existing });
    }

    const aiTasks = normalizeAiTasks(user.analysis?.dailyTasks || []);
    const templates = aiTasks.length ? aiTasks : buildQuestTemplates(user.analysis?.weaknesses || []);
    const quests = await Quest.insertMany(
      templates.map((quest) => ({
        ...quest,
        user: user._id
      }))
    );

    res.status(201).json({ quests });
  } catch (error) {
    next(error);
  }
};

export const completeQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findOne({
      _id: req.params.questId,
      user: req.user._id
    });

    if (!quest) {
      const error = new Error("Quest not found.");
      error.status = 404;
      throw error;
    }

    if (quest.completed) {
      const user = await User.findById(req.user._id);
      return res.json({
        quest,
        xp: user.xp,
        streak: user.streak,
        xpEarned: 0,
        gamification: getGamificationSnapshot(user)
      });
    }

    quest.completed = true;
    quest.completedAt = new Date();
    quest.xpReward = getQuestXp(quest.difficulty);
    await quest.save();

    const user = await User.findById(req.user._id);
    const dailyActivity = syncDailyActivity(user);

    user.xp += quest.xpReward;
    user.lastQuestCompletedAt = new Date();
    appendActivityLog(user, {
      type: "quest",
      label: quest.title,
      xpAwarded: quest.xpReward,
      detail: `Completed a ${String(quest.difficulty || "Easy").toLowerCase()} task.`,
      createdAt: quest.completedAt
    });
    await user.save();

    res.json({
      quest,
      xp: user.xp,
      streak: user.streak,
      xpEarned: quest.xpReward,
      futureBoost:
        user.streak >= 3
          ? "Consistency detected. Your future trajectory is getting stronger."
          : "Keep stacking completions to unlock a stronger future boost.",
      gamification: getGamificationSnapshot(user, {
        loginRewardXp: dailyActivity.xpAwarded,
        streakBonusXpAwarded: dailyActivity.streakBonusAwarded
      })
    });
  } catch (error) {
    next(error);
  }
};
