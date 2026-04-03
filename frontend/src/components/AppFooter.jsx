import { Link } from "react-router-dom";
import { GithubIcon, LinkedinIcon, SparklesIcon } from "./V0Icons.jsx";

const footerLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Tasks", to: "/tasks" },
  { label: "Journal", to: "/journal" },
  { label: "Feedback", to: "/feedback" }
];

const AppFooter = () => (
  <footer className="relative px-4 pb-8 pt-4">
    <div className="container mx-auto">
      <div className="pastel-shell rounded-[2rem] px-6 py-8 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <div className="soft-button flex h-11 w-11 items-center justify-center rounded-full">
                <SparklesIcon className="h-5 w-5 text-slate-950 dark:text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">multiverse ai</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">A cleaner future-focused workspace</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Plan better, stay consistent, and keep the experience simple enough to use every day.
            </p>
          </div>

          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex flex-wrap gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm text-slate-600 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200/80 bg-white/70 p-2.5 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:text-white"
                aria-label="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200/80 bg-white/70 p-2.5 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200/80 pt-5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          © 2026 multiverse ai. Designed for clarity.
        </div>
      </div>
    </div>
  </footer>
);

export default AppFooter;
