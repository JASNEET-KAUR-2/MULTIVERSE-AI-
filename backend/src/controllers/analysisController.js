import Quest from "../models/Quest.js";
import User from "../models/User.js";
import Emotion from "../models/Emotion.js";
import { appendActivityLog } from "../services/gamificationService.js";
import { generateFutureStateScan, generateSimulationNarrative, generateWhatIfStory } from "../services/groqService.js";
import { predictFutureOutcome } from "../services/mlService.js";
import { buildPersonalizedRecommendations } from "../services/personalizationService.js";

const normalizeBehavior = (payload) => ({
  studyHours: Number(payload.studyHours),
  sleepHours: Number(payload.sleepHours),
  exercise: Boolean(payload.exercise),
  screenTime: Number(payload.screenTime),
  consistency: Number(payload.consistency),
  procrastination: Number(payload.procrastination),
  goalClarity: Number(payload.goalClarity)
});

const validateBehaviorProfile = (behaviorProfile) => {
  const ranges = [
    ["studyHours", behaviorProfile.studyHours, 0, 12],
    ["sleepHours", behaviorProfile.sleepHours, 0, 12],
    ["screenTime", behaviorProfile.screenTime, 0, 18],
    ["consistency", behaviorProfile.consistency, 1, 10],
    ["procrastination", behaviorProfile.procrastination, 1, 10],
    ["goalClarity", behaviorProfile.goalClarity, 1, 10]
  ];

  for (const [field, value, min, max] of ranges) {
    if (!Number.isFinite(value) || value < min || value > max) {
      const error = new Error(`${field} must be between ${min} and ${max}.`);
      error.status = 400;
      throw error;
    }
  }
};

const PRODUCTIVITY_POSITIVE_SIGNALS = [
  "finished",
  "completed",
  "deep work",
  "focused",
  "focus",
  "planned",
  "reviewed",
  "priority",
  "priorities",
  "shipped",
  "exercise",
  "study",
  "wrote",
  "built",
  "organized",
  "scheduled",
  "wrapped up",
  "progress",
  "sprint",
  "coding"
];

const PRODUCTIVITY_NEGATIVE_SIGNALS = [
  "procrastinating",
  "procrastinated",
  "scrolling",
  "social media",
  "avoiding",
  "missed deadlines",
  "scattered",
  "distracted",
  "burned out",
  "burnout",
  "tired",
  "doomscrolling",
  "overthinking",
  "delayed",
  "late",
  "stuck",
  "chaotic",
  "couldn't focus",
  "unfocused"
];

const buildProductivityPrediction = (rawText = "") => {
  const input = String(rawText || "").trim();
  const text = input.toLowerCase();

  let score = 50;
  const matchedPositive = [];
  const matchedNegative = [];

  PRODUCTIVITY_POSITIVE_SIGNALS.forEach((signal) => {
    if (text.includes(signal)) {
      score += 7;
      matchedPositive.push(signal);
    }
  });

  PRODUCTIVITY_NEGATIVE_SIGNALS.forEach((signal) => {
    if (text.includes(signal)) {
      score -= 8;
      matchedNegative.push(signal);
    }
  });

  if (input.length > 120) {
    score += 4;
  } else if (input.length < 30) {
    score -= 4;
  }

  const normalizedScore = Math.max(2, Math.min(98, score));
  const positive = normalizedScore >= 50;
  const confidence = positive ? normalizedScore / 100 : (100 - normalizedScore) / 100;

  return {
    input,
    predicted_label: positive ? "POSITIVE" : "NEGATIVE",
    confidence: Number(confidence.toFixed(4)),
    source: "app-backend-heuristic",
    signal_breakdown: {
      matchedPositive,
      matchedNegative,
      score: normalizedScore
    },
    numeric_metrics_placeholder: {
      status: "ready_for_extension",
      message: positive
        ? "This activity reads as productive momentum. You can later extend this with task-count and focus-time metrics."
        : "This activity reads as low productivity momentum. You can later extend this with task-count and focus-time metrics."
    }
  };
};

