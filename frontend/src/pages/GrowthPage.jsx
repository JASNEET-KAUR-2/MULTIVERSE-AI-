import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api/client";
import LevelPopup from "../components/LevelPopup.jsx";
import LoadingDots from "../components/LoadingDots.jsx";
import TaskList from "../components/TaskList.jsx";
import XPBar from "../components/XPBar.jsx";
import XPToast from "../components/XPToast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { RefreshIcon, SparklesIcon, TrophyIcon, TrendUpIcon } from "../components/V0Icons.jsx";
import { getLevelFromXp, getLevelProgress, getXpToNextLevel } from "../utils/progression.js";

const actionXpItems = [
  { label: "Daily login", value: "+10 XP" },
  { label: "Streak bonus", value: "+20 XP" },
  { label: "Easy task", value: "+20 XP" },
  { label: "Medium task", value: "+40 XP" },
  { label: "Hard task", value: "+80 XP" }
];

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
        quests: dashboard?.quests || [],
        guildCount: dashboard?.user?.guilds?.length || 0
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
        quests: [...(dashboard?.quests || []).map((quest) => (quest._id === questId ? { ...quest, completed: true } : quest))],
        guildCount: dashboard?.user?.guilds?.length || 0
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

  return (
    <div className="relative space-y-6">
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

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Gamification <span className="gradient-brand-text">Dashboard</span>
          </h1>
          <p className="mt-2 text-slate-400">Earn XP, level up, protect your streak, and clear daily tasks like a futuristic progression game.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerateQuests}
          disabled={generating}
          className="gradient-brand inline-flex min-w-56 items-center justify-center rounded-md px-5 py-3 font-semibold text-slate-950 disabled:opacity-70"
        >
          <RefreshIcon className="mr-2 h-4 w-4" />
          {generating ? <LoadingDots label="Analyzing your future..." /> : "Generate Daily Tasks"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">XP</p>
          <p className="mt-3 text-4xl font-bold text-white">{dashboard.stats?.xp ?? 0}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Level Badge</p>
          <p className="mt-3 inline-flex rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-3xl font-bold text-fuchsia-100">
            LVL {level}
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Streak Counter</p>
          <p className="mt-3 text-4xl font-bold text-emerald-200">{dashboard.stats?.streak ?? 0} days</p>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <XPBar xp={dashboard.stats?.xp || 0} level={level} progress={progress} xpToNextLevel={xpToNextLevel} />

        <div className="dynamic-panel rounded-[1.8rem] p-6">
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
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">XP Rules</p>
            <h2 className="mt-2 text-2xl font-semibold">Reward Matrix</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {actionXpItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {(recommendations.length || focusAreas.length) ? (
        <div className="glass rounded-2xl border border-white/10 p-6">
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
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <TaskList
        quests={quests}
        onComplete={handleCompleteQuest}
        completingQuestId={completingQuestId}
        celebratingQuestId={celebratingQuestId}
      />

      {!quests.length ? (
        <div className="glass rounded-2xl p-8 text-center">
          <TrophyIcon className="mx-auto h-10 w-10 text-pink-300" />
          <h2 className="mt-4 text-xl font-semibold">No active tasks yet</h2>
          <p className="mt-2 text-slate-400">Generate daily tasks like study sessions, workouts, and phone-discipline goals.</p>
        </div>
      ) : null}
    </div>
  );
};

export default GrowthPage;
