import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  ["STYLE", "#style"],
  ["CYCLE", "#cycle"],
  ["IMPACT", "#impact"],
  ["APP", "#app"],
];

export default function Nav({ onNavigate, onGetApp }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 40)), [scrollY]);

  const go = (id) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          scrolled ? "border-b border-[#121212]/10 bg-[#F5F3EF]/75 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <button
            data-testid="nav-logo"
            data-cursor="hover"
            onClick={() => go("#hero")}
            className="font-display text-lg font-extrabold tracking-[0.18em] text-[#121212]"
          >
            REVAMPED
          </button>
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map(([label, id]) => (
              <button
                key={id}
                data-testid={`nav-link-${label.toLowerCase()}`}
                data-cursor="hover"
                onClick={() => go(id)}
                className="font-mono2 text-[11px] tracking-[0.3em] text-[#121212]/70 transition-colors hover:text-[#1E3A2B]"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              data-testid="nav-download-app-btn"
              data-cursor="hover"
              onClick={onGetApp}
              className="rounded-full bg-[#121212] px-5 py-2.5 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] transition-colors duration-300 hover:bg-[#1E3A2B]"
            >
              GET THE APP
            </button>
            <button
              data-testid="nav-menu-btn"
              data-cursor="hover"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="text-[#121212] md:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            className="fixed inset-0 z-[150] flex flex-col bg-[#121212] px-6 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-extrabold tracking-[0.18em] text-[#F5F3EF]">REVAMPED</span>
              <button data-testid="mobile-menu-close" aria-label="Close menu" onClick={() => setOpen(false)} className="text-[#F5F3EF]">
                <X size={26} />
              </button>
            </div>
            <div className="mt-16 flex flex-col gap-3">
              {LINKS.map(([label, id], i) => (
                <motion.button
                  key={id}
                  data-testid={`mobile-link-${label.toLowerCase()}`}
                  onClick={() => go(id)}
                  className="text-left font-display text-5xl font-bold text-[#F5F3EF]"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * i }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
            <button
              data-testid="mobile-download-app-btn"
              onClick={() => {
                setOpen(false);
                onGetApp();
              }}
              className="mt-auto rounded-full bg-[#F5F3EF] py-4 font-mono2 text-xs tracking-[0.3em] text-[#121212]"
            >
              GET THE APP
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
