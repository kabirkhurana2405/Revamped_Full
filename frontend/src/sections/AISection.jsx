import { motion } from "framer-motion";
import { Chapter, MaskedLines, Reveal, EASE } from "../components/primitives";
import TeeSvg from "../components/TeeSvg";

const CHECKS = [
  ["CONDITION", "GOOD"],
  ["WEAR", "LOW"],
  ["DAMAGE", "NONE"],
  ["REUSE POTENTIAL", "HIGH"],
];

const BRACKETS = [
  "left-3 top-3 border-l-2 border-t-2",
  "right-3 top-3 border-r-2 border-t-2",
  "left-3 bottom-3 border-l-2 border-b-2",
  "right-3 bottom-3 border-r-2 border-b-2",
];

export default function AISection() {
  return (
    <section id="ai" data-testid="ai-section" className="relative bg-[#F5F3EF] py-28 md:py-40">
      <div className="mx-auto grid max-w-[1600px] items-center gap-14 px-5 md:grid-cols-2 md:px-10">
        <div>
          <Chapter num="05" label="THE AI CHECK" />
          <h2 className="mt-8 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
            <MaskedLines
              lines={["SCANNED.", "ASSESSED.", "SORTED."]}
              lineClass="text-[clamp(2rem,4vw,3.8rem)] text-[#121212]"
            />
          </h2>
          <Reveal delay={0.15} className="mt-6 max-w-md">
            <p className="text-sm leading-relaxed text-[#121212]/70 md:text-base">
              Every garment you bring gets an AI-assisted condition assessment. AI helps us evaluate
              overall condition, visible damage, wear, stains, tears and usability &mdash; and
              determine the best next step.
            </p>
          </Reveal>
          <Reveal delay={0.25} className="mt-7 flex flex-wrap gap-2">
            {["CONDITION", "WEAR", "DAMAGE", "STAINS", "TEARS", "USABILITY"].map((c) => (
              <span
                key={c}
                className="rounded-full border border-[#121212]/15 px-4 py-2 font-mono2 text-[9px] tracking-[0.22em] text-[#121212]/70"
              >
                {c}
              </span>
            ))}
          </Reveal>
          <Reveal delay={0.35} className="mt-7">
            <p className="font-mono2 text-[10px] tracking-[0.2em] text-[#1E3A2B]">
              AI ASSISTS. OUR TEAM VERIFIES EVERY ASSESSMENT.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            data-testid="ai-scan-card"
            className="relative overflow-hidden rounded-3xl bg-[#121212] p-6 text-[#F5F3EF] shadow-2xl md:p-8"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]/60">AI CONDITION CHECK</p>
              <span className="flex items-center gap-2 font-mono2 text-[8px] tracking-[0.2em] text-[#5E8B6F]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5E8B6F]" />
                SCANNING
              </span>
            </div>
            <div className="relative mt-5 h-56 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a18] md:h-64">
              {BRACKETS.map((cls) => (
                <span key={cls} className={`absolute h-6 w-6 border-[#5E8B6F] ${cls}`} />
              ))}
              <TeeSvg className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 md:h-44 md:w-44" />
              <div className="scan-line absolute left-4 right-4 h-0.5 bg-[#5E8B6F] shadow-[0_0_16px_rgba(94,139,111,0.9)]" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {CHECKS.map(([k, v], i) => (
                <motion.div
                  key={k}
                  className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: EASE }}
                >
                  <span className="font-mono2 text-[8px] tracking-[0.2em] text-[#F5F3EF]/60">{k}</span>
                  <span className="font-mono2 text-[9px] tracking-[0.15em] text-[#5E8B6F]">{v}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-4 flex items-center justify-between rounded-xl bg-[#1E3A2B] px-4 py-3.5"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0, duration: 0.5, ease: EASE }}
            >
              <span className="font-mono2 text-[8px] tracking-[0.25em] text-[#F5F3EF]/70">
                AI ASSESSMENT &rarr; BEST NEXT LIFE
              </span>
              <span className="font-display text-sm font-extrabold tracking-wide text-[#F5F3EF]">REWEAR</span>
            </motion.div>
            <p className="mt-4 text-center font-mono2 text-[7px] tracking-[0.25em] text-[#F5F3EF]/35">
              CONCEPT INTERFACE &mdash; DEMO PREVIEW
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
