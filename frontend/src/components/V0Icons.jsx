const createIcon = (paths, viewBox = "0 0 24 24") =>
  function Icon({ className = "w-5 h-5" }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {paths.map((path, index) =>
          path.circle ? <circle key={index} {...path.circle} /> : path.rect ? <rect key={index} {...path.rect} /> : <path key={index} d={path.d} />
        )}
      </svg>
    );
  };

export const SparklesIcon = createIcon([
  { d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" },
  { d: "M20 2v4" },
  { d: "M22 4h-4" },
  { circle: { cx: "4", cy: "20", r: "2" } }
]);

export const MenuIcon = createIcon([{ d: "M4 5h16" }, { d: "M4 12h16" }, { d: "M4 19h16" }]);
export const ArrowRightIcon = createIcon([{ d: "M5 12h14" }, { d: "m12 5 7 7-7 7" }]);
export const ArrowLeftIcon = createIcon([{ d: "m12 19-7-7 7-7" }, { d: "M19 12H5" }]);
export const PlayIcon = createIcon([{ d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }]);
export const BrainIcon = createIcon([
  { d: "M12 18V5" },
  { d: "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" },
  { d: "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" },
  { d: "M17.997 5.125a4 4 0 0 1 2.526 5.77" },
  { d: "M18 18a4 4 0 0 0 2-7.464" },
  { d: "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" },
  { d: "M6 18a4 4 0 0 1-2-7.464" },
  { d: "M6.003 5.125a4 4 0 0 0-2.526 5.77" }
]);
export const TargetIcon = createIcon([{ circle: { cx: "12", cy: "12", r: "10" } }, { circle: { cx: "12", cy: "12", r: "6" } }, { circle: { cx: "12", cy: "12", r: "2" } }]);
export const ZapIcon = createIcon([{ d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }]);
export const DashboardIcon = createIcon([
  { rect: { width: "7", height: "9", x: "3", y: "3", rx: "1" } },
  { rect: { width: "7", height: "5", x: "14", y: "3", rx: "1" } },
  { rect: { width: "7", height: "9", x: "14", y: "12", rx: "1" } },
  { rect: { width: "7", height: "5", x: "3", y: "16", rx: "1" } }
]);
export const BranchIcon = createIcon([{ d: "M15 6a9 9 0 0 0-9 9V3" }, { circle: { cx: "18", cy: "6", r: "3" } }, { circle: { cx: "6", cy: "18", r: "3" } }]);
export const TrophyIcon = createIcon([
  { d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" },
  { d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" },
  { d: "M18 9h1.5a1 1 0 0 0 0-5H18" },
  { d: "M4 22h16" },
  { d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" },
  { d: "M6 9H4.5a1 1 0 0 1 0-5H6" }
]);
export const MessageIcon = createIcon([{ d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" }]);
export const UserIcon = createIcon([{ d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }, { circle: { cx: "12", cy: "7", r: "4" } }]);
export const SwordIcon = createIcon([{ d: "m11 19-6-6" }, { d: "m5 21-2-2" }, { d: "m8 16-4 4" }, { d: "M9.5 17.5 21 6V3h-3L6.5 14.5" }]);
export const TrendUpIcon = createIcon([{ d: "M16 7h6v6" }, { d: "m22 7-8.5 8.5-5-5L2 17" }]);
export const TrendDownIcon = createIcon([{ d: "M16 17h6v-6" }, { d: "m22 17-8.5-8.5-5 5L2 7" }]);
export const RefreshIcon = createIcon([{ d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }, { d: "M21 3v5h-5" }, { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }, { d: "M8 16H3v5" }]);
export const BriefcaseIcon = createIcon([{ d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" }, { rect: { width: "20", height: "14", x: "2", y: "6", rx: "2" } }]);
export const HeartIcon = createIcon([{ d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" }]);
export const HouseIcon = createIcon([{ d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }, { d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]);
export const CheckCircleIcon = createIcon([{ circle: { cx: "12", cy: "12", r: "10" } }, { d: "m9 12 2 2 4-4" }]);
export const XCircleIcon = createIcon([{ circle: { cx: "12", cy: "12", r: "10" } }, { d: "m15 9-6 6" }, { d: "m9 9 6 6" }]);
export const SkullIcon = createIcon([{ d: "m12.5 17-.5-1-.5 1h1z" }, { d: "M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z" }, { circle: { cx: "15", cy: "12", r: "1" } }, { circle: { cx: "9", cy: "12", r: "1" } }]);
export const AlertIcon = createIcon([{ d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }, { d: "M12 9v4" }, { d: "M12 17h.01" }]);
export const SunIcon = createIcon([{ circle: { cx: "12", cy: "12", r: "4" } }, { d: "M12 2v2" }, { d: "M12 20v2" }, { d: "m4.93 4.93 1.41 1.41" }, { d: "m17.66 17.66 1.41 1.41" }, { d: "M2 12h2" }, { d: "M20 12h2" }, { d: "m6.34 17.66-1.41 1.41" }, { d: "m19.07 4.93-1.41 1.41" }]);
export const MoonIcon = createIcon([{ d: "M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9" }]);
export const GithubIcon = createIcon([{ d: "M9 19c-5 1.5-5-2.5-7-3" }, { d: "M15 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" }]);
export const LinkedinIcon = createIcon([{ d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-12h4v2" }, { rect: { x: "2", y: "9", width: "4", height: "12", rx: "1" } }, { circle: { cx: "4", cy: "4", r: "2" } }]);
export const SearchIcon = createIcon([{ circle: { cx: "11", cy: "11", r: "7" } }, { d: "m21 21-4.35-4.35" }]);
