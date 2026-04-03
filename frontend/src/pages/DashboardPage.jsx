import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AlertIcon,
  BranchIcon,
  BriefcaseIcon,
  MessageIcon,
  RefreshIcon,
  SparklesIcon,
  SwordIcon,
  TrendDownIcon,
  TrendUpIcon,
  TrophyIcon
} from "../components/V0Icons.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import WhatIfSimulator from "../components/WhatIfSimulator.jsx";
import { getAchievementList, getLevelFromXp, getLevelProgress, getXpToNextLevel } from "../utils/progression.js";

const metricValue = (value, max) => Math.max(8, Math.min(100, Math.round((value / max) * 100)));

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.06, ease: "easeOut" }
  })
};

const SignalBar = ({ label, strengthScore, riskScore }) => (
  <div className="dynamic-panel rounded-[1.4rem] p-4">
    <div className="mb-3 flex items-center justify-between text-sm">
      <span className="text-slate-700">{label}</span>
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Signal</span>
    </div>
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>Strength</span>
          <span className="text-emerald-600">{strengthScore}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strengthScore}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-200"
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>Risk</span>
          <span className="text-sky-600">{riskScore}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-200 via-rose-300 to-fuchsia-400"
          />
        </div>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { token, setUser, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard(token)
      .then((response) => {
        setDashboard(response);
        setUser(response.user);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [token, setUser]);

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="pastel-shell rounded-2xl p-6 text-slate-700">{error}</div>;
  }

  const behavior = dashboard.behaviorProfile || {};
  const analysis = dashboard.analysis || {};
  const probabilities = dashboard.prediction?.probabilities || {};
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const recommendations = analysis.recommendations || [];
  const insightCards = analysis.insightCards || [];
  const driverSignals = analysis.driverSignals || [];
  const futureScore = Math.round(((probabilities.High || 0) * 100) || 0);
  const level = getLevelFromXp(dashboard.stats?.xp || 0);
  const levelProgress = getLevelProgress(dashboard.stats?.xp || 0);
  const xpToNextLevel = getXpToNextLevel(dashboard.stats?.xp || 0);
  const achievements = getAchievementList({
    xp: dashboard.stats?.xp || 0,
    streak: dashboard.stats?.streak || 0,
    prediction: dashboard.stats?.prediction,
    quests: dashboard.quests || [],
    guildCount: dashboard.user?.guilds?.length || 0
  });

  const quickActions = [
    { label: "View Futures", to: "/futures", icon: BranchIcon, tint: "text-cyan-700", bg: "bg-cyan-100" },
    { label: "Daily Quests", to: "/growth", icon: TrophyIcon, tint: "text-amber-700", bg: "bg-amber-100" },
    { label: "Career Lab", to: "/career", icon: BriefcaseIcon, tint: "text-violet-700", bg: "bg-violet-100" },
    { label: "Future Message", to: "/message", icon: MessageIcon, tint: "text-sky-700", bg: "bg-sky-100" },
    { label: "Retake Quiz", to: "/quiz", icon: RefreshIcon, tint: "text-emerald-700", bg: "bg-emerald-100" }
  ];

  const behaviorStats = [
    { label: "Deep Work", value: metricValue(behavior.studyHours || 0, 12), tone: "good" },
    { label: "Clarity", value: metricValue(behavior.goalClarity || 0, 10), tone: "good" },
    { label: "Consistency", value: metricValue(behavior.consistency || 0, 10), tone: "good" },
    { label: "Screen Drift", value: metricValue(behavior.screenTime || 0, 18), tone: "warning" },
    { label: "Sleep Debt", value: metricValue(12 - (behavior.sleepHours || 0), 12), tone: "warning" },
    { label: "Delay Loop", value: metricValue(behavior.procrastination || 0, 10), tone: "warning" }
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.section custom={0} variants={fadeUp} className="hero-shell relative overflow-hidden rounded-[2rem] border border-cyan-200/30 px-6 py-7 md:px-8">
        <div className="hero-orb hero-orb-cyan" />
        <div className="hero-orb hero-orb-rose" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-700">Personal Control Room</p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              {user?.name || dashboard.user?.name || "Explorer"}, your trajectory is{" "}
              <span className="gradient-hero-text">{analysis.narrativeTone || "evolving"}</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
              {analysis.summary || "Run a scan to unlock your full AI-guided trajectory map."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {strengths.slice(0, 3).map((item) => (
                <span key={item} className="soft-chip px-4 py-2 text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="dynamic-panel relative rounded-[1.8rem] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar name={user?.name || dashboard.user?.name} className="h-16 w-16 text-lg" />
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 bg-cyan-200">
                    <SwordIcon className="h-4 w-4 text-slate-950" />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coach Mode</p>
                  <h2 className="text-2xl font-semibold text-slate-900">{analysis.coachProfile?.title || "Trajectory Coach"}</h2>
                </div>
              </div>
              <div className="soft-chip px-3 py-1 text-xs">
                {dashboard.prediction?.label || "Pending"}
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-700">
              {analysis.coachProfile?.headline || "Sharper guidance appears here after your analysis."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-100 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Primary Focus</p>
                <p className="mt-2 text-lg font-semibold text-cyan-700">{analysis.coachProfile?.focus || "Goal alignment"}</p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next Best Move</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.nextBestAction || "Complete your next scan to unlock a focused recommendation."}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{analysis.coachProfile?.mission || "Your coach mission will appear after analysis."}</p>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section custom={1} variants={fadeUp} className="grid gap-4 md:grid-cols-3">
          {(insightCards.length
            ? insightCards
            : [
                { title: "Momentum", value: analysis.momentumScore || 0, tone: "neutral", detail: "Your drive snapshot updates after each scan." },
                { title: "Risk Load", value: analysis.riskScore || 0, tone: "neutral", detail: "Habit friction and energy drain show up here." },
                { title: "Personal Fit", value: analysis.confidence || 0, tone: "neutral", detail: "Recommendation quality improves as your profile gets richer." }
              ]).map((card) => (
            <div key={card.title} className={`metric-tile metric-${card.tone || "neutral"} rounded-[1.6rem] p-5`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{card.title}</p>
                <SparklesIcon className="h-4 w-4 text-cyan-700" />
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-900">{card.value}</span>
                <span className="pb-1 text-sm text-slate-400">/100</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
            </div>
          ))}
        </motion.section>

        <motion.section custom={2} variants={fadeUp} className="dynamic-panel rounded-[1.8rem] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prediction Engine</p>
              <h2 className="mt-2 text-2xl font-semibold">Trajectory Mix</h2>
            </div>
            <div className="soft-chip px-3 py-1 text-xs text-emerald-700">
              {dashboard.stats?.confidence || analysis.confidence || 0}% confidence
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "High", value: Math.round((probabilities.High || 0) * 100), color: "from-emerald-300 to-cyan-300" },
              { label: "Average", value: Math.round((probabilities.Average || 0) * 100), color: "from-amber-200 to-orange-300" },
              { label: "Negative", value: Math.round((probabilities.Negative || 0) * 100), color: "from-rose-300 to-fuchsia-400" }
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="text-slate-400">{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[1.4rem] border border-cyan-100 bg-white/70 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-700">Future Score</span>
              <span className="text-2xl font-bold text-emerald-700">{futureScore}/100</span>
            </div>
            <p className="text-sm text-slate-600">This score favors durable progress, not just short bursts of intensity.</p>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section custom={3} variants={fadeUp} className="space-y-6">
          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Action Deck</p>
                <h2 className="mt-2 text-2xl font-semibold">Quick Actions</h2>
              </div>
              <AlertIcon className="h-5 w-5 text-amber-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} to={action.to} className="rounded-[1.3rem] border border-cyan-100 bg-white/70 p-4 transition-transform duration-200 hover:-translate-y-1">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${action.bg}`}>
                      <Icon className={`h-5 w-5 ${action.tint}`} />
                    </div>
                    <span className="text-sm text-slate-800">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Level Track</p>
                <h2 className="mt-2 text-2xl font-semibold">Player Progress</h2>
              </div>
              <div className="soft-chip px-3 py-1 text-xs">
                {xpToNextLevel} XP to next
              </div>
            </div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-slate-900">Lv. {level}</p>
                <p className="mt-2 text-sm text-slate-600">Every quest and streak makes this profile more adaptive.</p>
              </div>
              <TrophyIcon className="h-8 w-8 text-amber-700" />
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/8">
              <motion.div initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }} transition={{ duration: 0.8 }} className="gradient-brand h-full rounded-full" />
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Achievement State</p>
                <h2 className="mt-2 text-2xl font-semibold">Milestones</h2>
              </div>
              <div className="soft-chip px-3 py-1 text-xs text-emerald-700">
                {achievements.filter((item) => item.unlocked).length}/{achievements.length}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.slice(0, 6).map((achievement) => (
                <div key={achievement.id} className={`rounded-[1.2rem] border p-4 ${achievement.unlocked ? "border-cyan-200/35 bg-cyan-50" : "border-cyan-100 bg-white/60"}`}>
                  <p className="text-sm font-medium text-slate-900">{achievement.label}</p>
                  <p className={`mt-2 text-xs ${achievement.unlocked ? "text-cyan-700" : "text-slate-500"}`}>{achievement.unlocked ? "Unlocked" : "Locked"}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section custom={4} variants={fadeUp} className="space-y-6">
          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Behavior Field</p>
                <h2 className="mt-2 text-2xl font-semibold">Signal Breakdown</h2>
              </div>
              <div className="soft-chip flex items-center gap-2 px-3 py-1 text-xs">
                <TrendUpIcon className="h-4 w-4 text-emerald-700" />
                Live from latest scan
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(driverSignals.length
                ? driverSignals
                : [
                    { label: "Deep work time", strengthScore: 0, riskScore: 0 },
                    { label: "Sleep rhythm", strengthScore: 0, riskScore: 0 },
                    { label: "Execution consistency", strengthScore: 0, riskScore: 0 }
                  ]).map((signal) => (
                <SignalBar key={signal.label} {...signal} />
              ))}
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Personalized Sprint</p>
                <h2 className="mt-2 text-2xl font-semibold">Recommended Moves</h2>
              </div>
              {analysis.habitAnchors?.primaryGoal ? (
                <div className="soft-chip px-3 py-1 text-xs">
                  Goal: {analysis.habitAnchors.primaryGoal}
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(analysis.dailyTasks?.length ? analysis.dailyTasks : []).map((task) => (
                <div key={task.title} className="rounded-[1.4rem] border border-cyan-100 bg-white/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <span className="rounded-full border border-cyan-100 bg-white/80 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                      {task.difficulty}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{task.description}</p>
                </div>
              ))}
            </div>
            {recommendations.length ? (
              <div className="mt-4 rounded-[1.4rem] border border-cyan-100 bg-white/70 p-4">
                <p className="text-sm leading-7 text-slate-700">
                  <span className="font-medium text-cyan-700">Watchlist:</span> {weaknesses.join(", ")}. {recommendations[0]}
                </p>
              </div>
            ) : null}
          </div>

          <WhatIfSimulator
            token={token}
            behaviorProfile={behavior}
            currentPrediction={dashboard.prediction || {}}
            currentStory={dashboard.simulation?.futureStory || analysis.summary || ""}
            simulationHistory={dashboard.simulationHistory || []}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {behaviorStats.map((item) => (
              <div key={item.label} className={`metric-tile metric-${item.tone} rounded-[1.4rem] p-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  {item.tone === "good" ? <TrendUpIcon className="h-4 w-4 text-emerald-700" /> : <TrendDownIcon className="h-4 w-4 text-sky-700" />}
                </div>
                <p className="mt-5 text-3xl font-bold text-slate-900">{item.value}%</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
