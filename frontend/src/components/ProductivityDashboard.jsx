import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function ProductivityDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("week"); // week, month, all

  // Fetch dashboard stats
  const loadStats = async () => {
    if (!token) return;
    try {
      setLoading(true);

      const [tasksRes, habitsRes, goalsRes, journalRes] = await Promise.all([
        api.getTasks(token),
        api.getHabits(token),
        api.getGoals(token),
        api.getJournalEntries(token, { limit: 100 })
      ]);

      const tasks = tasksRes.tasks || [];
      const habits = habitsRes.habits || [];
      const goals = goalsRes.goals || [];
      const entries = journalRes.entries || [];

      // Calculate stats
      const completedTasks = tasks.filter((t) => t.completed).length;
      const completedHabitsToday = habits.filter((h) => h.completedToday).length;
      const completedGoals = goals.filter((g) => g.status === "Completed").length;
      const avgGoalProgress = goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
        : 0;

      // Category breakdown
      const categoryStats = {};
      tasks.forEach((task) => {
        if (!categoryStats[task.category]) {
          categoryStats[task.category] = { total: 0, completed: 0 };
        }
        categoryStats[task.category].total++;
        if (task.completed) categoryStats[task.category].completed++;
      });

      // Mood trends (last 7 entries)
      const moodTrends = {};
      entries.slice(0, 7).forEach((entry) => {
        moodTrends[entry.mood] = (moodTrends[entry.mood] || 0) + 1;
      });

      setStats({
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          byCategory: categoryStats,
          completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
        },
        habits: {
          total: habits.length,
          completedToday: completedHabitsToday,
          activeStreaks: habits.filter((h) => h.streak > 0).length,
          bestStreak: habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0
        },
        goals: {
          total: goals.length,
          completed: completedGoals,
          onTrack: goals.filter((g) => g.status === "On Track").length,
          avgProgress: avgGoalProgress
        },
        journal: {
          total: entries.length,
          moodTrends
        },
        xp: user?.xp || 0,
        streak: user?.streak || 0,
        level: user?.level || 1
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  if (!stats) {
    return (
      <div className="p-6 text-center">
        {loading ? "Loading dashboard..." : "Failed to load dashboard"}
      </div>
    );
  }

  const StatCard = ({ icon, label, value, subtext, color = "indigo" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-${color}-50 dark:bg-${color}-900/20 border-2 border-${color}-200 dark:border-${color}-800 rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtext}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            📊 Productivity Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Your progress at a glance
          </p>
        </div>
      </div>

      {/* XP & Level Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon="⭐"
          label="Current Level"
          value={stats.level}
          subtext={`${stats.xp} XP`}
          color="amber"
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${stats.streak} days`}
          subtext="Keep it going!"
          color="orange"
        />
        <StatCard
          icon="✨"
          label="Total XP"
          value={stats.xp}
          subtext="Lifetime earnings"
          color="purple"
        />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon="✅"
          label="Task Completion"
          value={`${stats.tasks.completed}/${stats.tasks.total}`}
          subtext={`${stats.tasks.completionRate}% complete`}
          color="emerald"
        />
        <StatCard
          icon="📅"
          label="Habits Today"
          value={`${stats.habits.completedToday}/${stats.habits.total}`}
          subtext="Keep building!"
          color="blue"
        />
        <StatCard
          icon="🎯"
          label="Goals Progress"
          value={`${stats.goals.avgProgress}%`}
          subtext={`${stats.goals.completed}/${stats.goals.total} completed`}
          color="indigo"
        />
        <StatCard
          icon="📝"
          label="Journal Entries"
          value={stats.journal.total}
          subtext="Track your reflections"
          color="pink"
        />
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.tasks.byCategory).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Tasks by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.tasks.byCategory).map(([category, counts]) => {
              const rate = Math.round((counts.completed / counts.total) * 100) || 0;
              return (
                <div key={category} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <p className="font-semibold text-slate-900 dark:text-white">{category}</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    {counts.completed}/{counts.total}
                  </p>
                  <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rate}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mood Trends */}
      {Object.keys(stats.journal.moodTrends).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Mood Patterns
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.journal.moodTrends).map(([mood, count]) => {
              const moodEmojis = {
                Focused: "🎯",
                Balanced: "⚖️",
                Drained: "😩",
                Motivated: "🚀",
                Reflective: "🤔"
              };
              return (
                <div
                  key={mood}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full"
                >
                  <span className="text-xl">{moodEmojis[mood]}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{mood}</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {count}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🚀 Your Progress</h2>
        <p className="mb-6">
          You're on a streak of {stats.streak} days! Keep going to unlock more achievements.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-90">Tasks Completed</p>
            <p className="text-2xl font-bold">{stats.tasks.completed}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-90">Habits Built</p>
            <p className="text-2xl font-bold">{stats.habits.total}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-90">Active Streaks</p>
            <p className="text-2xl font-bold">{stats.habits.activeStreaks}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-90">XP Earned</p>
            <p className="text-2xl font-bold">{stats.xp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
