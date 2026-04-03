import User from "../models/User.js";

/**
 * Create a new long-term goal
 */
export const createGoal = async (req, res, next) => {
  try {
    const { title, detail, horizon } = req.body;

    if (!title || !title.trim()) {
      const error = new Error("Goal title is required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const newGoal = {
      title: title.trim(),
      detail: detail || "",
      horizon: horizon || "1 Year",
      progress: 0,
      status: "On Track"
    };

    if (!user.longTermGoals) {
      user.longTermGoals = [];
    }
    user.longTermGoals.push(newGoal);
    await user.save();

    const createdGoal = user.longTermGoals[user.longTermGoals.length - 1];

    res.status(201).json({
      message: "Goal created successfully.",
      goal: createdGoal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all goals
 */
export const getGoals = async (req, res, next) => {
  try {
    const { horizon, status } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    let goals = user.longTermGoals || [];

    if (horizon) goals = goals.filter((g) => g.horizon === horizon);
    if (status) goals = goals.filter((g) => g.status === status);

    res.json({
      goals,
      total: goals.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single goal
 */
export const getGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const goal = user.longTermGoals?.id(goalId);
    if (!goal) {
      const error = new Error("Goal not found.");
      error.status = 404;
      throw error;
    }

    res.json({ goal });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a goal
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { title, detail, horizon, progress, status } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const goal = user.longTermGoals?.id(goalId);
    if (!goal) {
      const error = new Error("Goal not found.");
      error.status = 404;
      throw error;
    }

    if (title !== undefined) goal.title = title.trim();
    if (detail !== undefined) goal.detail = detail;
    if (horizon !== undefined) goal.horizon = horizon;
    if (progress !== undefined) goal.progress = Math.max(0, Math.min(100, Number(progress)));
    if (status !== undefined) goal.status = status;

    await user.save();

    res.json({
      message: "Goal updated successfully.",
      goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    user.longTermGoals = (user.longTermGoals || []).filter(
      (g) => g._id.toString() !== goalId
    );
    await user.save();

    res.json({
      message: "Goal deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
