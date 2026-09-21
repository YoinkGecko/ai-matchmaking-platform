export default function ScoreRing({ value, size = "md", className = "" }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      className={`score-ring score-ring--${size} ${className}`.trim()}
      role="img"
      aria-label={`${pct} percent match`}
    >
      <div
        className="score-ring__track"
        style={{
          background: `conic-gradient(var(--orange) ${pct}%, #e8e8e8 0)`,
        }}
      />
      <span className="score-ring__label">{pct}%</span>
    </div>
  );
}
