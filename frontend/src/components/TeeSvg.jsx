export default function TeeSvg({ color = "#E9E4D9", className = "", folds = true, logoSrc = "/logo.png" }) {
  return (
    <svg viewBox="0 0 200 210" className={className} fill="none" aria-hidden="true">
      <path
        d="M67 14 L34 26 L8 54 L27 69 L47 57 L47 174 Q100 184 153 174 L153 57 L173 69 L192 54 L166 26 L133 14 Q100 30 67 14 Z"
        fill={color}
        stroke="rgba(18,18,18,0.14)"
        strokeWidth="1.5"
      />
      <path d="M67 14 Q100 30 133 14 Q100 22 67 14 Z" fill="rgba(18,18,18,0.08)" />
      {folds && (
        <g stroke="rgba(18,18,18,0.10)" strokeWidth="2" strokeLinecap="round">
          <path d="M70 80 Q74 120 70 160" />
          <path d="M96 84 Q99 124 95 166" />
          <path d="M126 78 Q122 118 127 160" />
        </g>
      )}
      <image href={logoSrc} x="104" y="50" width="32" height="33" />
    </svg>
  );
}
