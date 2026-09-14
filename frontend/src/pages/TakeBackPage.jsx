import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopShell from "../components/ShopShell";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { MaskedLines, Reveal } from "../components/primitives";

const STEPS = [
  { num: "01", title: "BRING IT", copy: "Bring your unwanted clothes. Any brand, any label — if you're done wearing it, bring it back." },
  { num: "02", title: "AI CHECK", copy: "Upload photos through the website or app. Our AI-assisted system evaluates the garment's visible condition." },
  { num: "03", title: "REVIEW", copy: "AI provides an initial assessment. Where required, the submission is reviewed by the Revamped team." },
  { num: "04", title: "FIND ITS NEXT LIFE", copy: "REWEAR · REVAMP · RECYCLE — the garment goes where it fits best." },
  { num: "05", title: "IMPACT", copy: "Your contribution is recorded in your Revamped Impact profile, with a full journey timeline." },
];

export default function TakeBackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (user) api.get("/takeback/my").then((r) => setSubs(r.data.submissions)).catch(() => {});
  }, [user]);

  const start = () => navigate(user ? "/take-back/assess" : "/login?next=/take-back/assess");

  return (
    <ShopShell>
      <div data-testid="takeback-page">
        <h1 className="font-display font-extrabold uppercase leading-[0.9] tracking-tight">
          <MaskedLines mount lines={["DONE WITH IT?"]} lineClass="text-[clamp(2.4rem,8vw,6.5rem)] text-[#121212]" />
          <MaskedLines mount delay={0.15} lines={["BRING IT TO US."]} lineClass="text-[clamp(2.4rem,8vw,6.5rem)] text-[#1E3A2B]" />
        </h1>
        <Reveal delay={0.2} className="mt-6 max-w-xl">
          <p className="text-base leading-relaxed text-[#121212]/70">
            We take back clothes from <b>any brand</b>. Any label. Any brand. If you&rsquo;re done wearing it,
            bring it back — we assess it and give it the best possible next life.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-[#121212]/10 bg-[#121212]/10 md:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.num} className="bg-[#F5F3EF] p-6">
              <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">{s.num}</p>
              <p className="mt-2 font-display text-base font-bold">{s.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#121212]/60">{s.copy}</p>
            </div>
          ))}
        </div>

        <Reveal className="mt-10">
          <button
            data-testid="start-takeback-btn"
            onClick={start}
            className="rounded-full bg-[#121212] px-10 py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
          >
            START A TAKE-BACK →
          </button>
          <p className="mt-3 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/45">
            5% OFF PER GARMENT · UP TO 4 GARMENTS · MAX 20% OFF YOUR PURCHASE
          </p>
        </Reveal>

        {user && subs.length > 0 && (
          <div className="mt-16">
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">MY SUBMISSIONS</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {subs.map((s) => (
                <Link
                  key={s.id || s._id}
                  to="/impact"
                  data-testid={`submission-${(s.id || "").slice(-6)}`}
                  className="flex items-center justify-between rounded-2xl border border-[#121212]/10 bg-white/60 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div>
                    <p className="font-display text-sm font-bold">{s.garment_type}</p>
                    <p className="font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50">
                      {s.brand || "ANY BRAND"} · {(s.created_at || "").slice(0, 10)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#1E3A2B]/10 px-3 py-1 font-mono2 text-[8px] tracking-[0.2em] text-[#1E3A2B]">
                    {s.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
