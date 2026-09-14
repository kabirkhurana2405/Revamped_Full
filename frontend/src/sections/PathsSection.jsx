import { motion } from "framer-motion";
import { Shirt, Scissors, Layers } from "lucide-react";
import { Chapter, MaskedLines, Reveal, EASE } from "../components/primitives";

const PATHS = [
  {
    id: "rewear",
    num: "PATH 01",
    title: "REWEAR",
    icon: Shirt,
    copy: "Still wearable. Restored and directed toward another wearer or donation pathway.",
  },
  {
    id: "revamp",
    num: "PATH 02",
    title: "REVAMP",
    icon: Scissors,
    copy: "Still has potential. Selected garments can be transformed through redesign and upcycling.",
  },
  {
    id: "recycle",
    num: "PATH 03",
    title: "RECYCLE",
    icon: Layers,
    copy: "No longer wearable. Material is directed toward appropriate textile recycling pathways.",
  },
];

export default function PathsSection() {
  return (
    <section id="paths" data-testid="paths-section" className="relative overflow-hidden bg-[#ECE8E0] py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Chapter num="06" label="THREE PATHS" />
        <h2 className="mt-8 text-center font-display font-extrabold uppercase leading-[0.92] tracking-tight">
          <MaskedLines
            lines={["ONE RETURN.", "THREE POSSIBILITIES."]}
            lineClass="text-[clamp(2.4rem,7vw,6.5rem)] text-[#121212]"
          />
        </h2>

        <div className="relative mt-20 md:mt-28">
          <Reveal className="relative z-10 mx-auto w-max">
            <div className="flex items-center gap-3 rounded-full border border-[#121212]/15 bg-[#F5F3EF] px-6 py-3 shadow-sm">
              <Shirt size={16} className="text-[#1E3A2B]" />
              <span className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/80">ONE RETURNED GARMENT</span>
            </div>
          </Reveal>

          <svg viewBox="0 0 1200 220" className="pointer-events-none absolute -top-2 left-0 hidden h-[220px] w-full md:block" fill="none">
            {[
              "M600,0 C600,110 200,90 200,205",
              "M600,0 C600,110 600,110 600,205",
              "M600,0 C600,110 1000,90 1000,205",
            ].map((d, i) => (
              <motion.path
                key={i}
                d={d}
                stroke="#1E3A2B"
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.2 + i * 0.2 }}
              />
            ))}
          </svg>

          <div className="relative z-10 mt-16 grid gap-6 md:mt-48 md:grid-cols-3 md:gap-8">
            {PATHS.map((p, i) => (
              <Reveal key={p.id} delay={0.15 + i * 0.12}>
                <div
                  data-testid={`path-card-${p.id}`}
                  data-cursor="hover"
                  className="group h-full rounded-3xl border border-[#121212]/10 bg-[#F5F3EF] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl md:p-10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A2B] text-[#F5F3EF] transition-transform duration-500 group-hover:scale-110">
                    <p.icon size={20} strokeWidth={1.6} />
                  </div>
                  <p className="mt-6 font-mono2 text-[10px] tracking-[0.35em] text-[#1E3A2B]">{p.num}</p>
                  <h3 className="mt-2 font-display text-3xl font-extrabold tracking-wide text-[#121212]">{p.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#121212]/65">{p.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <p className="mx-auto max-w-lg font-mono2 text-[10px] leading-relaxed tracking-[0.15em] text-[#121212]/50">
              THE CONDITION ASSESSMENT DETERMINES THE APPROPRIATE PATHWAY &mdash; NOT EVERY
              GARMENT FOLLOWS THE SAME ROUTE.
            </p>
          </Reveal>
        </div>

        <div className="mt-28 flex flex-col items-center md:mt-40">
          <Reveal>
            <div data-testid="loop-visual" className="relative flex h-[320px] w-[320px] items-center justify-center md:h-[400px] md:w-[400px]">
              <svg viewBox="0 0 400 400" className="spin-slow absolute inset-0 h-full w-full">
                <defs>
                  <path id="loopPath" d="M200,200 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0" fill="none" />
                </defs>
                <text fontSize="15.5" letterSpacing="7" fill="#1E3A2B" className="font-mono2">
                  <textPath href="#loopPath">REWEAR &middot; REVAMP &middot; RECYCLE &middot; REWEAR &middot; REVAMP &middot; RECYCLE &middot;</textPath>
                </text>
              </svg>
              <svg viewBox="0 0 400 400" className="spin-slower absolute inset-6 h-auto w-auto" style={{ animationDirection: "reverse" }}>
                <circle cx="200" cy="200" r="150" fill="none" stroke="#121212" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 10" />
              </svg>
              <div className="text-center">
                <p className="font-display text-4xl font-extrabold tracking-[0.06em] text-[#121212] md:text-5xl">REVAMPED</p>
                <p className="mt-3 font-mono2 text-[10px] tracking-[0.3em] text-[#8E8B83] md:text-[11px]">
                  STYLE &rarr; CYCLE &rarr; IMPACT
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
