export const LogoMark = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <path d="M24 15 V49" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <circle cx="34" cy="27" r="12" stroke="currentColor" strokeWidth="7" />
    <path d="M36 37 L48 49" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

export default function Logo({ className = "", markSize = 26, wordmarkClass = "text-lg" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      <span className={`font-display font-extrabold tracking-[0.18em] ${wordmarkClass}`}>REVAMPED</span>
    </span>
  );
}
