import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "./BrandLogo.jsx";

const BrandSplashScreen = ({ visible }) => (
  <AnimatePresence>
    {visible ? (
      <motion.div
        className="brand-splash-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      >
        <div className="brand-splash-orb brand-splash-orb-left" />
        <div className="brand-splash-orb brand-splash-orb-right" />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.08, y: -18 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="brand-splash-card"
        >
          <motion.div
            initial={{ rotate: -8, scale: 0.92 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandLogo
              showText
              className="justify-center"
              markClassName="h-28 w-28 md:h-32 md:w-32"
              titleClassName="text-3xl md:text-5xl"
              subtitleClassName="justify-center text-sm md:text-base"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
            className="mt-6"
          >
            <p className="text-center text-sm leading-7 text-[#336988] md:text-base">
              Calmer planning, clearer futures, one adaptive workspace.
            </p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: "easeInOut" }}
            className="brand-splash-line"
          />
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default BrandSplashScreen;
