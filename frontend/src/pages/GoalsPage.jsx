import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const horizonIcons = {
  "3 Months": "🎯",
  "1 Year": "📊",
  "5 Years": "🚀"
};

const statusColors = {
  "On Track": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  "Needs Focus": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  "Completed": "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
};

export default function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    detail: "",
    horizon: "1 Year"
  });

  // Load goals
  const loadGoals = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.getGoals(token);
      setGoals(response.goals || []);
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [token]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const response = await api.createGoal(token, formData);
      setGoals([...goals, response.goal]);
      setFormData({ title: "", detail: "", horizon: "1 Year" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const response = await api.updateGoal(token, goalId, updates);
      setGoals(goals.map((g) => (g._id === goalId ? response.goal : g)));
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.deleteGoal(token, goalId);
      setGoals(goals.filter((g) => g._id !== goalId));
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const groupedGoals = {
    "3 Months": goals.filter((g) => g.horizon === "3 Months"),
    "1 Year": goals.filter((g) => g.horizon === "1 Year"),
    "5 Years": goals.filter((g) => g.horizon === "5 Years")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            🎯 Long-Term Goals
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Design your future and track progress toward your dreams.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Goals</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{goals.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">On Track</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {goals.filter((g) => g.status === "On Track").length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {goals.filter((g) => g.status === "Completed").length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Progress</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {goals.length > 0
                ? Math.round(
                    goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Goals</h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            + New Goal
          </motion.button>
        </div>

        {/* Goals by Horizon */}
        {loading ? (
          <div className="text-center py-12">Loading goals...</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedGoals).map(([horizon, goalsInHorizon]) => (
              goalsInHorizon.length > 0 && (
                <div key={horizon}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{horizonIcons[horizon]}</span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {horizon} Goals
                    </h3>
                    <span className="ml-auto px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                      {goalsInHorizon.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {goalsInHorizon.map((goal) => (
                      <motion.div
                        key={goal._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="mb-2">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  statusColors[goal.status]
                                }`}
                              >
                                {goal.status}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                              {goal.title}
                            </h4>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteGoal(goal._id)}
                            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition-colors"
                          >
                            🗑️
                          </motion.button>
                        </div>

                        {goal.detail && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            {goal.detail}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Progress
                            </span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {goal.progress}%
                            </span>
                          </div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) =>
                              handleUpdateGoal(goal._id, {
                                progress: parseInt(e.target.value)
                              })
                            }
                            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                          />
                          <select
                            value={goal.status}
                            onChange={(e) =>
                              handleUpdateGoal(goal._id, { status: e.target.value })
                            }
                            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold focus:outline-none"
                          >
                            <option>On Track</option>
                            <option>Needs Focus</option>
                            <option>Completed</option>
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {goals.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                <div className="text-5xl mb-4">🌟</div>
                <p className="text-slate-600 dark:text-slate-400">No goals yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Set your first goal and start building your future!
                </p>
              </div>
            )}
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
                🎯 Set a New Goal
              </h2>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <textarea
                  placeholder="Goal details and description"
                  value={formData.detail}
                  onChange={(e) =>
                    setFormData({ ...formData, detail: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="4"
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Time Horizon
                  </label>
                  <select
                    value={formData.horizon}
                    onChange={(e) =>
                      setFormData({ ...formData, horizon: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>3 Months</option>
                    <option>1 Year</option>
                    <option>5 Years</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Create Goal
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
