import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useMotionTemplate, AnimatePresence } from "framer-motion";
import { Chapter, MaskedLines, Reveal, PillButton } from "../components/primitives";
import TeeSvg from "../components/TeeSvg";

const WORDS = ["DISCOVER", "BRING", "SCAN", "TRACK", "FOLLOW", "REWARD"];

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
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">STYLE. CYCLE. IMPACT.</p>
    <p className="mt-2 font-display text-[24px] font-extrabold leading-[1.02] text-[#121212]">
      KEEP IT
      <br />
      MOVING.
    </p>
    <div className="mt-4 rounded-2xl bg-[#1E3A2B] p-4 text-[#F5F3EF]">
      <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#F5F3EF]/60">FEATURED &mdash; DROP 001</p>
      <div className="mt-7 flex items-end justify-between">
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
        <p className="font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/50">CONTRIBUTED</p>
        <p className="mt-2 font-display text-base font-bold text-[#121212]">0 GARMENTS</p>
      </div>
      <div className="rounded-2xl border border-[#121212]/10 p-3">
        <p className="font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/50">REWARD</p>
        <p className="mt-2 font-display text-base font-bold text-[#121212]">&mdash;</p>
      </div>
    </div>
  </ScreenShell>
);

const BringScreen = () => (
  <ScreenShell nav={2}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">BRING IT BACK</p>
    <p className="mt-2 font-display text-[22px] font-extrabold leading-[1.08] text-[#121212]">
      WHAT ARE YOU DONE WEARING?
    </p>
    <p className="mt-2 text-[10px] leading-relaxed text-[#121212]/60">
      If you don&rsquo;t wear it anymore, we can help give it another life.
    </p>
    <div className="mt-4 rounded-full bg-[#121212] py-3 text-center font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]">
      SCAN / ADD CLOTHES
    </div>
    <div className="mt-3 flex gap-2">
      {["ANY BRAND", "ANY GARMENT"].map((c) => (
        <span
          key={c}
          className="flex-1 rounded-full border border-[#1E3A2B]/30 py-2 text-center font-mono2 text-[8px] tracking-[0.2em] text-[#1E3A2B]"
        >
          {c}
        </span>
      ))}
    </div>
    <div className="mt-4 space-y-2">
      {["OVERSIZED TEE", "HOODIE"].map((g) => (
        <div key={g} className="flex items-center justify-between rounded-xl border border-[#121212]/10 px-3 py-2.5">
          <span className="font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/70">{g}</span>
          <span className="font-mono2 text-[7px] tracking-[0.2em] text-[#1E3A2B]">ADDED</span>
        </div>
      ))}
    </div>
  </ScreenShell>
);

