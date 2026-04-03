import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import BrandLogo from "./BrandLogo.jsx";
import ProfilePanel from "./ProfilePanel.jsx";
import UserAvatar from "./UserAvatar.jsx";
import {
  BotIcon,
  BranchIcon,
  ChevronDownIcon,
  DashboardIcon,
  MenuIcon,
  MessageIcon,
  MoonIcon,
  SunIcon,
  TargetIcon,
  XCircleIcon
} from "./V0Icons.jsx";

const primaryLinks = [
  { label: "Dashboard", to: "/dashboard", icon: DashboardIcon, aliases: ["/app", "/dashboard"] },
  { label: "Future Paths", to: "/futures", icon: BranchIcon, aliases: ["/app/future", "/futures"] },
  { label: "Reality Engine", to: "/reality-engine", icon: TargetIcon, aliases: ["/app/reality-engine", "/reality-engine"] },
  {
    key: "growth-planner",
    label: "Growth Planner",
    icon: TargetIcon,
    children: [
      { key: "growth-overview", label: "Growth Overview", to: "/growth", aliases: ["/app/growth", "/growth"] },
      { key: "planner-board", label: "Planner Board", to: "/planner", aliases: ["/app/planner", "/planner"] },
      { key: "habit-rhythm", label: "Habit Rhythm", to: "/habits", aliases: ["/app/habits", "/habits"] }
    ]
  }
];

const feedbackLink = { label: "Feedback", to: "/feedback", icon: MessageIcon, aliases: ["/app/feedback", "/feedback"] };

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  to,
  accent = false,
  children = [],
  isOpen = false,
  onToggle,
  onChildClick
}) => {
  const hasChildren = children.length > 0;
  const className = `sidebar-item ${active ? "sidebar-item-active" : ""} ${accent ? "sidebar-item-accent" : ""}`.trim();

  if (hasChildren) {
    return (
      <div>
        <button type="button" onClick={onToggle} className={className}>
          <span className="flex items-center gap-3">
            <span className="sidebar-icon-wrap">
              <Icon className="h-4 w-4" />
            </span>
            <span>{label}</span>
          </span>

          <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <div className={`overflow-hidden pl-5 transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 pt-2 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-1.5 border-l border-white/10 pl-4">
            {children.map((child) => (
              <button
                key={child.key}
                type="button"
                onClick={() => onChildClick?.(child)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                  child.active
                    ? "bg-white/10 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                    : "text-slate-400 hover:bg-white/8 hover:text-sky-200"
                }`}
              >
                {child.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (to) {
    return (
      <NavLink to={to} className={className} onClick={onClick}>
        <span className="sidebar-icon-wrap">
          <Icon className="h-4 w-4" />
        </span>
        <span>{label}</span>
      </NavLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <span className="sidebar-icon-wrap">
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
};

const V0DashboardNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const isActive = (link) =>
    link.aliases?.includes(location.pathname) ||
    link.children?.some((child) => child.aliases?.includes(location.pathname) || child.to === location.pathname);

  const handleToggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  useEffect(() => {
    const activeMenu = primaryLinks.find((link) =>
      link.children?.some((child) => child.aliases?.includes(location.pathname) || child.to === location.pathname)
    );

    if (activeMenu) {
      setOpenMenu(activeMenu.key);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linksWithState = useMemo(
    () =>
      primaryLinks.map((link) => ({
        ...link,
        children: (link.children || []).map((child) => ({
          ...child,
          active: child.aliases?.includes(location.pathname) || child.to === location.pathname
        }))
      })),
    [location.pathname]
  );

  const sidebarBody = (
    <div className="sidebar-shell flex h-full flex-col">
      <div className="sidebar-brand">
        <BrandLogo showText markClassName="h-12 w-12" titleClassName="text-sm text-white" subtitleClassName="text-[11px] tracking-[0.28em] text-slate-400" />
      </div>

      <div className="mt-8 space-y-2">
        {linksWithState.map((link) => (
          <SidebarItem
            key={link.key || link.to}
            icon={link.icon}
            label={link.label}
            to={link.to}
            active={isActive(link)}
            children={link.children}
            isOpen={openMenu === link.key}
            onToggle={() => handleToggle(link.key)}
            onChildClick={(child) => {
              if (child?.to) {
                navigate(child.to);
                setSidebarOpen(false);
              }
            }}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </div>

      <button
        type="button"
        className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/6 p-4 text-left transition hover:border-white/18 hover:bg-white/10"
        onClick={() => {
          setSidebarOpen(false);
          setProfileOpen(true);
        }}
      >
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.name} className="h-11 w-11 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name || "Explorer"}</p>
            <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-400">Personal workspace</p>
          </div>
        </div>
      </button>

      <div className="mt-auto space-y-2 pt-8">
        <SidebarItem
          icon={XCircleIcon}
          label="Logout"
          onClick={() => {
            setSidebarOpen(false);
            handleLogout();
          }}
        />
        <SidebarItem
          icon={feedbackLink.icon}
          label={feedbackLink.label}
          to={feedbackLink.to}
          active={isActive(feedbackLink)}
          accent
          onClick={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="dashboard-mobile-top">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="dashboard-mobile-button"
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <BrandLogo showText markClassName="h-11 w-11" titleClassName="text-sm text-slate-900" subtitleClassName="text-[10px] tracking-[0.26em] text-slate-500" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/message")}
            className="dashboard-mobile-button !h-11 !w-11"
            aria-label="Open bot"
            title="Open bot"
          >
            <BotIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="dashboard-mobile-button !h-11 !w-11"
            aria-label={theme === "light" ? "Enable dark mode" : "Enable light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-[85]">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            aria-label="Close sidebar"
          />
          <aside className="dashboard-sidebar absolute inset-y-4 left-4 w-[18rem] max-w-[calc(100vw-2rem)]">
            {sidebarBody}
          </aside>
        </div>
      ) : null}

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default V0DashboardNav;
