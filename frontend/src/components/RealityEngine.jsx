import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CAREER_MODELS = {
  "Software Engineer": {
    baseSuccess: 85,
    baseSalary: [85000, 140000, 220000],
    baseDemand: 92,
    baseRegret: 15,
    baseDrift: 20,
    baseRelevance: 88,
    industryGrowth: 22,
    futureDemand: 95,
    riskLevel: 10
  },
  "Product Designer": {
    baseSuccess: 78,
    baseSalary: [70000, 110000, 160000],
    baseDemand: 82,
    baseRegret: 22,
    baseDrift: 18,
    baseRelevance: 85,
    industryGrowth: 18,
    futureDemand: 88,
    riskLevel: 15
  },
  Entrepreneur: {
    baseSuccess: 45,
    baseSalary: [50000, 150000, 500000],
    baseDemand: 68,
    baseRegret: 45,
    baseDrift: 35,
    baseRelevance: 65,
    industryGrowth: 30,
    futureDemand: 75,
    riskLevel: 40
  },
  "Data Scientist": {
    baseSuccess: 88,
    baseSalary: [90000, 130000, 190000],
    baseDemand: 94,
    baseRegret: 12,
    baseDrift: 15,
    baseRelevance: 90,
    industryGrowth: 25,
    futureDemand: 96,
    riskLevel: 8
  },
  "UX Researcher": {
    baseSuccess: 76,
    baseSalary: [72000, 105000, 145000],
    baseDemand: 78,
    baseRegret: 20,
    baseDrift: 22,
    baseRelevance: 82,
    industryGrowth: 16,
    futureDemand: 84,
    riskLevel: 18
  },
  "DevOps Engineer": {
    baseSuccess: 84,
    baseSalary: [95000, 145000, 200000],
    baseDemand: 88,
    baseRegret: 14,
    baseDrift: 16,
    baseRelevance: 86,
    industryGrowth: 24,
    futureDemand: 91,
    riskLevel: 12
  }
};

const calculateMetrics = (careerKey, skillLevel, interestLevel) => {
  const model = CAREER_MODELS[careerKey];

  if (!model) {
    return null;
  }

  const skillFactor = skillLevel / 100;
  const interestFactor = interestLevel / 100;

  const successProb = Math.min(98, Math.max(15, model.baseSuccess * (0.6 + 0.4 * skillFactor) * (0.7 + 0.3 * interestFactor)));
  const relevance = Math.min(98, Math.max(20, model.baseRelevance * (0.7 + 0.3 * interestFactor) * (0.8 + 0.2 * skillFactor)));
  const regretRisk = Math.min(70, Math.max(5, model.baseRegret * (1.3 - 0.4 * interestFactor) * (1.2 - 0.3 * skillFactor)));
  const identityDrift = Math.min(75, Math.max(5, model.baseDrift * (1.4 - 0.5 * interestFactor) * (1.1 - 0.2 * skillFactor)));
  const marketDemand = Math.min(98, Math.max(30, model.baseDemand * (0.9 + 0.15 * skillFactor)));

  const salaryProjection = {
    entry: Math.round(model.baseSalary[0] * (0.85 + 0.3 * skillFactor)),
    mid: Math.round(model.baseSalary[1] * (0.9 + 0.25 * skillFactor)),
    senior: Math.round(model.baseSalary[2] * (0.95 + 0.2 * skillFactor))
  };

  const realityScore = Math.round(
    successProb * 0.3 +
      relevance * 0.25 +
      marketDemand * 0.2 +
      (100 - regretRisk) * 0.15 +
      (100 - identityDrift) * 0.1
  );

  return {
    successProb: Math.round(successProb),
    relevance: Math.round(relevance),
    regretRisk: Math.round(regretRisk),
    identityDrift: Math.round(identityDrift),
    marketDemand: Math.round(marketDemand),
    salaryProjection,
    industryGrowth: model.industryGrowth,
    futureDemand: model.futureDemand,
    riskLevel: model.riskLevel,
    realityScore
  };
};

const formatCurrency = (value) => `$${value.toLocaleString()}`;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.06, ease: "easeOut" }
  })
};

const MetricCard = ({ title, value, unit, barClass, tooltip, delay = 0 }) => (
  <motion.div custom={delay} variants={fadeUp} className="muse-mini-card group p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs leading-5 text-slate-500">{tooltip}</p>
      </div>
      <span className="rounded-full border border-cyan-100 bg-white/80 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        Live
      </span>
    </div>

    <div className="mt-5 flex items-end gap-1">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="pb-1 text-sm text-slate-500">{unit}</span>
    </div>

    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay: 0.15 + delay * 0.04, ease: "easeOut" }}
        className={`h-full rounded-full ${barClass}`}
      />
    </div>
  </motion.div>
);

