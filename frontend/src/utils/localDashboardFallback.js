const STORAGE_KEY = "parallel-you-local-dashboard";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const round = (value) => Math.round(value);

const buildProbabilities = (behaviorProfile) => {
  const score = clamp(
    50 +
      (Number(behaviorProfile.studyHours || 0) - 4) * 4 +
      (Number(behaviorProfile.sleepHours || 0) - 7) * 3 +
      (behaviorProfile.exercise ? 6 : -2) +
      (Number(behaviorProfile.consistency || 0) - 5) * 5 +
      (Number(behaviorProfile.goalClarity || 0) - 5) * 4 -
      (Number(behaviorProfile.screenTime || 0) - 4) * 2.5 -
      (Number(behaviorProfile.procrastination || 0) - 5) * 5,
    1,
    99
  );

  const high = clamp((score - 42) / 58, 0.05, 0.9);
  const negative = clamp((58 - score) / 58, 0.05, 0.9);
  const average = clamp(1 - Math.max(high, negative) - Math.min(high, negative) * 0.55, 0.05, 0.9);
  const total = high + average + negative;

  return {
    High: Number((high / total).toFixed(4)),
    Average: Number((average / total).toFixed(4)),
    Negative: Number((negative / total).toFixed(4))
  };
};

const buildPrediction = (probabilities) => {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  return {
    label: entries[0]?.[0] || "Average",
    confidence: Number((entries[0]?.[1] || 0).toFixed(4)),
    probabilities,
    modelName: "frontend-local-fallback"
  };
};

const buildInsightCards = (behaviorProfile, prediction) => {
  const momentum = round(
    clamp(
      behaviorProfile.studyHours * 7 +
        behaviorProfile.consistency * 5 +
        behaviorProfile.goalClarity * 4 -
        behaviorProfile.procrastination * 3,
      18,
      96
    )
  );
  const risk = round(
    clamp(
      behaviorProfile.screenTime * 6 +
        (10 - behaviorProfile.sleepHours) * 5 +
        behaviorProfile.procrastination * 4,
      10,
      92
    )
  );

  return [
    {
      title: "Momentum",
      value: momentum,
      tone: momentum >= 70 ? "good" : momentum >= 45 ? "neutral" : "warning",
      detail: "Generated locally from your latest quiz answers."
    },
    {
      title: "Risk Load",
      value: risk,
      tone: risk <= 35 ? "good" : risk <= 60 ? "neutral" : "warning",
      detail: "Higher procrastination, screen drift, and low recovery increase this."
    },
    {
      title: "Personal Fit",
      value: prediction.label === "High" ? 84 : prediction.label === "Average" ? 68 : 49,
      tone: prediction.label === "Negative" ? "warning" : "good",
      detail: "This preview uses the local fallback model because the live analysis API was unavailable."
    }
  ];
};

