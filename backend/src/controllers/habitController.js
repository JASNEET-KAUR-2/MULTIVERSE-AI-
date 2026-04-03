import User from "../models/User.js";
import { appendActivityLog, getGamificationSnapshot } from "../services/gamificationService.js";

/**
 * Create a new habit
 */
export const createHabit = async (req, res, next) => {
  try {
    const { name, target } = req.body;

    if (!name || !name.trim()) {
      const error = new Error("Habit name is required.");
      error.status = 400;
      throw error;
    }

    if (!target || target <= 0) {
      const error = new Error("Target must be a positive number.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const newHabit = {
      name: name.trim(),
      target: Number(target),
      current: 0,
      streak: 0,
      completedToday: false
    };

    if (!user.habitTracker) {
      user.habitTracker = [];
    }
    user.habitTracker.push(newHabit);
    await user.save();

    const createdHabit = user.habitTracker[user.habitTracker.length - 1];

    res.status(201).json({
      message: "Habit created successfully.",
      habit: createdHabit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all habits
 */
export const getHabits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const habits = user.habitTracker || [];

    res.json({
      habits,
      total: habits.length,
      activeHabits: habits.filter((h) => h.streak > 0).length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single habit
 */
export const getHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const habit = user.habitTracker?.id(habitId);
    if (!habit) {
      const error = new Error("Habit not found.");
      error.status = 404;
      throw error;
    }

    res.json({ habit });
  } catch (error) {
    next(error);
  }
};

/**
 * Update habit progress
 */
export const updateHabitProgress = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { current } = req.body;

    if (current === undefined || current < 0) {
      const error = new Error("Current progress must be a non-negative number.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const habit = user.habitTracker?.id(habitId);
    if (!habit) {
      const error = new Error("Habit not found.");
      error.status = 404;
      throw error;
    }

    const previousProgress = habit.current;
    habit.current = Number(current);

    // Check if habit is completed for today
    if (habit.current >= habit.target && !habit.completedToday) {
      habit.completedToday = true;
      habit.streak += 1;

      // Award XP
      const xpAwarded = 100;
      user.xp += xpAwarded;

      appendActivityLog(user, {
        type: "habit",
        label: habit.name,
        xpAwarded,
        detail: `Completed habit "${habit.name}" (streak: ${habit.streak} days)`
      });
    } else if (habit.current < habit.target && habit.completedToday) {
      habit.completedToday = false;
    }

    await user.save();

    res.json({
      message: "Habit progress updated.",
      habit,
      updatedFields: {
        completedToday: habit.completedToday,
        streak: habit.streak
      },
      gamification: getGamificationSnapshot(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Increment habit progress
 */
export const incrementHabitProgress = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { amount } = req.body;

    const incrementAmount = amount || 1;
    if (incrementAmount <= 0) {
      const error = new Error("Amount must be positive.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const habit = user.habitTracker?.id(habitId);
    if (!habit) {
      const error = new Error("Habit not found.");
      error.status = 404;
      throw error;
    }

    const wasCompleted = habit.current >= habit.target;
    habit.current = Math.min(habit.current + incrementAmount, habit.target);

    // Check if just completed
    if (habit.current >= habit.target && !habit.completedToday && !wasCompleted) {
      habit.completedToday = true;
      habit.streak += 1;

      const xpAwarded = 100;
      user.xp += xpAwarded;

      appendActivityLog(user, {
        type: "habit",
        label: habit.name,
        xpAwarded,
        detail: `Completed habit "${habit.name}" (streak: ${habit.streak} days)`
      });
    }

    await user.save();

    res.json({
      message: `Habit progress increased by ${incrementAmount}.`,
      habit,
      newProgress: habit.current,
      targetProgress: habit.target,
      completed: habit.completedToday,
      streak: habit.streak,
      gamification: getGamificationSnapshot(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete habit for today
 */
export const completeHabitToday = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const habit = user.habitTracker?.id(habitId);
    if (!habit) {
      const error = new Error("Habit not found.");
      error.status = 404;
      throw error;
    }

    if (habit.completedToday) {
      return res.json({
        message: "Habit already completed today.",
        habit
      });
    }

    habit.current = habit.target;
    habit.completedToday = true;
    habit.streak += 1;

    const xpAwarded = 100;
    user.xp += xpAwarded;

    appendActivityLog(user, {
      type: "habit",
      label: habit.name,
      xpAwarded,
      detail: `Completed habit "${habit.name}" (streak: ${habit.streak} days)`
    });

    await user.save();

    res.json({
      message: "Habit marked as completed for today.",
      habit,
      xpAwarded,
      streak: habit.streak,
      gamification: getGamificationSnapshot(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset daily habits calendar (should be called once per day by a scheduler)
 */
export const resetDailyHabits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    if (user.habitTracker) {
      user.habitTracker.forEach((habit) => {
        habit.current = 0;
        habit.completedToday = false;
      });
    }
    await user.save();

    res.json({
      message: "Daily habits reset.",
      habits: user.habitTracker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a habit
 */
export const deleteHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const habit = user.habitTracker?.id(habitId);
    if (!habit) {
      const error = new Error("Habit not found.");
      error.status = 404;
      throw error;
    }

    user.habitTracker = (user.habitTracker || []).filter(
      (h) => h._id.toString() !== habitId
    );
    await user.save();

    res.json({
      message: "Habit deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