const normalizeQuizAssessment = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const scenarioAnswers = Array.isArray(payload.scenarioAnswers)
    ? payload.scenarioAnswers
        .map((item) => ({
          questionId: Number(item?.questionId),
          category: typeof item?.category === "string" ? item.category.trim() : "",
          answer: typeof item?.answer === "string" ? item.answer.trim() : ""
        }))
        .filter((item) => Number.isFinite(item.questionId) && item.category && item.answer)
    : [];

  const traits = payload.traits && typeof payload.traits === "object"
    ? {
        patience: Number(payload.traits.patience || 0),
        riskTaking: Number(payload.traits.riskTaking || 0),
        creativity: Number(payload.traits.creativity || 0),
        discipline: Number(payload.traits.discipline || 0),
        leadership: Number(payload.traits.leadership || 0),
        adaptability: Number(payload.traits.adaptability || 0),
        curiosity: Number(payload.traits.curiosity || 0),
        emotionalResilience: Number(payload.traits.emotionalResilience || 0)
      }
    : null;

  const hasTraits = traits && Object.values(traits).some((value) => Number.isFinite(value) && value > 0);
  const patterns = payload.patterns && typeof payload.patterns === "object"
    ? {
        decisionStyle: typeof payload.patterns.decisionStyle === "string" ? payload.patterns.decisionStyle : "",
        workingStyle: typeof payload.patterns.workingStyle === "string" ? payload.patterns.workingStyle : "",
        riskProfile: typeof payload.patterns.riskProfile === "string" ? payload.patterns.riskProfile : "",
        thinkingPattern: typeof payload.patterns.thinkingPattern === "string" ? payload.patterns.thinkingPattern : ""
      }
    : null;

  if (!scenarioAnswers.length && !hasTraits && !payload.archetype && !payload.summary) {
    return null;
  }

  return {
    archetype: typeof payload.archetype === "string" ? payload.archetype.trim() : "",
    summary: typeof payload.summary === "string" ? payload.summary.trim() : "",
    xpGained: Number(payload.xpGained || 0),
    traits: hasTraits ? traits : undefined,
    patterns,
    scenarioAnswers,
    completedAt: new Date()
  };
};

const getOutcomeScore = (label, probabilities = {}) => {
  const high = Number(probabilities.High || 0);
  const average = Number(probabilities.Average || 0);
  const negative = Number(probabilities.Negative || 0);
  const base = label === "High" ? 100 : label === "Average" ? 62 : 28;
  return Math.max(0, Math.min(100, Math.round(base + high * 12 + average * 4 - negative * 10)));
};

const getContributionBreakdown = (current = {}, next = {}) => {
  const changes = [
    {
      key: "studyHours",
      label: "Study Hours",
      delta: Number(next.studyHours || 0) - Number(current.studyHours || 0),
      weight: 8,
      explanation: "More deep work time usually lifts trajectory quality."
    },
    {
      key: "sleepHours",
      label: "Sleep Hours",
      delta: Number(next.sleepHours || 0) - Number(current.sleepHours || 0),
      weight: 6,
      explanation: "Recovery quality affects focus consistency and burnout risk."
    },
    {
      key: "exercise",
      label: "Exercise",
      delta: (next.exercise ? 1 : 0) - (current.exercise ? 1 : 0),
      weight: 7,
      explanation: "Movement improves resilience, energy, and execution stability."
    },
    {
      key: "consistency",
      label: "Consistency",
      delta: Number(next.consistency || 0) - Number(current.consistency || 0),
      weight: 9,
      explanation: "Consistency is one of the strongest compounding signals."
    },
    {
      key: "procrastination",
      label: "Procrastination",
      delta: Number(current.procrastination || 0) - Number(next.procrastination || 0),
      weight: 9,
      explanation: "Lower procrastination reduces drag and makes momentum more durable."
    },
    {
      key: "goalClarity",
      label: "Goal Clarity",
      delta: Number(next.goalClarity || 0) - Number(current.goalClarity || 0),
      weight: 8,
      explanation: "Clear goals make daily actions map to better long-term outcomes."
    }
  ].map((item) => ({
    ...item,
    score: Math.abs(item.delta) * item.weight
  }));

  const topContributor = [...changes].sort((a, b) => b.score - a.score)[0];
  return {
    changes,
    topContributor: topContributor?.score
      ? {
          key: topContributor.key,
          label: topContributor.label,
          delta: topContributor.delta,
          explanation: topContributor.explanation
        }
      : null
  };
};

