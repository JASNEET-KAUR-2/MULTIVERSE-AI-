import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const horizonIcons = {
  "3 Months": "Q1",
  "6 Months": "H1",
  "1 Year": "Y1",
  "2 Years": "Y2"
};

const horizonOrder = ["3 Months", "6 Months", "1 Year", "2 Years"];

const statusColors = {
  "On Track": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  "Needs Focus": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Completed: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
};

export default function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    detail: "",
    horizon: "6 Months"
  });

  const loadGoals = async () => {
    if (!token) {
      return;
    }

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

  const handleCreateGoal = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    try {
      const response = await api.createGoal(token, formData);
      setGoals([...goals, response.goal]);
      setFormData({ title: "", detail: "", horizon: "6 Months" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const response = await api.updateGoal(token, goalId, updates);
      setGoals(goals.map((goal) => (goal._id === goalId ? response.goal : goal)));
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.deleteGoal(token, goalId);
      setGoals(goals.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const groupedGoals = horizonOrder.reduce((groups, horizon) => {
    groups[horizon] = goals.filter((goal) => goal.horizon === horizon);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">Long-Term Goals</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Design your future and track progress toward your next milestones.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Goals</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{goals.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">On Track</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {goals.filter((goal) => goal.status === "On Track").length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {goals.filter((goal) => goal.status === "Completed").length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Progress</p>
            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
              {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0}%
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Goals</h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            + New Goal
          </motion.button>
        </div>

        {loading ? (
          <div className="py-12 text-center">Loading goals...</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedGoals).map(([horizon, goalsInHorizon]) =>
              goalsInHorizon.length > 0 ? (
                <div key={horizon}>
                  <div className="mb-6 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {horizonIcons[horizon]}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{horizon} Goals</h3>
                    <span className="ml-auto rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {goalsInHorizon.length}
                    </span>
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {goalsInHorizon.map((goal) => (
                      <motion.div
                        key={goal._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2">
                              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[goal.status]}`}>
                                {goal.status}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteGoal(goal._id)}
                            className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                          >
                            Delete
                          </motion.button>
                        </div>

                        {goal.detail ? <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{goal.detail}</p> : null}

                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(event) =>
                              handleUpdateGoal(goal._id, {
                                progress: parseInt(event.target.value, 10)
                              })
                            }
                            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700"
                          />
                          <select
                            value={goal.status}
                            onChange={(event) => handleUpdateGoal(goal._id, { status: event.target.value })}
                            className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 focus:outline-none dark:bg-slate-700 dark:text-slate-300"
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
              ) : null
            )}

            {goals.length === 0 ? (
              <div className="rounded-2xl bg-white py-12 text-center dark:bg-slate-800">
                <div className="mb-4 text-5xl">+</div>
                <p className="text-slate-600 dark:text-slate-400">No goals yet</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">Set your first goal and start building your future.</p>
              </div>
            ) : null}
          </div>
        )}

        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-h-96 w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 dark:bg-slate-800"
            >
              <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Set a New Goal</h2>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
                  required
                />

                <textarea
                  placeholder="Goal details and description"
                  value={formData.detail}
                  onChange={(event) => setFormData({ ...formData, detail: event.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
                  rows="4"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Time Horizon</label>
                  <select
                    value={formData.horizon}
                    onChange={(event) => setFormData({ ...formData, horizon: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
                  >
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>1 Year</option>
                    <option>2 Years</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700">
                    Create Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl bg-slate-200 px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
