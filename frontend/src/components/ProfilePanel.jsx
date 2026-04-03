import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { loadLocalDashboardFallback } from "../utils/localDashboardFallback.js";
import BehaviorSnapshot from "./BehaviorSnapshot.jsx";
import UserAvatar from "./UserAvatar.jsx";
import { BranchIcon, SparklesIcon, TargetIcon, TrendUpIcon, TrophyIcon, UserIcon, XCircleIcon } from "./V0Icons.jsx";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
};

const ProfilePanel = ({ open, onClose }) => {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoading(true);
    api
      .getDashboard(token)
      .then((response) => {
        setDashboard(response);
        setError("");
      })
      .catch((loadError) => {
        const fallbackDashboard = loadLocalDashboardFallback();

        if (fallbackDashboard) {
          setDashboard(fallbackDashboard);
          setError("");
          return;
        }

        setError(loadError.message);
      })
      .finally(() => setLoading(false));
  }, [open, token]);

  const timelineItems = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return (dashboard.activityLog || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [dashboard]);

  if (!open) {
    return null;
  }

  const analysis = dashboard?.analysis || {};
  const stats = dashboard?.stats || {};
  const behavior = dashboard?.behaviorProfile || {};
  const summaryCards = [
    { label: "Prediction", value: dashboard?.prediction?.label || "Pending", icon: SparklesIcon },
    { label: "Momentum", value: `${analysis.momentumScore || 0}/100`, icon: TrendUpIcon },
    { label: "Streak", value: `${stats.streak || 0} days`, icon: BranchIcon },
    { label: "XP", value: stats.xp || 0, icon: TrophyIcon }
  ];

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/32 backdrop-blur-[2px]"
        aria-label="Close profile panel"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-[#d9d9df] bg-[linear-gradient(180deg,#fbfbfd_0%,#f2f5f9_100%)] p-5 shadow-[-30px_0_80px_rgba(15,23,42,0.18)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Profile Panel</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Personal Workspace</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
          >
            <XCircleIcon className="h-4 w-4" />
            Close
          </button>
        </div>

        {loading ? (
          <div className="dashboard-surface rounded-[1.6rem] p-5 text-slate-600">Loading profile...</div>
        ) : error ? (
          <div className="dashboard-surface rounded-[1.6rem] border border-rose-200 p-5 text-rose-600">{error}</div>
        ) : (
          <div className="space-y-5">
            <section className="dashboard-surface rounded-[1.8rem] p-6">
              <div className="flex items-center gap-4">
                <UserAvatar name={user?.name || dashboard?.user?.name} className="h-16 w-16 text-lg shadow-[0_12px_26px_rgba(14,165,233,0.18)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Account</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{dashboard?.user?.name || user?.name || "Explorer"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{dashboard?.user?.email || "No email available"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                {analysis.coachProfile?.headline || "Complete a scan to unlock stronger personal guidance and a sharper summary."}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              {summaryCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="dashboard-card-subtle rounded-[1.4rem] p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Icon className="h-4 w-4 text-sky-600" />
                      {item.label}
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </section>

            <BehaviorSnapshot behaviorProfile={behavior} />

            <section className="dashboard-surface rounded-[1.8rem] p-6">
              <div className="mb-4 flex items-center gap-3">
                <TargetIcon className="h-5 w-5 text-sky-600" />
                <h3 className="text-xl font-semibold text-slate-900">Focus Anchors</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="dashboard-card-subtle rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Primary Goal</p>
                  <p className="mt-3 text-base font-medium text-slate-900">{analysis.habitAnchors?.primaryGoal || "Not set yet"}</p>
                </div>
                <div className="dashboard-card-subtle rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Primary Habit</p>
                  <p className="mt-3 text-base font-medium text-slate-900">{analysis.habitAnchors?.primaryHabit || "Not set yet"}</p>
                </div>
              </div>
            </section>

            <section className="dashboard-surface rounded-[1.8rem] p-6">
              <div className="mb-4 flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-sky-600" />
                <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
              </div>

              <div className="space-y-3">
                {timelineItems.length ? (
                  timelineItems.map((item) => (
                    <div key={item._id || item.createdAt} className="dashboard-card-subtle rounded-[1.3rem] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.type || "Activity"}</p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                          {item.xpAwarded ? `+${item.xpAwarded} XP` : "Logged"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail || "No details captured."}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{formatDate(item.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-card-subtle rounded-[1.3rem] p-4 text-sm text-slate-500">
                    No activity yet. Your next scan or quest completion will start building this timeline.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ProfilePanel;
