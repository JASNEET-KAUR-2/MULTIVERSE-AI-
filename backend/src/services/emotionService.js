import Emotion from "../models/Emotion.js";
import { appendActivityLog } from "./gamificationService.js";

const emotionPalette = {
  happy: { color: "#22C55E", emoji: "🙂", label: "Happy" },
  sad: { color: "#3B82F6", emoji: "😔", label: "Sad" },
  angry: { color: "#EF4444", emoji: "😠", label: "Angry" },
  neutral: { color: "#6B7280", emoji: "😐", label: "Neutral" },
  focused: { color: "#14B8A6", emoji: "🧠", label: "Focused" },
  stressed: { color: "#F97316", emoji: "😣", label: "Stressed" },
  surprise: { color: "#A855F7", emoji: "😮", label: "Surprised" },
  fear: { color: "#8B5CF6", emoji: "😟", label: "Anxious" },
  disgust: { color: "#84CC16", emoji: "😖", label: "Overloaded" }
};

const journalMoodMap = {
  happy: "Motivated",
  focused: "Focused",
  neutral: "Balanced",
  stressed: "Drained",
  sad: "Reflective",
  angry: "Drained",
  fear: "Reflective",
  surprise: "Balanced",
  disgust: "Drained"
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfWindow = (days = 7) => {
  const date = startOfDay();
  date.setDate(date.getDate() - (days - 1));
  return date;
};

const getDayKey = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};

export const normalizeEmotionLabel = (emotion = "neutral", allScores = {}) => {
  const normalized = String(emotion || "").toLowerCase();

  if (["happy", "neutral", "sad", "angry", "fear", "surprise", "disgust"].includes(normalized)) {
    return normalized;
  }

  const stressLikeScore = Math.max(allScores.fear || 0, allScores.sad || 0, allScores.angry || 0);
  if (stressLikeScore >= 0.65) {
    return "stressed";
  }

  if ((allScores.neutral || 0) >= 0.55 && (allScores.happy || 0) >= 0.2) {
    return "focused";
  }

  return normalized || "neutral";
};

export const getEmotionMeta = (emotion) => emotionPalette[emotion] || emotionPalette.neutral;

export const getJournalMoodFromEmotion = (emotion) => journalMoodMap[emotion] || "Reflective";

export const getMoodRecommendation = (emotion) => {
  const library = {
    sad: "Take a lighter task, write a short reflection, and give yourself room to reset.",
    stressed: "You seem overloaded. Protect a short break, breathe, and reduce task intensity for the next block.",
    angry: "Pause before high-stakes work and switch to a low-friction task until your energy settles.",
    neutral: "This is a solid state for structured focus. Pick one meaningful task and finish it cleanly.",
    happy: "Great energy today. Use it on an important goal while momentum is naturally high.",
    focused: "Continue your deep work session and shield it from interruptions.",
    fear: "Choose one safe next step and turn uncertainty into progress through clarity.",
    surprise: "Capture what changed, then convert that energy into a concrete next action.",
    disgust: "Reduce clutter and friction first, then restart with one clean task."
  };

  return library[emotion] || library.neutral;
};

export const getProductivityMode = (emotion) => {
  const modes = {
    happy: "Momentum sprint",
    focused: "Deep work block",
    neutral: "Structured execution",
    sad: "Recovery-friendly tasks",
    stressed: "Pressure relief mode",
    angry: "Low-friction reset",
    fear: "Confidence rebuilding",
    surprise: "Re-plan and capture changes",
    disgust: "Declutter and restart"
  };

  return modes[emotion] || modes.neutral;
};

export const getMoodNotificationCopy = (emotion) => {
  const messages = {
    stressed: {
      title: "Stress check-in",
      message: "You seem stressed today, take a short break before the next task block."
    },
    sad: {
      title: "Gentle momentum",
      message: "You look a little low today. Start with a light task and rebuild momentum."
    },
    happy: {
      title: "Energy spike",
      message: "Great energy today, push one of your biggest goals while the momentum is here."
    },
    focused: {
      title: "Deep work mode",
      message: "You look focused. Protect your attention and keep the current session going."
    }
  };

  return messages[emotion] || null;
};

export const createEmotionNotification = (user, emotion) => {
  const payload = getMoodNotificationCopy(emotion);
  if (!payload) return;

  user.notificationCenter = user.notificationCenter || [];
  const todayKey = getDayKey();
  const alreadyLoggedToday = user.notificationCenter.some(
    (item) => item.type === "emotion" && item.title === payload.title && getDayKey(item.createdAt) === todayKey
  );

  if (alreadyLoggedToday) {
    return;
  }

  user.notificationCenter.unshift({
    type: "emotion",
    title: payload.title,
    message: payload.message,
    read: false,
    channel: "in-app",
    createdAt: new Date()
  });
  user.notificationCenter = user.notificationCenter.slice(0, 40);
  user.notifications = user.notificationCenter;
};

