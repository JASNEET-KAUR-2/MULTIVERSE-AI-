import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const priorityColors = {
  Easy: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  Hard: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" }
};

const categoryIcons = {
  Work: "💼",
  Study: "📚",
  Health: "💪",
  Personal: "✨",
  Future: "🚀"
};

export default function TaskManagementPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Personal",
    priority: "Medium",
    deadline: "",
    view: "daily"
  });
  const [selectedFilter, setSelectedFilter] = useState({ view: "daily", priority: "All", category: "All" });
  const [searchQuery, setSearchQuery] = useState("");

  // Load tasks
  const loadTasks = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.getTasks(token);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [token]);

  // Filter and search tasks
  useEffect(() => {
    let filtered = tasks.filter((task) => task.view === selectedFilter.view);

    if (selectedFilter.priority !== "All") {
      filtered = filtered.filter((t) => t.priority === selectedFilter.priority);
    }
    if (selectedFilter.category !== "All") {
      filtered = filtered.filter((t) => t.category === selectedFilter.category);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered.sort((a, b) => a.order - b.order));
  }, [tasks, selectedFilter, searchQuery]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const response = await api.createTask(token, formData);
      setTasks([...tasks, response.task]);
      setFormData({
        title: "",
        description: "",
        category: "Personal",
        priority: "Medium",
        deadline: "",
        view: "daily"
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await api.completeTask(token, taskId);
      setTasks(
        tasks.map((t) => (t._id === taskId ? response.task : t))
      );
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(token, taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📋 Task Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Organize your day, build better habits, and track progress.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{tasks.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{completionRate}%</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Remaining</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {tasks.length - completedCount}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 flex gap-4 flex-wrap">
            {/* Search */}
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Filter buttons */}
            <div className="flex gap-2">
              {["All", "Easy", "Medium", "Hard"].map((priority) => (
                <button
                  key={priority}
                  onClick={() =>
                    setSelectedFilter({ ...selectedFilter, priority })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFilter.priority === priority
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Add Task
          </motion.button>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center py-12">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-600 dark:text-slate-400">No tasks yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Create your first task to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-2 transition-all ${
                  task.completed
                    ? "border-emerald-200 dark:border-emerald-900 opacity-75"
                    : priorityColors[task.priority].border
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {categoryIcons[task.category] || "📌"}
                    </span>
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          {task.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            priorityColors[task.priority].bg
                          } ${priorityColors[task.priority].text}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold text-lg ${
                          task.completed
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                  </div>
                  {task.completed && (
                    <span className="text-2xl">✅</span>
                  )}
                </div>

                {task.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {task.deadline && (
                    <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                  )}
                  <span>{task.view === "daily" ? "📅 Daily" : "📊 Weekly"}</span>
                </div>

                <div className="flex gap-2">
                  {!task.completed && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCompleteTask(task._id)}
                      className="flex-1 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-sm"
                    >
                      ✓ Complete
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteTask(task._id)}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-sm"
                  >
                    🗑️ Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Create New Task
              </h2>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <textarea
                  placeholder="Task description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="3"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Work</option>
                    <option>Study</option>
                    <option>Health</option>
                    <option>Personal</option>
                    <option>Future</option>
                  </select>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <select
                    value={formData.view}
                    onChange={(e) =>
                      setFormData({ ...formData, view: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
