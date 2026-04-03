import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api/client";
import LevelPopup from "../components/LevelPopup.jsx";
import LoadingDots from "../components/LoadingDots.jsx";
import ProductivityChart from "../components/ProductivityChart.jsx";
import TaskList from "../components/TaskList.jsx";
import XPBar from "../components/XPBar.jsx";
import XPToast from "../components/XPToast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { RefreshIcon, SparklesIcon, TrophyIcon, TrendUpIcon } from "../components/V0Icons.jsx";
import { getAchievementList, getLevelFromXp, getLevelProgress, getXpToNextLevel } from "../utils/progression.js";

const actionXpItems = [
  { label: "Daily login", value: "+10 XP" },
  { label: "Streak bonus", value: "+20 XP" },
  { label: "Easy task", value: "+20 XP" },
  { label: "Medium task", value: "+40 XP" },
  { label: "Hard task", value: "+80 XP" }
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.06, ease: "easeOut" }
  })
};

const GrowthPage = () => {
  const { token, setUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rewardToast, setRewardToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [badgeToast, setBadgeToast] = useState([]);
  const [levelUp, setLevelUp] = useState(false);
  const [completingQuestId, setCompletingQuestId] = useState("");
  const [celebratingQuestId, setCelebratingQuestId] = useState("");
  const previousLevelRef = useRef(0);

  useEffect(() => {
    if (!rewardToast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setRewardToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [rewardToast]);

  useEffect(() => {
    if (!badgeToast.length) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setBadgeToast([]), 3200);
    return () => window.clearTimeout(timeout);
  }, [badgeToast]);

  useEffect(() => {
    if (!levelUp) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setLevelUp(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [levelUp]);

  const loadDashboard = async () => {
    try {
      const response = await api.getDashboard(token);
      setDashboard(response);
      setUser(response.user);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  useEffect(() => {
    const currentLevel = getLevelFromXp(dashboard?.stats?.xp || 0);
    if (previousLevelRef.current && currentLevel > previousLevelRef.current) {
      setLevelUp(true);
    }
    previousLevelRef.current = currentLevel;
  }, [dashboard?.stats?.xp]);

  const handleGenerateQuests = async () => {
    try {
      setGenerating(true);
      await api.generateQuests(token);
      await loadDashboard();
    } catch (generateError) {
      setError(generateError.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      setCompletingQuestId(questId);
      const previousAchievements = getAchievementList({
        xp: dashboard?.stats?.xp || 0,
        streak: dashboard?.stats?.streak || 0,
        prediction: dashboard?.stats?.prediction,
        quests: dashboard?.quests || []
      });
      const previousLevel = getLevelFromXp(dashboard?.stats?.xp || 0);
      const response = await api.completeQuest(token, questId);
      setCelebratingQuestId(questId);
      await loadDashboard();
      const nextXp = response.xp || 0;
      const nextStreak = response.streak || 0;
      const nextLevel = getLevelFromXp(nextXp);
      const nextAchievements = getAchievementList({
        xp: nextXp,
        streak: nextStreak,
        prediction: dashboard?.stats?.prediction,
        quests: [...(dashboard?.quests || []).map((quest) => (quest._id === questId ? { ...quest, completed: true } : quest))]
      });
      const unlockedBadges = nextAchievements.filter((achievement) => {
        const previous = previousAchievements.find((item) => item.id === achievement.id);
        return achievement.unlocked && !previous?.unlocked;
      });

      if (nextLevel > previousLevel) {
        setLevelUp(true);
      }

      setRewardToast({
        xpEarned: response.xpEarned || 0,
        totalXp: response.xp || 0,
        futureBoost: response.futureBoost || "",
        streak: response.streak || 0
      });
      setBadgeToast(unlockedBadges);
      window.setTimeout(() => setCelebratingQuestId(""), 500);
    } catch (completeError) {
      setError(completeError.message);
    } finally {
      setCompletingQuestId("");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoadingDots label="Analyzing your future..." />
      </div>
    );
  }

  if (error) {
    return <div className="glass rounded-2xl p-6 text-rose-300">{error}</div>;
  }

  const level = getLevelFromXp(dashboard.stats?.xp || 0);
  const progress = getLevelProgress(dashboard.stats?.xp || 0);
  const xpToNextLevel = getXpToNextLevel(dashboard.stats?.xp || 0);
  const recommendations = dashboard.analysis?.recommendations || [];
  const focusAreas = dashboard.analysis?.focusAreas || [];
  const quests = dashboard.quests || [];
  const nextBoostUnlocked = (dashboard.stats?.streak || 0) >= 3;
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const totalQuests = quests.length;
  const completionRate = totalQuests ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const streak = dashboard.stats?.streak || 0;
  const xp = dashboard.stats?.xp || 0;
  const weeklyQuestBars = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => {
    const energyBase = Math.max(1, Math.round(progress / 12));
    const streakBias = Math.min(3, Math.floor(streak / 2));
    return {
      label,
      value: Math.max(1, Math.min(10, energyBase + streakBias + (index % 3)))
    };
  });
  const xpMomentumLine = ["W1", "W2", "W3", "W4", "W5", "W6", "Now"].map((label, index) => ({
    label,
    value: Math.max(12, Math.round((xp / 12) * (0.52 + index * 0.08)) + (index % 2 === 0 ? 4 : 0))
  }));
  const statCards = [
    {
      label: "XP Core",
      value: xp,
      suffix: "XP",
      tone: "",
      detail: `${xpToNextLevel} XP to next level`
    },
    {
      label: "Level Badge",
      value: level,
      suffix: "",
      tone: "muse-card-blue",
      detail: `${progress}% growth progress`
    },
    {
      label: "Streak Flow",
      value: streak,
      suffix: "days",
      tone: "muse-card-mint",
      detail: nextBoostUnlocked ? "Boost active" : "Keep momentum alive"
    },
    {
      label: "Quest Clear Rate",
      value: completionRate,
      suffix: "%",
      tone: "muse-card-peach",
      detail: `${completedQuests}/${Math.max(totalQuests, 1)} completed`
    }
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="muse-page">
      <XPToast reward={rewardToast} />
      <LevelPopup level={level} open={levelUp} />

      <AnimatePresence>
        {badgeToast.length ? (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="pointer-events-none fixed right-8 top-24 z-[70] w-full max-w-sm space-y-3"
          >
            {badgeToast.map((badge) => (
              <div key={badge.id} className="rounded-[1.4rem] border border-amber-300/20 bg-slate-950/90 p-4 shadow-[0_24px_80px_rgba(6,11,28,0.48)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/15">
                    <SparklesIcon className="h-5 w-5 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-amber-200">Badge Unlocked</p>
                    <p className="text-lg font-semibold text-white">{badge.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.section
        custom={0}
        variants={fadeUp}
        className="hero-shell muse-card muse-card-peach relative overflow-hidden px-6 py-7 md:px-8"
        data-ambient-scene="Growth Hub"
        data-ambient-intensity="0.24"
      >
        <div className="muse-wave muse-wave-mint bottom-[-2rem] left-[-2rem] h-40 w-52" />
        <div className="muse-wave muse-wave-blue right-[-1rem] top-[-1.5rem] h-36 w-44" />
        <div className="relative muse-grid-hero">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-700">Progression Room</p>
            <h1 className="text-3xl font-bold md:text-5xl">
            Gamification <span className="gradient-brand-text">Dashboard</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
              Earn XP, level up, protect your streak, and clear daily tasks like a futuristic progression game.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {focusAreas.slice(0, 3).map((area) => (
                <span key={area} className="soft-chip px-4 py-2 text-sm">
                  {area}
                </span>
              ))}
              {!focusAreas.length ? <span className="soft-chip px-4 py-2 text-sm">Consistency engine</span> : null}
            </div>
          </div>

          <div className="muse-card muse-card-blue p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Growth Pulse</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Level {level} operator</h2>
              </div>
              <div className="soft-chip px-3 py-1 text-xs text-emerald-700">
                {completionRate}% ready
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-100 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current XP</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{xp}</p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Streak Energy</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{streak}d</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateQuests}
              disabled={generating}
              className="gradient-brand mt-5 inline-flex min-w-56 items-center justify-center rounded-full px-5 py-3 font-semibold text-slate-950 disabled:opacity-70"
            >
              <RefreshIcon className="mr-2 h-4 w-4" />
              {generating ? <LoadingDots label="Analyzing your future..." /> : "Generate Daily Tasks"}
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section custom={1} variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const body = (
            <>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900">{card.value}</p>
                {card.suffix ? <span className="pb-1 text-sm text-slate-500">{card.suffix}</span> : null}
              </div>
              <p className="mt-3 text-sm text-slate-600">{card.detail}</p>
            </>
          );

          if (index === 2) {
            return (
              <motion.div
                key={card.label}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className={`muse-card p-6 ${card.tone}`.trim()}
              >
                {body}
              </motion.div>
            );
          }

          return (
            <div key={card.label} className={`muse-card p-6 ${card.tone}`.trim()}>
              {body}
            </div>
          );
        })}
      </motion.section>

      <div className="muse-grid-two">
        <motion.section custom={2} variants={fadeUp} className="space-y-6">
          <XPBar xp={xp} level={level} progress={progress} xpToNextLevel={xpToNextLevel} />
          <ProductivityChart title="Weekly task rhythm" subtitle="Quest completions" points={weeklyQuestBars} />
        </motion.section>

        <motion.section custom={3} variants={fadeUp} className="space-y-6">
          <div className="muse-card muse-card-blue p-6">
          <div className="mb-4 flex items-center gap-3">
            <TrendUpIcon className="h-5 w-5 text-emerald-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Streak System</p>
              <h2 className="mt-2 text-2xl font-semibold">Future boost</h2>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            {nextBoostUnlocked
              ? "Consistency detected. Your future path is strengthening because you are stacking repeat wins."
              : "Stay active daily. Missed days reset the streak, while daily activity compounds your upside."}
          </p>
          <div className={`mt-5 rounded-[1.3rem] border p-4 ${nextBoostUnlocked ? "border-emerald-300/20 bg-emerald-300/10" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center gap-3">
              <SparklesIcon className={`h-5 w-5 ${nextBoostUnlocked ? "text-emerald-200" : "text-slate-400"}`} />
              <div>
                <p className="font-medium text-white">{nextBoostUnlocked ? "Boost active" : "Boost warming up"}</p>
                <p className="text-sm text-slate-400">Current streak: {dashboard.stats?.streak || 0} days</p>
              </div>
            </div>
          </div>
          </div>
          <ProductivityChart title="XP momentum" subtitle="Growth curve" points={xpMomentumLine} variant="line" />
        </motion.section>
      </div>

      <motion.section custom={4} variants={fadeUp} className="muse-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">XP Rules</p>
            <h2 className="mt-2 text-2xl font-semibold">Reward Matrix</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {actionXpItems.map((item) => (
            <div key={item.label} className="muse-mini-card p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {(recommendations.length || focusAreas.length) ? (
        <motion.section custom={5} variants={fadeUp} className="muse-card muse-card-mint p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Task Engine</p>
              <h2 className="mt-2 text-2xl font-semibold">Daily Tasks</h2>
            </div>
            {dashboard.stats?.confidence ? (
              <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-300">
                {dashboard.stats.confidence}% confidence
              </div>
            ) : null}
          </div>
          {focusAreas.length ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <span key={area} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-300">
                  {area}
                </span>
              ))}
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-3">
              {recommendations.map((item) => (
                <div key={item} className="muse-mini-card p-4 text-sm leading-relaxed text-slate-600">
                  {item}
                </div>
              ))}
            </div>
        </motion.section>
      ) : null}

      <motion.section custom={6} variants={fadeUp} className="muse-grid-two">
        <div className="muse-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quest Board</p>
              <h2 className="mt-2 text-2xl font-semibold">Active Missions</h2>
            </div>
            <div className="soft-chip px-3 py-1 text-xs">
              {completedQuests}/{totalQuests || 0} cleared
            </div>
          </div>
          <TaskList
            quests={quests}
            onComplete={handleCompleteQuest}
            completingQuestId={completingQuestId}
            celebratingQuestId={celebratingQuestId}
          />
        </div>

        <div className="space-y-6">
          <div className="muse-card muse-card-peach p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visual Snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold">Progress radar</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Level", value: `${level}` },
                { label: "Completion", value: `${completionRate}%` },
                { label: "Streak", value: `${streak}d` },
                { label: "XP", value: `${xp}` }
              ].map((item) => (
                <div key={item.label} className="muse-mini-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="muse-card muse-card-mint p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next Unlock</p>
            <h2 className="mt-2 text-2xl font-semibold">Momentum target</h2>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                  <span>XP to next level</span>
                  <span>{xpToNextLevel}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-sky-300"
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                  <span>Streak boost threshold</span>
                  <span>{Math.min(100, Math.round((streak / 3) * 100))}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((streak / 3) * 100))}%` }}
                    transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-teal-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {!quests.length ? (
        <motion.div custom={7} variants={fadeUp} className="muse-card muse-card-peach p-8 text-center">
          <TrophyIcon className="mx-auto h-10 w-10 text-pink-300" />
          <h2 className="mt-4 text-xl font-semibold">No active tasks yet</h2>
          <p className="mt-2 text-slate-400">Generate daily tasks like study sessions, workouts, and phone-discipline goals.</p>
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default GrowthPage;
