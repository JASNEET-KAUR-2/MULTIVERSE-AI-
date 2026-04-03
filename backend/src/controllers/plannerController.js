import User from "../models/User.js";
import { appendActivityLog, syncDailyActivity } from "../services/gamificationService.js";

const TASK_XP = {
  Easy: 20,
  Medium: 40,
  Hard: 80
};

const startOfDay = (date = new Date()) => {
  const stamp = new Date(date);
  stamp.setHours(0, 0, 0, 0);
  return stamp;
};

const formatCategory = (category = "Personal") => `${category} task`;

const buildSeedTasks = (user) => [
  {
    title: "Study 2 hours",
    description: "Protect one deep work block for your highest-value learning goal.",
    category: "Study",
    priority: "Hard",
    view: "daily",
    order: 0,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000)
  },
  {
    title: "Workout reset",
    description: "Move for at least 30 minutes to keep energy and attention stable.",
    category: "Health",
    priority: "Medium",
    view: "daily",
    order: 1,
    deadline: new Date(Date.now() + 10 * 60 * 60 * 1000)
  },
  {
    title: "Reduce phone usage",
    description: "Create one no-scroll focus window before the evening.",
    category: "Personal",
    priority: "Easy",
    view: "weekly",
    order: 2,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Future path review",
    description: `Take one action this week that supports ${user.goals?.[0] || "your next chapter"}.`,
    category: "Future",
    priority: "Medium",
    view: "weekly",
    order: 3,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  }
];

const buildSeedHabits = () => [
  { name: "Deep Work", target: 2, current: 1, streak: 3, completedToday: false },
  { name: "Sleep Rhythm", target: 8, current: 7, streak: 4, completedToday: false },
  { name: "Hydration", target: 8, current: 5, streak: 2, completedToday: false }
];

const buildSeedGoals = (user) => [
  {
    title: user.goals?.[0] || "Build a stronger career path",
    detail: "Turn current routines into measurable progress with weekly review loops.",
    horizon: "1 Year",
    progress: 46,
    status: "On Track"
  },
  {
    title: "Create a healthier baseline",
    detail: "Protect sleep, movement, and lower digital drift so execution is sustainable.",
    horizon: "3 Months",
    progress: 58,
    status: "On Track"
  }
];

const buildWelcomeNotifications = () => [
  {
    type: "system",
    title: "Planner activated",
    message: "Your productivity cockpit is ready. Start with one daily win.",
    channel: "in-app"
  }
];

const ensurePlannerSeed = (user) => {
  let changed = false;

  if (!user.plannerTasks?.length) {
    user.plannerTasks = buildSeedTasks(user);
    changed = true;
  }

  if (!user.habitTracker?.length) {
    user.habitTracker = buildSeedHabits();
    changed = true;
  }

  if (!user.longTermGoals?.length) {
    user.longTermGoals = buildSeedGoals(user);
    changed = true;
  }

  if (!user.notificationCenter?.length) {
    user.notificationCenter = buildWelcomeNotifications();
    changed = true;
  }

  if (!user.plannerSettings) {
    user.plannerSettings = {
      browserPush: true,
      emailReminders: false,
      smsReminders: false,
      faceLoginEnabled: false
    };
    changed = true;
  }

  if (!user.journalEntries) {
    user.journalEntries = [];
    changed = true;
  }

  return changed;
};

const syncDeadlineNotifications = (user) => {
  const now = new Date();
  const notificationCenter = user.notificationCenter || [];
  let changed = false;

  for (const task of user.plannerTasks || []) {
    if (!task.deadline || task.completed) {
      continue;
    }

    const hoursUntilDeadline = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
    const shouldNotify = hoursUntilDeadline <= 24;

    if (!shouldNotify) {
      continue;
    }

    const exists = notificationCenter.some(
      (notification) =>
        String(notification.taskId || "") === String(task._id) &&
        notification.type === "deadline" &&
        startOfDay(notification.createdAt).getTime() === startOfDay(now).getTime()
    );

    if (!exists) {
      notificationCenter.unshift({
        type: "deadline",
        title: `${task.title} is due soon`,
        message: `${formatCategory(task.category)} deadline is approaching. Lock in one focused finish window.`,
        taskId: task._id,
        dueAt: task.deadline,
        channel: "in-app",
        createdAt: now
      });
      changed = true;
    }
  }

  user.notificationCenter = notificationCenter.slice(0, 40);
  return changed;
};

