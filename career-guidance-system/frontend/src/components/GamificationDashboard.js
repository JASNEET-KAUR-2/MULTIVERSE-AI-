import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function GamificationDashboard({ gamification, onAction, reward }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const user = gamification || {
    points: 0,
    level: 0,
    streakDays: 0,
    badges: [],
    skillNodes: []
  };

  const leaderboard = useMemo(
    () =>
      [
        { name: "Alex Chen", points: 1240, avatar: "A" },
        { name: "Jordan Lee", points: 980, avatar: "J" },
        { name: "You", points: user.points, avatar: "Y", isCurrentUser: true },
        { name: "Taylor Kim", points: 760, avatar: "T" },
        { name: "Casey Morgan", points: 540, avatar: "C" }
      ].sort((a, b) => b.points - a.points),
    [user.points]
  );

  const currentLevelThreshold = user.level * user.level;
  const nextLevelThreshold = (user.level + 1) * (user.level + 1);
  const progressPercent = ((user.points - currentLevelThreshold) / Math.max(1, nextLevelThreshold - currentLevelThreshold)) * 100;
  const streakPercent = Math.min(100, (user.streakDays / 30) * 100);
  const newestBadge = reward?.new_badges?.[0] || null;

  const triggerAction = async (points, label) => {
    await onAction?.(points, label);
    confetti({
      particleCount: 70,
      spread: 54,
      origin: { y: 0.72 },
      colors: ["#60a5fa", "#6366f1", "#22c55e"]
    });
  };

  return (
    <section className="glass-panel p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-700">Gamification Layer</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">CareerQuest momentum engine</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Persistent points, streaks, badges, and mastery now update from real backend activity across the BUISES journey.
          </p>
        </div>
        <div className="rounded-[28px] bg-slate-950 px-5 py-4 text-white shadow-xl">
          <p className="text-sm opacity-70">Current streak</p>
          <p className="mt-2 text-4xl">{user.streakDays}d</p>
        </div>
      </div>

      <AnimatePresence>
        {newestBadge ? (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white shadow-xl"
          >
            <i className={`${newestBadge.icon} text-2xl`} />
            <div>
              <p className="font-semibold">Badge unlocked</p>
              <p className="text-sm opacity-90">{newestBadge.name}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg">
              CQ
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Career Navigator</h3>
              <p className="text-sm text-slate-500">Backend-synced growth loop</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Points</p>
              <p className="text-3xl font-extrabold text-blue-600">{user.points}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Level</p>
              <p className="text-4xl font-black text-indigo-600">{user.level}</p>
            </div>
            <button
              type="button"
              onClick={() => triggerAction(15, "Daily check-in")}
              className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
            >
              Daily +15
            </button>
          </div>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Progress to level {user.level + 1}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${Math.min(100, progressPercent)}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <i className="fas fa-fire text-xl text-orange-500" />
            <h3 className="font-bold text-slate-800">Momentum Streak</h3>
          </div>
          <div className="text-center">
            <span className="text-5xl font-black text-orange-600">{user.streakDays}</span>
            <span className="ml-1 text-slate-500">days</span>
          </div>
          <div className="mt-4 h-3 rounded-full bg-slate-200">
            <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-rose-500" style={{ width: `${streakPercent}%` }} />
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            {user.streakDays >= 7 ? "Strong consistency. Bonus rewards keep stacking." : "Keep showing up daily to grow the streak."}
          </p>
          <button
            type="button"
            onClick={() => triggerAction(25, "Mini project")}
            className="mt-4 w-full rounded-2xl bg-indigo-100 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200"
          >
            Complete mini-project (+25)
          </button>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-slate-800">
            <i className="fas fa-trophy text-yellow-500" />
            Leaderboard
          </h3>
          <div className="mt-3 space-y-2">
            {leaderboard.map((entry, index) => (
              <div key={entry.name} className={`flex items-center justify-between rounded-xl p-3 text-sm ${entry.isCurrentUser ? "border border-blue-200 bg-blue-50" : "bg-slate-50"}`}>
                <div className="flex items-center gap-2">
                  <span className="w-5 font-bold text-slate-400">#{index + 1}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">{entry.avatar}</span>
                  <span className="font-medium text-slate-700">{entry.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{entry.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-slate-800">
          <i className="fas fa-medal text-yellow-500" />
          Badge Cabinet
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {(user.badges || []).map((badge) => (
            <motion.button
              key={badge.id}
              whileHover={{ y: -4 }}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              className={`rounded-2xl bg-white/85 p-4 text-center shadow-md transition ${badge.unlocked ? "border-l-4 border-blue-500" : "opacity-50 grayscale"}`}
            >
              <i className={`${badge.icon} mb-2 text-4xl`} style={{ color: badge.unlocked ? badge.color : "#9ca3af" }} />
              <p className="text-sm font-semibold text-slate-800">{badge.name}</p>
              {!badge.unlocked ? <p className="mt-1 text-[10px] text-slate-400">{badge.requirement}</p> : null}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-2xl font-bold text-slate-800">
          <i className="fas fa-tree mr-2 text-emerald-600" />
          Skill Tree
        </h3>
        <div className="rounded-3xl bg-white/60 p-6 shadow-inner">
          <div className="grid gap-5 md:grid-cols-3">
            {(user.skillNodes || []).map((skill) => (
              <div key={skill.id} className="rounded-xl border-l-8 bg-white p-4 shadow-sm" style={{ borderLeftColor: skill.colorCode }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-700">{skill.name}</span>
                  <span className="text-xs font-medium capitalize" style={{ color: skill.colorCode }}>
                    {skill.status}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${skill.mastery}%`, backgroundColor: skill.colorCode }} />
                </div>
                <p className="mt-2 text-right text-[11px] text-slate-500">{skill.mastery}% mastery</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            BUISES actions and manual wins both feed these mastery tracks now.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => triggerAction(40, "Quiz challenge")}
          className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white shadow-lg transition hover:scale-105"
        >
          Take quiz (+40)
        </button>
        <button
          type="button"
          onClick={() => triggerAction(60, "AI exploration project")}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white shadow-lg transition hover:scale-105"
        >
          AI explorer (+60)
        </button>
        <button
          type="button"
          onClick={() => triggerAction(30, "Learning lesson")}
          className="rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 px-6 py-3 text-white shadow-lg transition hover:scale-105"
        >
          Lesson (+30)
        </button>
      </div>

      <AnimatePresence>
        {selectedBadge ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <i className={`${selectedBadge.icon} mb-3 text-5xl`} style={{ color: selectedBadge.unlocked ? selectedBadge.color : "#9ca3af" }} />
              <h4 className="text-xl font-bold text-slate-900">{selectedBadge.name}</h4>
              <p className="mt-2 text-slate-600">{selectedBadge.description}</p>
              {!selectedBadge.unlocked ? (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                  Requirement: {selectedBadge.requirement}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="mt-5 w-full rounded-full bg-slate-200 py-2.5 font-medium text-slate-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
