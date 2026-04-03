import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from "../components/V0Icons.jsx";
import {
  buildLocalDashboardFallback,
  clearLocalDashboardFallback,
  saveLocalDashboardFallback
} from "../utils/localDashboardFallback.js";
import { analyzeScenarioResponses, generateDynamicScenarios } from "../utils/dynamicQuizModel.js";

const MIN_ANSWER_LENGTH = 30;

const calculateLevel = (totalXp) => Math.min(10, Math.floor(totalXp / 400) + 1);

const getPrimaryValue = (value, fallback) => {
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }

  return value || fallback;
};

const QuizPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [draft, setDraft] = useState("");
  const [xp, setXp] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const scenarios = useMemo(() => generateDynamicScenarios(user), [user]);
  const currentScenario = scenarios[currentIndex];
  const completion = scenarios.length ? Math.round(((currentIndex + 1) / scenarios.length) * 100) : 0;
  const level = calculateLevel(xp);
  const firstGoal = getPrimaryValue(user?.goals, "your next chapter");
  const firstHabit = getPrimaryValue(user?.habits, "your current routine");

  useEffect(() => {
    if (!currentScenario) {
      return;
    }

    setDraft(responses[currentScenario.id]?.answer || "");
    setError("");
  }, [currentScenario, responses]);

  const persistCurrentDraft = () => {
    if (!currentScenario) {
      return null;
    }

    const trimmed = draft.trim();
    return {
      questionId: currentScenario.id,
      category: currentScenario.category,
      answer: trimmed
    };
  };

  const handleBack = () => {
    if (currentIndex === 0 || submitting) {
      return;
    }

    const savedResponse = persistCurrentDraft();
    if (savedResponse?.answer) {
      setResponses((current) => ({ ...current, [currentScenario.id]: savedResponse }));
    }

    setCurrentIndex((value) => value - 1);
  };

  const handleNext = async () => {
    const trimmed = draft.trim();
    if (trimmed.length < MIN_ANSWER_LENGTH) {
      setError(`Please write at least ${MIN_ANSWER_LENGTH} characters so the analysis has enough depth.`);
      return;
    }

    const savedResponse = {
      questionId: currentScenario.id,
      category: currentScenario.category,
      answer: trimmed
    };

    const answerXp = 40 + Math.min(50, Math.floor(trimmed.length / 15));
    setResponses((current) => ({ ...current, [currentScenario.id]: savedResponse }));
    setXp((current) => current + answerXp);
    setError("");

    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    const orderedResponses = scenarios.map((scenario) =>
      scenario.id === currentScenario.id ? savedResponse : responses[scenario.id]
    );

    const analysis = analyzeScenarioResponses({
      answers: orderedResponses.filter(Boolean),
      user
    });
    const payload = {
      ...analysis.behaviorProfile,
      quizAssessment: {
        archetype: analysis.archetype,
        summary: analysis.summary,
        xpGained: analysis.xpGained,
        traits: analysis.traits,
        patterns: analysis.patterns,
        scenarioAnswers: orderedResponses.filter(Boolean)
      }
    };

    setSubmitting(true);

    try {
      await api.analyzeUser(token, payload);
      clearLocalDashboardFallback();
      navigate("/dashboard", { replace: true });
    } catch {
      const fallbackDashboard = buildLocalDashboardFallback({
        user,
        answers: analysis.behaviorProfile,
        quizAssessment: payload.quizAssessment
      });
      saveLocalDashboardFallback(fallbackDashboard);
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentScenario) {
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-parallel-grid text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[12%] top-[18%] h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-[10%] right-[12%] h-80 w-80 rounded-full bg-pink-200/24 blur-3xl" />
      </div>

      <header className="glass-light border-b border-emerald-200/40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="soft-button flex h-10 w-10 items-center justify-center rounded-lg">
              <SparklesIcon className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">FutureSync</p>
              <p className="text-sm font-semibold text-slate-900">Behavioral Scenario Scan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-emerald-200/70 bg-white/60 px-3 py-1">
              XP {xp}
            </span>
            <span className="rounded-full border border-emerald-200/70 bg-white/60 px-3 py-1">
              Lv. {level}
            </span>
          </div>
        </div>
      </header>

      <div className="w-full bg-white/10">
        <div className="gradient-brand h-1 transition-all duration-500" style={{ width: `${completion}%` }} />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="mb-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="pastel-shell rounded-[1.8rem] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Personalized Setup</p>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">
                We are mapping how you respond under pressure, uncertainty, growth, and ambition.
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                This version of the quiz is built around <span className="font-semibold text-slate-900">{firstGoal}</span> and
                the routine you described around <span className="font-semibold text-slate-900">{firstHabit}</span>, so the output
                feels more like a real behavioral read than a generic productivity form.
              </p>
            </div>

            <div className="pastel-shell rounded-[1.8rem] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Progress</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">
                {currentIndex + 1}
                <span className="text-lg font-medium text-slate-500">/{scenarios.length}</span>
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Long-form answers unlock a better dashboard prediction and stronger local fallback if the API is down.
              </p>
            </div>
          </div>

          <div className="pastel-shell relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="gradient-brand absolute left-0 right-0 top-0 h-1" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  {currentScenario.category}
                </p>
                <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-slate-950">
                  {currentScenario.prompt}
                </h2>
              </div>

              <div className="rounded-2xl border border-emerald-200/70 bg-white/60 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Question</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {currentIndex + 1} of {scenarios.length}
                </p>
              </div>
            </div>

            <textarea
              rows={8}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a detailed response. Explain what you would do, why you would do it, and what tradeoffs you would consider."
              className="min-h-[220px] w-full rounded-[1.4rem] border border-emerald-100/90 bg-white/72 px-5 py-4 text-base leading-7 text-slate-800 shadow-[0_18px_40px_rgba(148,163,184,0.08)] outline-none transition focus:border-emerald-300 focus:bg-white"
            />

            <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-600">
              <span>{draft.trim().length} characters</span>
              <span>Minimum {MIN_ANSWER_LENGTH} recommended for accurate analysis</span>
            </div>

            {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentIndex === 0 || submitting}
              className="soft-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 hover:bg-white/90"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {scenarios.map((scenario, dotIndex) => {
                const hasResponse = Boolean(responses[scenario.id]?.answer) || (dotIndex === currentIndex && draft.trim().length >= MIN_ANSWER_LENGTH);
                return (
                  <div
                    key={scenario.id}
                    className={`h-2.5 rounded-full transition-all ${hasResponse ? "w-6 bg-emerald-300" : dotIndex === currentIndex ? "w-6 bg-pink-200" : "w-2.5 bg-white/20"}`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="soft-button inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "Analyzing..." : currentIndex === scenarios.length - 1 ? "See My Future" : "Next"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizPage;