const buildDailyGoal = (user) => {
  const incompleteDailyTasks = (user.plannerTasks || []).filter((task) => task.view === "daily" && !task.completed);
  const topTask = incompleteDailyTasks.sort((a, b) => (TASK_XP[b.priority] || 0) - (TASK_XP[a.priority] || 0))[0];

  if (topTask) {
    return `Finish "${topTask.title}" before ${new Date(topTask.deadline || Date.now()).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    })}.`;
  }

  return "Keep your streak alive with one meaningful task completion today.";
};

const buildInsights = (user) => {
  const behavior = user.behaviorProfile || {};
  const incompleteTasks = (user.plannerTasks || []).filter((task) => !task.completed);
  const topFutureGoal = user.longTermGoals?.[0]?.title || "your future path";
  const recommendations = [];

  if ((behavior.procrastination || 0) >= 7) {
    recommendations.push("Front-load one hard task in your first work block to cut procrastination drift.");
  }

  if ((behavior.sleepHours || 0) < 7) {
    recommendations.push("Protect sleep before pushing harder output. Recovery is limiting your consistency.");
  }

  if ((behavior.consistency || 0) >= 7) {
    recommendations.push("Your consistency is already strong. Convert it into a weekly review ritual for bigger gains.");
  }

  if (!recommendations.length) {
    recommendations.push("Anchor the day around one high-value completion instead of spreading energy across too many priorities.");
  }

  return {
    dailyGoal: buildDailyGoal(user),
    recommendations,
    personalizedFocus: incompleteTasks[0]?.title || "Protect one meaningful action today.",
    futurePath: `If you keep stacking task wins around ${topFutureGoal}, your best timeline gets more realistic each week.`,
    faceLoginStatus: user.plannerSettings?.faceLoginEnabled
      ? "Face login is enabled."
      : "Email/password remains the secure active fallback while face login is kept optional."
  };
};

const buildCharts = (user) => {
  const now = startOfDay();
  const weeklyCompletions = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const completed = (user.plannerTasks || []).filter(
      (task) => task.completedAt && startOfDay(task.completedAt).getTime() === date.getTime()
    ).length;

    return {
      label: date.toLocaleDateString([], { weekday: "short" }),
      value: completed
    };
  });

  const categoryMap = new Map();
  for (const task of user.plannerTasks || []) {
    categoryMap.set(task.category, (categoryMap.get(task.category) || 0) + 1);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([label, value]) => ({ label, value }));
  const productivityTrend = weeklyCompletions.map((point, index) => ({
    label: point.label,
    value: Math.min(100, point.value * 22 + index * 4 + Math.min(user.streak || 0, 6))
  }));

  return {
    weeklyCompletions,
    categoryBreakdown,
    productivityTrend
  };
};

const buildStats = (user) => {
  const tasks = user.plannerTasks || [];
  const completedCount = tasks.filter((task) => task.completed).length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const pointsToday = (user.activityLog || [])
    .filter((entry) => startOfDay(entry.createdAt).getTime() === startOfDay().getTime())
    .reduce((sum, entry) => sum + (entry.xpAwarded || 0), 0);

  return {
    xp: user.xp || 0,
    level: Math.floor((user.xp || 0) / 100),
    streak: user.streak || 0,
    completionRate,
    pointsToday,
    unreadNotifications: (user.notificationCenter || []).filter((item) => !item.read).length
  };
};

