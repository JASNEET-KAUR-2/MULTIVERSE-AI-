import User from "../models/User.js";
import { appendActivityLog, getGamificationSnapshot } from "../services/gamificationService.js";

/**
 * Create a new task
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, category, priority, deadline, view } = req.body;

    if (!title || !title.trim()) {
      const error = new Error("Task title is required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const newTask = {
      title: title.trim(),
      description: description || "",
      category: category || "Personal",
      priority: priority || "Medium",
      deadline: deadline ? new Date(deadline) : null,
      view: view || "daily",
      completed: false,
      order: user.plannerTasks?.length || 0,
      createdAt: new Date()
    };

    user.plannerTasks.push(newTask);
    await user.save();

    // Get the task that was just created
    const createdTask = user.plannerTasks[user.plannerTasks.length - 1];

    res.status(201).json({
      message: "Task created successfully.",
      task: createdTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for the user
 */
export const getTasks = async (req, res, next) => {
  try {
    const { category, priority, view, completed } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    let tasks = [...user.plannerTasks];

    // Apply filters
    if (category) tasks = tasks.filter((t) => t.category === category);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    if (view) tasks = tasks.filter((t) => t.view === view);
    if (completed !== undefined) {
      tasks = tasks.filter((t) => t.completed === (completed === "true"));
    }

    res.json({
      tasks,
      total: tasks.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task
 */
export const getTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const task = user.plannerTasks.id(taskId);
    if (!task) {
      const error = new Error("Task not found.");
      error.status = 404;
      throw error;
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, category, priority, deadline, view, order } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const task = user.plannerTasks.id(taskId);
    if (!task) {
      const error = new Error("Task not found.");
      error.status = 404;
      throw error;
    }

    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (priority !== undefined) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;
    if (view !== undefined) task.view = view;
    if (order !== undefined) task.order = order;

    await user.save();

    res.json({
      message: "Task updated successfully.",
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a task
 */
export const completeTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const task = user.plannerTasks.id(taskId);
    if (!task) {
      const error = new Error("Task not found.");
      error.status = 404;
      throw error;
    }

    if (task.completed) {
      return res.json({
        message: "Task already completed.",
        task
      });
    }

    task.completed = true;
    task.completedAt = new Date();

    // Award XP for task completion
    const xpAwarded = task.priority === "Hard" ? 150 : task.priority === "Medium" ? 100 : 50;
    user.xp += xpAwarded;

    appendActivityLog(user, {
      type: "task",
      label: task.title,
      xpAwarded,
      detail: `Completed a ${task.category} task (${task.priority} priority).`
    });

    // Update streak if daily task window (past 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!user.lastTaskCompletedAt || user.lastTaskCompletedAt < oneDayAgo) {
      user.streak = 1;
    } else {
      user.streak += 1;
    }
    user.lastTaskCompletedAt = new Date();

    await user.save();

    res.json({
      message: "Task completed successfully.",
      task,
      xpAwarded,
      streak: user.streak,
      gamification: getGamificationSnapshot(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const task = user.plannerTasks.id(taskId);
    if (!task) {
      const error = new Error("Task not found.");
      error.status = 404;
      throw error;
    }

    user.plannerTasks = user.plannerTasks.filter((t) => t._id.toString() !== taskId);
    await user.save();

    res.json({
      message: "Task deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder tasks (drag-and-drop)
 */
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // array of { _id, order }

    if (!Array.isArray(tasks)) {
      const error = new Error("Tasks array is required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    // Update order for each task
    tasks.forEach(({ _id, order }) => {
      const task = user.plannerTasks.id(_id);
      if (task) {
        task.order = order;
      }
    });

    await user.save();

    res.json({
      message: "Tasks reordered successfully.",
      tasks: user.plannerTasks.sort((a, b) => a.order - b.order)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search tasks
 */
export const searchTasks = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      const error = new Error("Search query is required.");
      error.status = 400;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      throw error;
    }

    const query = q.toLowerCase();
    const results = user.plannerTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
    );

    res.json({
      results,
      count: results.length
    });
  } catch (error) {
    next(error);
  }
};
