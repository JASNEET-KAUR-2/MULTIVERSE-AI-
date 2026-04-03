const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const roundPercent = (value) => Math.round(clamp(value, 0, 1) * 100);
const toTitle = (value) => String(value || "").replace(/[_-]/g, " ").trim();

const inferIntentProfile = ({ goals = [], habits = [] }) => {
  const tokens = [...goals, ...habits].map((item) => String(item || "").toLowerCase()).join(" ");
  const themes = [
    {
      key: "career",
      match: /career|job|internship|promotion|startup|business|coding|engineer|work/,
      label: "Career Builder",
      missionWord: "career momentum"
    },
    {
      key: "learning",
      match: /study|exam|learn|course|college|school|grade|gpa|skill/,
      label: "Learning Accelerator",
      missionWord: "learning velocity"
    },
    {
      key: "health",
      match: /health|fitness|gym|workout|sleep|diet|run|body/,
      label: "Energy Rebuilder",
      missionWord: "energy stability"
    },
    {
      key: "creative",
      match: /write|design|music|art|create|content|youtube|creative/,
      label: "Creative Operator",
      missionWord: "creative output"
    }
  ];

  const found = themes.find((theme) => theme.match.test(tokens));
  return found || { key: "general", label: "Future Architect", missionWord: "personal momentum" };
};

const buildDriverScores = (behaviorProfile = {}) => {
  const values = {
    studyHours: Number(behaviorProfile.studyHours || 0),
    sleepHours: Number(behaviorProfile.sleepHours || 0),
    exercise: behaviorProfile.exercise ? 1 : 0,
    screenTime: Number(behaviorProfile.screenTime || 0),
    consistency: Number(behaviorProfile.consistency || 0),
    procrastination: Number(behaviorProfile.procrastination || 0),
    goalClarity: Number(behaviorProfile.goalClarity || 0)
  };

  return [
    {
      key: "studyHours",
      label: "Deep work time",
      strengthScore: clamp(values.studyHours / 8, 0, 1),
      riskScore: clamp((3 - values.studyHours) / 3, 0, 1),
      recommendation: values.studyHours < 3 ? "Protect one daily study sprint of at least 45 focused minutes." : "Keep your learning block consistent and distraction-free."
    },
    {
      key: "sleepHours",
      label: "Sleep rhythm",
      strengthScore: clamp(1 - Math.abs(values.sleepHours - 7.5) / 3, 0, 1),
      riskScore: clamp(Math.abs(values.sleepHours - 7.5) / 3, 0, 1),
      recommendation:
        values.sleepHours < 6.5
          ? "Prioritize sleep recovery for the next three nights before trying to increase output."
          : values.sleepHours > 8.8
            ? "Tighten your wake-up window so your energy stays sharper across the day."
            : "Your sleep range is workable. Protect it with a stable screen-off routine."
    },
    {
      key: "exercise",
      label: "Physical activation",
      strengthScore: values.exercise ? 0.9 : 0.25,
      riskScore: values.exercise ? 0.15 : 0.75,
      recommendation: values.exercise ? "Use your movement habit to anchor your most important work block." : "Add a short walk or workout ritual to improve focus and stress resilience."
    },
    {
      key: "screenTime",
      label: "Screen discipline",
      strengthScore: clamp((8 - values.screenTime) / 8, 0, 1),
      riskScore: clamp((values.screenTime - 4) / 8, 0, 1),
      recommendation:
        values.screenTime > 6
          ? "Reduce passive screen time with one protected no-scroll window each day."
          : "Your screen time is under control. Keep protecting it during high-focus hours."
    },
    {
      key: "consistency",
      label: "Execution consistency",
      strengthScore: clamp(values.consistency / 10, 0, 1),
      riskScore: clamp((6 - values.consistency) / 6, 0, 1),
      recommendation:
        values.consistency < 6
          ? "Lower the size of daily goals so you can build a repeatable win streak."
          : "Consistency is becoming an edge. Keep stacking small daily completions."
    },
    {
      key: "procrastination",
      label: "Procrastination control",
      strengthScore: clamp((10 - values.procrastination) / 10, 0, 1),
      riskScore: clamp(values.procrastination / 10, 0, 1),
      recommendation:
        values.procrastination > 6
          ? "Break major tasks into tiny starts so resistance stays low."
          : "Your procrastination signal is manageable. Guard against context switching."
    },
    {
      key: "goalClarity",
      label: "Goal clarity",
      strengthScore: clamp(values.goalClarity / 10, 0, 1),
      riskScore: clamp((6 - values.goalClarity) / 6, 0, 1),
      recommendation:
        values.goalClarity < 6
          ? "Rewrite your next 30 days into one measurable target and one weekly milestone."
          : "Your goals are fairly clear. Keep linking each day to a specific milestone."
    }
  ];
};

const extractKeywords = (items = []) =>
  Array.isArray(items)
    ? items
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

