import { useState, useEffect } from "react";
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
  Focused: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Balanced: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  Drained: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  Motivated: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Reflective: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
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

  // Load journal entries
  const loadEntries = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [entriesResponse, statsResponse] = await Promise.all([
        api.getJournalEntries(token, { limit: 50 }),
        api.getMoodStats(token)
      ]);
      setEntries(entriesResponse.entries || []);
      setMoodStats(statsResponse);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [token]);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;

    try {
      const response = await api.createJournalEntry(token, formData);
      setEntries([response.entry, ...entries]);
      setFormData({ title: "", body: "", mood: "Reflective" });
      setShowCreateModal(false);
      // Reload stats
      loadEntries();
    } catch (error) {
      console.error("Failed to create journal entry:", error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await api.deleteJournalEntry(token, entryId);
      setEntries(entries.filter((e) => e._id !== entryId));
      loadEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📔 Daily Journal
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Reflect on your day, capture moments, and track your mood.
          </p>
        </div>

        {/* Mood Stats */}
        {moodStats && (
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              💭 Your Mood Patterns
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(moodStats.moodStats || {}).map(([mood, count]) => (
                <div
                  key={mood}
                  className={`p-4 rounded-xl text-center border-2 ${moodColors[mood]}`}
                >
                  <div className="text-2xl mb-1">{moodEmojis[mood]}</div>
                  <p className="text-sm font-semibold">{count}</p>
                  <p className="text-xs opacity-75">{mood}</p>
                </div>
              ))}
            </div>
            {moodStats.mostCommonMood && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                ✨ Your most common mood is <span className="font-semibold">{moodStats.mostCommonMood}</span>
              </p>
            )}
          </div>
        )}

        {/* Create Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Entries ({entries.length})
          </h2>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            + New Entry
          </motion.button>
        </div>

        {/* Journal Entries */}
        {loading ? (
          <div className="text-center py-12">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-slate-600 dark:text-slate-400">No journal entries yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Start your journaling journey today!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${moodColors[entry.mood]}`}>
                        <span className="mr-2">{moodEmojis[entry.mood]}</span>
                        {entry.mood}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
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
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {entry.title}
                    </h3>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="flex-shrink-0 p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors ml-4"
                  >
                    🗑️
                  </motion.button>
                </div>

                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {entry.body}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                ✍️ Write a Journal Entry
              </h2>

              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Today's Mood
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => {
                          setSelectedMood(mood);
                          setFormData({ ...formData, mood });
                        }}
                        className={`p-3 rounded-xl text-2xl transition-all ${
                          selectedMood === mood
                            ? `${moodColors[mood]} scale-110 ring-2 ring-offset-2`
                            : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <textarea
                  placeholder="What's on your mind today?"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="6"
                  required
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Save Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
