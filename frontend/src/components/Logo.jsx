export const LogoMark = ({ size = 28, className = "", mono = false }) => {
  if (mono) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#F5F3EF] ${className}`}
        style={{ width: size + 10, height: size + 10 }}
      >
        <img
          src="/logo.png"
          alt="REVAMPED logo"
          style={{ width: size, height: size, objectFit: "contain" }}
        />
      </span>
    );
  }
  return (
    <img
      src="/logo.png"
      alt="REVAMPED logo"
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
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