export const analyzeUser = async (req, res, next) => {
  try {
    const behaviorProfile = normalizeBehavior(req.body);
    const quizAssessment = normalizeQuizAssessment(req.body.quizAssessment);
    validateBehaviorProfile(behaviorProfile);

    const mlResponse = await predictFutureOutcome({
      study_hours: behaviorProfile.studyHours,
      sleep_hours: behaviorProfile.sleepHours,
      exercise: behaviorProfile.exercise ? 1 : 0,
      screen_time: behaviorProfile.screenTime,
      consistency: behaviorProfile.consistency,
      procrastination: behaviorProfile.procrastination,
      goal_clarity: behaviorProfile.goalClarity
    });

    const user = await User.findById(req.user._id);
    const simulation = await generateSimulationNarrative({
      name: user.name,
      goals: user.goals,
      habits: user.habits,
      behaviorProfile,
      prediction: mlResponse.prediction,
      probabilities: mlResponse.probabilities
    });
    const latestEmotion = await Emotion.findOne({ userId: req.user._id }).sort({ timestamp: -1 }).lean();
    const personalized = buildPersonalizedRecommendations({
      behaviorProfile,
      prediction: mlResponse.prediction,
      probabilities: mlResponse.probabilities,
      goals: user.goals,
      habits: user.habits,
      latestEmotion: latestEmotion?.emotion || "neutral"
    });

    user.behaviorProfile = behaviorProfile;
    if (quizAssessment) {
      user.quizAssessment = quizAssessment;
    }
    user.mlPrediction = {
      label: mlResponse.prediction,
      probabilities: mlResponse.probabilities,
      confidence: mlResponse.confidence,
      modelName: mlResponse.model_name
    };
    user.analysis = {
      strengths: personalized.strengths.length ? personalized.strengths : simulation.strengths,
      weaknesses: personalized.weaknesses.length ? personalized.weaknesses : simulation.weaknesses,
      focusAreas: personalized.focusAreas,
      recommendations: personalized.recommendations,
      personalityType: simulation.personalityType,
      modelUsed: simulation.modelUsed,
      summary: `${simulation.summary} ${personalized.summary}`,
      confidence: personalized.confidence,
      momentumScore: personalized.momentumScore,
      riskScore: personalized.riskScore,
      nextBestAction: personalized.nextBestAction,
      narrativeTone: personalized.narrativeTone,
      habitAnchors: personalized.habitAnchors,
      coachProfile: personalized.coachProfile,
      insightCards: personalized.insightCards,
      driverSignals: personalized.driverSignals,
      dailyTasks: personalized.personalizedTasks.length ? personalized.personalizedTasks : simulation.dailyTasks
    };
    user.simulation = {
      futureStory: simulation.futureStory,
      alternateStory: simulation.alternateStory,
      futureMessage: simulation.futureMessage,
      timelineVariants: simulation.timelineVariants
    };
    await user.save();

    await Quest.deleteMany({ user: user._id, completed: false });

    res.json({
      prediction: user.mlPrediction,
      analysis: user.analysis,
      simulation: user.simulation,
      quizAssessment: user.quizAssessment
    });
  } catch (error) {
    next(error);
  }
};

const validateScannerPayload = ({ mood, energy, engagement, stress }) => {
  const validMoods = ["happy", "focused", "tired", "stressed"];
  if (!validMoods.includes(mood)) {
    const error = new Error("mood must be one of happy, focused, tired, or stressed.");
    error.status = 400;
    throw error;
  }

  for (const [field, value] of [
    ["energy", energy],
    ["engagement", engagement],
    ["stress", stress]
  ]) {
    if (!Number.isFinite(Number(value)) || Number(value) < 1 || Number(value) > 10) {
      const error = new Error(`${field} must be between 1 and 10.`);
      error.status = 400;
      throw error;
    }
  }
};

export const analyzeFutureState = async (req, res, next) => {
  try {
    const scannerState = {
      mood: String(req.body.mood || "").toLowerCase(),
      energy: Number(req.body.energy),
      engagement: Number(req.body.engagement),
      stress: Number(req.body.stress),
      cameraEnabled: Boolean(req.body.cameraEnabled),
      capturedAt: req.body.capturedAt || null,
      thumbnail: typeof req.body.thumbnail === "string" ? req.body.thumbnail : ""
    };

    validateScannerPayload(scannerState);

    const user = await User.findById(req.user._id).select("-password");
    const currentPrediction = user.mlPrediction?.label || "Unanalyzed";
    const stateScore =
      scannerState.engagement * 1.4 +
      scannerState.energy * 1.1 -
      scannerState.stress * 1.2 +
      (scannerState.mood === "focused" ? 2 : 0) +
      (scannerState.mood === "happy" ? 1 : 0) -
      (scannerState.mood === "tired" ? 2 : 0) -
      (scannerState.mood === "stressed" ? 3 : 0);

    const riskLevel = stateScore >= 13 ? "Low" : stateScore >= 8 ? "Moderate" : "High";

    const scan = await generateFutureStateScan({
      name: user.name,
      goals: user.goals,
      habits: user.habits,
      currentPrediction,
      scannerState: {
        ...scannerState,
        derivedRiskLevel: riskLevel
      }
    });

    const today = new Date().toDateString();
    const lastScan = user.lastScannerScanAt ? new Date(user.lastScannerScanAt).toDateString() : null;
    const alreadyScannedToday = lastScan === today;
    const xpAwarded = alreadyScannedToday ? 0 : 15;

    if (!alreadyScannedToday) {
      user.xp += xpAwarded;
      user.scannerStreak = lastScan === new Date(Date.now() - 86400000).toDateString() ? user.scannerStreak + 1 : 1;
      user.lastScannerScanAt = new Date();
    }

    user.scannerHistory.unshift({
      mood: scannerState.mood,
      energy: scannerState.energy,
      engagement: scannerState.engagement,
      stress: scannerState.stress,
      riskLevel,
      statusLabel: scan.statusLabel,
      summary: scan.summary,
      futureWarning: scan.futureWarning,
      bestMoveNow: scan.bestMoveNow,
      suggestions: scan.suggestions,
      thumbnail: scannerState.thumbnail,
      cameraEnabled: scannerState.cameraEnabled
    });
    user.scannerHistory = user.scannerHistory.slice(0, 8);
    appendActivityLog(user, {
      type: "scanner",
      label: scan.statusLabel,
      xpAwarded,
      detail: scan.bestMoveNow,
      createdAt: new Date()
    });
    await user.save();

    res.json({
      riskLevel,
      scannerState,
      scan,
      xpAwarded,
      scannerStreak: user.scannerStreak,
      scannerHistory: user.scannerHistory,
      totalXp: user.xp
    });
  } catch (error) {
    next(error);
  }
};