export const buildPersonalizedRecommendations = ({
  behaviorProfile = {},
  prediction,
  probabilities = {},
  goals = [],
  habits = []
}) => {
  const drivers = buildDriverScores(behaviorProfile);
  const strongestDrivers = [...drivers].sort((a, b) => b.strengthScore - a.strengthScore).slice(0, 3);
  const weakestDrivers = [...drivers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
  const focusAreas = weakestDrivers.map((item) => item.label);
  const recommendations = weakestDrivers.map((item) => item.recommendation);
  const confidence = roundPercent(
    Math.max(probabilities.High || 0, probabilities.Average || 0, probabilities.Negative || 0)
  );

  const goalText = extractKeywords(goals);
  const habitText = extractKeywords(habits);
  const intentProfile = inferIntentProfile({ goals: goalText, habits: habitText });
  const momentumScoreRaw =
    drivers.reduce((total, item) => total + item.strengthScore, 0) / Math.max(drivers.length, 1);
  const riskScoreRaw =
    drivers.reduce((total, item) => total + item.riskScore, 0) / Math.max(drivers.length, 1);
  const momentumScore = roundPercent(momentumScoreRaw);
  const riskScore = roundPercent(riskScoreRaw);
  const habitConsistency = behaviorProfile.consistency >= 7 ? "stable" : behaviorProfile.consistency >= 5 ? "forming" : "fragile";
  const primaryGoal = goalText[0] || "your biggest next chapter";
  const primaryHabit = habitText[0] || "one repeatable daily trigger";
  const narrativeTone = prediction === "High" ? "accelerating" : prediction === "Average" ? "stabilizing" : "recovery";
  const coachTitle =
    prediction === "High"
      ? `${intentProfile.label} Momentum Architect`
      : prediction === "Average"
        ? `${intentProfile.label} Trajectory Stabilizer`
        : `${intentProfile.label} Reset Strategist`;
  const nextBestAction = weakestDrivers[0]
    ? `${weakestDrivers[0].recommendation} Keep it connected to ${primaryGoal}.`
    : `Keep building around ${primaryGoal} with ${primaryHabit}.`;

  const summary = `Your strongest signals right now are ${strongestDrivers
    .map((item) => item.label.toLowerCase())
    .join(", ")}, while ${focusAreas.map((item) => item.toLowerCase()).join(", ")} are holding back a stronger ${String(prediction || "future").toLowerCase()} trajectory.`;

  const personalizedTasks = weakestDrivers.map((item, index) => {
    const difficulty = index === 0 ? "Hard" : index === 1 ? "Medium" : "Easy";
    const anchorGoal = goalText[index % Math.max(goalText.length, 1)] || "your future goal";
    const anchorHabit = habitText[index % Math.max(habitText.length, 1)] || "your routine";

    return {
      title:
        item.key === "screenTime"
          ? "Distraction Reset Window"
          : item.key === "sleepHours"
            ? "Recovery Routine Lock"
            : item.key === "goalClarity"
              ? "Goal Alignment Sprint"
              : item.key === "procrastination"
                ? "Tiny Start Challenge"
                : item.key === "consistency"
                  ? "Consistency Checkpoint"
                  : item.key === "exercise"
                    ? "Energy Activation"
                    : "Focused Work Block",
      description: `${item.recommendation} Tie it directly to ${anchorGoal} and use ${anchorHabit} as the trigger.`,
      difficulty
    };
  });

  return {
    strengths: strongestDrivers.map((item) => item.label),
    weaknesses: weakestDrivers.map((item) => item.label),
    focusAreas,
    recommendations,
    summary,
    confidence,
    momentumScore,
    riskScore,
    nextBestAction,
    narrativeTone,
    habitAnchors: {
      primaryGoal,
      primaryHabit,
      consistencyBand: habitConsistency
    },
    coachProfile: {
      title: coachTitle,
      headline:
        prediction === "High"
          ? `You already have upward signals. The biggest win now is protecting consistency around ${intentProfile.missionWord}.`
          : prediction === "Average"
            ? `You are closer to a breakout in ${intentProfile.missionWord} than your current routine suggests.`
            : `Your best improvement in ${intentProfile.missionWord} will come from recovery, clarity, and smaller starts.`,
      focus: focusAreas[0] || "Execution consistency",
      energy:
        behaviorProfile.exercise || behaviorProfile.sleepHours >= 7
          ? "usable"
          : "depleted",
      mission: `Turn ${toTitle(focusAreas[0] || "your weakest signal").toLowerCase()} into a daily edge for ${primaryGoal} and stronger ${intentProfile.missionWord}.`
    },
    insightCards: [
      {
        title: "Momentum",
        value: momentumScore,
        tone: momentumScore >= 70 ? "good" : momentumScore >= 45 ? "neutral" : "warning",
        detail: `Built from your current balance of study, consistency, clarity, and recovery.`
      },
      {
        title: "Risk Load",
        value: riskScore,
        tone: riskScore <= 35 ? "good" : riskScore <= 60 ? "neutral" : "warning",
        detail: `Higher screen drift, low recovery, and procrastination are adding drag right now.`
      },
      {
        title: "Personal Fit",
        value: roundPercent(Math.min(1, 0.45 + goalText.length * 0.12 + habitText.length * 0.12 + momentumScoreRaw * 0.25)),
        tone: goalText.length || habitText.length ? "good" : "neutral",
        detail: `Recommendations are anchored to ${goalText.length ? "your goals" : "your current scan"} and ${habitText.length ? "habits" : "behavior signals"}.`
      }
    ],
    personalizedTasks,
    driverSignals: drivers.map((item) => ({
      label: item.label,
      strengthScore: roundPercent(item.strengthScore),
      riskScore: roundPercent(item.riskScore)
    }))
  };
};
