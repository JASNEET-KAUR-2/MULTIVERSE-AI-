const groqApiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";
const primaryGroqModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const fallbackGroqModel = process.env.GROQ_FALLBACK_MODEL || "llama-3.1-8b-instant";

const shouldFallbackToLocalNarrative = (error) => {
  const message = String(error?.message || "");
  const status = Number(error?.status || 0);

  return (
    /fetch failed|econnrefused|enotfound|timed out|timeout|network|request too large|tokens per minute|rate limit|please reduce your message size|too many requests|unauthorized|authentication|invalid api key/i.test(message) ||
    [401, 403, 408, 429, 500, 502, 503, 504].includes(status)
  );
};

const extractJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Groq returned an invalid JSON payload.");
  }

  return JSON.parse(text.slice(start, end + 1));
};

const compactList = (value, limit = 3) => {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, limit);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, limit);
  }

  return [];
};

const timelineOrder = ["1 Year", "5 Years", "10 Years", "20 Years"];

const getPrimaryGoal = (goals = []) => compactList(goals, 1)[0] || "long-term growth";

const getPrimaryHabit = (habits = []) => compactList(habits, 1)[0] || "steady discipline";

const getFutureIdentity = (prediction) => {
  if (prediction === "High") {
    return {
      bestTitle: "The Breakthrough Builder",
      riskTitle: "The Wasted Edge"
    };
  }

  if (prediction === "Average") {
    return {
      bestTitle: "The Stable Climber",
      riskTitle: "The Slow Drifter"
    };
  }

  return {
    bestTitle: "The Recovery Path",
    riskTitle: "The Stagnant Loop"
  };
};

const getTimelineMood = (timeline) => {
  if (timeline === "1 Year") {
    return {
      horizon: "over the next year",
      progressWord: "early momentum",
      bestLiving: "more structured and intentional",
      riskLiving: "still reactive and unstable"
    };
  }

  if (timeline === "5 Years") {
    return {
      horizon: "within five years",
      progressWord: "visible compounding",
      bestLiving: "stable with stronger self-trust",
      riskLiving: "pressured by delayed decisions"
    };
  }

  if (timeline === "10 Years") {
    return {
      horizon: "over ten years",
      progressWord: "identity-level growth",
      bestLiving: "well-built and self-directed",
      riskLiving: "defined by missed momentum"
    };
  }

  return {
    horizon: "across twenty years",
    progressWord: "legacy-level impact",
    bestLiving: "deeply aligned and influential",
    riskLiving: "boxed in by old patterns"
  };
};

const createTimelineVariantsFallback = ({ name, goals, habits, behaviorProfile, prediction, probabilities }) => {
  const userName = name || "You";
  const goal = getPrimaryGoal(goals);
  const habit = getPrimaryHabit(habits);
  const identity = getFutureIdentity(prediction);
  const riskLoad = Math.round(Number(probabilities?.Negative || 0) * 100);
  const sleepScore = Math.max(35, Math.min(98, Math.round((Number(behaviorProfile?.sleepHours || 0) / 10) * 100)));
  const focusScore = Math.max(
    30,
    Math.min(
      98,
      Math.round(
        Number(behaviorProfile?.consistency || 0) * 7 +
          Number(behaviorProfile?.studyHours || 0) * 4 -
          Number(behaviorProfile?.procrastination || 0) * 3
      )
    )
  );

  return timelineOrder.reduce((variants, timeline) => {
    const mood = getTimelineMood(timeline);
    variants[timeline] = {
      label: timeline,
      bestTitle: identity.bestTitle,
      riskTitle: identity.riskTitle,
      bestStory: `${userName} uses ${mood.horizon} to turn ${goal} into ${mood.progressWord}. With ${behaviorProfile.studyHours} study hours, ${behaviorProfile.sleepHours} hours of sleep, ${behaviorProfile.exercise ? "regular movement" : "inconsistent movement"}, and stronger follow-through, ${userName.toLowerCase()} becomes known for ${habit}. This version of life feels more deliberate, more respected, and much less chaotic than today.`,
      riskStory: `${userName} enters ${mood.horizon} still fighting procrastination, drifting routines, and unclear execution. Instead of building on ${goal}, the pressure compounds slowly. The result is a future that feels ${mood.riskLiving}, where opportunities exist but rarely convert into real progress.`,
      futureMessage: `${timeline} from now, your future self says: protect consistency, keep your recovery stable, and let ${habit} become your default identity.`,
      bestCareerOutcome: timeline === "1 Year" ? "Emerging momentum" : timeline === "5 Years" ? "Recognized growth track" : timeline === "10 Years" ? "Trusted expert path" : "Long-term influence arc",
      riskCareerOutcome: timeline === "1 Year" ? "Delayed momentum" : timeline === "5 Years" ? "Uneven career growth" : timeline === "10 Years" ? "Plateaued trajectory" : "Legacy weakened by drift",
      bestLifestyleIndicators: [
        { label: "Career", value: prediction === "High" ? "Fast upside" : prediction === "Average" ? "Stable progress" : "Recovery in motion" },
        { label: "Health Score", value: `${sleepScore}/100` },
        { label: "Living Situation", value: mood.bestLiving },
        { label: "Focus Score", value: `${focusScore}/100` }
      ],
      riskLifestyleIndicators: [
        { label: "Career Status", value: riskLoad >= 45 ? "High friction" : "Slow momentum" },
        { label: "Health Score", value: `${Math.max(20, sleepScore - 22)}/100` },
        { label: "Living Situation", value: mood.riskLiving },
        { label: "Risk Load", value: `${riskLoad}%` }
      ]
    };

    return variants;
  }, {});
};