const buildPlannerResponse = (user) => ({
  user,
  planner: {
    tasks: [...(user.plannerTasks || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    habits: user.habitTracker || [],
    goals: user.longTermGoals || [],
    journalEntries: [...(user.journalEntries || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    notifications: [...(user.notificationCenter || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    settings: user.plannerSettings || {}
  },
  stats: buildStats(user),
  insights: buildInsights(user),
  charts: buildCharts(user)
});

const loadPlannerUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  const seeded = ensurePlannerSeed(user);
  const syncedNotifications = syncDeadlineNotifications(user);

  if (seeded || syncedNotifications) {
    await user.save();
  }

  return user;
};

export const getPlanner = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const taskCount = user.plannerTasks?.length || 0;
    const { title, description, category, priority, deadline, view } = req.body;

    user.plannerTasks.push({
      title,
      description,
      category,
      priority,
      deadline: deadline ? new Date(deadline) : undefined,
      view,
      order: taskCount
    });

    user.notificationCenter.unshift({
      type: "reminder",
      title: "Task added",
      message: `"${title}" has been added to your planner.`,
      channel: "in-app"
    });

    await user.save();
    res.status(201).json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const task = user.plannerTasks.id(req.params.taskId);

    if (!task) {
      const error = new Error("Planner task not found.");
      error.status = 404;
      throw error;
    }

    const wasCompleted = task.completed;
    const nextCompleted = typeof req.body.completed === "boolean" ? req.body.completed : task.completed;

    Object.assign(task, {
      title: req.body.title ?? task.title,
      description: req.body.description ?? task.description,
      category: req.body.category ?? task.category,
      priority: req.body.priority ?? task.priority,
      deadline: req.body.deadline ? new Date(req.body.deadline) : req.body.deadline === null ? null : task.deadline,
      view: req.body.view ?? task.view,
      completed: wasCompleted ? true : nextCompleted
    });

    if (!wasCompleted && nextCompleted) {
      const dailyActivity = syncDailyActivity(user);
      const xpAwarded = TASK_XP[task.priority] || 0;
      task.completedAt = new Date();
      user.xp += xpAwarded;
      appendActivityLog(user, {
        type: "planner-task",
        label: task.title,
        xpAwarded,
        detail: `Completed a ${String(task.priority).toLowerCase()} planner task in ${String(task.category).toLowerCase()}.`
      });
      user.notificationCenter.unshift({
        type: "achievement",
        title: `+${xpAwarded} XP earned`,
        message: `"${task.title}" is complete. ${dailyActivity.alreadyActiveToday ? "Momentum maintained." : "Daily streak updated."}`,
        channel: "in-app"
      });
    }

    await user.save();
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const task = user.plannerTasks.id(req.params.taskId);

    if (!task) {
      const error = new Error("Planner task not found.");
      error.status = 404;
      throw error;
    }

    task.deleteOne();
    user.plannerTasks.forEach((item, index) => {
      item.order = index;
    });
    await user.save();
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const reorderTasks = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const orderedIds = Array.isArray(req.body.taskIds) ? req.body.taskIds : [];

    user.plannerTasks.sort((a, b) => orderedIds.indexOf(String(a._id)) - orderedIds.indexOf(String(b._id)));
    user.plannerTasks.forEach((task, index) => {
      task.order = index;
    });

    await user.save();
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const notification = user.notificationCenter.id(req.params.notificationId);

    if (!notification) {
      const error = new Error("Notification not found.");
      error.status = 404;
      throw error;
    }

    notification.read = true;
    await user.save();
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const habit = user.habitTracker.id(req.params.habitId);

    if (!habit) {
      const error = new Error("Habit not found.");
      error.status = 404;
      throw error;
    }

    const wasCompletedToday = habit.completedToday;
    habit.current = Number(req.body.current ?? habit.current);
    habit.completedToday = habit.current >= habit.target;
    if (!wasCompletedToday && habit.completedToday) {
      habit.streak += 1;
    }

    await user.save();
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const createJournalEntry = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    user.journalEntries.unshift({
      title: req.body.title,
      body: req.body.body,
      mood: req.body.mood
    });
    user.journalEntries = user.journalEntries.slice(0, 20);
    await user.save();
    res.status(201).json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const user = await loadPlannerUser(req.user._id);
    const goal = user.longTermGoals.id(req.params.goalId);

    if (!goal) {
      const error = new Error("Goal not found.");
      error.status = 404;
      throw error;
    }

    goal.progress = Number(req.body.progress ?? goal.progress);
    goal.status = req.body.status ?? goal.status;
    await user.save();
    res.json(buildPlannerResponse(user));
  } catch (error) {
    next(error);
  }
};
