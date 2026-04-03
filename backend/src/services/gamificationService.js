const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_LOGIN_XP = 10;
const STREAK_BONUS_XP = 20;

const getDayStamp = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDayDifference = (earlier, later = new Date()) => {
  const start = getDayStamp(earlier).getTime();
  const end = getDayStamp(later).getTime();
  return Math.round((end - start) / DAY_MS);
};

export const appendActivityLog = (user, entry) => {
  user.activityLog = user.activityLog || [];
  user.activityLog.unshift({
    type: entry.type,
    label: entry.label,
    xpAwarded: entry.xpAwarded || 0,
    detail: entry.detail || "",
    createdAt: entry.createdAt || new Date()
  });
  user.activityLog = user.activityLog.slice(0, 40);
};

export const syncDailyActivity = (user, now = new Date()) => {
  const lastActiveAt = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  const alreadyActiveToday = lastActiveAt && getDayDifference(lastActiveAt, now) === 0;

  if (alreadyActiveToday) {
    return {
      xpAwarded: 0,
      streakBonusAwarded: 0,
      streak: user.streak || 0,
      alreadyActiveToday: true
    };
  }

  const continuedStreak = lastActiveAt && getDayDifference(lastActiveAt, now) === 1;
  user.streak = continuedStreak ? Math.max(1, user.streak || 0) + 1 : 1;

  const streakBonusAwarded = user.streak > 1 ? STREAK_BONUS_XP : 0;
  const xpAwarded = DAILY_LOGIN_XP + streakBonusAwarded;

  user.xp += xpAwarded;
  user.lastActiveAt = now;
  appendActivityLog(user, {
    type: "login",
    label: "Daily login reward",
    xpAwarded,
    detail: streakBonusAwarded ? `Streak bonus unlocked at ${user.streak} days.` : "Momentum check-in completed.",
    createdAt: now
  });

  return {
    xpAwarded,
    streakBonusAwarded,
    streak: user.streak,
    alreadyActiveToday: false
  };
};

export const getGamificationSnapshot = (user, extras = {}) => ({
  xp: user.xp || 0,
  streak: user.streak || 0,
  dailyLoginXp: DAILY_LOGIN_XP,
  streakBonusXp: STREAK_BONUS_XP,
  ...extras
});
