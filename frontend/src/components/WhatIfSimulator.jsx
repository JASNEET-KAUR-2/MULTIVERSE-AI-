import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api/client";
import { SparklesIcon, TrendDownIcon, TrendUpIcon } from "./V0Icons.jsx";

const labelTone = {
  High: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  Average: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  Negative: "border-rose-300/20 bg-rose-300/10 text-rose-200",
  Pending: "border-white/10 bg-white/5 text-slate-300"
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const presets = [
  {
    id: "Exam Week",
    values: {
      studyHours: 8,
      sleepHours: 6.5,
      exercise: false,
      consistency: 8,
      procrastination: 4,
      goalClarity: 8
    }
  },
  {
    id: "Burnout Recovery",
    values: {
      studyHours: 5,
      sleepHours: 8.5,
      exercise: true,
      consistency: 6,
      procrastination: 3,
      goalClarity: 7
    }
  },
  {
    id: "Discipline Mode",
    values: {
      studyHours: 7,
      sleepHours: 7.5,
      exercise: true,
      consistency: 9,
      procrastination: 2,
      goalClarity: 9
    }
  },
  {
    id: "Deep Work Reset",
    values: {
      studyHours: 6,
      sleepHours: 7.5,
      exercise: true,
      consistency: 8,
      procrastination: 3,
      goalClarity: 8
    }
  },
  {
    id: "Career Sprint",
    values: {
      studyHours: 9,
      sleepHours: 7,
      exercise: true,
      consistency: 9,
      procrastination: 2,
      goalClarity: 10
    }
  }
];

const buildFixedFuture = (behavior = {}) => ({
  studyHours: clamp(Number(behavior.studyHours || 0) + 2, 1, 10),
  sleepHours: clamp(Math.max(Number(behavior.sleepHours || 0), 7.5), 4, 10),
  exercise: true,
  consistency: clamp(Number(behavior.consistency || 0) + 2, 1, 10),
  procrastination: clamp(Number(behavior.procrastination || 0) - 2, 1, 10),
  goalClarity: clamp(Number(behavior.goalClarity || 0) + 2, 1, 10)
});

const controlRows = [
  { key: "studyHours", label: "Study Hours", min: 1, max: 10 },
  { key: "sleepHours", label: "Sleep Hours", min: 4, max: 10, step: 0.5 },
  { key: "consistency", label: "Consistency", min: 1, max: 10 },
  { key: "procrastination", label: "Procrastination", min: 1, max: 10 },
  { key: "goalClarity", label: "Goals", min: 1, max: 10 }
];

const formatSimulationTime = (value) => new Date(value).toLocaleString();

const WhatIfSimulator = ({ token, behaviorProfile = {}, currentPrediction = {}, currentStory = "", simulationHistory = [] }) => {
  const [form, setForm] = useState(() => ({
    studyHours: clamp(Number(behaviorProfile.studyHours || 4), 1, 10),
    sleepHours: clamp(Number(behaviorProfile.sleepHours || 7), 4, 10),
    exercise: Boolean(behaviorProfile.exercise),
    consistency: clamp(Number(behaviorProfile.consistency || 5), 1, 10),
    procrastination: clamp(Number(behaviorProfile.procrastination || 5), 1, 10),
    goalClarity: clamp(Number(behaviorProfile.goalClarity || 5), 1, 10)
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const currentCard = useMemo(
    () => ({
      prediction: currentPrediction.label || "Pending",
      story: currentStory || "Complete your scan to unlock your current future story.",
      score: Math.round(((currentPrediction.probabilities?.High || 0) * 100) || 0)
    }),
    [currentPrediction, currentStory]
  );

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: key === "exercise" ? value : Number(value)
    }));
  };

  const handleSimulate = async (payload = form, presetMode = "") => {
    try {
      setLoading(true);
      setError("");
      const response = await api.simulateFuture(token, {
        ...payload,
        presetMode
      });
      setResult(response);
    } catch (simulationError) {
      setError(simulationError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFixMyFuture = async () => {
    const improved = buildFixedFuture(form);
    setForm(improved);
    await handleSimulate(improved, "Fix My Future");
  };

  const applyPreset = async (preset) => {
    setForm(preset.values);
    await handleSimulate(preset.values, preset.id);
  };

  const replayHistoryEntry = async (entry) => {
    const replayValues = {
      studyHours: entry.behaviorProfile?.studyHours ?? form.studyHours,
      sleepHours: entry.behaviorProfile?.sleepHours ?? form.sleepHours,
      exercise: Boolean(entry.behaviorProfile?.exercise),
      consistency: entry.behaviorProfile?.consistency ?? form.consistency,
      procrastination: entry.behaviorProfile?.procrastination ?? form.procrastination,
      goalClarity: entry.behaviorProfile?.goalClarity ?? form.goalClarity
    };
    setForm(replayValues);
    await handleSimulate(replayValues, entry.presetMode || "History Replay");
  };

  const comparison = result || {
    current: currentCard,
    simulated: {
      prediction: "Pending",
      story: "Adjust the sliders and run a simulation to see your alternate reality.",
      score: 0
    },
    improvement: {
      delta: 0,
      label: "No simulation yet"
    },
    topContributor: null,
    history: simulationHistory
  };

  return (
    <div className="dynamic-panel rounded-[1.8rem] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">What If Simulator</p>
          <h2 className="mt-2 text-2xl font-semibold">Simulate Alternate Reality</h2>
        </div>
        <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs text-fuchsia-100">
          {comparison.improvement.label}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            disabled={loading}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:opacity-70"
          >
            {preset.id}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {controlRows.map((control) => (
            <label key={control.key} className="block rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-200">{control.label}</span>
                <span className="text-cyan-200">{form[control.key]}</span>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step || 1}
                value={form[control.key]}
                onChange={(event) => updateField(control.key, event.target.value)}
                className="w-full accent-cyan-300"
              />
            </label>
          ))}

          <div className="rounded-[1.2rem] border border-white/8 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-200">Exercise</span>
              <span className="text-cyan-200">{form.exercise ? "Yes" : "No"}</span>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-black/15 p-1">
              {[
                { label: "No", value: false },
                { label: "Yes", value: true }
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => updateField("exercise", option.value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${form.exercise === option.value ? "bg-cyan-300/15 text-cyan-100" : "text-slate-400"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSimulate()}
              disabled={loading}
              className="gradient-brand rounded-xl px-5 py-3 font-semibold text-slate-950 disabled:opacity-70"
            >
              {loading ? "Analyzing your alternate future..." : "Simulate New Future"}
            </button>
            <button
              type="button"
              onClick={handleFixMyFuture}
              disabled={loading}
              className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-100 disabled:opacity-70"
            >
              Fix My Future
            </button>
          </div>

          {comparison.topContributor ? (
            <div className="rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Top Contributor</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {comparison.topContributor.label} {comparison.topContributor.delta > 0 ? `(+${comparison.topContributor.delta})` : `(${comparison.topContributor.delta})`}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{comparison.topContributor.explanation}</p>
            </div>
          ) : null}

          {error ? <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-200">{error}</div> : null}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid min-h-[24rem] place-items-center rounded-[1.4rem] border border-white/8 bg-white/5 p-6 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30"
              >
                <SparklesIcon className="h-5 w-5 text-cyan-200" />
              </motion.div>
              <p className="text-lg font-medium text-white">Analyzing your alternate future...</p>
              <p className="mt-2 text-sm text-slate-400">Projecting how your changed habits reshape the next timeline.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current Future</p>
                  <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs ${labelTone[comparison.current.prediction] || labelTone.Pending}`}>
                    {comparison.current.prediction}
                  </div>
                  <p className="mt-4 text-3xl font-bold text-white">{comparison.current.score}/100</p>
                  <motion.p key={`current-${comparison.current.prediction}`} initial={{ opacity: 0.25 }} animate={{ opacity: 1 }} className="mt-4 text-sm leading-7 text-slate-300">
                    {comparison.current.story}
                  </motion.p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={comparison.simulated.prediction + comparison.simulated.story}
                    initial={{ opacity: 0, x: 22 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    className="rounded-[1.4rem] border border-cyan-300/15 bg-cyan-300/6 p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Simulated Future</p>
                    <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs ${labelTone[comparison.simulated.prediction] || labelTone.Pending}`}>
                      {comparison.simulated.prediction}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <p className="text-3xl font-bold text-white">{comparison.simulated.score}/100</p>
                      <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${comparison.improvement.delta >= 0 ? "bg-emerald-300/10 text-emerald-200" : "bg-rose-300/10 text-rose-200"}`}>
                        {comparison.improvement.delta >= 0 ? <TrendUpIcon className="h-3.5 w-3.5" /> : <TrendDownIcon className="h-3.5 w-3.5" />}
                        {comparison.improvement.label}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{comparison.simulated.story}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent Simulation History</p>
                  <span className="text-xs text-slate-400">{(comparison.history || []).length} saved</span>
                </div>
                <div className="space-y-3">
                  {(comparison.history || []).slice(0, 4).map((entry) => (
                    <div key={entry._id || `${entry.createdAt}-${entry.prediction}`} className="rounded-[1rem] border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{entry.presetMode || "Custom Simulation"}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatSimulationTime(entry.createdAt)}</p>
                        </div>
                        <div className={`rounded-full border px-3 py-1 text-xs ${labelTone[entry.prediction] || labelTone.Pending}`}>
                          {entry.prediction}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">{entry.improvementDelta >= 0 ? `+${entry.improvementDelta}` : entry.improvementDelta}% outcome shift</p>
                      {entry.topContributor?.label ? (
                        <p className="mt-2 text-xs text-slate-400">
                          Biggest driver: {entry.topContributor.label}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => replayHistoryEntry(entry)}
                        disabled={loading}
                        className="mt-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-70"
                      >
                        Replay This Scenario
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
