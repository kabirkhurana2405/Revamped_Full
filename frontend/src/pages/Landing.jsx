import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import Cursor from "../components/Cursor";
import ShopNav from "../components/ShopNav";
import WaitlistModal from "../components/WaitlistModal";
import Marquee from "../components/Marquee";
import Hero from "../sections/Hero";
import StyleSection from "../sections/StyleSection";
import ProblemSection from "../sections/ProblemSection";
import TakeBackSection from "../sections/TakeBackSection";
import AISection from "../sections/AISection";
import PathsSection from "../sections/PathsSection";
import ImpactSection from "../sections/ImpactSection";
import DropSection from "../sections/DropSection";
import AppSection from "../sections/AppSection";
import FinalCTA from "../sections/FinalCTA";
import Footer from "../sections/Footer";

export default function Landing() {
  const lenisRef = useRef(null);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ open: false, source: "site" });
  const openModal = useCallback((source = "site") => setModal({ open: true, source }), []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.15 });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const scrollTo = useCallback((target) => {
    if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.6 });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="grain min-h-screen bg-[#F5F3EF] text-[#121212] antialiased">
      <Cursor />
      <ShopNav />
      <main>
        <Hero onExplore={() => scrollTo("#style")} onGetApp={() => openModal("hero")} onShop={() => navigate("/men")} />
        <StyleSection />
        <ProblemSection />
        <TakeBackSection />
        <AISection />
        <PathsSection />
        <ImpactSection />
        <Marquee />
        <DropSection onAccess={() => navigate("/men")} onGetApp={() => openModal("drop")} />
        <AppSection onGetApp={() => openModal("app")} />
        <FinalCTA onGetApp={() => openModal("final")} onAccess={() => navigate("/men")} />
      </main>
      <Footer />
      <WaitlistModal open={modal.open} source={modal.source} onClose={() => setModal((m) => ({ ...m, open: false }))} />
    </div>
  );
}
