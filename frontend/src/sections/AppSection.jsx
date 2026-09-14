import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useMotionTemplate, AnimatePresence } from "framer-motion";
import { Chapter, MaskedLines, Reveal, PillButton } from "../components/primitives";

const WORDS = ["DISCOVER", "RETURN", "IMPACT", "TRACK", "REWARD", "DROP"];

const ScreenShell = ({ nav = 0, children }) => (
  <div className="flex h-full flex-col bg-[#F5F3EF] text-left">
    <div className="flex items-center justify-between px-5 pt-6">
      <span className="font-display text-[10px] font-extrabold tracking-[0.22em] text-[#121212]">REVAMPED</span>
      <span className="h-1.5 w-6 rounded-full bg-[#121212]/15" />
    </div>
    <div className="flex-1 overflow-hidden px-5 pb-2 pt-4">{children}</div>
    <div className="flex items-center justify-around border-t border-[#121212]/10 px-2 py-3">
      {["HOME", "DROP", "RETURN", "IMPACT"].map((it, i) => (
        <span
          key={it}
          className={`font-mono2 text-[7px] tracking-[0.2em] ${i === nav ? "text-[#1E3A2B]" : "text-[#121212]/40"}`}
        >
          {it}
        </span>
      ))}
    </div>
  </div>
);

