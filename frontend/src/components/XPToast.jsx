import { AnimatePresence, motion } from "framer-motion";

const particleMotion = {
  initial: { opacity: 0, scale: 0.7, y: 0 },
  animate: (index) => ({
    opacity: [0, 1, 0],
    scale: [0.7, 1, 0.6],
    y: -22 - index * 6,
    x: index % 2 === 0 ? -14 - index * 2 : 14 + index * 2,
    transition: { duration: 1.3, ease: "easeOut" }
  })
};

const XPToast = ({ reward }) => (
  <AnimatePresence>
    {reward ? (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -26, scale: 0.96 }}
        className="pointer-events-none fixed bottom-8 right-8 z-[80] w-full max-w-sm rounded-[1.7rem] border border-cyan-300/20 bg-slate-950/90 p-5 shadow-[0_24px_80px_rgba(6,11,28,0.48)] backdrop-blur-xl"
      >
        <div className="relative">
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              custom={index}
              variants={particleMotion}
              initial="initial"
              animate="animate"
              className="absolute left-1/2 top-2 h-2 w-2 rounded-full bg-cyan-200"
            />
          ))}
          <p className="text-3xl font-bold text-cyan-200">+{reward.xpEarned} XP</p>
          <p className="mt-1 text-sm text-slate-300">Total XP: {reward.totalXp}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{reward.futureBoost}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300">Streak: {reward.streak} days</p>
        </div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default XPToast;
