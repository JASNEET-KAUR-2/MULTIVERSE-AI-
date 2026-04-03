const BrandLogo = ({ className = "", markClassName = "h-12 w-12", showText = false, titleClassName = "", subtitleClassName = "" }) => (
  <div className={`flex items-center gap-3 ${className}`.trim()}>
    <svg viewBox="0 0 96 96" className={markClassName} aria-hidden="true">
      <defs>
        <linearGradient id="brand-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7de9ef" />
          <stop offset="55%" stopColor="#49b9f7" />
          <stop offset="100%" stopColor="#6f9dff" />
        </linearGradient>
        <linearGradient id="brand-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8f5f4" />
          <stop offset="50%" stopColor="#68cff6" />
          <stop offset="100%" stopColor="#4d7de8" />
        </linearGradient>
        <linearGradient id="brand-network" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#48c7ff" />
          <stop offset="100%" stopColor="#f68ac8" />
        </linearGradient>
      </defs>

      <ellipse cx="44" cy="80" rx="36" ry="9" fill="rgba(73,185,247,0.18)" />
      <path
        d="M11 67c11 10 26 15 43 15 11 0 22-2 33-6-8 10-23 16-40 16-15 0-29-4-39-11-3-2-2-7 3-14z"
        fill="url(#brand-orbit)"
        opacity="0.96"
      />
      <path
        d="M34 16c-9 0-17 7-19 17-2 9 1 18 6 24v12c0 8 6 14 14 14 9 0 17-7 17-16V36c0-11-8-20-18-20z"
        fill="url(#brand-face)"
      />
      <path
        d="M44 22c-6 2-10 8-10 16 0 7 2 12 5 16-4 6-8 8-13 9 6 3 12 4 18 4 6 0 10-2 13-5-5-1-10-5-12-12l4-3c-1-3-1-6 1-9-1-8-3-13-6-16z"
        fill="#ffffff"
        opacity="0.28"
      />
      <path
        d="M29 33c5 2 8 5 10 10-3 1-6 1-10-1m7 11c3 1 5 4 5 7-3 1-6 0-8-2m12-18c1 2 1 4 0 6"
        fill="none"
        stroke="#0f4c73"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M45 18c19 0 33 15 33 34 0 4-1 8-2 11l-8-4-8-16-13-10-2-15z"
        fill="none"
        stroke="#143f85"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 33 59 31 67 39 58 49 69 58M59 31l1 12m-14-10 12 10m0 6 11 9"
        fill="none"
        stroke="url(#brand-network)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [46, 33, "#49b9f7"],
        [59, 31, "#f68ac8"],
        [67, 39, "#49b9f7"],
        [58, 49, "#f68ac8"],
        [69, 58, "#49b9f7"],
        [76, 50, "#f68ac8"],
        [61, 61, "#49b9f7"]
      ].map(([cx, cy, fill]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" fill={fill} />
      ))}
    </svg>

    {showText ? (
      <div>
        <p className={`brand-logo-title ${titleClassName}`.trim()}>MULTIVERSE AI</p>
        <p className={`brand-logo-subtitle ${subtitleClassName}`.trim()}>Studio Workspace</p>
      </div>
    ) : null}
  </div>
);

export default BrandLogo;
