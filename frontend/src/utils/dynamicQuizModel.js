const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const roundToHalf = (value) => Math.round(value * 2) / 2;

const averageLength = (answers = []) => {
  if (!answers.length) {
    return 0;
  }

  return answers.reduce((sum, item) => sum + String(item.answer || "").trim().length, 0) / answers.length;
};

const calculateTrait = (text, positiveKeywords, negativeKeywords, depthBonus = 0) => {
  let score = 50 + depthBonus;

  positiveKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      score += 12;
    }
  });

  negativeKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      score -= 10;
    }
  });

  return clamp(score, 0, 100);
};

const getProfileSignals = (user = {}) => {
  const age = Number(user.age) || 25;
  const goalsText = Array.isArray(user.goals) ? user.goals.join(", ") : String(user.goals || "");
  const habitsText = Array.isArray(user.habits) ? user.habits.join(", ") : String(user.habits || "");
  const goalsLower = goalsText.toLowerCase();
  const habitsLower = habitsText.toLowerCase();

  return {
    age,
    goalsText,
    habitsText,
    goalsLower,
    habitsLower,
    ageGroup: age < 22 ? "student_early" : age < 35 ? "young_professional" : age < 50 ? "mid_career" : "experienced",
    hasCareerGoal: /career|work|job|promotion|manager|lead|income|startup|business/.test(goalsLower),
    hasGrowthGoal: /learn|skill|improve|grow|master|study|ai|build/.test(goalsLower),
    hasBalanceGoal: /balance|health|life|wellbeing|peace|family/.test(goalsLower),
    hasGoodHabit: /exercise|read|meditate|journal|walk|sleep|plan|routine|gym|run|yoga/.test(habitsLower),
    hasBadHabit: /procrastinate|late|distracted|scroll|overthink|delay|inconsistent/.test(habitsLower)
  };
};

export const generateDynamicScenarios = (user = {}) => {
  const profile = getProfileSignals(user);

  return [
    {
      id: 1,
      category: "Problem-solving under pressure",
      prompt:
        profile.ageGroup === "student_early"
          ? "You have major exams next week, a group project is slipping, and someone on your team is not contributing. You also promised to help a friend. You have five days. What is your exact action plan?"
          : profile.ageGroup === "young_professional"
            ? "Your startup has 60 days of runway left. Three possible investors want different terms, and a key teammate just got a competing offer. What do you do step by step?"
            : "Your department is facing a major budget cut next quarter. You need to protect jobs while keeping performance stable. Your boss wants a plan in 48 hours. Walk through your exact response."
    },
    {
      id: 2,
      category: "Handling failure",
      prompt: profile.hasCareerGoal
        ? "You spent six months preparing for a promotion and delivered strong work, but someone else got the role. How do you process it and what is your next move?"
        : "You poured serious time and money into a personal project and it failed. People around you know about it. How do you handle the disappointment and rebuild?"
    },
    {
      id: 3,
      category: "Learning style",
      prompt: profile.hasGrowthGoal
        ? `You want to master ${profile.goalsText || "a high-value skill"} in the next 30 days while keeping the rest of life moving. Design your learning system: schedule, resources, accountability, and progress tracking.`
        : "Your company is shifting to a completely new system and everyone needs to learn it fast. Describe your learning approach from day one to day twenty-one."
    },
    {
      id: 4,
      category: "Team vs individual behavior",
      prompt: profile.hasBalanceGoal
        ? "Your team wants to work overtime for two weeks to hit a deadline, but you care deeply about sustainability and balance. You are the only one pushing back. What do you do?"
        : "You have an idea that could save major time and money, but your team lead dismisses it immediately. Do you escalate, accept it, or find another path? Explain your reasoning."
    },
    {
      id: 5,
      category: "Risk-taking ability",
      prompt: profile.age < 30
        ? "You have a stable job, but there is a high-upside startup opportunity with a meaningful pay cut for the next two years. Walk through your decision framework."
        : "You have an opportunity to pivot into a different industry with better long-term upside, but you would have to start from a lower level. Current work is safe but stagnant. How do you decide?"
    },
    {
      id: 6,
      category: "Curiosity and initiative",
      prompt: profile.hasBadHabit
        ? "You notice a recurring problem at work that wastes hours every week, but solving it requires learning a new tool and you usually procrastinate on non-urgent work. What specific action do you take this week?"
        : "You notice an inefficiency that nobody else has acted on. Solving it would mean extra effort and some social friction. What is your exact approach?"
    },
    {
      id: 7,
      category: "Time management",
      prompt: profile.hasGoodHabit
        ? "You have a work deadline, a family commitment, movement, learning time, and an unexpected urgent request all in one day. Show your exact prioritization system."
        : "You have several important deliverables, multiple meetings, and constant notifications. You get distracted more than you want. Create your detailed time-blocking plan for the next eight hours."
    },
    {
      id: 8,
      category: "Decision-making style",
      prompt: profile.age > 35
        ? "A competitor offers you more money, but the move would create real life tradeoffs outside work. Current work is stable but not exciting. Which factors matter most and how do you decide?"
        : "You have two paths in front of you: one safe and predictable, one uncertain but potentially transformative. You have been thinking about it for months. What finally pushes you one way?"
    },
    {
      id: 9,
      category: "Reaction to uncertainty",
      prompt: profile.ageGroup === "mid_career"
        ? "Technology shifts are threatening parts of your industry over the next few years. Some of your current skills may lose value. What is your emotional response, and what is your 90-day plan?"
        : "Your company announces restructuring next month and you do not know what your future there looks like. How do you prepare mentally and practically over the next two weeks?"
    },
    {
      id: 10,
      category: "Motivation triggers",
      prompt: profile.hasCareerGoal
        ? `Think about your biggest goal: "${profile.goalsText || "your next chapter"}". Describe the last time you felt fully engaged working toward something similar. What conditions made that happen?`
        : "When do you feel most energized and alive? Describe a specific recent moment. What does that reveal about how you are actually wired?"
    }
  ];
};