const createScannerFallback = ({ name, currentPrediction, scannerState }) => {
  const { mood, energy, engagement, stress, derivedRiskLevel } = scannerState;
  const struggling = mood === "tired" || mood === "stressed" || energy <= 4 || engagement <= 4 || stress >= 7;
  const momentum = mood === "focused" || mood === "happy";

  const statusLabel =
    derivedRiskLevel === "High"
      ? "Recovery Mode Needed"
      : derivedRiskLevel === "Moderate"
        ? "Stability Check"
        : "Momentum Building";

  const summary = struggling
    ? `${name || "You"} look low on reserve right now. If this state repeats, your current ${String(currentPrediction || "future path").toLowerCase()} can slip further.`
    : `${name || "You"} are showing usable momentum right now. A small focused action today can strengthen your ${String(currentPrediction || "future path").toLowerCase()} trajectory.`;

  const futureWarning =
    derivedRiskLevel === "High"
      ? "If this pattern continues for a few days, your focus, confidence, and consistency may drop fast."
      : derivedRiskLevel === "Moderate"
        ? "If you ignore this dip, it can slowly turn into procrastination and lower-output days."
        : "If you protect this momentum, your future path is more likely to improve instead of flatten out.";

  const bestMoveNow =
    stress >= 7
      ? "Take a 10 minute reset, hydrate, and do one tiny task before returning to bigger work."
      : energy <= 4
        ? "Recover your energy first with food, water, or rest, then restart with a 15 minute sprint."
        : "Lock in a single high-impact task for the next 20 minutes and avoid switching contexts.";

  const suggestions = [
    "Do one small task that you can finish in under 15 minutes.",
    momentum ? "Protect your current focus by silencing distractions for one short sprint." : "Reduce screen drift and avoid passive scrolling for the next hour.",
    struggling ? "Prioritize recovery today so tomorrow does not start from burnout." : "End the day with a quick review so the momentum carries into tomorrow."
  ];

  return {
    statusLabel,
    riskLevel: derivedRiskLevel,
    summary,
    futureWarning,
    bestMoveNow,
    suggestions,
    bestCase: momentum
      ? "A steady routine today compounds into stronger confidence, cleaner execution, and visible growth this week."
      : "A timely reset today can stop the slide and bring you back to a more stable routine within days.",
    declineCase: struggling
      ? "If you keep pushing in this state without recovery, your future self may feel more drained, avoidant, and inconsistent."
      : "If you waste this window of momentum, the next few days can drift into fragmented effort and weaker output.",
    modelUsed: "local-fallback"
  };
};

const createWhatIfFallback = ({ name, prediction, behaviorProfile }) => {
  const label = String(prediction || "Average");
  const improved =
    label === "High"
      ? "Your alternate routine creates compounding upside. Better consistency, cleaner focus, and lower procrastination make your next chapter look far more intentional."
      : label === "Average"
        ? "Your alternate routine stabilizes the future, but some friction still remains. You are building a safer path, just not a breakout path yet."
        : "Even with these changes, the pattern still carries risk. The biggest missing pieces are consistency, recovery, and lower avoidance.";

  return {
    story: `${name || "You"} tested a new path with ${behaviorProfile.studyHours} study hours, ${behaviorProfile.sleepHours} hours of sleep, ${behaviorProfile.exercise ? "movement built in" : "limited movement"}, consistency at ${behaviorProfile.consistency}/10, procrastination at ${behaviorProfile.procrastination}/10, and goal clarity at ${behaviorProfile.goalClarity}/10. ${improved}`,
    modelUsed: "local-fallback"
  };
};

