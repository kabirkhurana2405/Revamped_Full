import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Chapter, MaskedLines, Reveal } from "../components/primitives";

const STEPS = [
  { num: "01", title: "BRING IT", copy: "Bring clothes you no longer want or wear. Any brand. Any label." },
  { num: "02", title: "AI CHECK", copy: "AI helps us assess the condition and determine the best next step." },
  { num: "03", title: "SORT", copy: "Based on condition and potential: Rewear, Revamp or Recycle." },
  { num: "04", title: "IMPACT", copy: "The contribution becomes part of your Impact Journey." },
];

const FLOW = ["CLOSET", "AI CHECK", "SORT", "NEW LIFE", "IMPACT"];

function TakeBackRing() {
  return (
    <div data-testid="takeback-ring" className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <circle cx="200" cy="200" r="158" fill="none" stroke="#121212" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="2 9" />
      </svg>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-1/2 top-[10.5%] h-4 w-4 -translate-x-1/2 rounded-full border-4 border-[#F5F3EF] bg-[#1E3A2B] shadow-md" />
      </motion.div>
      <div className="absolute inset-0 m-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-[#121212]/10 bg-white shadow-xl md:h-28 md:w-28">
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#1E3A2B]" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M8.5 3 4 6l2 3 1.5-1v12h9V8L18 9l2-3-4.5-3a3.5 3.5 0 0 1-7 0Z" strokeLinejoin="round" />
        </svg>
      </div>
      {[
        { label: "01 BRING IT", cls: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
        { label: "02 AI CHECK", cls: "right-0 top-1/2 translate-x-1/3 -translate-y-1/2" },
        { label: "03 SORT", cls: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" },
        { label: "04 IMPACT", cls: "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2" },
      ].map((b) => (
        <span
          key={b.label}
          className={`absolute ${b.cls} rounded-full border border-[#121212]/15 bg-[#F5F3EF] px-3 py-1.5 font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/80 shadow-sm md:text-[9px]`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

function Calculator() {
  const [n, setN] = useState(0);
  const price = useSpring(999, { stiffness: 140, damping: 22 });
  useEffect(() => price.set(999 - n * 50), [n, price]);
  const priceText = useTransform(price, (v) => `${Math.round(v)}`);

  const C = 2 * Math.PI * 54;

  return (
    <div data-testid="takeback-calculator" className="mt-24 overflow-hidden rounded-3xl bg-[#121212] text-[#F5F3EF] md:mt-32">
      <div className="grid gap-12 p-8 md:grid-cols-2 md:p-14">
        <div>
          <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#5E8B6F]">TAKE-BACK DISCOUNT &mdash; 5% OFF PER GARMENT</p>
          <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-[1.02] tracking-tight md:text-5xl">
            Your old clothes come back with you.
          </h3>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#F5F3EF]/60">
            Bring garments you no longer wear &mdash; any brand, any label. When you buy from
            Revamped, every eligible contributed garment gets you 5% off. Up to 4 garments per
            purchase. Maximum 20% off.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 font-mono2 text-[10px] tracking-[0.2em]">
            {[
              ["BRING 1", "5% OFF"],
              ["BRING 2", "10% OFF"],
              ["BRING 3", "15% OFF"],
              ["BRING 4", "20% OFF"],
            ].map(([g, d], i) => (
              <div
                key={g}
                className={`rounded-xl border px-4 py-3 transition-colors duration-300 ${
                  n === i + 1 ? "border-[#5E8B6F] bg-[#1E3A2B]" : "border-white/10"
                }`}
              >
                <p className="text-[#F5F3EF]/50">{g}</p>
                <p className="mt-1 text-[#F5F3EF]">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono2 text-[9px] leading-relaxed tracking-[0.2em] text-[#F5F3EF]/40">
            A DISCOUNT ON YOUR PURCHASE &mdash; NOT A BUY-BACK. WE KEEP CLOTHES MOVING.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(245,243,239,0.12)" strokeWidth="3" />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#5E8B6F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={C}
                animate={{ strokeDashoffset: C * (1 - n / 4) }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]/50">DISCOUNT</span>
              <span data-testid="takeback-discount" className="font-display text-3xl font-extrabold text-[#F5F3EF]">
                {n * 5}%
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            {n > 0 && <span className="font-mono2 text-sm text-[#F5F3EF]/40 line-through">&#8377;999</span>}
            <span className="font-display text-6xl font-extrabold tracking-tight text-[#F5F3EF]">
              &#8377;<motion.span data-testid="takeback-price">{priceText}</motion.span>
            </span>
          </div>
          <p className="mt-1 font-mono2 text-[9px] tracking-[0.25em] text-[#F5F3EF]/40">
            ILLUSTRATIVE &mdash; DROP 001 AT &#8377;999
          </p>

          <div className="mt-7 flex items-center gap-2.5">
            {[0, 1, 2, 3, 4].map((v) => (
              <button
                key={v}
                data-testid={`garment-btn-${v}`}
                data-cursor="hover"
                onClick={() => setN(v)}
                className={`h-11 w-11 rounded-full border font-mono2 text-xs transition-all duration-300 ${
                  n === v
                    ? "border-[#F5F3EF] bg-[#F5F3EF] text-[#121212]"
                    : "border-white/20 text-[#F5F3EF]/70 hover:border-white/50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center font-mono2 text-[9px] tracking-[0.25em] text-[#F5F3EF]/40">
            UP TO 4 GARMENTS PER PURCHASE &middot; MAX 20% OFF
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TakeBackSection() {
  return (
    <section id="cycle" data-testid="takeback-section" className="relative bg-[#F5F3EF] py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Chapter num="04" label="THE TAKE-BACK" />
        <h2 className="mt-8 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
          <MaskedLines
            lines={["BUY.", "WEAR.", "BRING IT BACK."]}
            lineClass="text-[clamp(2.8rem,8vw,7.5rem)] text-[#121212]"
          />
        </h2>
        <Reveal delay={0.15} className="mt-6">
          <p className="font-mono2 text-xs tracking-[0.3em] text-[#1E3A2B]">
            WE TAKE BACK CLOTHES FROM ANY BRAND.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-12">
          <div className="rounded-3xl border-2 border-[#1E3A2B] bg-[#1E3A2B]/5 p-8 md:p-12">
            <p data-testid="takeback-anybrand" className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#1E3A2B] md:text-4xl">
              We take back all clothes.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#121212]/70 md:text-base">
              Bring clothes you no longer wear &mdash; any brand, any label. They don&rsquo;t have to
              be Revamped products. We assess what you bring and give it the best possible next life.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid items-center gap-14 md:mt-24 md:grid-cols-2">
          <Reveal>
            <TakeBackRing />
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div className="border-t border-[#121212]/15 pt-4">
                  <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">{s.num}</p>
                  <h4 className="mt-2 font-display text-lg font-bold tracking-wide text-[#121212]">{s.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#121212]/60">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-16">
          <div data-testid="takeback-flow" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {FLOW.map((f, i) => (
              <span key={f} className="flex items-center gap-3">
                <span
                  className={`rounded-full px-5 py-2.5 font-mono2 text-[9px] tracking-[0.25em] md:text-[10px] ${
                    i === FLOW.length - 1
                      ? "bg-[#1E3A2B] text-[#F5F3EF]"
                      : "border border-[#121212]/15 text-[#121212]/75"
                  }`}
                >
                  {f}
                </span>
                {i < FLOW.length - 1 && <span className="font-mono2 text-[#1E3A2B]">&rarr;</span>}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-12 flex flex-col items-center text-center">
          <p className="max-w-xl text-sm leading-relaxed text-[#121212]/70 md:text-base">
            Every garment you bring is assessed and directed toward its most suitable next step.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["REWEAR", "REVAMP", "RECYCLE"].map((p) => (
              <span
                key={p}
                className="rounded-full border border-[#1E3A2B]/30 px-5 py-2.5 font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]"
              >
                {p}
              </span>
            ))}
          </div>
        </Reveal>

        <Calculator />
      </div>
    </section>
  );
}
