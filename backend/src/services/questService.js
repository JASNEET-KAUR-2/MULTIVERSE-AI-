const difficultyXp = {
  Easy: 20,
  Medium: 40,
  Hard: 80
};

const weaknessTaskLibrary = {
  "Deep work time": {
    title: "Study 2h Focus Run",
    description: "Complete 2 hours of distraction-free study time to strengthen your future trajectory.",
    difficulty: "Hard"
  },
  "Sleep rhythm": {
    title: "Sleep Hygiene Routine",
    description: "Set a consistent bedtime and go screen-free for 30 minutes before sleep.",
    difficulty: "Easy"
  },
  "Physical activation": {
    title: "Workout Momentum",
    description: "Do one workout or a brisk 30-minute walk to improve energy and resilience.",
    difficulty: "Medium"
  },
  "Screen discipline": {
    title: "No Phone Power Hour",
    description: "Protect one full hour with no passive scrolling or notification checking.",
    difficulty: "Medium"
  },
  "Execution consistency": {
    title: "Daily System Lock",
    description: "Finish your top priority before switching to anything optional.",
    difficulty: "Hard"
  },
  "Procrastination control": {
    title: "Tiny Start Challenge",
    description: "Begin your hardest task with a 10-minute starter sprint.",
    difficulty: "Medium"
  },
  "Goal clarity": {
    title: "Progress Review",
    description: "Review your weekly direction and rewrite one next step with a measurable outcome.",
    difficulty: "Medium"
  }
};

export const buildQuestTemplates = (weaknesses = []) => {
  const mapped = weaknesses.slice(0, 3).map((weakness, index) => {
    const libraryTask = weaknessTaskLibrary[weakness];
    if (libraryTask) {
      return {
        ...libraryTask,
        xpReward: difficultyXp[libraryTask.difficulty]
      };
    }

    const templates = [
      {
        title: "Focused Power Hour",
        description: `Spend 60 uninterrupted minutes improving: ${weakness}.`,
        difficulty: "Hard"
      },
      {
        title: "Micro Upgrade Sprint",
        description: `Spend 25 minutes taking one practical action on: ${weakness}.`,
        difficulty: "Medium"
      },
      {
        title: "Momentum Ritual",
        description: `Write one reflection and one next step to reduce: ${weakness}.`,
        difficulty: "Easy"
      }
    ];

    return templates[index % templates.length];
  });

  return mapped.length
    ? mapped.map((quest) => ({
        ...quest,
        xpReward: difficultyXp[quest.difficulty]
      }))
    : [
        {
          title: "Daily Alignment",
          description: "Spend 20 minutes aligning today's actions with your future self.",
          difficulty: "Easy",
          xpReward: difficultyXp.Easy
        }
      ];
};

export const getQuestXp = (difficulty) => difficultyXp[difficulty] || difficultyXp.Easy;

export const normalizeAiTasks = (dailyTasks = []) =>
  dailyTasks.slice(0, 3).map((task) => ({
    title: task.title,
    description: task.description,
    difficulty: task.difficulty,
    xpReward: getQuestXp(task.difficulty)
  }));
