import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { createTeeGeometry, createFabricBump, StudioLights } from "../three/tee";
import { PillButton } from "../components/primitives";

const SHIRTS = [
  { name: "MINIMAL", sub: "DESIGN 01 — SMALL EMBROIDERED BRANDING", color: "#E9E4D9", accent: "#1E3A2B" },
  { name: "STATEMENT", sub: "DESIGN 02 — LARGER GRAPHIC + EMBROIDERY", color: "#22402F", accent: "#E9E4D9" },
  { name: "CIRCULAR", sub: "DESIGN 03 — OLD → REVAMPED → NEW", color: "#2C2C29", accent: "#E9E4D9" },
];

function DropTees({ progress }) {
  const refs = useRef([]);
  const geo = useMemo(() => createTeeGeometry(0.8), []);
  const bump = useMemo(() => createFabricBump(), []);

  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const mobile = state.size.width < 768;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const e = THREE.MathUtils.smoothstep(p, 0.04 + i * 0.15, 0.24 + i * 0.15);
      const arrange = THREE.MathUtils.smoothstep(p, 0.72, 0.95);
      const base = mobile
        ? { x: 0, y: 2.0 - i * 2.0, s: 0.5 }
        : { x: (i - 1) * 2.3, y: 0, s: 0.78 };
      const tri = mobile
        ? base
        : [
            { x: -1.6, y: 0.55, s: 0.6 },
            { x: 1.6, y: 0.55, s: 0.6 },
            { x: 0, y: -1.0, s: 0.6 },
          ][i];
      const x = base.x + (tri.x - base.x) * arrange;
      const y = base.y + (tri.y - base.y) * arrange;
      const s = (base.s + (tri.s - base.s) * arrange) * (0.25 + 0.75 * e);
      let ry = Math.sin(t * 0.35 + i * 2) * 0.12;
      let z = 0;
      if (i === 0) ry += (1 - e) * 2.6;
      if (i === 1) z = -(1 - e) * 1.5;
      if (i === 2) ry += (1 - e) * 4.2;
      g.position.set(x, y + Math.sin(t * 0.7 + i) * 0.045, z);
      g.scale.setScalar(Math.max(0.001, s));
      g.rotation.y = ry;
      g.visible = e > 0.002;
    });
  });

  return (
    <group>
      {SHIRTS.map((sh, i) => (
        <group key={sh.name} ref={(el) => (refs.current[i] = el)}>
          <mesh geometry={geo}>
            <meshStandardMaterial color={sh.color} roughness={0.94} metalness={0} bumpMap={bump} bumpScale={0.5} />
          </mesh>
          <mesh position={[0.28, 0.34, 0.34]}>
            <boxGeometry args={[0.3, 0.09, 0.03]} />
            <meshStandardMaterial color={sh.accent} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function DropSection({ onAccess, onGetApp }) {
  const ref = useRef(null);
  const viewRef = useRef(null);
  const inView = useInView(viewRef, { margin: "220px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const headOp = useTransform(scrollYProgress, [0, 0.06], [0, 1]);
  const lab0 = useTransform(scrollYProgress, [0.05, 0.14], [0, 1]);
  const lab1 = useTransform(scrollYProgress, [0.2, 0.29], [0, 1]);
  const lab2 = useTransform(scrollYProgress, [0.35, 0.44], [0, 1]);
  const ctaOp = useTransform(scrollYProgress, [0.14, 0.24], [0, 1]);
  const endOp = useTransform(scrollYProgress, [0.86, 0.95], [0, 1]);
  const endY = useTransform(scrollYProgress, [0.86, 0.95], [40, 0]);
  const labels = [lab0, lab1, lab2];

  return (
    <section id="drop" ref={ref} data-testid="drop-section" className="relative h-[340vh] bg-[#F5F3EF]">
      <div ref={viewRef} className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="absolute inset-0" data-cursor="explore" data-cursor-text="EXPLORE">
          <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 10.5], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
          >
            <StudioLights />
            <DropTees progress={scrollYProgress} />
          </Canvas>
        </div>

        <motion.div style={{ opacity: headOp }} className="pointer-events-none relative z-10 px-5 pt-24 text-center md:pt-20">
          <p className="font-mono2 text-[10px] tracking-[0.4em] text-[#1E3A2B]">07 &mdash; THE FIRST PILOT</p>
          <h2 className="mt-3 font-display text-[clamp(3rem,9vw,7.5rem)] font-extrabold uppercase leading-none tracking-tight text-[#121212]">
            DROP 001
          </h2>
          <p className="mt-3 font-mono2 text-[11px] tracking-[0.35em] text-[#121212]/70">50 PIECES. 3 DESIGNS.</p>
          <p className="mt-2 text-sm text-[#121212]/55">We&rsquo;re starting small on purpose.</p>
        </motion.div>

        <div className="pointer-events-none relative z-10 mt-auto px-5 pb-8 md:px-10">
          <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 md:gap-6">
            {SHIRTS.map((sh, i) => (
              <motion.div key={sh.name} style={{ opacity: labels[i] }} className="text-center">
                <p data-testid={`drop-shirt-label-${sh.name.toLowerCase()}`} className="font-display text-sm font-bold tracking-[0.15em] text-[#121212] md:text-xl">
                  {sh.name}
                </p>
                <p className="mt-1 hidden font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/50 md:block">{sh.sub}</p>
              </motion.div>
            ))}
          </div>

          <motion.div style={{ opacity: ctaOp }} className="pointer-events-auto mt-6 flex flex-col items-center gap-4">
            <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#121212]/55 md:text-[10px]">
              240 GSM &middot; 100% COTTON &middot; OVERSIZED &middot; DROP SHOULDER &middot; EMBROIDERY &middot; &#8377;999
            </p>
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
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: endOp, y: endY }}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F5F3EF]/60 backdrop-blur-[2px]"
        >
          <p className="font-display text-[clamp(3rem,10vw,8rem)] font-extrabold uppercase leading-none text-[#121212]">
            50 PIECES.
          </p>
          <p className="font-display text-[clamp(1.6rem,5vw,3.5rem)] font-extrabold uppercase text-[#1E3A2B]">
            THAT&rsquo;S IT.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
