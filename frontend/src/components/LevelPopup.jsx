import { AnimatePresence, motion } from "framer-motion";

const LevelPopup = ({ level = 0, open = false }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -12 }}
          className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/90 px-10 py-8 text-center shadow-[0_30px_100px_rgba(6,11,28,0.5)]"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Level Up</p>
          <h2 className="mt-3 text-5xl font-bold text-white">LEVEL {level}</h2>
          <p className="mt-3 text-lg text-fuchsia-200">Trajectory upgraded</p>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default LevelPopup;
