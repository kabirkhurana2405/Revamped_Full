export const LogoMark = ({ size = 28, className = "", mono = false }) => {
  const dark = mono ? "currentColor" : "#2B2B28";
  const red = mono ? "currentColor" : "#E23B3B";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <g stroke={red} strokeWidth="9" strokeLinecap="round">
        <path d="M84.6 27.6 A74 74 0 0 1 149.5 45" />
        <path d="M170.4 122.9 A74 74 0 0 1 122.9 170.4" />
        <path d="M29.6 77.1 A74 74 0 0 1 77.1 29.6" />
      </g>
      <g stroke={dark} strokeWidth="16" fill="none">
        <path d="M44.6 132 A64 64 0 0 1 100 36" />
        <path d="M132 44.6 A64 64 0 0 1 132 155.4" />
        <path d="M100 164 A64 64 0 0 1 44.6 68" />
      </g>
      <g fill={dark}>
        <path d="M118 36 L98 21 L98 51 Z" />
        <path d="M116.4 164.4 L141.2 167.4 L126.2 141.4 Z" />
        <path d="M53.6 52.4 L30.6 62.2 L56.6 77.2 Z" />
      </g>
      <g stroke={dark} strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M100 68 C100 60 93 58 93 51 C93 45 99 43 103 46" />
        <path d="M100 68 L64 92" />
        <path d="M100 68 L136 92" />
        <path d="M72 92 L128 92" />
      </g>
      <path d="M77 85 L100 124" stroke={dark} strokeWidth="11" strokeLinecap="round" />
      <path d="M100 124 L123 85" stroke={dark} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
};

export default function Logo({ className = "", markSize = 26, wordmarkClass = "text-lg", mono = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} mono={mono} />
      <span className={`font-display font-extrabold tracking-[0.18em] ${wordmarkClass}`}>REVAMPED</span>
    </span>
  );
}
