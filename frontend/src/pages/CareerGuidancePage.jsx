import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, BrainIcon, BriefcaseIcon, SparklesIcon, TargetIcon, TrophyIcon, TrendUpIcon } from "../components/V0Icons.jsx";

const buisesSteps = [
  {
    letter: "B",
    title: "Baseline Assessment",
    description: "Start with skills, education, experience, and optional resume context to map your current state."
  },
  {
    letter: "U",
    title: "Understanding Goals",
    description: "Turn vague short-term and long-term ambitions into clear roles, milestones, and required skills."
  },
  {
    letter: "I",
    title: "Insights",
    description: "See skill gaps against target roles, track match score, and highlight where growth matters most."
  },
  {
    letter: "S",
    title: "Suggestions",
    description: "Get personalized learning moves like courses, projects, certifications, and weekly actions."
  },
  {
    letter: "E",
    title: "Evaluation",
    description: "Score mini-assessments, identify weak areas, and adapt recommendations based on performance."
  },
  {
    letter: "S",
    title: "Skill Plan",
    description: "Build a roadmap with milestones, progress tracking, and a momentum loop that rewards follow-through."
  }
];

const gamificationHighlights = [
  "Backend-persisted points, streaks, badges, and mastery state",
  "Automatic rewards after each BUISES checkpoint",
  "Manual challenge actions for quizzes, projects, and lessons",
  "Skill tree growth and badge unlock celebrations",
  "PDF-ready roadmap export in the standalone lab"
];

const launchCards = [
  {
    title: "Career Lab",
    body: "Open the guided career-planning flow with AI-assisted recommendations and roadmap generation.",
    to: "/growth",
    icon: BriefcaseIcon,
    label: "Open growth hub"
  },
  {
    title: "Future Scan",
    body: "Feed better inputs into your career path by refreshing the behavior scan and prediction model.",
    to: "/quiz",
    icon: SparklesIcon,
    label: "Run scan"
  },
  {
    title: "Planner Sync",
    body: "Convert roadmap steps into practical task execution with your daily planner and task board.",
    to: "/planner",
    icon: TargetIcon,
    label: "Open planner"
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, delay: index * 0.07, ease: "easeOut" }
  })
};

const CareerGuidancePage = () => (
  <motion.div initial="hidden" animate="visible" className="space-y-6">
    <motion.section custom={0} variants={fadeUp} className="hero-shell relative overflow-hidden rounded-[2rem] border border-cyan-200/30 px-6 py-7 md:px-8">
      <div className="hero-orb hero-orb-cyan" />
      <div className="hero-orb hero-orb-rose" />
      <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-700">Career Intelligence</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
            BUISES career guidance with a <span className="gradient-brand-text">gamified growth loop</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
            This feature turns career planning into an interactive system: assess your baseline, clarify goals, uncover gaps,
            generate recommendations, test yourself, and keep momentum with points, streaks, badges, and mastery progress.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/growth" className="gradient-brand inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold text-slate-950">
              View growth dashboard
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/planner" className="inline-flex items-center rounded-full border border-cyan-200 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5">
              Roadmap to planner
            </Link>
          </div>
        </div>

        <div className="dynamic-panel rounded-[1.8rem] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <BrainIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">What changed</p>
              <h2 className="text-2xl font-semibold text-slate-900">Native product entry</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-cyan-100 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rewards</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Points, streaks, badges</p>
            </div>
            <div className="rounded-[1.3rem] border border-cyan-100 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Skill tree mastery</p>
            </div>
            <div className="rounded-[1.3rem] border border-cyan-100 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workflow</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Assessment to roadmap</p>
            </div>
            <div className="rounded-[1.3rem] border border-cyan-100 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Output</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Actionable growth plan</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>

    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <motion.section custom={1} variants={fadeUp} className="dynamic-panel rounded-[1.8rem] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System Flow</p>
            <h2 className="mt-2 text-2xl font-semibold">BUISES journey</h2>
          </div>
          <div className="soft-chip px-3 py-1 text-xs text-cyan-700">6 stages</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {buisesSteps.map((step) => (
            <div key={`${step.letter}-${step.title}`} className="rounded-[1.4rem] border border-cyan-100 bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 font-bold text-cyan-700">
                  {step.letter}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{step.title}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{step.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section custom={2} variants={fadeUp} className="dynamic-panel rounded-[1.8rem] p-6">
        <div className="mb-5 flex items-center gap-3">
          <TrophyIcon className="h-5 w-5 text-amber-700" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gamification Layer</p>
            <h2 className="mt-2 text-2xl font-semibold">Momentum system</h2>
          </div>
        </div>
        <div className="space-y-3">
          {gamificationHighlights.map((item) => (
            <div key={item} className="rounded-[1.3rem] border border-cyan-100 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <TrendUpIcon className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-semibold text-slate-900">Integrated with the rest of the workspace</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Use Future Scan for inputs, Growth for rewards, and Planner for execution.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>

    <motion.section custom={3} variants={fadeUp} className="grid gap-6 md:grid-cols-3">
      {launchCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.title} to={card.to} className="pastel-shell rounded-[1.8rem] p-6 transition-transform duration-200 hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
            <div className="mt-5 inline-flex items-center text-sm font-semibold text-cyan-700">
              {card.label}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </div>
          </Link>
        );
      })}
    </motion.section>
  </motion.div>
);

export default CareerGuidancePage;
