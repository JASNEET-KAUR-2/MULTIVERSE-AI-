import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import UserAvatar from "../components/UserAvatar.jsx";
import FutureSnapshotShare from "../components/FutureSnapshotShare.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { MessageIcon, SparklesIcon } from "../components/V0Icons.jsx";
import { getAchievementList, getLevelFromXp } from "../utils/progression.js";

const MessagePage = () => {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-400">Loading future message...</div>;
  }

  if (error) {
    return <div className="glass rounded-2xl p-6 text-rose-300">{error}</div>;
  }

  const level = getLevelFromXp(dashboard.stats?.xp || 0);
  const achievements = getAchievementList({
    xp: dashboard.stats?.xp || 0,
    streak: dashboard.stats?.streak || 0,
    prediction: dashboard.stats?.prediction,
    quests: dashboard.quests || [],
    guildCount: dashboard.user?.guilds?.length || 0
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <div className="glass inline-flex items-center gap-2 rounded-full border border-violet-300/30 px-4 py-2">
          <SparklesIcon className="h-4 w-4 text-violet-300" />
          <span className="text-sm text-slate-400">Transmission Received</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold">
          A Message From Your <span className="gradient-brand-text">Future Self</span>
        </h1>
      </div>

      <div className="glass relative overflow-hidden rounded-[2rem] border border-white/10 p-8 md:p-10">
        <div className="gradient-brand absolute left-0 right-0 top-0 h-1" />
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <UserAvatar name={dashboard.user?.name} className="h-16 w-16 text-lg" />
            <div className="absolute -bottom-1 -right-1 gradient-brand flex h-7 w-7 items-center justify-center rounded-full">
              <MessageIcon className="h-4 w-4 text-slate-950" />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Future Message</p>
            <h2 className="text-2xl font-semibold">Read this carefully</h2>
            <p className="mt-1 text-sm text-slate-500">Level {level} explorer with {dashboard.stats?.xp || 0} XP</p>
          </div>
        </div>

        <p className="text-lg leading-9 text-slate-200">
          {dashboard.simulation?.futureMessage || "Complete the Soul Scan to receive a message from your future self."}
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {achievements.slice(0, 3).map((achievement) => (
            <div key={achievement.id} className={`rounded-xl border p-4 ${achievement.unlocked ? "border-violet-300/20 bg-violet-300/10" : "border-white/10 bg-white/5"}`}>
              <p className="text-sm font-medium">{achievement.label}</p>
              <p className={`mt-2 text-xs ${achievement.unlocked ? "text-violet-300" : "text-slate-500"}`}>
                {achievement.unlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <FutureSnapshotShare
          name={dashboard.user?.name || "You"}
          prediction={dashboard.stats?.prediction || "Pending"}
          level={`Level ${level}`}
          message={dashboard.simulation?.futureMessage || "My future self says to stay consistent."}
        />
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-sm text-slate-300">Finished the journey? Leave a quick product note so the experience keeps improving.</p>
        <Link to="/feedback" className="gradient-brand mt-4 inline-flex rounded-xl px-5 py-3 font-semibold text-slate-950">
          Open Feedback Page
        </Link>
      </div>
    </div>
  );
};

export default MessagePage;
