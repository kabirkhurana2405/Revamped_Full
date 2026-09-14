import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 650, damping: 45, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 650, damping: 45, mass: 0.5 });
  const [variant, setVariant] = useState({ type: "default", text: "" });
  const lastKey = useRef("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target.closest ? e.target.closest("[data-cursor]") : null;
      const key = t ? `${t.dataset.cursor}|${t.dataset.cursorText || ""}` : "default";
      if (key !== lastKey.current) {
        lastKey.current = key;
        setVariant(
          t
            ? { type: t.dataset.cursor, text: t.dataset.cursorText || "" }
            : { type: "default", text: "" }
        );
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;
  const size = variant.type === "explore" ? 88 : variant.type === "hover" ? 46 : 12;

  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[300]" style={{ x: sx, y: sy }}>
      <motion.div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${
          variant.type === "default"
            ? "bg-[#121212]"
            : "border border-[#121212]/70 bg-[#F5F3EF]/20 backdrop-blur-[2px]"
        }`}
        animate={{ width: size, height: size }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
      >
        {variant.type === "explore" && (
          <span className="font-mono2 text-[10px] tracking-[0.22em] text-[#121212]">{variant.text}</span>
        )}
      </motion.div>
    </motion.div>
  );
}
