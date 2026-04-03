import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, MessageIcon, SparklesIcon, TrendUpIcon } from "../components/V0Icons.jsx";

const FEEDBACK_KEY = "parallel-you-feedback";

const initialState = {
  rating: 4,
  vibe: "Useful",
  message: ""
};

const feedbackOptions = ["Useful", "Clean", "Smooth", "Needs polish"];

const sentimentCards = [
  {
    title: "Usability",
    detail: "Tell us if the flow feels fast, clear, and easy to use.",
    icon: TrendUpIcon
  },
  {
    title: "Visual feel",
    detail: "Share where the interface still feels noisy or inconsistent.",
    icon: SparklesIcon
  },
  {
    title: "Missing detail",
    detail: "Point out the one thing that would make the workspace feel complete.",
    icon: MessageIcon
  }
];

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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="dashboard-surface rounded-[2rem] px-6 py-8 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Feedback Studio</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-5xl">Help us make the workspace feel simpler and sharper.</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              Leave a quick note on what feels smooth, what still feels heavy, and what would improve the experience the most for everyday use.
            </p>
          </div>

          <div className="dashboard-card-subtle max-w-sm rounded-[1.5rem] p-5">
            <div className="flex items-center gap-3">
              <div className="feedback-illustration flex h-12 w-12 items-center justify-center rounded-2xl">
                <SparklesIcon className="h-5 w-5 text-sky-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Latest sentiment</p>
                <p className="text-sm text-slate-500">{averageLabel}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Feedback is stored locally right now so you can iterate quickly while polishing the product.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {sentimentCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              whileHover={{ y: -4 }}
              className="dashboard-card-subtle rounded-[1.6rem] p-5"
            >
              <div className="feedback-illustration flex h-11 w-11 items-center justify-center rounded-2xl">
                <Icon className="h-5 w-5 text-sky-700" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{card.detail}</p>
            </motion.div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <form onSubmit={handleSubmit} className="dashboard-surface rounded-[1.9rem] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="feedback-illustration flex h-12 w-12 items-center justify-center rounded-2xl">
              <MessageIcon className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Share feedback</h2>
              <p className="text-sm text-slate-500">Short, honest notes are enough.</p>
            </div>
          </div>

          <label className="mb-6 block">
            <span className="mb-3 block text-sm font-medium text-slate-700">Overall rating</span>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, rating: value }))}
                  className={`feedback-rating-chip ${form.rating === value ? "feedback-rating-chip-active" : ""}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </label>

          <label className="mb-6 block">
            <span className="mb-3 block text-sm font-medium text-slate-700">Which word fits best?</span>
            <div className="flex flex-wrap gap-3">
              {feedbackOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, vibe: option }))}
                  className={`feedback-pill ${form.vibe === option ? "feedback-pill-active" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-3 block text-sm font-medium text-slate-700">What should improve?</span>
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="input-field min-h-36 resize-none"
              placeholder="Example: the sidebar feels much better, but I want the feedback page to show recent notes more clearly."
            />
          </label>

          <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800">
            <CheckCircleIcon className="h-4 w-4" />
            Save Feedback
          </button>
        </form>

        <div className="space-y-6">
          <div className="dashboard-surface rounded-[1.9rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <TrendUpIcon className="h-5 w-5 text-sky-700" />
              <h2 className="text-2xl font-semibold text-slate-900">Current sentiment</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="feedback-stat-card rounded-[1.4rem] p-4">
                <p className="text-sm text-slate-500">Latest rating</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{submitted?.rating || "-"}</p>
              </div>
              <div className="feedback-stat-card rounded-[1.4rem] p-4">
                <p className="text-sm text-slate-500">Mood tag</p>
                <p className="mt-4 text-2xl font-semibold text-slate-900">{submitted?.vibe || "-"}</p>
              </div>
              <div className="feedback-stat-card rounded-[1.4rem] p-4">
                <p className="text-sm text-slate-500">Readout</p>
                <p className="mt-4 text-xl font-semibold text-slate-900">{averageLabel}</p>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ y: -3 }} className="dashboard-surface rounded-[1.9rem] p-6">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Latest saved note</h2>
            </div>
            <div className="dashboard-card-subtle rounded-[1.4rem] p-4">
              <p className="text-sm leading-7 text-slate-600">
                {submitted?.message || "No written feedback yet. Once you save a note, it will appear here as your latest product signal."}
              </p>
            </div>
            {submitted?.createdAt ? (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                Saved {new Date(submitted.createdAt).toLocaleString()}
              </p>
            ) : null}
          </motion.div>

          <div className="dashboard-surface rounded-[1.9rem] p-6">
            <div className="mb-4 flex items-center gap-3">
              <SparklesIcon className="h-5 w-5 text-sky-700" />
              <h2 className="text-2xl font-semibold text-slate-900">Suggested review flow</h2>
            </div>
            <div className="space-y-3">
              {[
                "Check the dashboard shell and sidebar comfort first.",
                "Open the BOT launcher and see if chat feels natural in context.",
                "Leave one note about what still feels visually heavy or hard to use."
              ].map((item) => (
                <div key={item} className="dashboard-card-subtle rounded-[1.2rem] p-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
