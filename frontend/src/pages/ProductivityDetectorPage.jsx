import { useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios.js";
import { BrainIcon, SparklesIcon, TrendDownIcon, TrendUpIcon } from "../components/V0Icons.jsx";

const PRODUCTIVITY_API_URL = import.meta.env.VITE_PRODUCTIVITY_API_URL || "http://127.0.0.1:8000";

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

const ProductivityDetectorPage = () => {
  const [text, setText] = useState(starterExamples[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const input = text.trim();
    if (!input || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${PRODUCTIVITY_API_URL}/predict`, {
        text: input
      });
      setResult(response.data);
    } catch (requestError) {
      setError(
        requestError.message ||
          `Unable to reach productivity detector at ${PRODUCTIVITY_API_URL}. Start the FastAPI service and try again.`
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
              This uses a FastAPI service on <span className="font-semibold">localhost:8000</span> with a Hugging Face transformer pipeline and returns a productivity-style positive or negative prediction with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="soft-chip px-4 py-2 text-sm">FastAPI REST API</span>
              <span className="soft-chip px-4 py-2 text-sm">Transformers pipeline</span>
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
                <h2 className="text-2xl font-semibold text-slate-900">DistilBERT Proxy</h2>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-700">
              The detector maps the model sentiment output into a simple productivity signal:
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

            {!result && !error ? (
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
                      "RandomForest/XGBoost integration can be added here for numeric productivity metrics."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="muse-card muse-card-blue p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Run Locally</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <p>
                1. Install Python dependencies from
                <span className="font-semibold"> services/productivity-detector/requirements.txt</span>
              </p>
              <p>
                2. Start FastAPI with
                <span className="font-semibold"> python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload</span>
              </p>
              <p>
                3. Open this website and click the detector icon in the top header.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ProductivityDetectorPage;