const CircularMetric = ({ title, value, strokeColor, trailColor, tooltip, delay = 0 }) => {
  const circumference = 314;
  const offset = circumference - (circumference * value) / 100;

  return (
    <motion.div custom={delay} variants={fadeUp} className="muse-mini-card p-4 text-center">
      <div className="mx-auto flex w-fit flex-col items-center">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" stroke={trailColor} strokeWidth="10" fill="none" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke={strokeColor}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, delay: 0.2 + delay * 0.05, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{value}%</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 max-w-[13rem] text-xs leading-5 text-slate-500">{tooltip}</p>
      </div>
    </motion.div>
  );
};

const ComparisonBar = ({ label, futureValue, regretValue, unit, futureClass, regretClass }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-emerald-700">Future {futureValue}{unit}</span>
        <span className="text-rose-500">Risk {regretValue}{unit}</span>
      </div>
    </div>
    <div className="flex gap-1">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${futureValue}%` }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className={`h-full rounded-full ${futureClass}`}
        />
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${regretValue}%` }}
          transition={{ duration: 0.75, delay: 0.08, ease: "easeOut" }}
          className={`h-full rounded-full ${regretClass}`}
        />
      </div>
    </div>
  </div>
);

const MarketRealityBar = ({ growth, demand, risk }) => (
  <div className="muse-mini-card p-4">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Market Reality</p>
        <h3 className="mt-2 text-base font-semibold text-slate-900">External pressure map</h3>
      </div>
      <span className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs text-cyan-700">Updated</span>
    </div>

    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">Industry growth</span>
          <span className="text-emerald-700">+{growth}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/70">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, growth)}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-300" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">Future demand</span>
          <span className="text-cyan-700">{demand}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/70">
          <motion.div initial={{ width: 0 }} animate={{ width: `${demand}%` }} transition={{ duration: 0.7, delay: 0.08 }} className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-300" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">Risk level</span>
          <span className="text-amber-700">{risk}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/70">
          <motion.div initial={{ width: 0 }} animate={{ width: `${risk}%` }} transition={{ duration: 0.7, delay: 0.16 }} className="h-full rounded-full bg-gradient-to-r from-amber-200 to-rose-300" />
        </div>
      </div>
    </div>
  </div>
);

