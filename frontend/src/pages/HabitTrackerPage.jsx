import { useEffect, useState } from "react";
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
  Cooking: "🍳",
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

  const handleCreateHabit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.target) return;

    try {
      const response = await api.createHabit(token, {
        name: formData.name,
        target: parseInt(formData.target, 10)
      });
      setHabits((current) => [...current, response.habit]);
      setFormData({ name: "", target: "10" });
      setShowCreateModal(false);
      loadHabits();
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  const handleIncrementHabit = async (habitId) => {
    try {
      const response = await api.incrementHabitProgress(token, habitId, { amount: 1 });
      setHabits((current) => current.map((habit) => (habit._id === habitId ? response.habit : habit)));
      loadHabits();
    } catch (error) {
      console.error("Failed to increment habit:", error);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const response = await api.completeHabitToday(token, habitId);
      setHabits((current) => current.map((habit) => (habit._id === habitId ? response.habit : habit)));
      loadHabits();
    } catch (error) {
      console.error("Failed to complete habit:", error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await api.deleteHabit(token, habitId);
      setHabits((current) => current.filter((habit) => habit._id !== habitId));
      loadHabits();
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const activeHabits = habits.filter((habit) => habit.streak > 0).length;
  const completedToday = habits.filter((habit) => habit.completedToday).length;

  return (
    <div className="muse-page mx-auto max-w-6xl p-6">
        <div className="muse-card muse-card-peach p-8" data-ambient-scene="Habit Studio" data-ambient-intensity="0.18">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Habit Tracker</h1>
          <p className="text-slate-600">Build consistency and understand how your mood influences follow-through.</p>
        </div>

        <div className="muse-grid-three xl:grid-cols-4">
          <div className="muse-card p-6">
            <p className="text-sm text-slate-600">Total Habits</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{habits.length}</p>
          </div>
          <div className="muse-card muse-card-blue p-6">
            <p className="text-sm text-slate-600">Active Streaks</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">{activeHabits}</p>
          </div>
          <div className="muse-card muse-card-mint p-6">
            <p className="text-sm text-slate-600">Completed Today</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{completedToday}</p>
          </div>
          <div className="muse-card p-6">
            <p className="text-sm text-slate-600">Best Streak</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {habits.length ? Math.max(...habits.map((habit) => habit.streak || 0)) : 0} days
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Your Habits</h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            + New Habit
          </motion.button>
        </div>

        {loading ? (
          <div className="py-12 text-center">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="muse-card muse-card-mint py-12 text-center">
            <div className="mb-4 text-5xl">🌱</div>
            <p className="text-slate-600">No habits yet</p>
            <p className="mt-2 text-sm text-slate-500">Create your first habit to start building consistency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {habits.map((habit) => {
              const progressPercent = Math.min(100, Math.round((habit.current / habit.target) * 100));
              const emoji = habitEmojis[habit.name] || "✨";

              return (
                <motion.div
                  key={habit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="muse-card p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{emoji}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{habit.name}</h3>
                        <p className="text-sm text-slate-600">Target: {habit.target}</p>
                      </div>
                    </div>
                    {habit.completedToday ? <span className="text-2xl">✅</span> : null}
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-indigo-600">
                        {habit.current} / {habit.target}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="text-xl font-bold text-orange-600">{habit.streak}</span>
                    <span className="text-sm text-slate-500">days</span>
                  </div>

                  <div className="flex gap-2">
                    {!habit.completedToday ? (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleIncrementHabit(habit._id)}
                          className="flex-1 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                        >
                          +1 Unit
                        </motion.button>
                        {habit.current < habit.target ? (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCompleteHabit(habit._id)}
                            className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            Complete
                          </motion.button>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
                        Completed Today
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteHabit(habit._id)}
                      className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md muse-card muse-card-peach p-8"
            >
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Create New Habit</h2>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Habit Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Morning Meditation"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Try names like Exercise, Meditation, Reading, Study, or Journaling.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Daily Target</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(event) => setFormData((current) => ({ ...current, target: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Examples: 10 units, 30 minutes, 8 glasses, or 1 session.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700">
                    Create Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl bg-slate-200 px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : null}
    </div>
  );
}
