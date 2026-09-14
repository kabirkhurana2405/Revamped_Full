import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopShell from "../components/ShopShell";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function RewardsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user === false) navigate("/login?next=/rewards");
    if (user) api.get("/rewards/my").then((r) => setData(r.data)).catch(() => {});
  }, [user, navigate]);

  if (!user) return null;

  const progress = data?.next_level
    ? Math.min(100, Math.round((data.contributed / data.next_level.min) * 100))
    : 100;

  return (
    <ShopShell>
      <div data-testid="rewards-page" className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">YOUR REVAMPED REWARDS</h1>

        <div className="mt-10 rounded-3xl bg-[#1E3A2B] p-8 text-[#F5F3EF] md:p-10">
          <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#F5F3EF]/60">CYCLE LEVEL</p>
          <p data-testid="reward-level" className="mt-2 font-display text-4xl font-extrabold tracking-wide">
            {data ? data.level.name : "—"}
          </p>
          <div className="mt-6">
            <div className="flex justify-between font-mono2 text-[9px] tracking-[0.2em] text-[#F5F3EF]/60">
              <span>{data?.contributed ?? 0} GARMENTS</span>
              <span>{data?.next_level ? `NEXT: ${data.next_level.name} AT ${data.next_level.min}` : "MAX LEVEL"}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#F5F3EF] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">WHAT THE CYCLE UNLOCKS</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(data?.perks || []).map((p) => (
              <div key={p} className="rounded-2xl border border-[#121212]/10 bg-white/60 p-5">
                <p className="font-display text-sm font-bold">{p}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#121212]/10 bg-white/60 p-6">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">LEVELS</p>
          <div className="mt-3 space-y-2">
            {(data?.levels || []).map((l) => (
              <div key={l.name} className="flex items-center justify-between">
                <span className={`font-mono2 text-[10px] tracking-[0.2em] ${data?.level.name === l.name ? "text-[#1E3A2B]" : "text-[#121212]/50"}`}>
                  {l.name}
                </span>
                <span className="font-mono2 text-[10px] text-[#121212]/40">{l.min}+ GARMENTS</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/take-back"
          data-testid="rewards-takeback-btn"
          className="mt-8 block rounded-full bg-[#121212] py-4 text-center font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
        >
          CONTRIBUTE A GARMENT →
        </Link>
        <p className="mt-3 text-center font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/40">
          REWARD RULES ARE MANAGED BY THE REVAMPED TEAM AND MAY EVOLVE.
        </p>
      </div>
    </ShopShell>
  );
}
