import { motion } from "framer-motion";
import { Chapter, MaskedLines, Reveal, PillButton, EASE } from "../components/primitives";
import TeeSvg from "../components/TeeSvg";

const SHIRTS = [
  {
    name: "MINIMAL",
    sub: "DESIGN 01 — SMALL EMBROIDERED BRANDING",
    color: "#E9E4D9",
    accent: "#1E3A2B",
    initial: { opacity: 0, rotate: -7, y: 70 },
  },
  {
    name: "STATEMENT",
    sub: "DESIGN 02 — LARGER GRAPHIC + EMBROIDERY",
    color: "#22402F",
    accent: "#E9E4D9",
    initial: { opacity: 0, x: -70 },
  },
  {
    name: "CIRCULAR",
    sub: "DESIGN 03 — OLD → REVAMPED → NEW",
    color: "#2C2C29",
    accent: "#E9E4D9",
    initial: { opacity: 0, scale: 0.7 },
  },
];

export default function DropSection({ onAccess, onGetApp }) {
  return (
    <section id="drop" data-testid="drop-section" className="relative bg-[#F5F3EF] py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="text-center">
          <Chapter num="08" label="DROP 001" />
          <h2 className="mt-6 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
            <MaskedLines
              lines={["DROP 001"]}
              lineClass="text-[clamp(3.4rem,11vw,9.5rem)] text-[#121212]"
            />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-4 font-mono2 text-[11px] tracking-[0.35em] text-[#121212]/70">50 PIECES. 3 DESIGNS.</p>
            <p className="mt-2 text-sm text-[#121212]/55">We&rsquo;re starting small on purpose.</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 md:mt-24 md:grid-cols-3 md:gap-8">
          {SHIRTS.map((sh, i) => (
            <motion.div
              key={sh.name}
              data-testid={`drop-shirt-${sh.name.toLowerCase()}`}
              data-cursor="hover"
              className="group flex flex-col items-center rounded-3xl border border-[#121212]/10 bg-white/50 p-8 transition-shadow duration-500 hover:shadow-2xl md:p-10"
              initial={sh.initial}
              whileInView={{ opacity: 1, rotate: 0, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.14 }}
            >
              <div className="transition-transform duration-500 group-hover:-translate-y-2">
                <TeeSvg color={sh.color} accent={sh.accent} className="w-40 md:w-48" />
              </div>
              <p data-testid={`drop-shirt-label-${sh.name.toLowerCase()}`} className="mt-6 font-display text-xl font-bold tracking-[0.15em] text-[#121212]">
                {sh.name}
              </p>
              <p className="mt-2 text-center font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/50">{sh.sub}</p>
            </motion.div>
          ))}
        </div>

        <Reveal className="mt-14 flex flex-col items-center gap-5 text-center">
          <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#121212]/55 md:text-[10px]">
            240 GSM &middot; 100% COTTON &middot; OVERSIZED &middot; DROP SHOULDER &middot; EMBROIDERY
          </p>
          <p className="font-display text-5xl font-extrabold tracking-tight text-[#121212] md:text-6xl">&#8377;999</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <PillButton testId="drop-access-btn" onClick={onAccess}>
              GET DROP 001 ACCESS
            </PillButton>
            <button
              data-testid="drop-download-app-btn"
              data-cursor="hover"
              onClick={onGetApp}
              className="px-2 py-3 font-mono2 text-[11px] tracking-[0.25em] text-[#121212]/70 transition-colors hover:text-[#1E3A2B]"
            >
              DOWNLOAD APP
            </button>
          </div>
        </Reveal>

        <div className="mt-28 text-center md:mt-36">
          <h3 className="font-display font-extrabold uppercase leading-[0.9] tracking-tight">
            <MaskedLines lines={["50 PIECES."]} lineClass="text-[clamp(3rem,10vw,8rem)] text-[#121212]" />
            <MaskedLines delay={0.2} lines={["THAT'S IT."]} lineClass="text-[clamp(1.8rem,5.5vw,4.5rem)] text-[#1E3A2B]" />
          </h3>
        </div>
      </div>
    </section>
  );
}
