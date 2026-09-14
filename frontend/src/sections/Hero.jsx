import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { createTeeGeometry, createFabricBump, StudioLights } from "../three/tee";
import { MaskedLines, PillButton } from "../components/primitives";
import TeeSvg from "../components/TeeSvg";

function HeroTee({ mouse }) {
  const group = useRef();
  const { size } = useThree();
  const geo = useMemo(() => createTeeGeometry(size.width < 768 ? 0.55 : 0.75), [size.width]);
  const bump = useMemo(() => createFabricBump(), []);
  const mobile = size.width < 768;

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, dt * 3);
    g.rotation.y += (Math.sin(t * 0.25) * 0.24 + mouse.current.x * 0.3 - g.rotation.y) * k;
    g.rotation.x += (mouse.current.y * 0.12 - g.rotation.x) * k;
    g.position.y = Math.sin(t * 0.7) * 0.07;
    const cam = state.camera;
    cam.position.z += ((mobile ? 6.4 : 5.2) - cam.position.z) * k;
    cam.position.x += (mouse.current.x * 0.25 - cam.position.x) * k;
    cam.position.y += (-mouse.current.y * 0.18 - cam.position.y) * k;
    cam.lookAt(mobile ? 0 : 0.55, 0, 0);
  });

  return (
    <group>
      <group ref={group} position={[mobile ? 0 : 1.05, 0, 0]}>
        <mesh geometry={geo}>
          <meshStandardMaterial color="#E9E4D9" roughness={0.94} metalness={0} bumpMap={bump} bumpScale={0.5} />
        </mesh>
      </group>
      <ContactShadows position={[mobile ? 0 : 1.05, -1.75, 0]} opacity={0.3} scale={10} blur={2.6} far={3.6} color="#3a382f" frames={1} />
    </group>
  );
}

export default function Hero({ onExplore, onGetApp }) {
  const mouse = useRef({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { margin: "150px" });
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  return (
    <section
      id="hero"
      ref={wrapRef}
      data-testid="hero-section"
      className="relative min-h-screen overflow-hidden"
      onMouseMove={(e) => {
        mouse.current = {
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        };
      }}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 md:justify-end md:pr-[10%] ${
          ready && !reduced ? "opacity-0" : "opacity-100"
        }`}
      >
        <TeeSvg className="animate-float-y w-60 md:w-[24rem]" />
      </div>

      {!reduced && (
        <div className="absolute inset-0" data-cursor="explore" data-cursor-text="EXPLORE">
          <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 5.2], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            onCreated={() => setReady(true)}
          >
            <StudioLights />
            <HeroTee mouse={mouse} />
          </Canvas>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pb-10">
        <div className="mt-[6vh] md:mt-[10vh]">
          <motion.p
            className="mb-5 flex items-center gap-2.5 font-mono2 text-[10px] tracking-[0.4em] text-[#1E3A2B] md:text-[11px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <img src="/logo.png" alt="" className="h-4 w-4 object-contain" />
            CIRCULAR STREETWEAR &mdash; INDIA
          </motion.p>
          <h1 data-testid="hero-headline" className="font-display font-extrabold uppercase leading-[0.88] tracking-tight">
            <MaskedLines
              mount
              delay={0.35}
              lines={["STYLE.", "CYCLE."]}
              lineClass="text-[clamp(2.9rem,11.5vw,10.5rem)] text-[#121212]"
            />
            <MaskedLines
              mount
              delay={0.61}
              lines={["IMPACT."]}
              lineClass="text-[clamp(2.9rem,11.5vw,10.5rem)] text-[#1E3A2B]"
            />
          </h1>
          <motion.p
            className="mt-6 max-w-md text-sm leading-relaxed text-[#121212]/70 md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <span className="font-semibold text-[#121212]">Fashion that keeps moving.</span>
            <br />
            Revamped is building a circular streetwear system. Wear what you love &mdash; and when
            you&rsquo;re done with clothes, any brand, bring them back into the loop.
          </motion.p>
          <motion.div
            className="pointer-events-auto mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.8 }}
          >
            <PillButton testId="hero-download-btn" onClick={onGetApp}>
              DOWNLOAD THE APP
            </PillButton>
            <button
              data-testid="hero-discover-btn"
              data-cursor="hover"
              onClick={onExplore}
              className="group inline-flex items-center gap-3 px-2 py-3 font-mono2 text-[11px] tracking-[0.25em] text-[#121212]/80 transition-colors hover:text-[#1E3A2B]"
            >
              DISCOVER THE LOOP
              <span className="inline-block transition-transform duration-300 group-hover:translate-y-1">&darr;</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          data-testid="hero-drop-meta"
          className="flex items-end justify-between font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span>DROP 001</span>
          <span className="hidden sm:inline">50 PIECES</span>
          <span>COMING SOON</span>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-mono2 text-[9px] tracking-[0.35em] text-[#121212]/50">SCROLL</span>
        <div className="scroll-line h-10 w-px bg-[#121212]/50" />
      </div>
    </section>
  );
}
