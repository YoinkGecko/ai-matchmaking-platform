/** Stylized 3D shipping container + crane hook (Setby-inspired) */
export default function ContainerVisual({
  className = "",
  label = "AI Matchmaking",
  large = false,
}) {
  return (
    <div
      className={`container-visual ${large ? "container-visual--lg" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg className="container-visual__crane" viewBox="0 0 120 200" fill="none">
        <path
          d="M60 0v24M60 24c-8 0-14 6-14 14v8h28v-8c0-8-6-14-14-14z"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M46 46h28M52 46v52M68 46v52" stroke="#333" strokeWidth="2" />
        <path d="M52 98h16" stroke="#333" strokeWidth="2" />
      </svg>

      <div className="container-visual__box">
        <div className="container-visual__face container-visual__face--front">
          <div className="container-visual__stripe" />
          <div className="container-visual__badge">
            <svg viewBox="0 0 48 48" className="container-visual__icon">
              <circle cx="24" cy="24" r="22" fill="#FF5C28" />
              <path
                d="M14 30 L24 14 L34 30 Z"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M18 26h12" stroke="#fff" strokeWidth="2" />
            </svg>
            <span className="container-visual__label">{label}</span>
          </div>
        </div>
        <div className="container-visual__face container-visual__face--top" />
        <div className="container-visual__face container-visual__face--side" />
      </div>
    </div>
  );
}