export const awardEmotionXp = async (user, emotion) => {
  const today = startOfDay();
  const dailyCount = await Emotion.countDocuments({
    userId: user._id,
    timestamp: { $gte: today }
  });

  if (dailyCount > 1) {
    return { xpAwarded: 0, badges: [] };
  }

  const xpAwarded = 20;
  user.xp = (user.xp || 0) + xpAwarded;
  appendActivityLog(user, {
    type: "emotion",
    label: "Mood check-in",
    xpAwarded,
    detail: `Logged a ${emotion} mood scan.`
  });

  const streakDays = await Emotion.aggregate([
    {
      $match: {
        userId: user._id,
        timestamp: { $gte: startOfWindow(7) }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
        }
      }
    }
  ]);

  const badges = ["Mood Awareness Badge"];
  if (["stressed", "sad", "angry", "fear"].includes(emotion)) {
    badges.push("Consistency under stress");
  }

  if (streakDays.length >= 5) {
    badges.push("Emotion Logging Streak");
  }

  return { xpAwarded, badges };
};

export const moodToTrendScore = (emotion) => {
  const map = {
    happy: 5,
    focused: 4,
    neutral: 3,
    surprise: 3,
    sad: 2,
    fear: 2,
    stressed: 1,
    angry: 1,
    disgust: 1
  };

  return map[emotion] || 3;
};

export const buildEmotionSummary = (records = []) => {
  const total = records.length;
  const distribution = records.reduce((accumulator, item) => {
    accumulator[item.emotion] = (accumulator[item.emotion] || 0) + 1;
    return accumulator;
  }, {});

  const mostFrequentEmotion =
    Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

  const averageConfidence = total
    ? Number((records.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / total).toFixed(2))
    : 0;

  const byDay = records.reduce((accumulator, item) => {
    const key = new Date(item.timestamp).toISOString().slice(0, 10);
    if (!accumulator[key]) {
      accumulator[key] = { timestamp: key, emotionCounts: {}, topEmotion: item.emotion, topCount: 0 };
    }

    accumulator[key].emotionCounts[item.emotion] = (accumulator[key].emotionCounts[item.emotion] || 0) + 1;
    const nextCount = accumulator[key].emotionCounts[item.emotion];
    if (nextCount >= accumulator[key].topCount) {
      accumulator[key].topCount = nextCount;
      accumulator[key].topEmotion = item.emotion;
    }

    return accumulator;
  }, {});

  const trend = Object.values(byDay)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((item) => ({
      timestamp: item.timestamp,
      emotion: item.topEmotion,
      score: moodToTrendScore(item.topEmotion)
    }));

  const latestEmotion = records[0]?.emotion || "neutral";
  const positiveTotal = (distribution.happy || 0) + (distribution.focused || 0);
  const recoveryTotal = (distribution.stressed || 0) + (distribution.sad || 0) + (distribution.angry || 0) + (distribution.fear || 0);

  return {
    total,
    distribution,
    mostFrequentEmotion,
    averageConfidence,
    trend,
    productivityMode: getProductivityMode(latestEmotion),
    positiveRatio: total ? Number((positiveTotal / total).toFixed(2)) : 0,
    recoveryRatio: total ? Number((recoveryTotal / total).toFixed(2)) : 0
  };
};

export const buildHabitEmotionInsight = (emotions = [], habits = []) => {
  const totalCompleted = habits.filter((habit) => habit.completedToday).length;
  const latestEmotion = emotions[0]?.emotion || "neutral";
  const completionRate = habits.length ? Number((totalCompleted / habits.length).toFixed(2)) : 0;
  const isPositiveState = ["happy", "focused", "neutral"].includes(latestEmotion);

  return {
    totalCompleted,
    latestEmotion,
    completionRate,
    insight: isPositiveState
      ? completionRate >= 0.6
        ? "You are more productive when your mood is steady or energized."
        : "Your mood is supportive today, so one small habit win can rebuild consistency fast."
      : completionRate >= 0.4
        ? "You are keeping habits alive even under strain, which is a strong resilience signal."
        : "Lower-energy moods work better with smaller, easier habit goals.",
    recommendation: getMoodRecommendation(latestEmotion),
    productivityMode: getProductivityMode(latestEmotion)
  };
};

export const buildJournalContext = (latestEmotionRecord) => {
  const emotion = latestEmotionRecord?.emotion || "neutral";

  return {
    detectedEmotion: emotion,
    suggestedMood: getJournalMoodFromEmotion(emotion),
    recommendation: getMoodRecommendation(emotion),
    confidence: latestEmotionRecord?.confidence || 0,
    productivityMode: getProductivityMode(emotion),
    meta: getEmotionMeta(emotion)
  };
};