const AiCheckScreen = () => (
  <ScreenShell nav={2}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">AI CONDITION CHECK</p>
    <div className="relative mt-3 h-36 overflow-hidden rounded-2xl bg-[#121212]">
      {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "left-2 bottom-2 border-l border-b", "right-2 bottom-2 border-r border-b"].map((cls) => (
        <span key={cls} className={`absolute h-4 w-4 border-[#5E8B6F] ${cls}`} />
      ))}
      <TeeSvg className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />
      <div className="scan-line absolute left-3 right-3 h-px bg-[#5E8B6F] shadow-[0_0_10px_rgba(94,139,111,0.9)]" />
    </div>
    <div className="mt-3 space-y-2">
      {[
        ["WEAR", "LOW"],
        ["DAMAGE", "LOW"],
        ["USABILITY", "HIGH"],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center justify-between">
          <span className="font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/60">{k}</span>
          <span className="font-mono2 text-[8px] tracking-[0.15em] text-[#1E3A2B]">{v}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#1E3A2B] px-3 py-2.5">
      <span className="font-mono2 text-[7px] tracking-[0.2em] text-[#F5F3EF]/70">RECOMMENDED PATH</span>
      <span className="font-display text-sm font-extrabold text-[#F5F3EF]">REWEAR</span>
    </div>
    <p className="mt-2 text-center font-mono2 text-[6px] tracking-[0.2em] text-[#121212]/40">
      CONCEPT DEMO &mdash; NOT A FINAL CLASSIFICATION
    </p>
  </ScreenShell>
);

const ImpactScreen = () => (
  <ScreenShell nav={3}>
    <div className="flex items-center justify-between">
      <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">MY IMPACT</p>
      <span className="rounded-full bg-[#121212] px-2 py-0.5 font-mono2 text-[6px] tracking-[0.2em] text-[#F5F3EF]">
        SAMPLE DATA
      </span>
    </div>
    <div className="mt-3 flex items-end gap-3">
      <p className="font-display text-6xl font-extrabold leading-none text-[#121212]">12</p>
      <p className="pb-1 font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/55">
        GARMENTS
        <br />
        CONTRIBUTED
      </p>
    </div>
    <div className="mt-5 space-y-2.5">
      {[
        ["8", "REWEAR", "w-2/3"],
        ["2", "REVAMP", "w-1/5"],
        ["2", "RECYCLE", "w-1/5"],
      ].map(([n, label, w]) => (
        <div key={label} className="rounded-xl border border-[#121212]/10 p-3">
          <div className="flex justify-between font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/60">
            <span>{label}</span>
            <span>{n}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#121212]/10">
            <div className={`h-full rounded-full bg-[#1E3A2B] ${w}`} />
          </div>
        </div>
      ))}
    </div>
    <p className="mt-3 text-center text-[9px] text-[#121212]/50">Example impact dashboard &mdash; app preview.</p>
  </ScreenShell>
);

const JourneyScreen = () => (
  <ScreenShell nav={3}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">GARMENT JOURNEY</p>
    <p className="mt-2 font-display text-lg font-extrabold text-[#121212]">OVERSIZED TEE &mdash; BONE</p>
    <div className="mt-5">
      {["YOU CONTRIBUTED IT", "AI CONDITION CHECK", "SORTED", "NEW LIFE", "IMPACT RECORDED"].map((step, i) => (
        <div key={step} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`h-3 w-3 rounded-full border-2 ${
                i < 4 ? "border-[#1E3A2B] bg-[#1E3A2B]" : "border-[#1E3A2B] bg-transparent"
              }`}
            />
            {i < 4 && <span className="h-7 w-px bg-[#121212]/20" />}
          </div>
          <p
            className={`-mt-0.5 font-mono2 text-[8px] tracking-[0.22em] ${
              i < 4 ? "text-[#121212]" : "text-[#121212]/45"
            }`}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
    <div className="mt-5 rounded-2xl bg-[#1E3A2B] p-4">
      <p className="font-mono2 text-[7px] tracking-[0.3em] text-[#F5F3EF]/60">STATUS</p>
      <p className="mt-1 font-display text-base font-bold text-[#F5F3EF]">Impact recorded</p>
    </div>
  </ScreenShell>
);

const RewardsScreen = () => (
  <ScreenShell nav={0}>
    <p className="font-mono2 text-[8px] tracking-[0.3em] text-[#1E3A2B]">YOUR CYCLE REWARDS</p>
    <div className="mt-4 rounded-2xl bg-[#1E3A2B] p-5 text-[#F5F3EF]">
      <p className="font-mono2 text-[7px] tracking-[0.3em] text-[#F5F3EF]/60">MAX TAKE-BACK DISCOUNT</p>
      <p className="mt-2 font-display text-4xl font-extrabold">20% OFF</p>
      <p className="mt-2 text-[10px] text-[#F5F3EF]/70">Your old clothes came back with you.</p>
    </div>
    <div className="mt-4 flex gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-2 flex-1 rounded-full bg-[#1E3A2B]" />
      ))}
    </div>
    <p className="mt-2 text-center font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/45">
      4 / 4 GARMENTS CONTRIBUTED
    </p>
    <div className="mt-4 flex gap-2">
      {["EARLY MEMBER", "LOOP STARTER"].map((b) => (
        <span
          key={b}
          className="flex-1 rounded-full border border-[#121212]/15 py-2 text-center font-mono2 text-[7px] tracking-[0.2em] text-[#121212]/60"
        >
          {b}
        </span>
      ))}
    </div>
    <p className="mt-3 text-center font-mono2 text-[6px] tracking-[0.25em] text-[#121212]/40">APP PREVIEW</p>
  </ScreenShell>
);

