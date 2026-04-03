import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { BrainIcon, SparklesIcon, TrendDownIcon, TrendUpIcon } from "../components/V0Icons.jsx";

const POSITIVE_SIGNALS = [
  "finished",
  "completed",
  "deep work",
  "focused",
  "focus",
  "planned",
  "reviewed",
  "priority",
  "priorities",
  "shipped",
  "exercise",
  "study",
  "wrote",
  "built",
  "organized",
  "scheduled",
  "wrapped up",
  "progress",
  "sprint",
  "coding"
];

const NEGATIVE_SIGNALS = [
  "procrastinating",
  "procrastinated",
  "scrolling",
  "social media",
  "avoiding",
  "missed deadlines",
  "scattered",
  "distracted",
  "burned out",
  "burnout",
  "tired",
  "doomscrolling",
  "overthinking",
  "delayed",
  "late",
  "stuck",
  "chaotic",
  "couldn't focus",
  "unfocused"
];

const starterExamples = [
  "Finished two deep-work sessions, completed my sprint tasks, and reviewed notes for tomorrow.",
  "Spent the day procrastinating, scrolling social media, and avoiding my main work.",
  "Cleared emails, planned priorities, and wrapped up a focused coding block.",
  "Kept switching tabs, missed deadlines, and felt scattered all afternoon."
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.06, ease: "easeOut" }
  })
};

const buildLocalProductivityResult = (rawText) => {
  const input = String(rawText || "").trim();
  const text = input.toLowerCase();
  let score = 50;
  const matchedPositive = [];
  const matchedNegative = [];

  POSITIVE_SIGNALS.forEach((signal) => {
    if (text.includes(signal)) {
      score += 7;
      matchedPositive.push(signal);
    }
  });

  NEGATIVE_SIGNALS.forEach((signal) => {
    if (text.includes(signal)) {
      score -= 8;
      matchedNegative.push(signal);
    }
  });

  if (input.length > 120) {
    score += 4;
  } else if (input.length < 30) {
    score -= 4;
  }

  const boundedScore = Math.max(2, Math.min(98, score));
  const positive = boundedScore >= 50;

  return {
    input,
    predicted_label: positive ? "POSITIVE" : "NEGATIVE",
    confidence: Number((positive ? boundedScore / 100 : (100 - boundedScore) / 100).toFixed(4)),
    source: "frontend-local-fallback",
    signal_breakdown: {
      matchedPositive,
      matchedNegative,
      score: boundedScore
    },
    numeric_metrics_placeholder: {
      status: "ready_for_extension",
      message: positive
        ? "This activity reads as productive momentum. The app used a local fallback because the detector API was unavailable."
        : "This activity reads as lower productivity momentum. The app used a local fallback because the detector API was unavailable."
    }
  };
};

const ProductivityDetectorPage = () => {
  const { token } = useAuth();
  const [text, setText] = useState(starterExamples[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const input = text.trim();
    if (!input || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await api.productivityDetector(token, {
        text: input
      });
      setResult(response);
    } catch (requestError) {
      setResult(buildLocalProductivityResult(input));
      setNotice(
        requestError.message === "API route not found."
          ? "Live detector route is not available yet, so a local fallback model was used."
          : "Live detector was unavailable, so a local fallback model was used."
      );
    } finally {
      setLoading(false);
    }
  };

  const positive = result?.predicted_label === "POSITIVE";

  return (
    <motion.div initial="hidden" animate="visible" className="muse-page">
      <motion.section custom={0} variants={fadeUp} className="hero-shell muse-card muse-card-mint px-6 py-7 md:px-8">
        <div className="relative muse-grid-hero">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-700">Productivity Detector</p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              Detect whether a work description reads as high or low productivity.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
              This detector now runs directly through the main app backend, so you can check work momentum without spinning up a separate local Python service.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="soft-chip px-4 py-2 text-sm">Integrated app API</span>
              <span className="soft-chip px-4 py-2 text-sm">Productivity signal</span>
              <span className="soft-chip px-4 py-2 text-sm">Confidence output</span>
            </div>
          </div>

          <div className="muse-card muse-card-blue p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                <BrainIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Model</p>
                <h2 className="text-2xl font-semibold text-slate-900">Native Productivity Detector</h2>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-700">
              The detector maps your activity description into a simple productivity signal:
              <span className="font-semibold text-emerald-700"> POSITIVE </span>
              for stronger productive momentum and
              <span className="font-semibold text-rose-600"> NEGATIVE </span>
              for lower productive momentum.
            </p>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <motion.section custom={1} variants={fadeUp} className="muse-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Input</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Describe activity</h2>
            </div>
            <SparklesIcon className="h-5 w-5 text-cyan-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Describe what you worked on today..."
              className="input-field min-h-44 resize-none"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="soft-button rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Predict Productivity"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setResult(null);
                  setError("");
                  setNotice("");
                }}
                className="soft-button-secondary rounded-full px-5 py-3 text-sm"
              >
                Reset
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick examples</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {starterExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setText(example)}
                  className="rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-left text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section custom={2} variants={fadeUp} className="space-y-6">
          <div className="muse-card muse-card-peach p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prediction</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Detector output</h2>
              </div>
              {result ? (
                <div className={`soft-chip flex items-center gap-2 px-3 py-1 text-xs ${positive ? "text-emerald-700" : "text-rose-600"}`}>
                  {positive ? <TrendUpIcon className="h-4 w-4" /> : <TrendDownIcon className="h-4 w-4" />}
                  {result.predicted_label}
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-[1.3rem] border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-600">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-[1.3rem] border border-cyan-200 bg-cyan-50/80 p-4 text-sm text-cyan-700">
                {notice}
              </div>
            ) : null}

            {!result && !error && !notice ? (
              <div className="rounded-[1.5rem] border border-cyan-100 bg-white/70 p-5 text-sm leading-7 text-slate-600">
                Submit an activity description to see the predicted label and confidence score.
              </div>
            ) : null}

            {result ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="muse-mini-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Predicted Label</p>
                    <p className={`mt-3 text-3xl font-bold ${positive ? "text-emerald-700" : "text-rose-600"}`}>
                      {result.predicted_label}
                    </p>
                  </div>
                  <div className="muse-mini-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Confidence</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {(result.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="muse-mini-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Input</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{result.input}</p>
                </div>

                <div className="muse-mini-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Numeric Model Placeholder</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {result.numeric_metrics_placeholder?.message ||
                      "Task-count and focus-time metrics can be layered in here later."}
                  </p>
                </div>

                {result.signal_breakdown ? (
                  <div className="muse-mini-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Signal Breakdown</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Positive cues</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {result.signal_breakdown.matchedPositive?.length ? result.signal_breakdown.matchedPositive.join(", ") : "No strong positive cues detected."}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-rose-600">Negative cues</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {result.signal_breakdown.matchedNegative?.length ? result.signal_breakdown.matchedNegative.join(", ") : "No strong negative cues detected."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {result.source ? (
                  <div className="muse-mini-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Source</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {result.source === "frontend-local-fallback" ? "Local fallback detector" : "App backend detector"}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="muse-card muse-card-blue p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">How It Works</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <p>
                1. Write a short description of what your workday or session looked like.
              </p>
              <p>
                2. The app backend scores productive and unproductive signals from that text.
              </p>
              <p>
                3. You get a positive or negative productivity read with confidence and cue breakdown.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ProductivityDetectorPage;