const createSimulationNarrativeFallback = ({ name, goals, habits, behaviorProfile, prediction, probabilities }) => {
  const fallbackVariants = createTimelineVariantsFallback({ name, goals, habits, behaviorProfile, prediction, probabilities });

  return {
    personalityType: getFutureIdentity(prediction).bestTitle,
    summary: `${name || "You"} show a ${String(prediction).toLowerCase()} trajectory shaped by consistency, recovery, and execution quality.`,
    strengths: [
      "Shows real potential when routines are protected",
      "Can compound small wins into visible momentum",
      "Has clear upside when habits stay aligned"
    ],
    weaknesses: [
      "Momentum can drop quickly when routines slip",
      "Avoidance still damages long-term compounding",
      "Recovery and focus need to stay protected"
    ],
    futureStory: fallbackVariants["5 Years"].bestStory,
    alternateStory: fallbackVariants["5 Years"].riskStory,
    futureMessage: fallbackVariants["5 Years"].futureMessage,
    dailyTasks: [
      {
        title: "Protect your first deep-work block",
        description: "Start the day with your most important task before distractions build.",
        difficulty: "Medium"
      },
      {
        title: "Lock a consistent sleep window",
        description: "Keep recovery stable so your focus stops fluctuating.",
        difficulty: "Easy"
      },
      {
        title: "Finish one avoided task",
        description: "Convert hesitation into momentum with one uncomfortable but meaningful action.",
        difficulty: "Hard"
      }
    ],
    timelineVariants: fallbackVariants,
    modelUsed: "timeline-fallback"
  };
};

