const palette = [
  "from-cyan-300 to-pink-300",
  "from-emerald-300 to-cyan-300",
  "from-violet-300 to-pink-300",
  "from-amber-300 to-pink-300"
];

const initialsFromName = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "PY";

const toneFromName = (name = "") => {
  const total = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[total % palette.length];
};

const UserAvatar = ({ name, className = "h-10 w-10 text-sm", textClassName = "" }) => (
  <div className={`flex items-center justify-center rounded-full bg-gradient-to-br ${toneFromName(name)} ${className}`}>
    <span className={`font-semibold tracking-[0.08em] text-slate-950 ${textClassName}`}>{initialsFromName(name)}</span>
  </div>
);

export default UserAvatar;