const HomeScreen = () => (
  <ScreenShell nav={0}>
    <p className="font-display text-[26px] font-extrabold leading-[1.02] text-[#121212]">
      KEEP IT
      <br />
      MOVING.
    </p>
    <div className="mt-5 rounded-2xl bg-[#1E3A2B] p-4 text-[#F5F3EF]">
      <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#F5F3EF]/60">DROP 001</p>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="font-mono2 text-[8px] tracking-[0.25em] text-[#F5F3EF]/70">50 PIECES</p>
          <p className="font-display text-xl font-bold">&#8377;999</p>
        </div>
        <span className="rounded-full bg-[#F5F3EF] px-3 py-1.5 font-mono2 text-[8px] tracking-[0.2em] text-[#121212]">
          EXPLORE DROP
        </span>
      </div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-[#121212]/10 p-3">
        <p className="font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/50">YOUR LOOP</p>
        <p className="mt-2 font-display text-base font-bold text-[#121212]">0 RETURNS</p>
      </div>
      <div className="rounded-2xl border border-[#121212]/10 p-3">
        <p className="font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/50">REWARD</p>
        <p className="mt-2 font-display text-base font-bold text-[#121212]">&mdash;</p>
      </div>
    </div>
  </ScreenShell>
);

const ReturnScreen = () => (
  <ScreenShell nav={2}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">RETURN YOUR CLOTHES</p>
    <p className="mt-2 font-display text-[22px] font-extrabold leading-[1.05] text-[#121212]">
      READY TO LET
      <br />
      IT GO?
    </p>
    <p className="mt-2 text-[10px] leading-relaxed text-[#121212]/60">
      Bring clothes you no longer want and give them another possible life.
    </p>
    <div className="mt-4 rounded-2xl border border-dashed border-[#121212]/25 p-3 text-center font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/60">
      + ADD GARMENT
    </div>
    <div className="mt-3 rounded-2xl border border-[#121212]/10 bg-white/60 p-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold text-[#121212]">T-SHIRT</p>
        <span className="rounded-full bg-[#1E3A2B]/10 px-2 py-1 font-mono2 text-[7px] tracking-[0.15em] text-[#1E3A2B]">
          GOOD
        </span>
      </div>
      <p className="mt-1 font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/45">NEXT: ASSESSMENT</p>
    </div>
    <div className="mt-3 flex items-center justify-between">
      <p className="font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/60">GARMENTS ADDED 2 / 4</p>
      <p className="font-display text-base font-extrabold text-[#1E3A2B]">10% OFF</p>
    </div>
    <div className="mt-3 rounded-full bg-[#121212] py-3 text-center font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]">
      CONTINUE
    </div>
  </ScreenShell>
);

const ImpactScreen = () => (
  <ScreenShell nav={3}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">MY IMPACT</p>
    <div className="mt-3 flex items-end gap-3">
      <p className="font-display text-6xl font-extrabold leading-none text-[#121212]">04</p>
      <p className="pb-1 font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/55">
        GARMENTS
        <br />
        RETURNED
      </p>
    </div>
    <div className="mt-5 space-y-3">
      {[
        ["01", "REWEAR", "w-1/4"],
        ["02", "REVAMP", "w-2/4"],
        ["01", "RECYCLE", "w-1/4"],
      ].map(([n, label, w]) => (
        <div key={label}>
          <div className="flex justify-between font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/60">
            <span>{label}</span>
            <span>{n}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#121212]/10">
            <div className={`h-full rounded-full bg-[#1E3A2B] ${w}`} />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-5 rounded-2xl border border-[#121212]/10 p-3">
      <p className="text-center font-mono2 text-[7px] tracking-[0.25em] text-[#121212]/50">RETURNED &darr; ASSESSED &darr; NEXT LIFE</p>
    </div>
    <p className="mt-3 text-center text-[9px] text-[#121212]/50">See where your returned garments go.</p>
  </ScreenShell>
);

const JourneyScreen = () => (
  <ScreenShell nav={3}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">GARMENT JOURNEY</p>
    <p className="mt-2 font-display text-lg font-extrabold text-[#121212]">OVERSIZED TEE &mdash; BONE</p>
    <div className="mt-6 space-y-0">
      {[
        ["RETURNED", true],
        ["ASSESSED", true],
        ["NEXT LIFE", false],
      ].map(([step, done], i) => (
        <div key={step} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`h-3.5 w-3.5 rounded-full border-2 ${
                done ? "border-[#1E3A2B] bg-[#1E3A2B]" : "border-[#1E3A2B] bg-transparent"
              }`}
            />
            {i < 2 && <span className="h-10 w-px bg-[#121212]/20" />}
          </div>
          <div className="-mt-0.5">
            <p className={`font-mono2 text-[9px] tracking-[0.25em] ${done ? "text-[#121212]" : "text-[#121212]/45"}`}>
              {step}
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 rounded-2xl bg-[#1E3A2B] p-4">
      <p className="font-mono2 text-[7px] tracking-[0.3em] text-[#F5F3EF]/60">STATUS</p>
      <p className="mt-1 font-display text-base font-bold text-[#F5F3EF]">Moving to next stage</p>
    </div>
  </ScreenShell>
);

const RewardsScreen = () => (
  <ScreenShell nav={0}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">REWARDS</p>
    <div className="mt-4 rounded-2xl bg-[#1E3A2B] p-5 text-[#F5F3EF]">
      <p className="font-mono2 text-[7px] tracking-[0.3em] text-[#F5F3EF]/60">CURRENT REWARD</p>
      <p className="mt-2 font-display text-4xl font-extrabold">20% OFF</p>
      <p className="mt-2 text-[10px] text-[#F5F3EF]/70">Your old clothes came back with you.</p>
    </div>
    <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#121212]/10 p-4">
      <p className="font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/55">RETURNED GARMENTS</p>
      <p className="font-display text-2xl font-extrabold text-[#121212]">04</p>
    </div>
    <div className="mt-3 flex gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-2 flex-1 rounded-full bg-[#1E3A2B]" />
      ))}
    </div>
    <p className="mt-3 text-center font-mono2 text-[7px] tracking-[0.25em] text-[#121212]/45">
      MAX 4 GARMENTS &middot; MAX 20% OFF
    </p>
  </ScreenShell>
);

const DropScreen = () => (
  <ScreenShell nav={1}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">DROP 001</p>
    <p className="mt-2 font-display text-[22px] font-extrabold leading-[1.05] text-[#121212]">
      3 DESIGNS.
      <br />
      50 PIECES.
    </p>
    <div className="mt-4 flex gap-2">
      {["#E9E4D9", "#22402F", "#2C2C29"].map((c, i) => (
        <div key={c} className="flex-1 rounded-2xl border border-[#121212]/10 p-2">
          <div className="h-16 rounded-xl" style={{ backgroundColor: c }} />
          <p className="mt-2 text-center font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/55">
            {["MINIMAL", "STATEMENT", "CIRCULAR"][i]}
          </p>
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between">
      <p className="font-display text-2xl font-extrabold text-[#121212]">&#8377;999</p>
      <p className="font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/50">240 GSM COTTON</p>
    </div>
    <div className="mt-3 rounded-full bg-[#121212] py-3 text-center font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]">
      GET ACCESS
    </div>
  </ScreenShell>
);

const SCREENS = [<HomeScreen key={0} />, <ReturnScreen key={1} />, <ImpactScreen key={2} />, <JourneyScreen key={3} />, <RewardsScreen key={4} />, <DropScreen key={5} />];

function Phone({ progress, screenIdx }) {
  const ry = useTransform(progress, [0, 0.28, 0.5, 0.72, 1], [0, 26, 180, 334, 360]);
  const rx = useTransform(progress, [0, 1], [7, 4]);
  const transform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg)`;

  return (
    <div style={{ perspective: 1400 }}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div
          data-testid="app-phone"
          className="preserve-3d relative h-[520px] w-[252px] md:h-[600px] md:w-[292px]"
          style={{ transform }}
        >
          <div className="absolute inset-[3px] rounded-[2.4rem] bg-[#111110]" />
          <div
            className="backface-hidden absolute inset-0 overflow-hidden rounded-[2.6rem] border border-black/70 bg-[#0d0d0c] p-[9px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)]"
            style={{ transform: "translateZ(8px)" }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-[#F5F3EF]">
              <div className="absolute left-1/2 top-2.5 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0d0d0c]" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={screenIdx}
                  data-testid="app-screen"
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {SCREENS[screenIdx]}
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            </div>
          </div>
          <div
            className="backface-hidden absolute inset-0 rounded-[2.6rem] border border-black/70 bg-gradient-to-br from-[#2c2c2a] via-[#141413] to-[#232320] p-[9px]"
            style={{ transform: "rotateY(180deg) translateZ(8px)" }}
          >
            <div className="relative h-full w-full rounded-[2.1rem] border border-white/5">
              <div className="absolute left-5 top-5 flex h-20 w-20 flex-col items-center justify-center gap-3 rounded-3xl bg-black/40">
                <span className="h-7 w-7 rounded-full border-2 border-[#3a3a38] bg-[#0a0a0a]" />
                <span className="h-7 w-7 rounded-full border-2 border-[#3a3a38] bg-[#0a0a0a]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1E3A2B]">
                  <span className="font-display text-[9px] font-extrabold tracking-[0.2em] text-[#F5F3EF]">REVAMPED</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <div className="mx-auto mt-8 h-6 w-2/3 rounded-[100%] bg-black/40 blur-xl" />
    </div>
  );
}

export default function AppSection({ onGetApp }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIdx(Math.min(5, Math.floor(v * 6.001)));
  });

  return (
    <section id="app" ref={ref} data-testid="app-section" className="relative h-[560vh] bg-[#121212] text-[#F5F3EF]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-8 px-5 md:grid-cols-2 md:gap-4 md:px-10">
          <div>
            <Chapter num="08" label="THE APP" light />
            <h2 className="mt-6 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
              <MaskedLines
                lines={["YOUR CLOSET.", "YOUR LOOP."]}
                lineClass="text-[clamp(2.6rem,6.5vw,6rem)]"
              />
            </h2>
            <Reveal delay={0.15} className="mt-5">
              <p className="text-sm text-[#F5F3EF]/60 md:text-base">Meet the Revamped app.</p>
            </Reveal>
            <div className="mt-10 hidden h-20 md:block">
              <AnimatePresence mode="wait">
                <motion.p
                  key={idx}
                  data-testid="app-step-word"
                  className="font-display text-6xl font-extrabold uppercase tracking-tight text-transparent lg:text-7xl"
                  style={{ WebkitTextStroke: "1.5px rgba(245,243,239,0.55)" }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {WORDS[idx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                data-testid="store-apple-btn"
                data-cursor="hover"
                onClick={onGetApp}
                className="rounded-full border border-[#F5F3EF]/30 px-6 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] transition-colors duration-300 hover:bg-[#F5F3EF] hover:text-[#121212]"
              >
                APPLE APP STORE
              </button>
              <button
                data-testid="store-google-btn"
                data-cursor="hover"
                onClick={onGetApp}
                className="rounded-full border border-[#F5F3EF]/30 px-6 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] transition-colors duration-300 hover:bg-[#F5F3EF] hover:text-[#121212]"
              >
                GOOGLE PLAY
              </button>
              <PillButton testId="early-access-btn" variant="light" onClick={onGetApp}>
                JOIN EARLY ACCESS
              </PillButton>
            </div>
            <p className="mt-6 font-mono2 text-[10px] tracking-[0.35em] text-[#F5F3EF]/40">THE LOOP STARTS HERE.</p>
          </div>
          <div className="flex justify-center">
            <Phone progress={scrollYProgress} screenIdx={idx} />
          </div>
        </div>
      </div>
    </section>
  );
}
