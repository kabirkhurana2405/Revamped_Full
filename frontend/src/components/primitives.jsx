import { useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 32, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10% 0px" }}
    transition={{ duration: 0.9, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

export const MaskedLines = ({ lines, className = "", lineClass = "", delay = 0, mount = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  return (
    <span ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.09em] -mb-[0.09em]">
          <motion.span
            className={`block ${lineClass}`}
            initial={{ y: "115%" }}
            animate={mount ? { y: "0%" } : { y: inView ? "0%" : "115%" }}
            transition={{ duration: 0.95, ease: EASE, delay: delay + i * 0.13 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const Chapter = ({ num, label, light = false }) => (
  <Reveal
    className={`flex items-center gap-4 font-mono2 text-[11px] tracking-[0.35em] ${
      light ? "text-[#8E8B83]" : "text-[#8E8B83]"
    }`}
  >
    <span>{num}</span>
    <span className="h-px w-10 bg-current opacity-40" />
    <span>{label}</span>
  </Reveal>
);

export const Magnetic = ({ children, strength = 0.3, className = "" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
};

export const PillButton = ({ children, onClick, variant = "dark", testId, className = "", arrow = true }) => {
  const styles =
    variant === "dark"
      ? "bg-[#121212] text-[#F5F3EF] hover:bg-[#1E3A2B]"
      : variant === "light"
        ? "bg-[#F5F3EF] text-[#121212] hover:bg-[#2A4D3A] hover:text-[#F5F3EF]"
        : "border border-current bg-transparent hover:bg-[#F5F3EF] hover:text-[#121212] hover:border-[#F5F3EF]";
  return (
    <Magnetic>
      <button
        data-testid={testId}
        data-cursor="hover"
        onClick={onClick}
        className={`group inline-flex items-center gap-3 rounded-full px-7 py-4 font-mono2 text-[12px] tracking-[0.22em] transition-colors duration-300 ${styles} ${className}`}
      >
        {children}
        {arrow && (
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
            &rarr;
          </span>
        )}
      </button>
    </Magnetic>
  );
};
