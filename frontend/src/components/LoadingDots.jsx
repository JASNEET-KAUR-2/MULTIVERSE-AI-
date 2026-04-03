import { motion } from "framer-motion";

const dotTransition = {
  duration: 0.6,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "reverse",
  ease: "easeInOut"
};

const LoadingDots = ({ label = "Analyzing your future..." }) => (
  <div className="flex items-center gap-3 text-sm text-slate-300">
    <span>{label}</span>
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ ...dotTransition, delay: index * 0.12 }}
          className="block h-1.5 w-1.5 rounded-full bg-cyan-200"
        />
      ))}
    </div>
  </div>
);

export default LoadingDots;
