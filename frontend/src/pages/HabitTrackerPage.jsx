import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const habitEmojis = {
  Exercise: "💪",
  Meditation: "🧘",
  Reading: "📚",
  Water: "💧",
  Sleep: "😴",
  Study: "🎓",
  Work: "💼",
  Coding: "💻",
  Art: "🎨",
  Music: "🎵",
  Cooking: "👨‍🍳",
  Journaling: "📝"
};

export default function HabitTrackerPage() {
  const { token } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    target: "10"
  });

  // Load habits
  const loadHabits = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.getHabits(token);
      setHabits(response.habits || []);
    } catch (error) {
      console.error("Failed to load habits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, [token]);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.target) return;

    try {
      const response = await api.createHabit(token, {
        name: formData.name,
        target: parseInt(formData.target)
      });
      setHabits([...habits, response.habit]);
      setFormData({ name: "", target: "10" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  const handleIncrementHabit = async (habitId) => {
    try {
      const response = await api.incrementHabitProgress(token, habitId, { amount: 1 });
      setHabits(
        habits.map((h) => (h._id === habitId ? response.habit : h))
      );
    } catch (error) {
      console.error("Failed to increment habit:", error);
    }
  };

  const handleCompleteHabbit = async (habitId) => {
    try {
      const response = await api.completeHabitToday(token, habitId);
      setHabits(
        habits.map((h) => (h._id === habitId ? response.habit : h))
      );
    } catch (error) {
      console.error("Failed to complete habit:", error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await api.deleteHabit(token, habitId);
      setHabits(habits.filter((h) => h._id !== habitId));
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const activeHabits = habits.filter((h) => h.streak > 0).length;
  const completedToday = habits.filter((h) => h.completedToday).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📅 Habit Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Build consistency and track your daily habits.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Habits</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{habits.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Streaks</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{activeHabits}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed Today</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{completedToday}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Best Streak</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {habits.length > 0
                ? Math.max(...habits.map((h) => h.streak || 0))
                : 0}{" "}
              days
            </p>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Habits</h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            + New Habit
          </motion.button>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="text-center py-12">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-slate-600 dark:text-slate-400">No habits yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Create your first habit to start building consistency!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map((habit) => {
              const progressPercent = Math.min(
                100,
                Math.round((habit.current / habit.target) * 100)
              );
              const emoji = habitEmojis[habit.name] || "✨";

              return (
                <motion.div
                  key={habit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{emoji}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                          {habit.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Target: {habit.target}
                        </p>
                      </div>
                    </div>
                    {habit.completedToday && (
                      <span className="text-2xl">✅</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {habit.current} / {habit.target}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl">🔥</span>
                        <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {habit.streak}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">days</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!habit.completedToday ? (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleIncrementHabit(habit._id)}
                          className="flex-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm"
                        >
                          +1 Unit
                        </motion.button>
                        {habit.current < habit.target && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCompleteHabbit(habit._id)}
                            className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-sm"
                          >
                            ✓ Complete
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold text-center text-sm">
                        ✓ Completed Today
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteHabit(habit._id)}
                      className="px-3 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-sm"
                    >
                      🗑️
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Create New Habit
              </h2>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Morning Meditation"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose from: {Object.keys(habitEmojis).slice(0, 6).join(", ")}...
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Daily Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    e.g., 10 units, 30 minutes, 8 glasses, etc.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Create Habit
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
