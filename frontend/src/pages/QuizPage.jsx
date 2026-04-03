import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { ArrowLeftIcon, ArrowRightIcon, BrainIcon, SparklesIcon } from "../components/V0Icons.jsx";

const buildQuestions = (user) => {
  const firstGoal = user?.goals?.[0] || "the future you want";
  const firstHabit = user?.habits?.[0] || "your current routine";
  const name = user?.name || "you";

  return [
    {
      key: "studyHours",
      eyebrow: "Deep Work Pattern",
      prompt: `When ${name} is serious about ${firstGoal}, how much focused work usually happens in a normal day?`,
      options: [
        { id: "study-1", label: "I mostly react to the day and struggle to start.", description: "Less than 2 real focused hours.", value: 1.5 },
        { id: "study-2", label: "I get one decent work block in.", description: "Around 2-4 focused hours.", value: 3 },
        { id: "study-3", label: "I usually make meaningful progress.", description: "Around 4-6 focused hours.", value: 5 },
        { id: "study-4", label: "I protect my priorities well.", description: "Around 6-8 focused hours.", value: 7 },
        { id: "study-5", label: "I operate like I am building something serious.", description: "More than 8 focused hours.", value: 9 }
      ]
    },
    {
      key: "sleepHours",
      eyebrow: "Recovery Rhythm",
      prompt: `How does sleep support or sabotage your progress toward ${firstGoal}?`,
      options: [
        { id: "sleep-1", label: "I am running on fumes most nights.", description: "Less than 5 hours.", value: 4.5 },
        { id: "sleep-2", label: "I survive, but not optimally.", description: "About 5-6 hours.", value: 5.5 },
        { id: "sleep-3", label: "It is decent but inconsistent.", description: "About 6-7 hours.", value: 6.5 },
        { id: "sleep-4", label: "I usually feel recovered enough to perform.", description: "About 7-8 hours.", value: 7.5 },
        { id: "sleep-5", label: "Recovery is one of my strengths.", description: "More than 8 hours.", value: 8.5 }
      ]
    },
    {
      key: "exercise",
      eyebrow: "Energy Signal",
      prompt: `Compared with ${firstHabit}, how much intentional movement is actually part of your week?`,
      options: [
        { id: "exercise-1", label: "Almost none", description: "Movement is not really part of my routine.", value: false },
        { id: "exercise-2", label: "A light restart", description: "1-2 sessions or walks a week.", value: true },
        { id: "exercise-3", label: "Fairly active", description: "3-4 times a week.", value: true },
        { id: "exercise-4", label: "Locked into my identity", description: "5+ times a week.", value: true }
      ]
    },
    {
      key: "screenTime",
      eyebrow: "Distraction Load",
      prompt: `Outside of important work, how much passive screen time steals energy from ${firstGoal}?`,
      options: [
        { id: "screen-1", label: "Very little", description: "Less than 2 hours.", value: 2 },
        { id: "screen-2", label: "Manageable drift", description: "Around 2-4 hours.", value: 4 },
        { id: "screen-3", label: "It is becoming a habit", description: "Around 4-6 hours.", value: 6 },
        { id: "screen-4", label: "It regularly eats my momentum", description: "Around 6-8 hours.", value: 8 },
        { id: "screen-5", label: "It dominates too much of my day", description: "More than 8 hours.", value: 10 }
      ]
    },
    {
      key: "consistency",
      eyebrow: "Execution Identity",
      prompt: `If someone watched you for 30 days, how consistent would your routine for ${firstGoal} actually look?`,
      options: [
        { id: "consistency-1", label: "Chaotic", description: "I break my own plans often.", value: 2 },
        { id: "consistency-2", label: "Unstable", description: "I follow through sometimes, but not reliably.", value: 4 },
        { id: "consistency-3", label: "Improving", description: "I have some structure, but it still slips.", value: 6 },
        { id: "consistency-4", label: "Strong", description: "I usually do what I said I would do.", value: 8 },
        { id: "consistency-5", label: "Relentless", description: "My routine is part of who I am.", value: 10 }
      ]
    },
    {
      key: "procrastination",
      eyebrow: "Resistance Pattern",
      prompt: `When the work really matters, how much does procrastination still control the pace?`,
      options: [
        { id: "procrastination-1", label: "Rarely", description: "I usually start without much resistance.", value: 2 },
        { id: "procrastination-2", label: "Sometimes", description: "I hesitate, but I recover fairly fast.", value: 4 },
        { id: "procrastination-3", label: "Often", description: "Delay is still a regular pattern.", value: 6 },
        { id: "procrastination-4", label: "Usually", description: "Starting is one of my biggest bottlenecks.", value: 8 },
        { id: "procrastination-5", label: "Almost always", description: "Resistance shapes the whole day.", value: 10 }
      ]
    },
    {
      key: "goalClarity",
      eyebrow: "Future Vision",
      prompt: `How clearly can you picture the next version of yourself you are actually trying to become?`,
      options: [
        { id: "goal-1", label: "Foggy", description: "I know I want change, but not what it looks like.", value: 2 },
        { id: "goal-2", label: "Loose", description: "I have ideas, but nothing sharp enough to guide action.", value: 4 },
        { id: "goal-3", label: "Decent", description: "I can describe it, but not always execute toward it.", value: 6 },
        { id: "goal-4", label: "Clear", description: "I know what I am aiming for and why it matters.", value: 8 },
        { id: "goal-5", label: "Crystal clear", description: "My next chapter is vivid and measurable.", value: 10 }
      ]
    }
  ];
};

