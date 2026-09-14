import { useState } from "react";
import { motion } from "framer-motion";
import { Chapter, MaskedLines, Reveal, EASE } from "../components/primitives";
import TeeSvg from "../components/TeeSvg";

const SPECS = [
  { label: "240 GSM", spec: "fabric", pos: "left-[4%] top-[14%]" },
  { label: "100% COTTON", spec: "fabric", pos: "right-[4%] top-[24%]" },
  { label: "EMBROIDERY", spec: "embroidery", pos: "right-[10%] bottom-[16%]" },
  { label: "OVERSIZED", spec: "fit", pos: "left-[7%] bottom-[26%]" },
  { label: "DROP SHOULDER", spec: "fit", pos: "right-[2%] top-[52%]" },
];

const SPOT = {
  none: { opacity: 0 },
  fabric: { opacity: 1, top: "42%", left: "28%", width: "44%", height: "48%" },
  embroidery: { opacity: 1, top: "24%", left: "52%", width: "22%", height: "16%" },
  fit: { opacity: 1, top: "12%", left: "14%", width: "72%", height: "78%" },
};

export default function StyleSection() {
  const [active, setActive] = useState("none");

  return (
    <section id="style" data-testid="style-section" className="relative overflow-hidden bg-[#F5F3EF] py-28 md:py-40">
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-5 md:grid-cols-2 md:px-10">
        <div>
          <Chapter num="02" label="STYLE" />
          <h2 className="mt-6 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
            <MaskedLines lines={["STYLE"]} lineClass="text-[clamp(2.6rem,6.5vw,5.5rem)] text-[#121212]" />
          </h2>
          <Reveal delay={0.15} className="mt-6">
            <p className="font-mono2 text-xs tracking-[0.3em] text-[#1E3A2B]">WE START WITH THE CLOTHES.</p>
          </Reveal>
          <Reveal delay={0.25} className="mt-5 max-w-sm">
            <p className="text-sm leading-relaxed text-[#121212]/70 md:text-base">
              Revamped is built around clothes people actually want to wear. Heavyweight, oversized,
              made to be lived in &mdash; and made to come back.
            </p>
          </Reveal>
          <Reveal delay={0.35} className="mt-8 hidden gap-2 md:flex md:flex-wrap">
            {SPECS.map((s) => (
              <button
                key={s.label}
                data-testid={`style-spec-list-${s.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                data-cursor="hover"
                onMouseEnter={() => setActive(s.spec)}
                onMouseLeave={() => setActive("none")}
                className={`rounded-full border px-4 py-2 font-mono2 text-[10px] tracking-[0.22em] transition-colors duration-300 ${
                  active === s.spec
                    ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]"
                    : "border-[#121212]/15 text-[#121212]/70 hover:border-[#121212]/40"
                }`}
              >
                {s.label}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="relative flex h-[52vh] items-center justify-center md:h-[72vh]" data-cursor="explore" data-cursor-text="EXPLORE">
          <motion.div
            animate={{ scale: active === "fit" ? 0.88 : active === "none" ? 1 : 1.12 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <TeeSvg className="animate-float-y w-64 md:w-[24rem]" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute rounded-full border-2 border-[#1E3A2B]/60"
            animate={SPOT[active] || SPOT.none}
            transition={{ duration: 0.5, ease: EASE }}
          />
          {SPECS.map((s, i) => (
            <button
              key={s.label}
              data-testid={`style-spec-chip-${i}`}
              data-cursor="hover"
              onMouseEnter={() => setActive(s.spec)}
              onMouseLeave={() => setActive("none")}
              className={`absolute items-center gap-2 rounded-full border px-3 py-2 font-mono2 text-[9px] tracking-[0.2em] backdrop-blur-md transition-all duration-300 md:flex ${s.pos} ${
                active === s.spec
                  ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]"
                  : "border-[#121212]/15 bg-[#F5F3EF]/70 text-[#121212]/80"
              } ${i > 1 ? "hidden md:flex" : "flex"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active === s.spec ? "bg-[#F5F3EF]" : "bg-[#1E3A2B]"}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
