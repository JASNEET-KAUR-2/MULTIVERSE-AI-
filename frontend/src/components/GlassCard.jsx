const GlassCard = ({ className = "", children }) => (
  <div className={`pastel-shell rounded-3xl p-6 ${className}`}>
    {children}
  </div>
);

export default GlassCard;
