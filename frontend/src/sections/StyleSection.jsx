import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useInView } from "framer-motion";
import { createTeeGeometry, createFabricBump, StudioLights } from "../three/tee";
import { Chapter, MaskedLines, Reveal } from "../components/primitives";

const SPECS = [
  { label: "240 GSM", spec: "fabric", pos: "left-[4%] top-[14%]" },
  { label: "100% COTTON", spec: "fabric", pos: "right-[4%] top-[24%]" },
  { label: "EMBROIDERY", spec: "embroidery", pos: "right-[10%] bottom-[16%]" },
  { label: "OVERSIZED", spec: "fit", pos: "left-[7%] bottom-[26%]" },
  { label: "DROP SHOULDER", spec: "fit", pos: "right-[2%] top-[52%]" },
];

function StyleTee({ active }) {
  const group = useRef();
  const geo = useMemo(() => createTeeGeometry(0.85), []);
  const bump = useMemo(() => createFabricBump(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const cfg = {
      none: { s: 1, rx: 0 },
      fabric: { s: 1.5, rx: 0.06 },
      embroidery: { s: 1.32, rx: 0.1 },
      fit: { s: 0.8, rx: 0 },
    }[active || "none"];
    const k = Math.min(1, dt * 3);
    g.scale.setScalar(g.scale.x + (cfg.s - g.scale.x) * k);
    g.rotation.y = t * (active === "none" || active === "fit" ? 0.1 : 0.05);
    g.rotation.x += (cfg.rx - g.rotation.x) * k;
  });

  return (
    <group ref={group}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#E9E4D9" roughness={0.94} metalness={0} bumpMap={bump} bumpScale={0.5} />
      </mesh>
      <mesh position={[0.3, 0.34, 0.34]}>
        <boxGeometry args={[0.3, 0.09, 0.03]} />
        <meshStandardMaterial color="#1E3A2B" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function StyleSection() {
  const [active, setActive] = useState("none");
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { margin: "220px" });

  return (
    <section id="style" data-testid="style-section" className="relative overflow-hidden bg-[#F5F3EF] py-28 md:py-40">
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-5 md:grid-cols-2 md:px-10">
        <div>
          <Chapter num="02" label="STYLE" />
          <h2 className="mt-6 font-display font-extrabold uppercase leading-[0.9] tracking-tight">
            <MaskedLines lines={["STYLE"]} lineClass="text-[clamp(3.5rem,9vw,8rem)] text-[#121212]" />
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

        <div ref={wrapRef} className="relative h-[58vh] md:h-[78vh]" data-cursor="explore" data-cursor-text="EXPLORE">
          <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 5.6], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
          >
            <StudioLights />
            <StyleTee active={active} />
            <ContactShadows position={[0, -1.8, 0]} opacity={0.3} scale={9} blur={2.6} far={3.4} color="#3a382f" />
          </Canvas>
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
