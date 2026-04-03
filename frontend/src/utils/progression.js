const XP_PER_LEVEL = 100;

export const getLevelFromXp = (xp = 0) => Math.floor(xp / XP_PER_LEVEL);

export const getXpIntoLevel = (xp = 0) => xp % XP_PER_LEVEL;

export const getXpToNextLevel = (xp = 0) => XP_PER_LEVEL - getXpIntoLevel(xp);

export const getLevelProgress = (xp = 0) => Math.round((getXpIntoLevel(xp) / XP_PER_LEVEL) * 100);

export const getAchievementList = ({
  xp = 0,
  streak = 0,
  prediction,
  quests = []
}) => [
  {
    id: "first-scan",
    label: "Soul Scan Complete",
    unlocked: Boolean(prediction && prediction !== "Unanalyzed"),
    tone: "cyan"
  },
  {
    id: "streak",
    label: "3-Day Momentum",
    unlocked: streak >= 3,
    tone: "emerald"
  },
  {
    id: "xp",
    label: "Level Builder",
    unlocked: xp >= XP_PER_LEVEL,
    tone: "violet"
  },
  {
    id: "quests",
    label: "Quest Crusher",
    unlocked: quests.some((quest) => quest.completed),
    tone: "pink"
  }
];
