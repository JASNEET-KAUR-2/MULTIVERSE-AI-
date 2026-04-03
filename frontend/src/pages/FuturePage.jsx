import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AlertIcon,
  BriefcaseIcon,
  BranchIcon,
  CheckCircleIcon,
  HeartIcon,
  HouseIcon,
  SparklesIcon,
  TrendDownIcon,
  TrendUpIcon,
  TrophyIcon,
  XCircleIcon
} from "../components/V0Icons.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import FutureSnapshotShare from "../components/FutureSnapshotShare.jsx";

const timelines = ["1 Year", "5 Years", "10 Years", "20 Years"];

const getTimelineFallback = (dashboard, selectedTimeline) => {
  const name = dashboard?.user?.name || "You";
  const prediction = dashboard?.prediction?.label || "Average";
  const goal = dashboard?.user?.goals?.[0] || "your goals";
  const habit = dashboard?.user?.habits?.[0] || "better habits";
  const sleepHours = dashboard?.behaviorProfile?.sleepHours || 7;
  const studyHours = dashboard?.behaviorProfile?.studyHours || 4;
  const negativeRisk = Math.round((dashboard?.prediction?.probabilities?.Negative || 0) * 100);

  const fallbackByTimeline = {
    "1 Year": {
      bestTitle: prediction === "High" ? "The Rising Version" : "The Rebuilding Version",
      riskTitle: "The Distracted Version",
      bestStory: `Within the next year, ${name} starts to feel more in control. ${studyHours} hours of focused work and ${sleepHours} hours of sleep begin to turn ${goal} into visible progress, and ${habit} becomes something people notice rather than something ${name.toLowerCase()} only intends to do.`,
      riskStory: `Within the next year, ${name} still wants change but keeps losing momentum to delay, inconsistency, and scattered effort. The result is frustration because the gap between potential and execution stays obvious.`,
      futureMessage: `1 year from now: the biggest win is not perfection, it is finally trusting your own routine.`,
      bestCareerOutcome: "Momentum building",
      riskCareerOutcome: "Momentum delayed",
      bestLifestyleIndicators: [
        { label: "Career", value: prediction === "High" ? "Strong early upside" : "Steady improvement" },
        { label: "Health Score", value: `${Math.max(45, sleepHours * 10)}/100` },
        { label: "Living Situation", value: "More structured" },
        { label: "Focus Score", value: `${Math.max(40, studyHours * 12)}/100` }
      ],
      riskLifestyleIndicators: [
        { label: "Career Status", value: "Slow start" },
        { label: "Health Score", value: `${Math.max(25, sleepHours * 10 - 18)}/100` },
        { label: "Living Situation", value: "Still reactive" },
        { label: "Risk Load", value: `${negativeRisk}%` }
      ]
    },
    "5 Years": {
      bestTitle: dashboard?.analysis?.personalityType || "The Achiever",
      riskTitle: "The Stagnant",
      bestStory: dashboard?.simulation?.futureStory || `In five years, ${name} has turned disciplined routines into real compounding progress around ${goal}.`,
      riskStory: dashboard?.simulation?.alternateStory || `In five years, ${name} is still paying the price for habits that never stabilized.`,
      futureMessage:
        dashboard?.simulation?.futureMessage || "My future self says I should stay focused and protect my best timeline.",
      bestCareerOutcome: prediction === "High" ? "Leadership track" : "Stable career growth",
      riskCareerOutcome: "Stalled progress",
      bestLifestyleIndicators: [
        { label: "Career", value: prediction },
        { label: "Health Score", value: `${Math.max(40, sleepHours * 10)}/100` },
        { label: "Living Situation", value: "Stable upward trajectory" },
        { label: "Net Worth", value: prediction === "High" ? "Compounding upward" : "Improving steadily" }
      ],
      riskLifestyleIndicators: [
        { label: "Career Status", value: "Momentum slowed" },
        { label: "Health Score", value: `${Math.max(20, 100 - (dashboard?.behaviorProfile?.screenTime || 0) * 8)}/100` },
        { label: "Living Situation", value: "Reactive not intentional" },
        { label: "Risk Load", value: `${negativeRisk}%` }
      ]
    },
    "10 Years": {
      bestTitle: prediction === "High" ? "The Trusted Expert" : "The Grounded Builder",
      riskTitle: "The Plateaued Self",
      bestStory: `Ten years from now, ${name} is defined less by talent and more by repeatable standards. ${goal} has matured into real credibility, and ${habit} has become part of ${name.toLowerCase()}'s identity rather than a phase.`,
      riskStory: `Ten years from now, the cost of inconsistency becomes harder to hide. ${name} is capable, but the lack of durable systems leaves life feeling like repeated restarts instead of long-term expansion.`,
      futureMessage: `10 years from now: the systems you repeat quietly today will decide your identity more than any one big opportunity.`,
      bestCareerOutcome: "Trusted expert path",
      riskCareerOutcome: "Plateaued trajectory",
      bestLifestyleIndicators: [
        { label: "Career", value: "Recognized expertise" },
        { label: "Health Score", value: `${Math.max(50, sleepHours * 10 + 5)}/100` },
        { label: "Living Situation", value: "Self-directed stability" },
        { label: "Influence", value: prediction === "High" ? "Growing strongly" : "Built steadily" }
      ],
      riskLifestyleIndicators: [
        { label: "Career Status", value: "Plateau risk" },
        { label: "Health Score", value: `${Math.max(20, sleepHours * 10 - 20)}/100` },
        { label: "Living Situation", value: "Held back by drift" },
        { label: "Risk Load", value: `${Math.min(99, negativeRisk + 8)}%` }
      ]
    },
    "20 Years": {
      bestTitle: prediction === "High" ? "The Legacy Builder" : "The Long Game Self",
      riskTitle: "The Unlived Potential",
      bestStory: `Twenty years from now, ${name} can clearly see how small disciplined choices shaped an entire life. ${goal} is no longer just ambition; it becomes legacy. The strongest difference is that ${name.toLowerCase()} built a life with intention instead of spending decades reacting.`,
      riskStory: `Twenty years from now, the painful part is not failure but unrealized potential. Without stable habits, ${name} looks back at how often comfort interrupted growth, and the future feels smaller than it could have been.`,
      futureMessage: `20 years from now: your future is not built in one dramatic leap, it is built by what you repeat when nobody is watching.`,
      bestCareerOutcome: "Legacy-level impact",
      riskCareerOutcome: "Legacy weakened by drift",
      bestLifestyleIndicators: [
        { label: "Career", value: "Long-term influence" },
        { label: "Health Score", value: `${Math.max(48, sleepHours * 10)}/100` },
        { label: "Living Situation", value: "Aligned and intentional" },
        { label: "Legacy", value: prediction === "High" ? "Clearly compounding" : "Meaningfully built" }
      ],
      riskLifestyleIndicators: [
        { label: "Career Status", value: "Potential underused" },
        { label: "Health Score", value: `${Math.max(20, sleepHours * 10 - 24)}/100` },
        { label: "Living Situation", value: "Constrained by old patterns" },
        { label: "Risk Load", value: `${Math.min(99, negativeRisk + 12)}%` }
      ]
    }
  };

  return fallbackByTimeline[selectedTimeline] || fallbackByTimeline["5 Years"];
};