const RealityEngine = () => {
  const [career, setCareer] = useState("Software Engineer");
  const [skillLevel, setSkillLevel] = useState(75);
  const [interestLevel, setInterestLevel] = useState(80);
  const [metrics, setMetrics] = useState(null);
  const [driftMessage, setDriftMessage] = useState({ text: "", trend: 0 });

  const updateMetrics = useCallback(() => {
    const nextMetrics = calculateMetrics(career, skillLevel, interestLevel);
    setMetrics(nextMetrics);

    const driftTrend = Math.round((interestLevel - 50) / 2);
    const messages = [
      {
        trend: driftTrend,
        text: `Interest alignment ${driftTrend >= 0 ? "improved" : "slipped"} by ${Math.abs(driftTrend)}% this week.`
      },
      {
        trend: driftTrend,
        text: `Career-personality match is ${Math.abs(driftTrend) > 10 ? "clearly" : "slightly"} ${driftTrend >= 0 ? "improving" : "declining"}.`
      }
    ];

    setDriftMessage(messages[Math.abs(driftTrend) > 8 ? 1 : 0]);
  }, [career, skillLevel, interestLevel]);

  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  if (!metrics) {
    return null;
  }

  const salaryGrowth = Math.round(((metrics.salaryProjection.senior - metrics.salaryProjection.entry) / metrics.salaryProjection.entry) * 100);
  const riskSalaryLoss = Math.round((metrics.salaryProjection.senior - metrics.salaryProjection.mid) * 0.3);

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} className="space-y-6">
      <motion.div custom={0} variants={fadeUp} className="hero-shell muse-card muse-card-peach relative overflow-hidden px-5 py-6 md:px-7">
        <div className="muse-wave muse-wave-mint bottom-[-2.4rem] left-[-2rem] h-40 w-56" />
        <div className="muse-wave muse-wave-blue right-[-1rem] top-[-1.5rem] h-36 w-44" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-700">Reality Engine</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                Simulate your next career path with live-fit scoring.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                Adjust skill depth and interest alignment to see how market demand, regret risk, identity drift, and salary growth change in real time.
              </p>
            </div>

            <div className="muse-card muse-card-blue min-w-[15rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overall Reality Score</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">{metrics.realityScore}</span>
                <span className="pb-1 text-sm text-slate-500">/100</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="soft-chip px-3 py-1">High demand</span>
                <span className="soft-chip px-3 py-1">{metrics.successProb}% success</span>
                <span className="soft-chip px-3 py-1">Adaptive simulation</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="muse-card p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Future You</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Upside projection</h3>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  Best fit
                </span>
              </div>

              <div className="space-y-4">
                <ComparisonBar label="Success Probability" futureValue={metrics.successProb} regretValue={metrics.regretRisk} unit="%" futureClass="bg-gradient-to-r from-emerald-300 to-teal-300" regretClass="bg-gradient-to-r from-rose-200 to-rose-300" />
                <ComparisonBar label="Salary Growth" futureValue={salaryGrowth} regretValue={Math.round(salaryGrowth * 0.6)} unit="%" futureClass="bg-gradient-to-r from-cyan-300 to-sky-300" regretClass="bg-gradient-to-r from-rose-200 to-rose-300" />
                <ComparisonBar label="Skill Momentum" futureValue={Math.min(100, skillLevel + 20)} regretValue={Math.max(20, skillLevel - 15)} unit="%" futureClass="bg-gradient-to-r from-violet-300 to-fuchsia-300" regretClass="bg-gradient-to-r from-rose-200 to-rose-300" />
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-cyan-100 bg-white/75 p-4">
                <p className="text-sm font-medium text-cyan-700">Projected salary range</p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatCurrency(metrics.salaryProjection.entry)} - {formatCurrency(metrics.salaryProjection.senior)}
                </p>
                <p className="mt-2 text-sm text-slate-600">Growth potential: +{salaryGrowth}% over your career arc.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard title="Relevance Score" value={metrics.relevance} unit="%" barClass="bg-gradient-to-r from-fuchsia-300 to-rose-300" tooltip="How strongly this path matches your profile." delay={1} />
              <MetricCard title="Success Probability" value={metrics.successProb} unit="%" barClass="bg-gradient-to-r from-emerald-300 to-teal-300" tooltip="Odds of durable progress from this starting point." delay={2} />
              <MetricCard title="Market Demand" value={metrics.marketDemand} unit="%" barClass="bg-gradient-to-r from-cyan-300 to-sky-300" tooltip="Projected demand curve for this role." delay={3} />
              <MetricCard title="Regret Risk" value={metrics.regretRisk} unit="%" barClass="bg-gradient-to-r from-amber-200 to-rose-300" tooltip="Risk of disengagement if this path misaligns." delay={4} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <CircularMetric
              title="Identity Drift"
              value={metrics.identityDrift}
              strokeColor="#8b5cf6"
              trailColor="#e5eef6"
              tooltip="Higher drift means the role may pull you away from how you naturally work."
            />
            <MarketRealityBar growth={metrics.industryGrowth} demand={metrics.futureDemand} risk={metrics.riskLevel} />
          </div>

          <div className="muse-card muse-card-blue p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Live Drift Tracker</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Alignment signal</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${driftMessage.trend >= 0 ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-rose-200 bg-rose-50 text-rose-600"}`}>
                {driftMessage.trend >= 0 ? "Improving" : "Watch closely"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={driftMessage.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-base font-medium leading-7 text-slate-900"
              >
                {driftMessage.text}
              </motion.p>
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>Real-time alignment tracking</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Updated instantly from your slider inputs</span>
            </div>
          </div>
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="space-y-6">
          <div className="muse-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customize Simulation</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Tune the scenario</h3>
              </div>
              <span className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs text-slate-600">Interactive</span>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Career Path</span>
                <select value={career} onChange={(event) => setCareer(event.target.value)} className="input-field">
                  {Object.keys(CAREER_MODELS).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>Skills Level</span>
                  <span>{skillLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillLevel}
                  onChange={(event) => setSkillLevel(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-cyan-100 accent-cyan-500"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>Interest Alignment</span>
                  <span>{interestLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={interestLevel}
                  onChange={(event) => setInterestLevel(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-rose-100 accent-fuchsia-500"
                />
              </label>
            </div>
          </div>

          <div className="muse-card muse-card-mint p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Regret You</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Cost of misalignment</h3>
              </div>
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-600">
                Risk zone
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.3rem] border border-rose-100 bg-white/75 p-4">
                <p className="text-sm font-medium text-rose-600">Regret probability</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.regretRisk}%</p>
                <p className="mt-2 text-sm text-slate-600">Misalignment and opportunity cost show up fastest here.</p>
              </div>

              <div className="rounded-[1.3rem] border border-amber-100 bg-white/75 p-4">
                <p className="text-sm font-medium text-amber-700">Identity drift impact</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.identityDrift}%</p>
                <p className="mt-2 text-sm text-slate-600">Higher drift means more internal resistance over time.</p>
              </div>

              <div className="muse-mini-card p-4">
                <p className="text-sm text-slate-700">
                  Potential earnings left on the table: <span className="font-semibold text-rose-600">{formatCurrency(riskSalaryLoss)}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default RealityEngine;
