import { MaskedLines, Reveal, PillButton } from "../components/primitives";
import TeeSvg from "../components/TeeSvg";

export default function FinalCTA({ onGetApp, onAccess }) {
  return (
    <section
      id="final"
      data-testid="final-cta-section"
      className="relative overflow-hidden bg-[#1E3A2B] text-[#F5F3EF]"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[26vw] font-extrabold uppercase leading-none text-transparent opacity-[0.08]"
        style={{ WebkitTextStroke: "2px #F5F3EF" }}
      >
        REVAMPED
      </div>
      <svg
        viewBox="0 0 800 800"
        className="spin-slower pointer-events-none absolute left-1/2 top-1/2 h-[150vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2 opacity-40"
      >
        <circle cx="400" cy="400" r="330" fill="none" stroke="#F5F3EF" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 14" />
      </svg>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-28 text-center">
        <Reveal>
          <TeeSvg className="animate-float-y mx-auto w-48 md:w-60" color="#E9E4D9" accent="#1E3A2B" />
        </Reveal>

        <h2 className="mt-8 font-display font-extrabold uppercase leading-[0.88] tracking-tight">
          <MaskedLines lines={["STYLE.", "CYCLE.", "IMPACT."]} lineClass="text-[clamp(3.2rem,11vw,9rem)]" />
        </h2>
        <Reveal delay={0.2} className="mt-8">
          <p className="font-mono2 text-[11px] tracking-[0.35em] text-[#F5F3EF]/70 md:text-xs">
            WHAT YOU STOP WEARING DOESN&rsquo;T HAVE TO STOP THERE.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#F5F3EF]/60">
            Join the first generation building a fashion system that keeps moving. Any brand. Any
            garment.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <PillButton testId="final-download-btn" variant="light" onClick={onGetApp}>
            DOWNLOAD THE APP
          </PillButton>
          <PillButton testId="final-drop-access-btn" variant="outline" onClick={onAccess} className="text-[#F5F3EF]">
            GET DROP 001 ACCESS
          </PillButton>
        </Reveal>
      </div>
    </section>
  );
}
