import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Chapter, MaskedLines, Reveal, EASE } from "../components/primitives";

const Counter = ({ to, className, testId }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} data-testid={testId} className={className}>
      {val}
    </span>
  );
};

const DotField = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [targets, setTargets] = useState(null);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const w = ref.current.clientWidth;
    const h = ref.current.clientHeight;
    const cx = w / 2;
    const cy = h * 0.98;
    const groups = [
      { n: 20, r: Math.min(w * 0.44, 200), c: "#B9B3A4" },
      { n: 18, r: Math.min(w * 0.34, 155), c: "#2A4D3A" },
      { n: 12, r: Math.min(w * 0.24, 110), c: "#8E8B83" },
    ];
    const pts = [];
    let idx = 0;
    groups.forEach((g) => {
      for (let i = 0; i < g.n; i++) {
        const theta = Math.PI + (Math.PI * (i + 0.5)) / g.n;
        const col = idx % 10;
        const row = Math.floor(idx / 10);
        const ox = ((col + 0.5) / 10) * w;
        const oy = row * 52 + 10;
        pts.push({
          id: idx,
          dx: cx + g.r * Math.cos(theta) - ox,
          dy: cy + g.r * Math.sin(theta) * 0.92 - oy,
          c: g.c,
        });
        idx++;
      }
    });
    setTargets(pts);
  }, [inView]);

  return (
    <div data-testid="impact-dots" ref={ref} className="relative mx-auto h-[290px] w-full max-w-[560px] md:h-[330px]">
      {Array.from({ length: 50 }).map((_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);
        const t = targets ? targets[i] : null;
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: `${((col + 0.5) / 10) * 100}%`,
              top: row * 52 + 10,
              backgroundColor: t ? t.c : "rgba(18,18,18,0.18)",
            }}
            animate={t ? { x: t.dx, y: t.dy } : {}}
            transition={{ delay: i * 0.012, duration: 1.3, ease: EASE }}
          />
        );
      })}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2 font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">
        <span>REWEAR</span>
        <span>REVAMP</span>
        <span>RECYCLE</span>
      </div>
    </div>
  );
};

const LEDGER = [
  ["GARMENTS RETURNED", "0"],
  ["GARMENTS REWEARABLE", "0"],
  ["GARMENTS REVAMPED / RECYCLED", "0"],
];

export default function ImpactSection() {
  return (
    <section id="impact" data-testid="impact-section" className="relative bg-[#F5F3EF] py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Chapter num="06" label="IMPACT" />
        <h2 className="mt-8 font-display font-extrabold uppercase leading-[0.94] tracking-tight">
          <MaskedLines
            lines={["STYLE IS WHAT YOU SEE.", "IMPACT IS WHAT", "YOU LEAVE BEHIND."]}
            lineClass="text-[clamp(2.2rem,6vw,5.5rem)] text-[#121212]"
          />
        </h2>
        <Reveal delay={0.2} className="mt-8 max-w-xl">
          <p className="text-sm leading-relaxed text-[#121212]/70 md:text-base">
            Every returned garment creates a chance to keep material in use rather than simply ending
            its journey.
          </p>
        </Reveal>

        <div data-testid="impact-ledger" className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-[#121212]/10 bg-[#121212]/10 md:grid-cols-3">
          {LEDGER.map(([label, val]) => (
            <div key={label} className="bg-[#F5F3EF] p-8 md:p-12">
              <p className="font-display text-6xl font-extrabold text-[#121212] md:text-7xl">{val}</p>
              <p className="mt-3 font-mono2 text-[10px] tracking-[0.28em] text-[#121212]/60">{label}</p>
            </div>
          ))}
        </div>
        <Reveal className="mt-4">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">THE LEDGER STARTS AT ZERO. THE PILOT BEGINS WITH DROP 001.</p>
        </Reveal>

        <div className="mt-28 text-center md:mt-36">
          <Reveal>
            <p className="font-mono2 text-[11px] tracking-[0.4em] text-[#121212]/60">WE&rsquo;RE STARTING WITH</p>
          </Reveal>
          <Counter
            to={50}
            testId="impact-counter-50"
            className="mt-2 block font-display text-[26vw] font-extrabold leading-none text-[#1E3A2B] md:text-[13rem]"
          />
          <Reveal>
            <p className="font-mono2 text-[11px] tracking-[0.4em] text-[#121212]/60">DROP 001 PILOT</p>
          </Reveal>
          <div className="mt-16">
            <DotField />
            <Reveal className="mt-14">
              <p className="text-sm text-[#121212]/60">50 garments. Each one with a next step.</p>
            </Reveal>
          </div>
        </div>

        <div className="mt-32 grid items-center gap-14 md:mt-44 md:grid-cols-2">
          <div>
            <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight">
              <MaskedLines
                lines={["IMPACT SHOULD", "BE TRACEABLE."]}
                lineClass="text-[clamp(2rem,5vw,4.5rem)] text-[#121212]"
              />
            </h3>
            <Reveal delay={0.15} className="mt-6 max-w-md">
              <p className="text-sm leading-relaxed text-[#121212]/70 md:text-base">
                Your contribution shouldn&rsquo;t disappear into a vague sustainability claim. Impact
                should be something you can see &mdash; what you returned, where it went, what happened
                next.
              </p>
              <p className="mt-4 font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">
                TRACK THE JOURNEY OF WHAT YOU RETURN.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div
              data-testid="impact-demo-card"
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#1E3A2B] p-8 text-[#F5F3EF] shadow-2xl md:p-10"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#5E8B6F]/20 blur-2xl" />
              <div className="flex items-center justify-between">
                <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#F5F3EF]/70">YOUR IMPACT</p>
                <span className="rounded-full bg-[#F5F3EF] px-3 py-1 font-mono2 text-[9px] tracking-[0.25em] text-[#121212]">
                  DEMO
                </span>
              </div>
              <div className="mt-8 space-y-5">
                {[
                  ["GARMENTS RETURNED", "04"],
                  ["CURRENTLY IN CIRCULATION", "03"],
                  ["DIVERTED TO RECYCLING", "01"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-end justify-between border-b border-white/10 pb-4">
                    <span className="font-mono2 text-[10px] tracking-[0.22em] text-[#F5F3EF]/60">{label}</span>
                    <span className="font-display text-4xl font-extrabold">{val}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]/50">
                EXAMPLE INTERFACE &mdash; COMING TO THE APP
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