export const buildLocalDashboardFallback = ({ user, answers, quizAssessment = null }) => {
  const behaviorProfile = {
    studyHours: Number(answers.studyHours || 0),
    sleepHours: Number(answers.sleepHours || 0),
    exercise: Boolean(answers.exercise),
    screenTime: Number(answers.screenTime || 0),
    consistency: Number(answers.consistency || 0),
    procrastination: Number(answers.procrastination || 0),
    goalClarity: Number(answers.goalClarity || 0)
  };

  const probabilities = buildProbabilities(behaviorProfile);
  const prediction = buildPrediction(probabilities);
  const goals = Array.isArray(user?.goals) ? user.goals : [];
  const habits = Array.isArray(user?.habits) ? user.habits : [];
  const firstGoal = goals[0] || "your next chapter";
  const firstHabit = habits[0] || "a repeatable daily habit";
  const consistencyBand = behaviorProfile.consistency >= 7 ? "stable" : behaviorProfile.consistency >= 5 ? "forming" : "fragile";
  const focusAreas = [
    behaviorProfile.procrastination >= 6 ? "Procrastination control" : "Deep work time",
    behaviorProfile.sleepHours < 6.5 ? "Sleep rhythm" : "Execution consistency",
    behaviorProfile.goalClarity < 6 ? "Goal clarity" : "Screen discipline"
  ];

  const analysis = {
    strengths: [
      behaviorProfile.goalClarity >= 7 ? "Goal clarity" : "Self-awareness",
      behaviorProfile.exercise ? "Physical activation" : "Potential for momentum",
      behaviorProfile.consistency >= 6 ? "Execution consistency" : "Willingness to improve"
    ],
    weaknesses: focusAreas,
    focusAreas,
    recommendations: [
      `Turn ${firstGoal} into one measurable weekly target.`,
      `Use ${firstHabit} as the trigger for your first focused block.`,
      behaviorProfile.procrastination >= 6
        ? "Break the first task into a tiny start so resistance stays low."
        : "Protect your strongest hours from distraction."
    ],
    personalityType: prediction.label === "High" ? "Momentum Architect" : prediction.label === "Average" ? "Trajectory Stabilizer" : "Reset Strategist",
    modelUsed: "frontend-local-fallback",
    summary: `This local dashboard snapshot was generated from your quiz answers so you can keep moving even when the live analysis service is unavailable.`,
    confidence: round(prediction.confidence * 100),
    momentumScore: buildInsightCards(behaviorProfile, prediction)[0].value,
    riskScore: buildInsightCards(behaviorProfile, prediction)[1].value,
    nextBestAction: `Take one concrete action today that clearly supports ${firstGoal}.`,
    narrativeTone: prediction.label === "High" ? "accelerating" : prediction.label === "Average" ? "stabilizing" : "recovering",
    habitAnchors: {
      primaryGoal: firstGoal,
      primaryHabit: firstHabit,
      consistencyBand
    },
    coachProfile: {
      title: prediction.label === "High" ? "Trajectory Coach" : "Momentum Guide",
      headline: "Your live analysis is offline, but your dashboard is ready with a local preview.",
      focus: focusAreas[0],
      energy: behaviorProfile.sleepHours >= 7 ? "usable" : "rebuilding",
      mission: `Use today to build one visible win toward ${firstGoal}.`
    },
    insightCards: buildInsightCards(behaviorProfile, prediction),
    driverSignals: [
      { label: "Deep work time", strengthScore: round(clamp((behaviorProfile.studyHours / 8) * 100, 10, 100)), riskScore: round(clamp(((3 - behaviorProfile.studyHours) / 3) * 100, 0, 100)) },
      { label: "Sleep rhythm", strengthScore: round(clamp((behaviorProfile.sleepHours / 8) * 100, 10, 100)), riskScore: round(clamp(((7 - behaviorProfile.sleepHours) / 3) * 100, 0, 100)) },
      { label: "Execution consistency", strengthScore: round(clamp((behaviorProfile.consistency / 10) * 100, 10, 100)), riskScore: round(clamp((behaviorProfile.procrastination / 10) * 100, 0, 100)) }
    ],
    dailyTasks: [
      {
        title: "Focused start",
        description: `Do one distraction-free work block for ${firstGoal}.`,
        difficulty: "Medium"
      },
      {
        title: "Recovery lock",
        description: "Protect sleep and energy so tomorrow starts stronger than today.",
        difficulty: "Easy"
      },
      {
        title: "Momentum proof",
        description: "Finish one task that you have been postponing.",
        difficulty: "Hard"
      }
    ]
  };

  return {
    user: {
      ...(user || {}),
      behaviorProfile,
      quizAssessment,
      mlPrediction: prediction,
      analysis
    },
    stats: {
      xp: Number(user?.xp || 0),
      streak: Number(user?.streak || 0),
      prediction: prediction.label,
      scannerStreak: Number(user?.scannerStreak || 0),
      confidence: round(prediction.confidence * 100)
    },
    prediction,
    behaviorProfile,
    quizAssessment,
    analysis,
    simulation: {
      futureStory: `If you keep turning ${firstGoal} into weekly action, this version of you becomes more deliberate, calmer, and more trusted over time.`,
      alternateStory: `If you stay reactive and let distractions win, progress toward ${firstGoal} will keep feeling slower than it should.`,
      futureMessage: `Your future self wants you to protect consistency and make ${firstHabit} automatic before chasing more intensity.`,
      timelineVariants: {}
    },
    scannerHistory: [],
    activityLog: [],
    simulationHistory: [],
    quests: [],
    emotions: {
      latest: null,
      summary: {
        dominantEmotion: "neutral",
        averageConfidence: 0,
        totalEntries: 0
      },
      journalContext: {
        mood: "neutral",
        prompt: "Start with one honest sentence about how today feels."
      },
      habitInsight: {
        strongestHabit: null,
        supportLevel: "steady"
      },
      recommendation: "Keep your next step small and doable."
    }
  };
};

export const saveLocalDashboardFallback = (payload) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const loadLocalDashboardFallback = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearLocalDashboardFallback = () => {
  localStorage.removeItem(STORAGE_KEY);
};