export const generateSimulationNarrative = async ({ name, goals, habits, behaviorProfile, prediction, probabilities }) => {
  if (!process.env.GROQ_API_KEY) {
    return createSimulationNarrativeFallback({ name, goals, habits, behaviorProfile, prediction, probabilities });
  }

  const messages = [
    {
      role: "system",
      content:
        "You are the narrative engine for a personal future simulation platform. Respect the machine-learning prediction as ground truth. Return only valid JSON."
    },
    {
      role: "user",
      content: `Return JSON with this exact shape:
{
  "personalityType": "string",
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "futureStory": "string",
  "alternateStory": "string",
  "futureMessage": "string",
  "timelineVariants": {
    "1 Year": {
      "label": "1 Year",
      "bestTitle": "string",
      "riskTitle": "string",
      "bestStory": "string",
      "riskStory": "string",
      "futureMessage": "string",
      "bestCareerOutcome": "string",
      "riskCareerOutcome": "string",
      "bestLifestyleIndicators": [{ "label": "string", "value": "string" }],
      "riskLifestyleIndicators": [{ "label": "string", "value": "string" }]
    },
    "5 Years": "same shape as 1 Year",
    "10 Years": "same shape as 1 Year",
    "20 Years": "same shape as 1 Year"
  },
  "dailyTasks": [
    {
      "title": "string",
      "description": "string",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}

Rules:
- strengths: exactly 3 items
- weaknesses: exactly 3 items
- dailyTasks: exactly 3 items
- futureStory = optimistic future path
- alternateStory = cautionary future path
- timelineVariants must contain exactly 4 keys: "1 Year", "5 Years", "10 Years", "20 Years"
- each timeline story must feel genuinely different and evolve with time horizon, not rephrase the same paragraph
- bestStory and riskStory must be personalized using the user's goals, habits, and behavior profile
- bestLifestyleIndicators and riskLifestyleIndicators must each contain exactly 4 items
- Keep it hackathon-demo friendly, practical, and motivating

User data:
${JSON.stringify({ name, goals, habits, behaviorProfile, prediction, probabilities }, null, 2)}`
    }
  ];

  const modelsToTry = Array.from(new Set([primaryGroqModel, fallbackGroqModel].filter(Boolean)));
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`${groqApiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || `Groq generation failed for model ${model}.`);
        error.status = response.status;
        throw error;
      }

      const content = data.choices?.[0]?.message?.content || "";
      const parsed = extractJson(content);
      const timelineVariants =
        parsed.timelineVariants && typeof parsed.timelineVariants === "object"
          ? parsed.timelineVariants
          : createTimelineVariantsFallback({ name, goals, habits, behaviorProfile, prediction, probabilities });

      return {
        ...parsed,
        timelineVariants,
        futureStory: parsed.futureStory || timelineVariants["5 Years"]?.bestStory,
        alternateStory: parsed.alternateStory || timelineVariants["5 Years"]?.riskStory,
        futureMessage: parsed.futureMessage || timelineVariants["5 Years"]?.futureMessage,
        modelUsed: model
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    if (shouldFallbackToLocalNarrative(lastError)) {
      return createSimulationNarrativeFallback({ name, goals, habits, behaviorProfile, prediction, probabilities });
    }

    lastError.status = 502;
    throw lastError;
  }

  return createSimulationNarrativeFallback({ name, goals, habits, behaviorProfile, prediction, probabilities });
};

export const generateFutureStateScan = async ({
  name,
  goals,
  habits,
  currentPrediction,
  scannerState
}) => {
  if (!process.env.GROQ_API_KEY) {
    return createScannerFallback({ name, currentPrediction, scannerState });
  }

  const scannerPromptPayload = {
    name,
    goals: compactList(goals, 3),
    habits: compactList(habits, 3),
    currentPrediction,
    scannerState: {
      mood: scannerState.mood,
      energy: scannerState.energy,
      engagement: scannerState.engagement,
      stress: scannerState.stress,
      cameraEnabled: scannerState.cameraEnabled,
      capturedAt: scannerState.capturedAt,
      derivedRiskLevel: scannerState.derivedRiskLevel,
      hasSnapshot: Boolean(scannerState.thumbnail)
    }
  };

  const messages = [
    {
      role: "system",
      content:
        "You are the future-self scanner engine for a personal growth app. Use the user's current mood and engagement state to generate practical, concise, motivating future insight. Return only valid JSON."
    },
    {
      role: "user",
      content: `Return JSON with this exact shape:
{
  "statusLabel": "string",
  "riskLevel": "Low" | "Moderate" | "High",
  "summary": "string",
  "futureWarning": "string",
  "bestMoveNow": "string",
  "suggestions": ["string"],
  "bestCase": "string",
  "declineCase": "string"
}

Rules:
- suggestions: exactly 3 items
- Make it feel like a hackathon demo for a Future Self Scanner
- If the current state is tired/stressed and low engagement, emphasize decline risk
- If the state is focused/happy and high engagement, emphasize momentum
- Keep it practical, short, and emotionally clear

User data:
${JSON.stringify(scannerPromptPayload, null, 2)}`
    }
  ];

  const modelsToTry = Array.from(new Set([primaryGroqModel, fallbackGroqModel].filter(Boolean)));
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`${groqApiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || `Groq future state scan failed for model ${model}.`);
        error.status = response.status;
        throw error;
      }

      const content = data.choices?.[0]?.message?.content || "";
      const parsed = extractJson(content);
      return {
        ...parsed,
        modelUsed: model
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    if (shouldFallbackToLocalNarrative(lastError)) {
      return createScannerFallback({ name, currentPrediction, scannerState });
    }

    lastError.status = 502;
    throw lastError;
  }

  return createScannerFallback({ name, currentPrediction, scannerState });
};

export const generateWhatIfStory = async ({ name, goals, habits, behaviorProfile, prediction, probabilities }) => {
  if (!process.env.GROQ_API_KEY) {
    return createWhatIfFallback({ name, prediction, behaviorProfile });
  }

  const payload = {
    name,
    goals: compactList(goals, 3),
    habits: compactList(habits, 3),
    behaviorProfile,
    prediction,
    probabilities
  };

  const messages = [
    {
      role: "system",
      content:
        "You are the alternate-reality simulator for a personal growth app. Respect the ML prediction as truth and explain the changed outcome clearly. Return only valid JSON."
    },
    {
      role: "user",
      content: `Return JSON with this exact shape:
{
  "story": "string"
}

Rules:
- Write one detailed future story paragraph
- Explain why the new habits produce this prediction
- Keep it motivating, clear, and visual
- Mention the user's changed behavior patterns naturally

User data:
${JSON.stringify(payload, null, 2)}`
    }
  ];

  const modelsToTry = Array.from(new Set([primaryGroqModel, fallbackGroqModel].filter(Boolean)));
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`${groqApiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || `Groq what-if generation failed for model ${model}.`);
        error.status = response.status;
        throw error;
      }

      const content = data.choices?.[0]?.message?.content || "";
      const parsed = extractJson(content);
      return {
        ...parsed,
        modelUsed: model
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    if (shouldFallbackToLocalNarrative(lastError)) {
      return createWhatIfFallback({ name, prediction, behaviorProfile });
    }

    lastError.status = 502;
    throw lastError;
  }

  return createWhatIfFallback({ name, prediction, behaviorProfile });
};
