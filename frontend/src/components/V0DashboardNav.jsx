import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { BranchIcon, BriefcaseIcon, DashboardIcon, MessageIcon, MoonIcon, SparklesIcon, SunIcon, TargetIcon, TrophyIcon, UserIcon } from "./V0Icons.jsx";
import UserAvatar from "./UserAvatar.jsx";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: DashboardIcon, aliases: ["/app"] },
  { label: "Scanner", to: "/scanner", icon: SparklesIcon, aliases: [] },
  { label: "Future Paths", to: "/futures", icon: BranchIcon, aliases: ["/app/future"] },
  { label: "Growth", to: "/growth", icon: TrophyIcon, aliases: ["/app/growth"] },
  { label: "Career Lab", to: "/career", icon: BriefcaseIcon, aliases: ["/app/career"] },
  { label: "Planner", to: "/planner", icon: TargetIcon, aliases: ["/app/planner"] },
  { label: "Message", to: "/message", icon: MessageIcon, aliases: ["/app/message"] },
  { label: "Guilds", to: "/app/guilds", icon: SparklesIcon, aliases: ["/guilds"] },
  { label: "Profile", to: "/profile", icon: UserIcon, aliases: ["/app/profile"] },
  { label: "Feedback", to: "/feedback", icon: MessageIcon, aliases: ["/app/feedback"] }
];

const V0DashboardNav = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 text-slate-900">
      <nav className="container mx-auto">
        <div className="report-nav flex items-center justify-between rounded-full px-4 py-3 md:px-6">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="report-brand-mark flex h-10 w-10 items-center justify-center rounded-full">
              <SparklesIcon className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">multiverse ai</p>
              <p className="text-sm font-medium text-white">Studio Workspace</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/16 text-white backdrop-blur-xl"
                        : "text-white/72 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="report-icon-button"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="report-secondary-button"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="report-icon-button"
              aria-label="Open profile"
            >
              <UserAvatar name={user?.name} className="h-8 w-8 text-[10px]" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 md:hidden">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                    isActive ? "bg-white/16 text-white backdrop-blur-xl" : "text-white/72 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default V0DashboardNav;
