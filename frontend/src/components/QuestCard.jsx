import { motion } from "framer-motion";
import GlassCard from "./GlassCard.jsx";

const difficultyColors = {
  Easy: "text-emerald-300",
  Medium: "text-cyan-300",
  Hard: "text-fuchsia-300"
};

const QuestCard = ({ quest, onComplete, isCompleting = false, isCelebrating = false }) => (
  <motion.div
    animate={
      isCelebrating
        ? { scale: [1, 1.03, 1], borderColor: ["rgba(103,232,249,0.1)", "rgba(103,232,249,0.4)", "rgba(103,232,249,0.1)"] }
        : { scale: 1 }
    }
    transition={{ duration: 0.45, ease: "easeOut" }}
  >
    <GlassCard className="flex h-full flex-col justify-between gap-5">
    <div>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-white">{quest.title}</h3>
        <span className={`text-sm font-medium ${difficultyColors[quest.difficulty]}`}>{quest.difficulty}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{quest.description}</p>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">+{quest.xpReward} XP</span>
      <button
        type="button"
        disabled={quest.completed || isCompleting}
        onClick={() => onComplete(quest._id)}
        className={`rounded-full border px-4 py-2 text-sm transition ${
          quest.completed || isCelebrating
            ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
            : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20"
        } disabled:cursor-not-allowed disabled:opacity-80`}
      >
        {quest.completed || isCelebrating ? "✔ Completed" : isCompleting ? "Completing..." : `Claim +${quest.xpReward} XP`}
      </button>
    </div>
    </GlassCard>
  </motion.div>
);

export default QuestCard;
