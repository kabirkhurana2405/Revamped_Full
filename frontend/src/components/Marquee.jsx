const ITEMS = [
  "STYLE",
  "CYCLE",
  "IMPACT",
  "KEEP FASHION MOVING",
  "ONE GARMENT. MULTIPLE LIVES.",
  "BUY IT. WEAR IT. BRING IT BACK.",
];

export default function Marquee() {
  return (
    <div data-testid="marquee" className="overflow-hidden border-y border-[#121212]/10 bg-[#F5F3EF] py-6 md:py-8">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span
              className={`font-display text-3xl font-bold uppercase tracking-tight md:text-5xl ${
                i % 2 ? "text-transparent" : "text-[#121212]"
              }`}
              style={i % 2 ? { WebkitTextStroke: "1.2px #121212" } : undefined}
            >
              {t}
            </span>
            <span className="h-2 w-2 rounded-full bg-[#1E3A2B]" />
          </span>
        ))}
      </div>
    </div>
  );
}
