import { motion } from "framer-motion";

const XPBar = ({ xp = 0, level = 0, progress = 0, xpToNextLevel = 0 }) => (
  <div className="muse-card muse-card-peach p-6">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">XP System</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Level {level}</h2>
        <p className="mt-2 text-sm text-slate-400">{xp} XP total</p>
      </div>
      <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
        {xpToNextLevel} XP to next
      </div>
    </div>

    <div className="h-4 overflow-hidden rounded-full bg-white/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="gradient-brand h-full rounded-full shadow-[0_0_24px_rgba(103,232,249,0.35)]"
      />
    </div>
    <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-500">
      <span>Progress</span>
      <span>{progress}%</span>
    </div>
  </div>
);

export default XPBar;
