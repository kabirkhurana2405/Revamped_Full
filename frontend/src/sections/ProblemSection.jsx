import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Chapter, MaskedLines, Reveal } from "../components/primitives";

const CHIPS = [
  { left: "6%", top: "10%", r: -8, label: "WORN", tone: "from-[#3a3a36] to-[#232321]", speed: 1.2 },
  { left: "76%", top: "6%", r: 6, label: "FOLDED", tone: "from-[#CFC9BA]/25 to-[#CFC9BA]/5", speed: 0.7 },
  { left: "12%", top: "58%", r: 5, label: "OLD", tone: "from-[#2A4D3A]/50 to-[#1E3A2B]/20", speed: 1.5 },
  { left: "72%", top: "62%", r: -6, label: "UNUSED", tone: "from-[#4a4a44] to-[#2b2b28]", speed: 0.9 },
  { left: "42%", top: "30%", r: 3, label: "LOVED", tone: "from-[#8E8B83]/40 to-[#8E8B83]/10", speed: 1.8 },
];

function GarmentChip({ chip, index, progress }) {
  const y = useTransform(progress, [0, 1], [50 * chip.speed, -70 * chip.speed]);
  const x = useTransform(progress, [0.45, 0.95], [0, (2 - index) * 34]);
  const opacity = useTransform(progress, [0.72, 0.95], [1, 0.15]);
  return (
    <motion.div style={{ y, x, opacity }} className="absolute" >
      <motion.div
        className={`flex h-28 w-24 flex-col justify-end rounded-2xl border border-white/10 bg-gradient-to-br p-3 md:h-36 md:w-28 ${chip.tone}`}
        style={{ left: chip.left, top: chip.top, rotate: chip.r, position: "relative" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-mono2 text-[8px] tracking-[0.3em] text-[#F5F3EF]/60">{chip.label}</span>
      </motion.div>
    </motion.div>
  );
}

export default function ProblemSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section
      id="problem"
      ref={ref}
      data-testid="problem-section"
      className="relative overflow-hidden bg-[#121212] py-32 text-[#F5F3EF] md:py-48"
    >
      <div className="pointer-events-none absolute inset-0">
        {CHIPS.map((c, i) => (
          <div key={c.label} className="absolute" style={{ left: c.left, top: c.top }}>
            <GarmentChip chip={c} index={i} progress={scrollYProgress} />
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <Chapter num="03" label="THE PROBLEM" light />
        <h2 className="mt-8 font-display font-extrabold uppercase leading-[0.92] tracking-tight">
          <MaskedLines
            lines={["WHAT HAPPENS", "WHEN YOU'RE", "DONE WITH IT?"]}
            lineClass="text-[clamp(2.6rem,7.5vw,7rem)]"
          />
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-24">
          <Reveal>
            <p className="text-xl text-[#F5F3EF]/85 md:text-2xl">You stop wearing it.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl text-[#F5F3EF]/85 md:text-2xl">
              But that doesn&rsquo;t mean its life has to stop.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#F5F3EF]/55">
              Closets fill up with garments that still have everything left in them. The end of your
              use doesn&rsquo;t have to be the end of the garment.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-32 md:mt-44">
          <img
            src="/logo.png"
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05] md:w-[440px]"
          />
          <h3 className="relative text-center font-display font-bold uppercase leading-[1.02] tracking-tight">
            <MaskedLines
              lines={["THE END OF YOUR USE", "DOESN'T HAVE TO BE"]}
              lineClass="text-[clamp(1.8rem,4.5vw,4rem)] text-[#F5F3EF]/90"
            />
            <MaskedLines
              delay={0.3}
              lines={["THE END OF THE GARMENT."]}
              lineClass="text-[clamp(1.8rem,4.5vw,4rem)] text-[#5E8B6F]"
            />
          </h3>
        </div>
      </div>
    </section>
  );
}
