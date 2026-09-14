export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#121212] px-5 py-14 text-[#F5F3EF] md:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-extrabold tracking-[0.15em]">REVAMPED</p>
          <p className="mt-2 font-mono2 text-[10px] tracking-[0.35em] text-[#5E8B6F]">STYLE. CYCLE. IMPACT.</p>
          <p className="mt-3 text-sm text-[#F5F3EF]/50">Fashion that keeps moving.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {["INSTAGRAM", "CONTACT", "PRIVACY", "TERMS"].map((l) => (
            <a
              key={l}
              data-testid={`footer-link-${l.toLowerCase()}`}
              data-cursor="hover"
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-mono2 text-[10px] tracking-[0.3em] text-[#F5F3EF]/60 transition-colors hover:text-[#F5F3EF]"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1600px] items-center justify-between border-t border-white/10 pt-6">
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]/40">&copy; 2026 REVAMPED</p>
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]/40">MADE TO MOVE</p>
      </div>
    </footer>
  );
}
