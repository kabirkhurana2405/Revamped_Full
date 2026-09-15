import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, Empty } from "./Dashboard";

export default function Assessments() {
  const [metrics, setMetrics] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/admin/ai-metrics").then((r) => setMetrics(r.data)).catch(() => {});
    api.get("/admin/takebacks").then((r) => setItems(r.data.takebacks.filter((t) => t.ai))).catch(() => {});
  }, []);

  if (!metrics) return <p className="py-20 text-center font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/40">LOADING…</p>;

  return (
    <div data-testid="admin-assessments">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">AI ASSESSMENTS</h1>
      <p className="mt-1 font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">
        GEMINI VISION LIVE — AI RECOMMENDS, YOUR TEAM CONFIRMS. LOW-CONFIDENCE READS ARE FLAGGED FOR REVIEW.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Card testId="ai-total" label="ASSESSMENTS" value={metrics.assessments} />
        <Card testId="ai-rewear" label="REWEAR RECOMMENDED" value={metrics.recommendations.REWEAR} />
        <Card testId="ai-revamp" label="REVAMP RECOMMENDED" value={metrics.recommendations.REVAMP} />
        <Card testId="ai-recycle" label="RECYCLE RECOMMENDED" value={metrics.recommendations.RECYCLE} />
        <Card testId="ai-needs-review" label="NEEDS REVIEW" value={metrics.needs_review ?? 0} />
        <Card
          testId="ai-agreement"
          label="AI AGREEMENT RATE"
          value={metrics.agreement_rate === null ? "—" : `${metrics.agreement_rate}%`}
        />
      </div>

      <p className="mt-8 font-mono2 text-[9px] tracking-[0.3em] text-[#121212]/50">ASSESSMENT RECORDS</p>
      <div className="mt-3 space-y-2">
        {items.length === 0 && <Empty text="No assessments yet" />}
        {items.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#121212]/8 bg-white px-4 py-3">
            <span className="font-mono2 text-[10px] font-bold">{t.label}</span>
            <span className="font-mono2 text-[10px] text-[#121212]/60">{t.garment_type}</span>
            <span className="font-mono2 text-[10px]">SCORE {t.ai.conditionScore ?? "—"}</span>
            <span className="font-mono2 text-[10px] text-[#1E3A2B]">AI: {t.ai.recommendedPath || "—"}</span>
            {t.ai.needs_review && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-mono2 text-[8px] tracking-[0.15em] text-red-800">
                NEEDS REVIEW
              </span>
            )}
            <span className="font-mono2 text-[10px]">
              FINAL: <b className={t.final_path ? "text-[#1E3A2B]" : "text-[#121212]/40"}>{t.final_path || "PENDING"}</b>
            </span>
            {t.final_path && (
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono2 text-[8px] tracking-[0.15em] ${
                  t.final_path === t.ai.recommendedPath ? "bg-[#1E3A2B]/10 text-[#1E3A2B]" : "bg-red-100 text-red-800"
                }`}
              >
                {t.final_path === t.ai.recommendedPath ? "AGREE" : "OVERRIDE"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
