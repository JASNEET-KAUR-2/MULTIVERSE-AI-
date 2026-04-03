import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const moodEmojis = {
  Focused: "🎯",
  Balanced: "⚖️",
  Drained: "😩",
  Motivated: "🚀",
  Reflective: "🤔"
};

const moodColors = {
  Focused: "bg-blue-100 text-blue-700 border-blue-200",
  Balanced: "bg-green-100 text-green-700 border-green-200",
  Drained: "bg-red-100 text-red-700 border-red-200",
  Motivated: "bg-amber-100 text-amber-700 border-amber-200",
  Reflective: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function JournalPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [moodStats, setMoodStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState("Reflective");
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    mood: "Reflective"
  });

  const loadEntries = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [entriesResponse, statsResponse] = await Promise.all([
        api.getJournalEntries(token, { limit: 50 }),
        api.getMoodStats(token)
      ]);

      const suggestedMood = statsResponse.journalContext?.suggestedMood || "Reflective";
      setEntries(entriesResponse.entries || []);
      setMoodStats(statsResponse);
      setSelectedMood(suggestedMood);
      setFormData((current) => ({
        ...current,
        mood: current.title || current.body ? current.mood : suggestedMood
      }));
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [token]);

  const handleCreateEntry = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;

    try {
      const response = await api.createJournalEntry(token, formData);
      setEntries((current) => [response.entry, ...current]);
      setFormData({
        title: "",
        body: "",
        mood: "Reflective"
      });
      setSelectedMood("Reflective");
      setShowCreateModal(false);
      loadEntries();
    } catch (error) {
      console.error("Failed to create journal entry:", error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await api.deleteJournalEntry(token, entryId);
      setEntries((current) => current.filter((entry) => entry._id !== entryId));
      loadEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <div className="muse-page mx-auto max-w-5xl p-6">
        <div className="muse-card muse-card-peach p-8" data-ambient-scene="Journal Studio" data-ambient-intensity="0.18">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Daily Journal</h1>
          <p className="text-slate-600">Reflect on your day, capture moments, and keep a clear record of your thoughts.</p>
        </div>

        {moodStats ? (
          <div className="muse-card muse-card-blue p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Your Mood Patterns</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {Object.entries(moodStats.moodStats || {}).map(([mood, count]) => (
                <div key={mood} className={`rounded-xl border-2 p-4 text-center ${moodColors[mood]}`}>
                  <div className="mb-1 text-2xl">{moodEmojis[mood]}</div>
                  <p className="text-sm font-semibold">{count}</p>
                  <p className="text-xs opacity-75">{mood}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Most common mood: <span className="font-semibold">{moodStats.mostCommonMood}</span>
            </p>
          </div>
        ) : null}

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Your Entries ({entries.length})</h2>
          <motion.button
            onClick={() => {
              setSelectedMood("Reflective");
              setFormData((current) => ({
                ...current,
                mood: current.mood || "Reflective"
              }));
              setShowCreateModal(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            + New Entry
          </motion.button>
        </div>

        {loading ? (
          <div className="py-12 text-center">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="muse-card muse-card-mint py-12 text-center">
            <div className="mb-4 text-5xl">📝</div>
            <p className="text-slate-600">No journal entries yet</p>
            <p className="mt-2 text-sm text-slate-500">Start your journaling journey today.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="muse-card p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`rounded-full border-2 px-3 py-1 text-sm font-semibold ${moodColors[entry.mood]}`}>
                        <span className="mr-2">{moodEmojis[entry.mood]}</span>
                        {entry.mood}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{entry.title}</h3>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="ml-4 rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Delete
                  </motion.button>
                </div>

                <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{entry.body}</p>
              </motion.div>
            ))}
          </div>
        )}

        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-h-[80vh] w-full max-w-2xl overflow-y-auto muse-card muse-card-peach p-8"
            >
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Write a Journal Entry</h2>

              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Today's Mood</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => {
                          setSelectedMood(mood);
                          setFormData((current) => ({ ...current, mood }));
                        }}
                        className={`rounded-xl p-3 text-2xl transition-all ${
                          selectedMood === mood ? `${moodColors[mood]} scale-110 ring-2 ring-offset-2` : "bg-slate-100 hover:bg-slate-200"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Journal title"
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <textarea
                  placeholder="What's on your mind today?"
                  value={formData.body}
                  onChange={(event) => setFormData((current) => ({ ...current, body: event.target.value }))}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="6"
                  required
                />

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700">
                    Save Entry
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