export const detectProductivity = async (req, res, next) => {
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (text.length < 3) {
      const error = new Error("Please describe the activity in a little more detail.");
      error.status = 400;
      throw error;
    }

    res.json(buildProductivityPrediction(text));
  } catch (error) {
    next(error);
  }
};

export const simulateFuture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const behaviorProfile = normalizeBehavior({
      ...user.behaviorProfile,
      ...req.body,
      screenTime: req.body.screenTime ?? user.behaviorProfile?.screenTime ?? 4
    });
    validateBehaviorProfile(behaviorProfile);

    const mlResponse = await predictFutureOutcome({
      study_hours: behaviorProfile.studyHours,
      sleep_hours: behaviorProfile.sleepHours,
      exercise: behaviorProfile.exercise ? 1 : 0,
      screen_time: behaviorProfile.screenTime,
      consistency: behaviorProfile.consistency,
      procrastination: behaviorProfile.procrastination,
      goal_clarity: behaviorProfile.goalClarity
    });

    const story = await generateWhatIfStory({
      name: user.name,
      goals: user.goals,
      habits: user.habits,
      behaviorProfile,
      prediction: mlResponse.prediction,
      probabilities: mlResponse.probabilities
    });

    const currentPrediction = user.mlPrediction || {};
    const currentScore = getOutcomeScore(currentPrediction.label, currentPrediction.probabilities);
    const simulatedScore = getOutcomeScore(mlResponse.prediction, mlResponse.probabilities);
    const delta = simulatedScore - currentScore;
    const contribution = getContributionBreakdown(user.behaviorProfile || {}, behaviorProfile);

    user.simulationHistory = user.simulationHistory || [];
    user.simulationHistory.unshift({
      presetMode: typeof req.body.presetMode === "string" ? req.body.presetMode : "",
      behaviorProfile,
      prediction: mlResponse.prediction,
      score: simulatedScore,
      story: story.story,
      improvementDelta: delta,
      topContributor: contribution.topContributor
    });
    user.simulationHistory = user.simulationHistory.slice(0, 12);
    appendActivityLog(user, {
      type: "simulation",
      label: req.body.presetMode ? `${req.body.presetMode} simulation` : "What If simulation",
      xpAwarded: 0,
      detail: `Simulated ${mlResponse.prediction} future with ${delta >= 0 ? `+${delta}` : delta}% change.`,
      createdAt: new Date()
    });
    await user.save();

    res.json({
      current: {
        prediction: currentPrediction.label || "Pending",
        story: user.simulation?.futureStory || user.analysis?.summary || "Complete your scan to unlock your current future story.",
        score: currentScore
      },
      simulated: {
        prediction: mlResponse.prediction,
        probabilities: mlResponse.probabilities,
        confidence: mlResponse.confidence,
        story: story.story,
        score: simulatedScore,
        modelUsed: story.modelUsed || mlResponse.model_name
      },
      improvement: {
        delta,
        label: delta > 0 ? `+${delta}% Better Outcome` : delta < 0 ? `${delta}% Harder Outcome` : "No change in outcome"
      },
      topContributor: contribution.topContributor,
      history: user.simulationHistory
    });
  } catch (error) {
    next(error);
  }
};