export const analyzeScenarioResponses = ({ answers = [], user = {} }) => {
  const profile = getProfileSignals(user);
  const text = answers.map((item) => String(item.answer || "").toLowerCase()).join(" ");
  const avgLength = averageLength(answers);
  const depthBonus = avgLength > 180 ? 10 : avgLength > 120 ? 7 : avgLength > 80 ? 4 : 0;

  const traits = {
    patience: calculateTrait(text, ["wait", "calm", "step by step", "breathe", "analyze", "reflect"], ["panic", "rage", "rush", "frustrated"], depthBonus),
    riskTaking: calculateTrait(text, ["risk", "opportunity", "startup", "uncertain", "bet", "pivot"], ["safe", "stability", "secure", "avoid risk", "comfortable"], depthBonus),
    creativity: calculateTrait(text, ["imagine", "brainstorm", "design", "creative", "novel", "innovative"], ["template", "standard", "traditional"], depthBonus),
    discipline: calculateTrait(text, ["routine", "schedule", "focus", "habit", "consistent", "plan", "track"], ["procrastinate", "messy", "chaos", "last minute", "distracted"], depthBonus),
    leadership: calculateTrait(text, ["lead", "team", "guide", "motivate", "responsibility", "mentor"], ["avoid leading", "defer", "stay quiet"], depthBonus),
    adaptability: calculateTrait(text, ["change", "pivot", "flexible", "evolve", "adjust", "learn new"], ["rigid", "hate change", "resistant"], depthBonus),
    curiosity: calculateTrait(text, ["explore", "why", "learn", "discover", "question", "research"], ["unnecessary", "why bother", "waste"], depthBonus),
    emotionalResilience: calculateTrait(text, ["bounce back", "learn from failure", "accept", "grow", "stronger", "recover"], ["give up", "crushed", "blame", "unfair", "devastated"], depthBonus)
  };

  const decisionStyle =
    /data|analyze|metrics|pros and cons|evidence/.test(text) ? "analytical" : /gut|feeling|intuition/.test(text) ? "intuitive" : "balanced";
  const workingStyle =
    /team|collaborate|together|group/.test(text) ? "collaborative" : /alone|independent|solo/.test(text) ? "independent" : "hybrid";
  const riskProfile = traits.riskTaking > 65 ? "adventurous" : traits.riskTaking < 35 ? "conservative" : "moderate";
  const thinkingPattern =
    /step|plan|structured|checklist/.test(text) ? "structured" : /flexible|adapt/.test(text) ? "flexible" : "intuitive";

  let archetype = "Strategist";
  if (traits.riskTaking > 60 && traits.creativity > 60) {
    archetype = "Explorer";
  } else if (traits.discipline > 70) {
    archetype = "Builder";
  } else if (traits.leadership > 65) {
    archetype = "Visionary";
  } else if (traits.curiosity > 70) {
    archetype = "Innovator";
  } else if (traits.adaptability > 65) {
    archetype = "Adaptor";
  }

  const studyHours = roundToHalf(clamp(1.5 + traits.discipline * 0.04 + traits.curiosity * 0.015 + avgLength / 120, 1.5, 10));
  const sleepHours = roundToHalf(
    clamp(5 + traits.emotionalResilience * 0.025 + traits.patience * 0.015 + (profile.hasGoodHabit ? 0.4 : 0) - (profile.hasBadHabit ? 0.5 : 0), 4.5, 8.5)
  );
  const exercise = profile.hasGoodHabit || /exercise|gym|run|walk|yoga|sport|workout/.test(text);
  const screenTime = roundToHalf(clamp(8.5 - traits.discipline * 0.03 - traits.emotionalResilience * 0.015 + (profile.hasBadHabit ? 1.2 : 0), 2, 10));
  const consistency = Math.round(clamp((traits.discipline * 0.55 + traits.patience * 0.2 + traits.emotionalResilience * 0.25) / 10, 1, 10));
  const procrastination = Math.round(
    clamp(10 - (traits.discipline * 0.5 + traits.emotionalResilience * 0.25 + traits.patience * 0.15) / 10 + (profile.hasBadHabit ? 1 : 0), 1, 10)
  );
  const goalClarity = Math.round(
    clamp((traits.curiosity * 0.2 + traits.discipline * 0.25 + traits.leadership * 0.15 + (profile.hasCareerGoal ? 10 : 0) + (profile.hasGrowthGoal ? 8 : 0) + avgLength / 20) / 10, 1, 10)
  );

  const behaviorProfile = {
    studyHours,
    sleepHours,
    exercise,
    screenTime,
    consistency,
    procrastination,
    goalClarity
  };

  const xpGained = 300 + Math.floor(Object.values(traits).reduce((total, value) => total + value, 0) / 8) + answers.length * 5;

  return {
    traits,
    patterns: {
      decisionStyle,
      workingStyle,
      riskProfile,
      thinkingPattern
    },
    archetype,
    xpGained,
    behaviorProfile,
    summary: `Your scenario responses suggest a ${archetype.toLowerCase()} pattern with ${decisionStyle} decisions, ${workingStyle} execution, and ${riskProfile} risk posture.`
  };
};