const SCREENS = [
  <HomeScreen key={0} />,
  <BringScreen key={1} />,
  <AiCheckScreen key={2} />,
  <ImpactScreen key={3} />,
  <JourneyScreen key={4} />,
  <RewardsScreen key={5} />,
];

function Phone({ progress, screenIdx }) {
  const ry = useTransform(progress, [0, 1], [-12, 12]);
  const rx = useTransform(progress, [0, 1], [5, -2]);
  const py = useTransform(progress, [0, 1], [50, -50]);
  const transform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg)`;

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div style={{ y: py }}>
        <motion.div
          data-testid="app-phone"
          className="relative h-[520px] w-[252px] md:h-[600px] md:w-[292px]"
          style={{ transform }}
        >
          <div className="absolute inset-0 rounded-[2.6rem] border border-black/70 bg-[#0d0d0c] p-[9px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)]">
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
          <div className="absolute -right-[2px] top-28 h-14 w-[3px] rounded-r bg-[#2e2e2c]" />
          <div className="absolute -left-[2px] top-24 h-8 w-[3px] rounded-l bg-[#2e2e2c]" />
          <div className="absolute -left-[2px] top-36 h-12 w-[3px] rounded-l bg-[#2e2e2c]" />
        </motion.div>
      </motion.div>
      <div className="mx-auto mt-8 h-6 w-2/3 rounded-[100%] bg-black/40 blur-xl" />
    </div>
  );
}

export default function AppSection({ onGetApp }) {
  const pinRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIdx(Math.min(5, Math.floor(v * 6.001)));
  });

  return (
    <section id="app" data-testid="app-section" className="relative bg-[#121212] text-[#F5F3EF]">
      <div ref={pinRef} className="relative h-[480vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-[1600px] items-center gap-8 px-5 md:grid-cols-2 md:gap-4 md:px-10">
            <div>
              <Chapter num="09" label="THE APP" light />
              <h2 className="mt-6 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
                <MaskedLines
                  lines={["YOUR CLOSET.", "YOUR CYCLE.", "YOUR IMPACT."]}
                  lineClass="text-[clamp(2.2rem,5.5vw,5.2rem)]"
                />
              </h2>
              <Reveal delay={0.15} className="mt-5 max-w-md">
                <p className="text-sm text-[#F5F3EF]/60 md:text-base">
                  The Revamped app will make it easier to discover drops, contribute clothes, follow
                  their journey and see your impact.
                </p>
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
            </div>
            <div className="flex justify-center">
              <Phone progress={scrollYProgress} screenIdx={idx} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-5 py-24 text-center md:py-32">
        <h3 className="font-display font-extrabold uppercase leading-[0.92] tracking-tight">
          <MaskedLines
            lines={["THE CYCLE IS", "GOING MOBILE."]}
            lineClass="text-[clamp(2.4rem,7vw,6rem)]"
          />
        </h3>
        <Reveal delay={0.15} className="mx-auto mt-6 max-w-md">
          <p className="text-sm leading-relaxed text-[#F5F3EF]/60 md:text-base">
            Discover Revamped drops. Bring clothes back. Follow their journey. Track your impact.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10">
          <p className="mb-5 font-mono2 text-[10px] tracking-[0.4em] text-[#5E8B6F]">COMING SOON</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              data-testid="store-apple-btn"
              data-cursor="hover"
              onClick={onGetApp}
              className="rounded-full border border-[#F5F3EF]/30 px-6 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] transition-colors duration-300 hover:bg-[#F5F3EF] hover:text-[#121212]"
            >
              DOWNLOAD ON THE APP STORE
            </button>
            <button
              data-testid="store-google-btn"
              data-cursor="hover"
              onClick={onGetApp}
              className="rounded-full border border-[#F5F3EF]/30 px-6 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] transition-colors duration-300 hover:bg-[#F5F3EF] hover:text-[#121212]"
            >
              GET IT ON GOOGLE PLAY
            </button>
          </div>
          <div className="mt-5">
            <PillButton testId="early-access-btn" variant="light" onClick={onGetApp}>
              JOIN EARLY ACCESS
            </PillButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
