import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { LogoMark } from "./Logo";

export default function WaitlistModal({ open, source, onClose }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setState("idle");
        setEmail("");
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/waitlist`, {
        email: email.trim(),
        source,
      });
      setState("done");
    } catch (err) {
      setState("idle");
      toast.error("Couldn't join right now. Try again in a moment.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="waitlist-modal"
          className="fixed inset-0 z-[250] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#121212]/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#F5F3EF] p-8 shadow-2xl md:p-10"
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              data-testid="waitlist-close-btn"
              data-cursor="hover"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-5 top-5 text-[#121212]/60 transition-colors hover:text-[#121212]"
            >
              <X size={20} />
            </button>

            {state !== "done" ? (
              <>
                <LogoMark size={30} className="text-[#1E3A2B]" />
                <p className="mt-4 font-mono2 text-[10px] tracking-[0.35em] text-[#1E3A2B]">COMING SOON</p>
                <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-[#121212]">
                  Revamped is getting ready to launch.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#121212]/70">
                  Join early access and be first in line for DROP 001 — 50 pieces, 3 designs.
                </p>
                <form onSubmit={submit} className="mt-7">
                  <label htmlFor="waitlist-email" className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/60">
                    ENTER YOUR EMAIL
                  </label>
                  <input
                    id="waitlist-email"
                    data-testid="waitlist-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-[#121212]/15 bg-white/60 px-4 py-3.5 text-sm text-[#121212] outline-none transition-colors placeholder:text-[#121212]/35 focus:border-[#1E3A2B]"
                  />
                  <button
                    data-testid="waitlist-submit-btn"
                    data-cursor="hover"
                    type="submit"
                    disabled={state === "loading"}
                    className="mt-4 w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.3em] text-[#F5F3EF] transition-colors duration-300 hover:bg-[#1E3A2B] disabled:opacity-60"
                  >
                    {state === "loading" ? "JOINING..." : "JOIN THE LOOP"}
                  </button>
                </form>
                <p className="mt-4 text-center font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/40">
                  STYLE. CYCLE. IMPACT.
                </p>
              </>
            ) : (
              <div data-testid="waitlist-success" className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A2B]">
                  <Check size={26} className="text-[#F5F3EF]" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold text-[#121212]">YOU&rsquo;RE IN THE LOOP.</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#121212]/70">
                  Confirmation sent to your inbox. DROP 001 access lands there first.
                </p>
                <button
                  data-testid="waitlist-done-btn"
                  data-cursor="hover"
                  onClick={onClose}
                  className="mt-7 rounded-full border border-[#121212] px-7 py-3 font-mono2 text-[10px] tracking-[0.3em] text-[#121212] transition-colors hover:bg-[#121212] hover:text-[#F5F3EF]"
                >
                  BACK TO THE SITE
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
