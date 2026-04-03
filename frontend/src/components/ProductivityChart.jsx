const chartTones = ["from-cyan-300 via-sky-300 to-blue-300", "from-emerald-300 via-cyan-300 to-sky-300", "from-sky-300 via-blue-200 to-cyan-200"];

const buildPolyline = (points = []) => {
  if (!points.length) {
    return "";
  }

  const max = Math.max(...points.map((point) => point.value), 1);

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point.value / max) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");
};

const ProductivityChart = ({ title, subtitle, points = [], variant = "bars" }) => {
  const max = Math.max(...points.map((point) => point.value), 1);
  const polyline = buildPolyline(points);

  return (
    <div className="dynamic-panel rounded-[1.7rem] p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
      </div>

      {variant === "line" ? (
        <div className="rounded-[1.4rem] border border-cyan-100/80 bg-white/70 p-4">
          <svg viewBox="0 0 100 100" className="h-44 w-full">
            <defs>
              <linearGradient id="plannerLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
            </defs>
            {[20, 40, 60, 80].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="2 3" />
            ))}
            <polyline fill="none" stroke="url(#plannerLineGradient)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={polyline} />
            {points.map((point, index) => {
              const x = (index / Math.max(points.length - 1, 1)) * 100;
              const y = 100 - (point.value / max) * 80 - 10;
              return <circle key={point.label} cx={x} cy={y} r="2.5" fill="#0f172a" />;
            })}
          </svg>
          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
            {points.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {points.map((point, index) => (
            <div key={point.label} className="flex flex-col items-center gap-3">
              <div className="flex h-40 w-full items-end">
                <div
                  className={`w-full rounded-t-2xl bg-gradient-to-t ${chartTones[index % chartTones.length]} shadow-[0_16px_30px_rgba(125,211,252,0.18)] transition-all duration-500`}
                  style={{ height: `${Math.max(14, (point.value / max) * 100)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-700">{point.label}</p>
                <p className="text-xs text-slate-500">{point.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;
