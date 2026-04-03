import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import BehaviorSnapshot from "../components/BehaviorSnapshot.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { BranchIcon, MessageIcon, SparklesIcon, TrophyIcon, TrendUpIcon, UserIcon } from "../components/V0Icons.jsx";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

const getLastSevenDays = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

const ProfilePage = () => {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const streakCalendar = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const recentDays = getLastSevenDays();
    const activityDates = new Set(
      (dashboard.activityLog || []).map((entry) => {
        const date = new Date(entry.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    return recentDays.map((date) => ({
      key: date.toISOString(),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      active: activityDates.has(date.getTime())
    }));
  }, [dashboard]);

  useEffect(() => {
    api
      .getDashboard(token)
      .then((response) => {
        setDashboard(response);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [token]);

  const timelineItems = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const activityEvents = (dashboard.activityLog || []).map((entry) => ({
      id: `activity-${entry._id || entry.createdAt}-${entry.label}`,
      kind: entry.type || "Activity",
      title: entry.label,
      detail: entry.detail,
      timestamp: entry.createdAt,
      badge: entry.xpAwarded ? `+${entry.xpAwarded} XP` : "Logged"
    }));

    return activityEvents
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 10);
  }, [dashboard]);

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-400">Loading profile...</div>;
  }

  if (error) {
    return <div className="glass rounded-2xl p-6 text-rose-300">{error}</div>;
  }

  const behavior = dashboard.behaviorProfile || {};
  const analysis = dashboard.analysis || {};
  const snapshotCards = [
    { label: "Prediction", value: dashboard.prediction?.label || "Pending", icon: SparklesIcon },
    { label: "Momentum", value: `${analysis.momentumScore || 0}/100`, icon: TrendUpIcon },
    { label: "Scanner Streak", value: dashboard.stats?.scannerStreak || 0, icon: BranchIcon },
    { label: "XP", value: dashboard.stats?.xp || 0, icon: TrophyIcon }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="hero-shell rounded-[2rem] border border-white/10 px-6 py-8 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar name={user?.name || dashboard.user?.name} className="h-[4.5rem] w-[4.5rem] text-xl" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/75">Profile Section</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{dashboard.user?.name || "Explorer"}</h1>
              <p className="mt-2 text-sm text-slate-300">{dashboard.user?.email}</p>
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
            {analysis.coachProfile?.headline || "Your latest analysis summary will show here once you complete a scan."}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-cyan-200" />
              <h2 className="text-2xl font-semibold">Current profile</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {snapshotCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-cyan-200" />
                      <span className="text-sm text-slate-400">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <BehaviorSnapshot behaviorProfile={behavior} />

          <div className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <BranchIcon className="h-5 w-5 text-emerald-200" />
              <h2 className="text-2xl font-semibold">7-day streak map</h2>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {streakCalendar.map((day) => (
                <div key={day.key} className={`rounded-[1.1rem] border p-4 text-center ${day.active ? "border-emerald-300/20 bg-emerald-300/10" : "border-white/10 bg-white/5"}`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{day.label}</p>
                  <p className={`mt-3 text-lg font-semibold ${day.active ? "text-emerald-200" : "text-slate-500"}`}>{day.active ? "On" : "Off"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <MessageIcon className="h-5 w-5 text-fuchsia-200" />
              <h2 className="text-2xl font-semibold">Focus anchors</h2>
            </div>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>Primary goal: {analysis.habitAnchors?.primaryGoal || "Not set yet"}</p>
              <p>Primary habit: {analysis.habitAnchors?.primaryHabit || "Not set yet"}</p>
              <p>Consistency band: {analysis.habitAnchors?.consistencyBand || "Unknown"}</p>
            </div>
          </div>

          <div className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <SparklesIcon className="h-5 w-5 text-cyan-200" />
              <h2 className="text-2xl font-semibold">What If history</h2>
            </div>
            <div className="space-y-3">
              {(dashboard.simulationHistory || []).slice(0, 4).map((entry) => (
                <div key={entry._id || entry.createdAt} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{entry.presetMode || "Custom Simulation"}</p>
                    <span className="text-sm text-cyan-200">{entry.prediction}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {entry.improvementDelta >= 0 ? `+${entry.improvementDelta}` : entry.improvementDelta}% shift | {formatDate(entry.createdAt)}
                  </p>
                  {entry.topContributor?.label ? (
                    <p className="mt-2 text-sm text-slate-300">
                      Biggest driver: {entry.topContributor.label} {entry.topContributor.delta > 0 ? `(+${entry.topContributor.delta})` : `(${entry.topContributor.delta})`}
                    </p>
                  ) : null}
                </div>
              ))}
              {!(dashboard.simulationHistory || []).length ? (
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  No simulations saved yet. Run a What If scenario from the dashboard to start comparing alternate futures.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="dynamic-panel rounded-[1.8rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <SparklesIcon className="h-5 w-5 text-cyan-200" />
            <h2 className="text-2xl font-semibold">Activity history</h2>
          </div>

          <div className="space-y-4">
            {timelineItems.length ? (
              timelineItems.map((item) => (
                <div key={item.id} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.kind}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.detail || "No details captured."}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs text-slate-300">{item.badge}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No history yet. Finish a scan or complete a quest and this page will start filling up.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
