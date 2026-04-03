import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AppFooter from "../components/AppFooter.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  ArrowRightIcon,
  MenuIcon,
  MoonIcon,
  PlayIcon,
  SparklesIcon,
  SunIcon,
  TargetIcon,
  TrendUpIcon,
  ZapIcon
} from "../components/V0Icons.jsx";

const focusCards = [
  {
    title: "Future Scan",
    description: "Turn your current habits into a simple, readable direction.",
    icon: SparklesIcon
  },
  {
    title: "Daily Rhythm",
    description: "Keep your tasks, habits, and goals in one calm flow.",
    icon: ZapIcon
  },
  {
    title: "Clear Progress",
    description: "Track what is improving without drowning in extra details.",
    icon: TrendUpIcon
  },
  {
    title: "Career Lab",
    description: "Use the BUISES career guidance flow with roadmap and gamified rewards.",
    icon: TargetIcon
  }
];

const storyPoints = [
  "A cleaner first screen with stronger visual focus",
  "Less internal text and fewer distracting blocks",
  "A more premium, editorial feel across desktop and mobile"
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: "easeOut" }
  })
};

const floatMotion = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" }
  }
};

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative min-h-screen overflow-hidden bg-parallel-grid text-slate-900">
      <div className="report-ambient pointer-events-none fixed inset-0">
        <div className="report-ambient-orb report-ambient-orb-left" />
        <div className="report-ambient-orb report-ambient-orb-right" />
        <div className="report-stars" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="report-nav flex items-center justify-between rounded-full px-4 py-3 md:px-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="report-brand-mark flex h-11 w-11 items-center justify-center rounded-full">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/70">multiverse ai</p>
                <p className="text-sm text-white">Premium Workspace</p>
              </div>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a className="text-sm text-white/78 transition hover:text-white" href="#experience">
                Experience
              </a>
              <a className="text-sm text-white/78 transition hover:text-white" href="#focus">
                Focus
              </a>
              <Link className="text-sm text-white/78 transition hover:text-white" to="/feedback">
                Feedback
              </Link>
              <Link className="text-sm text-white/78 transition hover:text-white" to="/career">
                Career Lab
              </Link>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button type="button" onClick={toggleTheme} className="report-icon-button" aria-label="Toggle theme">
                {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
              </button>
              <Link className="report-secondary-button" to="/login">
                Login
              </Link>
              <Link className="report-primary-button" to="/quiz">
                Start
              </Link>
            </div>

            <button
              type="button"
              className="report-icon-button md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="report-mobile-menu mt-3 rounded-3xl p-4 md:hidden">
              <a className="block px-3 py-2 text-white/85" href="#experience" onClick={() => setMobileMenuOpen(false)}>
                Experience
              </a>
              <a className="block px-3 py-2 text-white/85" href="#focus" onClick={() => setMobileMenuOpen(false)}>
                Focus
              </a>
              <Link className="block px-3 py-2 text-white/85" to="/feedback" onClick={() => setMobileMenuOpen(false)}>
                Feedback
              </Link>
              <Link className="block px-3 py-2 text-white/85" to="/career" onClick={() => setMobileMenuOpen(false)}>
                Career Lab
              </Link>
              <Link className="block px-3 py-2 text-white/85" to="/login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <button type="button" className="mt-2 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm text-white" onClick={toggleTheme}>
                {theme === "light" ? "Dark mode" : "Light mode"}
              </button>
              <Link className="report-primary-button mt-3 flex w-full items-center justify-center" to="/quiz" onClick={() => setMobileMenuOpen(false)}>
                Start Future Scan
              </Link>
            </div>
          ) : null}
        </nav>
      </header>

      <section className="relative px-4 pb-18 pt-28 md:pb-24 md:pt-34">
        <div className="container mx-auto">
          <div className="report-hero relative overflow-hidden rounded-[2.5rem] px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <div className="report-hero-sky" />
            <div className="report-hero-haze" />
            <motion.div variants={floatMotion} animate="animate" className="report-dome" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_0.72fr] lg:items-end">
              <motion.div initial="hidden" animate="visible" className="max-w-4xl">
                <motion.div custom={0.05} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/78 backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-white/80" />
                  Studio Report Experience
                </motion.div>

                <motion.p custom={0.12} variants={fadeUp} className="mt-10 text-center text-sm uppercase tracking-[0.42em] text-white/72 lg:text-left">
                  multiverse ai
                </motion.p>

                <motion.h1
                  custom={0.2}
                  variants={fadeUp}
                  className="report-display-title mt-4 text-center text-white lg:text-left"
                >
                  Shape the life
                  <br />
                  you are growing into
                </motion.h1>

                <motion.p custom={0.3} variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-white/78 md:text-lg lg:mx-0 lg:text-left">
                  A calmer, more cinematic way to read your direction, track your rhythm, and move forward without all the extra noise.
                </motion.p>

                <motion.div custom={0.38} variants={fadeUp} className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                  <Link to="/quiz" className="report-cta-primary inline-flex items-center justify-center">
                    Start Future Scan
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/career" className="report-cta-secondary inline-flex items-center justify-center">
                    Career Lab
                  </Link>
                  <Link to="/dashboard" className="report-cta-secondary inline-flex items-center justify-center">
                    <PlayIcon className="mr-2 h-5 w-5" />
                    Open Dashboard
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" className="relative z-10 lg:justify-self-end">
                <motion.div custom={0.28} variants={fadeUp} className="report-side-panel max-w-md rounded-[2rem] p-6 md:p-7">
                  <p className="text-xs uppercase tracking-[0.34em] text-white/58">Focused Experience</p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">Made to feel premium, not crowded.</h2>
                  <div className="mt-6 space-y-3">
                    {storyPoints.map((point) => (
                      <div key={point} className="report-side-item flex items-start gap-3 rounded-2xl px-4 py-3">
                        <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/14">
                          <TargetIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-sm leading-6 text-white/78">{point}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.45, ease: "easeOut" }}
              className="relative z-10 mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              {focusCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="report-bottom-card rounded-[1.7rem] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-lg font-medium text-white">{card.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/72">{card.description}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="experience" className="relative px-4 pb-8">
        <div className="container mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="pastel-shell rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Why this feels better</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold text-slate-900 md:text-4xl">
                The landing page now tells one clear story.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Instead of showing too many internal blocks, technical labels, and scattered details, the homepage now leads with mood, clarity, and one strong message.
              </p>
            </div>

            <div className="pastel-shell rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.34em] text-slate-500">What stays</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.4rem] border border-sky-100 bg-white/70 p-4">
                  <p className="font-semibold text-slate-900">Future-focused identity</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">The product still feels aspirational and reflective.</p>
                </div>
                <div className="rounded-[1.4rem] border border-sky-100 bg-white/70 p-4">
                  <p className="font-semibold text-slate-900">Useful entry points</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Quiz, dashboard, and feedback remain easy to access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="focus" className="relative px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Core Focus</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Less clutter. Stronger presence.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {focusCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="pastel-shell rounded-[1.8rem] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AppFooter />
    </main>
  );
};

export default HomePage;
