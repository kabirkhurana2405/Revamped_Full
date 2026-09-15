import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ShopShell from "../components/ShopShell";
import { api, fileUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { MaskedLines, Reveal } from "../components/primitives";

function JourneyModal({ id, onClose }) {
  const [data, setData] = useState(null);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    api.get(`/takeback/${id}`).then((r) => setData(r.data)).catch(() => {});
  }, [id]);

  const shareCard = async () => {
    setSharing(true);
    try {
      const r = await api.get(`/impact/share/${id}`, { responseType: "blob" });
      const file = new File([r.data], `revamped-impact-${data.label}.png`, { type: "image/png" });
      const caption = `My ${data.garment_type} just got a new life with REVAMPED — STYLE. CYCLE. IMPACT. Join the cycle.`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "REVAMPED — my impact", text: caption });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Impact card downloaded — ready to post");
      }
    } catch (e) {
      if (e?.name !== "AbortError") toast.error("Could not build the share card");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" onClick={onClose}>
      <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm" />
      <div
        data-testid="journey-modal"
        className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#F5F3EF] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!data ? (
          <p className="py-10 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/40">LOADING…</p>
        ) : (
          <>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">GARMENT JOURNEY</p>
            <h3 className="mt-2 font-display text-2xl font-extrabold">{data.label}</h3>
            <p className="mt-1 font-mono2 text-[10px] tracking-[0.2em] text-[#121212]/50">
              {data.garment_type.toUpperCase()} {data.brand ? `· ${data.brand.toUpperCase()}` : ""} · {(data.created_at || "").slice(0, 10)}
            </p>
            {data.ai && (
              <div className="mt-5 rounded-2xl border border-[#121212]/10 bg-white/60 p-4">
                <p className="font-mono2 text-[8px] tracking-[0.25em] text-[#121212]/50">{data.ai.label}</p>
                <p className="mt-1 text-sm">
                  Condition score <b>{data.ai.conditionScore}</b> · Recommended: <b>{data.ai.recommendedPath}</b>
                </p>
                {data.final_path && (
                  <p className="mt-1 font-mono2 text-[9px] tracking-[0.2em] text-[#1E3A2B]">FINAL DECISION: {data.final_path}</p>
                )}
              </div>
            )}
            <div className="mt-6">
              {data.journey.map((e, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-3 w-3 rounded-full border-2 border-[#1E3A2B] bg-[#1E3A2B]" />
                    {i < data.journey.length - 1 && <span className="h-8 w-px bg-[#121212]/20" />}
                  </div>
                  <div className="-mt-0.5 pb-4">
                    <p className="font-mono2 text-[10px] tracking-[0.22em] text-[#121212]">{e.stage}</p>
                    <p className="mt-0.5 font-mono2 text-[8px] tracking-[0.15em] text-[#121212]/45">
                      {(e.ts || "").slice(0, 10)} {e.note ? `· ${e.note}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              data-testid="journey-share-btn"
              onClick={shareCard}
              disabled={sharing}
              className="mt-6 w-full rounded-full bg-[#1E3A2B] py-3.5 font-mono2 text-[10px] tracking-[0.3em] text-[#F5F3EF] transition-colors hover:bg-[#121212] disabled:opacity-60"
            >
              {sharing ? "BUILDING CARD…" : "SHARE THIS JOURNEY ↗"}
            </button>
            <button
              data-testid="journey-close"
              onClick={onClose}
              className="mt-3 w-full rounded-full bg-[#121212] py-3.5 font-mono2 text-[10px] tracking-[0.3em] text-[#F5F3EF]"
            >
              CLOSE
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ImpactPage() {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);
  const [journeyId, setJourneyId] = useState(null);

  useEffect(() => {
    if (user) api.get("/impact/my").then((r) => setImpact(r.data)).catch(() => {});
  }, [user]);

  const stats = impact
    ? [
        ["GARMENTS CONTRIBUTED", impact.contributed],
        ["REWEAR", impact.rewear],
        ["REVAMPED", impact.revamp],
        ["RECYCLED", impact.recycle],
      ]
    : [
        ["GARMENTS CONTRIBUTED", 12],
        ["REWEAR", 8],
        ["REVAMPED", 2],
        ["RECYCLED", 2],
      ];

  return (
    <ShopShell>
      <div data-testid="impact-page">
        <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#1E3A2B]">STYLE. CYCLE. IMPACT.</p>
        <h1 className="mt-4 font-display font-extrabold uppercase leading-[0.92] tracking-tight">
          <MaskedLines mount lines={["YOUR IMPACT"]} lineClass="text-[clamp(2.4rem,7vw,5.5rem)] text-[#121212]" />
        </h1>
        <Reveal className="mt-4 max-w-lg">
          <p className="text-sm leading-relaxed text-[#121212]/70">
            Style is what you wear. Impact is what you leave behind. Every garment you bring back is tracked —
            no vague claims, just its real journey.
          </p>
        </Reveal>

        {!user && (
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#121212]/15 bg-white/60 px-5 py-2.5">
            <span className="rounded-full bg-[#121212] px-2.5 py-0.5 font-mono2 text-[8px] tracking-[0.2em] text-[#F5F3EF]">EXAMPLE</span>
            <span className="font-mono2 text-[10px] tracking-[0.15em] text-[#121212]/60">
              Sample data shown — <Link to="/login?next=/impact" className="underline">sign in</Link> to see yours
            </span>
          </div>
        )}

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#121212]/10 bg-[#121212]/10 lg:grid-cols-4">
          {stats.map(([label, val]) => (
            <div key={label} className="bg-[#F5F3EF] p-6 md:p-10">
              <p className="font-display text-4xl font-extrabold text-[#121212] md:text-6xl">{val}</p>
              <p className="mt-2 font-mono2 text-[9px] tracking-[0.22em] text-[#121212]/55">{label}</p>
            </div>
          ))}
        </div>

        {user && impact && (
          <div className="mt-14">
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">MY CYCLE — GARMENT JOURNEYS</p>
            {impact.garments.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-[#121212]/20 p-6 text-sm text-[#121212]/50">
                No garments yet. <Link to="/take-back" className="underline">Bring your first one</Link>.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {impact.garments.map((g) => (
                  <button
                    key={g.id}
                    data-testid={`garment-${g.label}`}
                    onClick={() => setJourneyId(g.id)}
                    className="flex items-center justify-between rounded-2xl border border-[#121212]/10 bg-white/60 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      {g.image ? (
                        <img src={fileUrl(g.image)} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E3A2B]/10 font-mono2 text-[9px] text-[#1E3A2B]">
                          {g.garment_type.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-display text-sm font-bold">{g.label}</p>
                        <p className="font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50">
                          {g.garment_type.toUpperCase()} · {g.created_at.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#1E3A2B]/10 px-3 py-1 font-mono2 text-[8px] tracking-[0.2em] text-[#1E3A2B]">
                      {g.path || g.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="mt-14 flex flex-col items-center rounded-3xl bg-[#1E3A2B] p-10 text-center text-[#F5F3EF]">
            <p className="font-display text-2xl font-extrabold md:text-3xl">TRACK WHAT YOU RETURN.</p>
            <p className="mt-3 max-w-md text-sm text-[#F5F3EF]/70">
              Create an account, bring clothes from any brand, and follow each garment to its next life.
            </p>
            <Link
              to="/login?next=/impact"
              data-testid="impact-join-btn"
              className="mt-6 rounded-full bg-[#F5F3EF] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] text-[#121212] transition-colors hover:bg-[#5E8B6F]"
            >
              JOIN THE LOOP
            </Link>
          </div>
        )}
      </div>
      {journeyId && <JourneyModal id={journeyId} onClose={() => setJourneyId(null)} />}
    </ShopShell>
  );
}
