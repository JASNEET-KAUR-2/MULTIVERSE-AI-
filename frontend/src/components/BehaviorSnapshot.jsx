import GlassCard from "./GlassCard.jsx";

const BehaviorSnapshot = ({ behaviorProfile }) => {
  const metrics = [
    { label: "Study", value: `${behaviorProfile?.studyHours ?? "-"}h` },
    { label: "Sleep", value: `${behaviorProfile?.sleepHours ?? "-"}h` },
    { label: "Screen", value: `${behaviorProfile?.screenTime ?? "-"}h` },
    { label: "Consistency", value: behaviorProfile?.consistency ?? "-" },
    { label: "Procrastination", value: behaviorProfile?.procrastination ?? "-" },
    { label: "Goal Clarity", value: behaviorProfile?.goalClarity ?? "-" }
  ];

  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Behavior Snapshot</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="muse-mini-card p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default BehaviorSnapshot;