const QuizPage = () => {
  const navigate = useNavigate();
  const { token, setUser, user } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questions = useMemo(() => buildQuestions(user), [user]);
  const currentQuestion = questions[index];
  const selected = selectedOptions[currentQuestion.key];
  const completion = Math.round(((index + 1) / questions.length) * 100);

  const handleNext = async () => {
    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.analyzeUser(token, answers);
      const dashboard = await api.getDashboard(token);
      setUser(dashboard.user);
      navigate("/futures");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-parallel-grid text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-200/22 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-200/22 blur-3xl" />
      </div>

      <header className="glass-light border-b border-cyan-200/30">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="soft-button flex h-10 w-10 items-center justify-center rounded-lg">
              <SparklesIcon className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-xl font-bold gradient-brand-text">Soul Scan</span>
          </div>
          <div className="text-sm text-slate-600">
            Question {index + 1} of {questions.length}
          </div>
        </div>
      </header>

      <div className="w-full bg-white/10">
        <div className="gradient-brand h-1 transition-all duration-500" style={{ width: `${completion}%` }} />
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="pastel-shell mb-5 rounded-[1.6rem] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-700">Personalized Read</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              This scan is calibrated around {user?.goals?.[0] || "your next chapter"} and the habits you shared, so the questions are trying to understand your real pattern, not just a generic productivity score.
            </p>
          </div>

          <div className="pastel-shell relative overflow-hidden rounded-2xl p-8">
            <div className="gradient-brand absolute left-0 right-0 top-0 h-1" />

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-200/40 bg-gradient-to-br from-cyan-100 to-emerald-100">
                <BrainIcon className="h-7 w-7 text-cyan-700" />
              </div>
              <div>
                <span className="text-sm font-medium text-cyan-700">{currentQuestion.eyebrow}</span>
                <h2 className="text-xl font-bold text-slate-900">{currentQuestion.prompt}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const active = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedOptions((current) => ({ ...current, [currentQuestion.key]: option.id }));
                      setAnswers((current) => ({ ...current, [currentQuestion.key]: option.value }));
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? "border-cyan-300/70 bg-white/78 shadow-[0_18px_35px_rgba(125,211,252,0.14)]"
                        : "border-cyan-100/80 bg-white/56 hover:border-cyan-200/80 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-cyan-600" : "border-slate-400"}`}>
                        {active ? <div className="h-2.5 w-2.5 rounded-full bg-cyan-600" /> : null}
                      </div>
                      <div>
                        <p className={active ? "text-slate-900" : "text-slate-800"}>{option.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              disabled={index === 0 || submitting}
              className="soft-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 hover:bg-white/90"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {questions.map((_, dotIndex) => (
                <div key={dotIndex} className={`h-2 w-2 rounded-full ${dotIndex <= index ? "bg-cyan-200" : "bg-white/10"}`} />
              ))}
            </div>

            <button
              type="button"
              disabled={typeof selected === "undefined" || submitting}
              onClick={handleNext}
              className="soft-button inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "Analyzing..." : index === questions.length - 1 ? "See My Future" : "Next"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizPage;