const FuturePage = () => {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("5 Years");

  useEffect(() => {
    api
      .getDashboard(token)
      .then((response) => {
        setDashboard(response);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [token]);

  const bestAchievements = useMemo(
    () =>
      dashboard?.analysis?.strengths?.length
        ? dashboard.analysis.strengths
        : ["Maintained focus under pressure", "Built strong momentum", "Stayed aligned with long-term goals"],
    [dashboard]
  );

  const negativeHabits = useMemo(
    () =>
      dashboard?.analysis?.weaknesses?.length
        ? dashboard.analysis.weaknesses
        : ["Ignored compounding habits", "Chose comfort over growth", "Delayed difficult but meaningful work"],
    [dashboard]
  );

  const selectedVariant = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    return dashboard.simulation?.timelineVariants?.[selectedTimeline] || getTimelineFallback(dashboard, selectedTimeline);
  }, [dashboard, selectedTimeline]);

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-400">Loading futures...</div>;
  }

  if (error) {
    return <div className="glass rounded-2xl p-6 text-rose-300">{error}</div>;
  }

  return (
    <div className="muse-page">
      <div className="muse-card muse-card-peach p-8 text-center" data-ambient-scene="Future Paths" data-ambient-intensity="0.27">
        <h1 className="mb-2 text-3xl font-bold">
          Your <span className="gradient-brand-text">Future Paths</span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400">
          Based on your Soul Scan, our AI has simulated two possible timelines. Your choices today determine which path becomes your reality.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="muse-card inline-flex items-center gap-1 rounded-[1.4rem] p-1">
          {timelines.map((timeline) => (
            <button
              key={timeline}
              type="button"
              onClick={() => setSelectedTimeline(timeline)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedTimeline === timeline ? "gradient-brand text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              {timeline}
            </button>
          ))}
        </div>
      </div>

      <div className="muse-grid-two">
        <div className="muse-card muse-card-mint relative overflow-hidden">
          <div className="gradient-success h-2" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative p-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5">
              <SparklesIcon className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-medium text-emerald-300">Best Timeline</span>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <UserAvatar name={dashboard.user?.name} className="h-20 w-20 text-xl" />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0a0a1a] bg-emerald-300">
                  <TrophyIcon className="h-4 w-4 text-slate-950" />
                </div>
              </div>
                <div>
                <h3 className="text-xl font-bold">Future {dashboard.user?.name || "You"}</h3>
                <p className="text-sm text-emerald-300">
                  {selectedVariant?.bestTitle || dashboard.analysis?.personalityType || "The Achiever"}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-emerald-300/20 bg-white/5 p-4">
              <h4 className="mb-2 text-sm font-medium text-emerald-300">AI-Generated Success Story</h4>
              <p className="text-sm leading-relaxed text-slate-400">
                {selectedVariant?.bestStory || "Complete a scan to unlock your best possible future."}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Career Outcome</h4>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-300/20">
                    <BriefcaseIcon className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {selectedVariant?.bestCareerOutcome || (dashboard.prediction?.label === "High" ? "Leadership Track" : "Stable Career Growth")}
                    </p>
                    <p className="text-sm text-slate-400">{selectedTimeline} outlook shaped by your current choices</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Lifestyle Indicators</h4>
              <div className="grid grid-cols-2 gap-3">
                {(selectedVariant?.bestLifestyleIndicators || []).map((item) => {
                  const iconMap = {
                    Career: BriefcaseIcon,
                    "Health Score": HeartIcon,
                    "Living Situation": HouseIcon,
                    "Focus Score": TrendUpIcon,
                    Influence: TrendUpIcon,
                    Legacy: TrophyIcon,
                    "Net Worth": TrendUpIcon
                  };
                  const Icon = iconMap[item.label] || TrendUpIcon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-emerald-300" />
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  );
                })}
                {!selectedVariant?.bestLifestyleIndicators?.length &&
                  [
                    { label: "Career", value: dashboard.prediction?.label || "High Future", icon: BriefcaseIcon },
                    { label: "Health Score", value: `${Math.max(40, (dashboard.behaviorProfile?.sleepHours || 0) * 10)}/100`, icon: HeartIcon },
                    { label: "Living Situation", value: "Stable upward trajectory", icon: HouseIcon },
                    { label: "Net Worth", value: dashboard.prediction?.label === "High" ? "Compounding upward" : "Improving steadily", icon: TrendUpIcon }
                  ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-emerald-300" />
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  );
                  })}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium">Key Achievements</h4>
              <div className="space-y-2">
                {bestAchievements.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                    <span className="text-sm text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="muse-card muse-card-blue relative overflow-hidden">
          <div className="gradient-danger h-2" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-pink-300/10 blur-3xl" />
          <div className="relative p-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-300/30 bg-pink-300/10 px-3 py-1.5">
              <AlertIcon className="h-4 w-4 text-pink-300" />
              <span className="text-sm font-medium text-pink-300">Risk Timeline</span>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <UserAvatar name={`Shadow ${dashboard.user?.name || "You"}`} className="h-20 w-20 text-xl opacity-80" />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0a0a1a] bg-rose-400">
                  <TrendDownIcon className="h-4 w-4 text-slate-950" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-300">Shadow {dashboard.user?.name || "You"}</h3>
                <p className="text-sm text-pink-300">{selectedVariant?.riskTitle || "The Stagnant"}</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-pink-300/20 bg-white/5 p-4">
              <h4 className="mb-2 text-sm font-medium text-pink-300">AI-Generated Warning Story</h4>
              <p className="text-sm leading-relaxed text-slate-400">
                {selectedVariant?.riskStory || "The risk path appears after your first analysis."}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Career Outcome</h4>
              <div className="rounded-xl border border-pink-300/20 bg-pink-300/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-300/20">
                    <BranchIcon className="h-6 w-6 text-pink-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300">{selectedVariant?.riskCareerOutcome || "Stalled Progress"}</p>
                    <p className="text-sm text-slate-400">{selectedTimeline} risk if habits drift</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium">Lifestyle Indicators</h4>
              <div className="grid grid-cols-2 gap-3">
                {(selectedVariant?.riskLifestyleIndicators || []).map((item) => {
                  const iconMap = {
                    "Career Status": BriefcaseIcon,
                    "Health Score": HeartIcon,
                    "Living Situation": HouseIcon,
                    "Risk Load": TrendDownIcon
                  };
                  const Icon = iconMap[item.label] || TrendDownIcon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-pink-300" />
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-300">{item.value}</p>
                    </div>
                  );
                })}
                {!selectedVariant?.riskLifestyleIndicators?.length &&
                  [
                    { label: "Career Status", value: "Momentum slowed", icon: BriefcaseIcon },
                    { label: "Health Score", value: `${Math.max(20, 100 - (dashboard.behaviorProfile?.screenTime || 0) * 8)}/100`, icon: HeartIcon },
                    { label: "Living Situation", value: "Reactive not intentional", icon: HouseIcon },
                    { label: "Risk Load", value: `${Math.round((dashboard.prediction?.probabilities?.Negative || 0) * 100)}%`, icon: TrendDownIcon }
                  ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-pink-300" />
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-300">{item.value}</p>
                    </div>
                  );
                  })}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium">Negative Habits</h4>
              <div className="space-y-2">
                {negativeHabits.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <XCircleIcon className="h-4 w-4 flex-shrink-0 text-pink-300" />
                    <span className="text-sm text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FutureSnapshotShare
          name={dashboard.user?.name || "You"}
          prediction={dashboard.prediction?.label || "Pending"}
          level={selectedTimeline}
          message={
            selectedVariant?.futureMessage ||
            dashboard.simulation?.futureMessage ||
            "My future self says I should stay focused and protect my best timeline."
          }
        />
      </div>
    </div>
  );
};

export default FuturePage;
