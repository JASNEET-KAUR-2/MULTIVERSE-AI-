import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo.jsx";
import { GithubIcon, LinkedinIcon } from "./V0Icons.jsx";

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
            <BrandLogo showText markClassName="h-11 w-11" titleClassName="text-base" subtitleClassName="text-xs tracking-[0.2em]" />
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Plan better, stay consistent, and keep the experience simple enough to use every day.
            </p>
          </div>

          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex flex-wrap gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full border border-[rgba(223,207,188,0.92)] bg-white/80 px-4 py-2 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[rgba(223,207,188,0.92)] bg-white/80 p-2.5 transition hover:-translate-y-0.5 hover:text-slate-900"
                aria-label="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[rgba(223,207,188,0.92)] bg-white/80 p-2.5 transition hover:-translate-y-0.5 hover:text-slate-900"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200/80 pt-5 text-xs text-slate-500">
          © 2026 multiverse ai. Designed for clarity.
        </div>
      </div>
    </div>
  </footer>
);

export default AppFooter;
