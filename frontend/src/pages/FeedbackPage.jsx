import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, MessageIcon, SparklesIcon, TrendUpIcon } from "../components/V0Icons.jsx";

const FEEDBACK_KEY = "parallel-you-feedback";

const initialState = {
  rating: 4,
  vibe: "Dynamic",
  message: ""
};

const feedbackOptions = ["Dynamic", "Useful", "Motivating", "Needs polish"];

const FeedbackPage = () => {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(() => {
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const averageLabel = useMemo(() => {
    if (!submitted) {
      return "Waiting for your take";
    }

    return submitted.rating >= 4 ? "Strong signal" : submitted.rating >= 3 ? "Promising signal" : "Needs another pass";
  }, [submitted]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(payload));
    setSubmitted(payload);
    setForm(initialState);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="hero-shell rounded-[2rem] border border-white/10 px-6 py-8 md:px-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/75">Feedback Loop</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">
          Tell us how the <span className="gradient-hero-text">experience feels</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
          This page closes the loop after scanning, reviewing your future, and tracking your profile. Leave a quick signal on the UX and what should improve next.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="dynamic-panel rounded-[1.8rem] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10">
              <MessageIcon className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Share feedback</h2>
              <p className="text-sm text-slate-400">Stored locally for now so you can iterate quickly during demo builds.</p>
            </div>
          </div>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm text-slate-300">Overall rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, rating: value }))}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                    form.rating === value ? "border-cyan-200/50 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm text-slate-300">Which word fits best?</span>
            <div className="flex flex-wrap gap-2">
              {feedbackOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, vibe: option }))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    form.vibe === option ? "border-fuchsia-200/50 bg-fuchsia-300/15 text-fuchsia-100" : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">What should improve?</span>
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="input-field min-h-36 resize-none"
              placeholder="Example: the future story is strong, but I want more history charts on the profile page."
            />
          </label>

          <button type="submit" className="gradient-brand mt-5 rounded-xl px-5 py-3 font-semibold text-slate-950">
            Save Feedback
          </button>
        </form>

        <div className="space-y-6">
          <div className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendUpIcon className="h-5 w-5 text-emerald-200" />
              <h2 className="text-2xl font-semibold">Current sentiment</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-tile metric-good rounded-[1.4rem] p-4">
                <p className="text-sm text-slate-300">Latest rating</p>
                <p className="mt-4 text-3xl font-bold text-white">{submitted?.rating || "-"}</p>
              </div>
              <div className="metric-tile metric-neutral rounded-[1.4rem] p-4">
                <p className="text-sm text-slate-300">Mood tag</p>
                <p className="mt-4 text-2xl font-bold text-white">{submitted?.vibe || "-"}</p>
              </div>
              <div className="metric-tile metric-warning rounded-[1.4rem] p-4">
                <p className="text-sm text-slate-300">Readout</p>
                <p className="mt-4 text-xl font-bold text-white">{averageLabel}</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-cyan-200" />
              <h2 className="text-2xl font-semibold">Latest saved note</h2>
            </div>
            <p className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
              {submitted?.message || "No written feedback yet. Leave a note once you finish the flow."}
            </p>
            {submitted?.createdAt ? (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                Saved {new Date(submitted.createdAt).toLocaleString()}
              </p>
            ) : null}
          </motion.div>

          <div className="dynamic-panel rounded-[1.8rem] p-6">
            <div className="mb-4 flex items-center gap-3">
              <SparklesIcon className="h-5 w-5 text-fuchsia-200" />
              <h2 className="text-2xl font-semibold">Suggested flow</h2>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Start on the intro page, run the scan, check your dashboard, open profile history, then leave feedback here so the experience gets sharper each round.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
