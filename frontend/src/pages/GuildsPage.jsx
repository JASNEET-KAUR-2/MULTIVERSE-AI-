import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import UserAvatar from "../components/UserAvatar.jsx";
import { SparklesIcon, TrophyIcon, TrendUpIcon } from "../components/V0Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  name: "",
  focus: "",
  description: ""
};

const medalByRank = {
  0: "Gold",
  1: "Silver",
  2: "Bronze"
};

const formatCountdown = (targetDate) => {
  if (!targetDate) {
    return "Reset unavailable";
  }

  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return "Resetting now";
  }

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h left`;
};

const GuildsPage = () => {
  const { token } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [guildLeaderboard, setGuildLeaderboard] = useState([]);
  const [weeklyPlayerLeaderboard, setWeeklyPlayerLeaderboard] = useState([]);
  const [weeklyGuildLeaderboard, setWeeklyGuildLeaderboard] = useState([]);
  const [challengeCards, setChallengeCards] = useState([]);
  const [personalRank, setPersonalRank] = useState({ allTime: null, weekly: null });
  const [spotlight, setSpotlight] = useState({ weeklyChampion: null, allTimeChampion: null, resetAt: null });
  const [leaderboardMode, setLeaderboardMode] = useState("weekly");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadGuilds = async () => {
    try {
      const response = await api.getGuilds(token);
      setGuilds(response.guilds);
      setTopPlayers(response.topPlayers || []);
      setGuildLeaderboard(response.guildLeaderboard || []);
      setWeeklyPlayerLeaderboard(response.weeklyPlayerLeaderboard || []);
      setWeeklyGuildLeaderboard(response.weeklyGuildLeaderboard || []);
      setChallengeCards(response.challengeCards || []);
      setPersonalRank(response.personalRank || { allTime: null, weekly: null });
      setSpotlight(response.spotlight || { weeklyChampion: null, allTimeChampion: null, resetAt: null });
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuilds();
  }, [token]);

  const handleCreateGuild = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.createGuild(token, form);
      setForm(initialForm);
      await loadGuilds();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGuild = async (guildId) => {
    setSubmitting(true);

    try {
      await api.joinGuild(token, guildId);
      await loadGuilds();
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetCountdown = useMemo(() => formatCountdown(spotlight.resetAt), [spotlight.resetAt]);

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center text-slate-300">Loading guild network...</div>;
  }

  const activePlayerBoard = leaderboardMode === "weekly" ? weeklyPlayerLeaderboard : topPlayers;
  const activeGuildBoard = leaderboardMode === "weekly" ? weeklyGuildLeaderboard : guildLeaderboard;
  const activeRank = leaderboardMode === "weekly" ? personalRank.weekly : personalRank.allTime;
  const activeChampion = leaderboardMode === "weekly" ? spotlight.weeklyChampion : spotlight.allTimeChampion;

  return (
    <div className="grid gap-6">
      <div className="glass rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Guild Network</p>
        <h1 className="mt-3 text-4xl font-semibold">Join people building better futures.</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Guilds give the app a social progression layer. Find people chasing similar outcomes, compare XP, and build momentum together.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="dynamic-panel rounded-[1.8rem] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Winner Spotlight</p>
              <h2 className="mt-2 text-2xl font-semibold">{activeChampion?.name || "No champion yet"}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {leaderboardMode === "weekly"
                  ? "This guild is leading the current reset window. Keep the pressure on before the board rolls over."
                  : "This guild has built the strongest long-term momentum in the network so far."}
              </p>
            </div>
            <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
              {leaderboardMode === "weekly" ? resetCountdown : "All-time board"}
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Guild</p>
              <p className="mt-2 text-lg font-semibold text-white">{activeChampion?.name || "-"}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Focus</p>
              <p className="mt-2 text-lg font-semibold text-white">{activeChampion?.focus || "-"}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {leaderboardMode === "weekly" ? activeChampion?.weeklyXp || 0 : activeChampion?.totalXp || 0} XP
              </p>
            </div>
          </div>
        </div>

        <div className="dynamic-panel rounded-[1.8rem] p-6">
          <div className="mb-4 flex items-center gap-3">
            <TrophyIcon className="h-5 w-5 text-amber-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Your Rank</p>
              <h2 className="text-2xl font-semibold">Personal standing</h2>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{leaderboardMode === "weekly" ? "Weekly rank" : "All-time rank"}</p>
              <p className="mt-2 text-3xl font-bold text-white">#{activeRank?.rank || "-"}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</p>
              <p className="mt-2 text-xl font-semibold text-cyan-200">
                {leaderboardMode === "weekly" ? activeRank?.weeklyXp || 0 : activeRank?.xp || 0} XP
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Streak</p>
              <p className="mt-2 text-xl font-semibold text-emerald-200">{activeRank?.streak || 0} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="gradient-brand flex h-12 w-12 items-center justify-center rounded-xl">
            <SparklesIcon className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Create Guild</p>
            <h2 className="text-xl font-semibold">Start a focused crew</h2>
          </div>
        </div>

        <form onSubmit={handleCreateGuild} className="grid gap-4 md:grid-cols-2">
          <input className="input-field" placeholder="Guild name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          <input className="input-field" placeholder="Focus area" value={form.focus} onChange={(event) => setForm((current) => ({ ...current, focus: event.target.value }))} required />
          <textarea
            className="input-field min-h-28 md:col-span-2"
            placeholder="Describe what this guild is about"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            required
          />
          <button type="submit" disabled={submitting} className="gradient-brand rounded-2xl px-5 py-3 font-semibold text-slate-950 md:col-span-2">
            {submitting ? "Syncing guild..." : "Create Guild"}
          </button>
        </form>
      </div>

      {error ? <div className="glass rounded-2xl p-6 text-rose-300">{error}</div> : null}

      <div className="dynamic-panel rounded-[1.8rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Leaderboard Mode</p>
            <h2 className="mt-2 text-2xl font-semibold">Current competition window</h2>
          </div>
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
            {[
              { id: "weekly", label: "Weekly Reset" },
              { id: "all-time", label: "All Time" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLeaderboardMode(item.id)}
                className={`rounded-xl px-4 py-2 text-sm transition ${leaderboardMode === item.id ? "bg-white/10 text-white" : "text-slate-400"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dynamic-panel rounded-[1.8rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <TrophyIcon className="h-5 w-5 text-amber-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Top Players</p>
              <h2 className="text-xl font-semibold">{leaderboardMode === "weekly" ? "Weekly XP leaders" : "All-time XP leaders"}</h2>
            </div>
          </div>
          <div className="space-y-3">
            {activePlayerBoard.map((player, index) => (
              <div key={player._id} className={`flex items-center justify-between rounded-[1.2rem] border p-4 ${index < 3 ? "border-amber-300/20 bg-amber-300/10" : "border-white/10 bg-white/5"}`}>
                <div className="flex items-center gap-3">
                  <span className="w-14 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{medalByRank[index] || `#${index + 1}`}</span>
                  <UserAvatar name={player.name} className="h-9 w-9 text-[11px]" />
                  <div>
                    <p className="font-medium text-white">{player.name}</p>
                    <p className="text-xs text-slate-400">Streak {player.streak || 0} days</p>
                  </div>
                </div>
                <span className="text-sm text-cyan-200">{leaderboardMode === "weekly" ? player.weeklyXp || 0 : player.xp || 0} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dynamic-panel rounded-[1.8rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <TrendUpIcon className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Guild Ranking</p>
              <h2 className="text-xl font-semibold">{leaderboardMode === "weekly" ? "Weekly guild push" : "All-time guild power"}</h2>
            </div>
          </div>
          <div className="space-y-3">
            {activeGuildBoard.map((guild, index) => (
              <div key={guild._id} className={`flex items-center justify-between rounded-[1.2rem] border p-4 ${index < 3 ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
                <div>
                  <p className="text-sm font-semibold text-white">{medalByRank[index] || `#${index + 1}`} {guild.name}</p>
                  <p className="text-xs text-slate-400">{guild.memberCount} members | {guild.focus}</p>
                </div>
                <span className="text-sm text-emerald-200">{leaderboardMode === "weekly" ? guild.weeklyXp || 0 : guild.totalXp || 0} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {challengeCards.map((challenge) => (
          <div key={challenge.id} className="dynamic-panel rounded-[1.6rem] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Guild Challenge</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{challenge.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{challenge.description}</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reward</p>
              <p className="mt-2 text-sm text-cyan-200">{challenge.reward}</p>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-200">Focus: {challenge.focus}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {guilds.map((guild) => (
          <div key={guild._id} className="glass rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{guild.focus}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{guild.name}</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                {guild.members.length} member{guild.members.length === 1 ? "" : "s"}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">{guild.description}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {guild.members.slice(0, 5).map((member) => (
                <div key={member._id} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <UserAvatar name={member.name} className="h-8 w-8 text-[10px]" />
                  <div className="text-sm text-slate-200">
                    {member.name} | {member.xp} XP
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-300">
                <TrophyIcon className="h-3.5 w-3.5" />
                Social progression unlocked
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleJoinGuild(guild._id)}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm text-cyan-200 transition hover:bg-cyan-400/20"
              >
                Join Guild
              </button>
            </div>
          </div>
        ))}
      </div>

      {!guilds.length ? (
        <div className="glass rounded-2xl p-8 text-center">
          <SparklesIcon className="mx-auto h-10 w-10 text-cyan-300" />
          <p className="mt-4 text-slate-300">No guilds exist yet. Create the first one and turn the social layer on for your demo.</p>
        </div>
      ) : null}
    </div>
  );
};

export default GuildsPage;
