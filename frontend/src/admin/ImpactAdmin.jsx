import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "../lib/api";
import { Card, Empty } from "./Dashboard";

const STAGES = ["CONTRIBUTED", "AI CONDITION CHECK", "ASSESSED", "SORTED", "REWEAR PATH", "REVAMP PATH", "RECYCLE PATH", "UPCYCLING", "RESTORATION", "RECYCLING", "NEW LIFE", "IMPACT RECORDED"];

export default function ImpactAdmin() {
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState("");
  const [stage, setStage] = useState(STAGES[0]);
  const [note, setNote] = useState("");

  const load = () => {
    api.get("/admin/impact/summary").then((r) => setSummary(r.data)).catch(() => {});
    api.get("/admin/takebacks").then((r) => setItems(r.data.takebacks)).catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  const addEvent = async () => {
    if (!selected) return toast.error("Select a garment");
    try {
      await api.post("/admin/impact-events", { takeback_id: selected, stage, note });
      toast.success("Journey updated");
      setNote("");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (!summary) return <p className="py-20 text-center font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/40">LOADING…</p>;

  return (
    <div data-testid="admin-impact">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">IMPACT</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card testId="imp-total" label="TOTAL CONTRIBUTED" value={summary.total} />
        <Card testId="imp-rewear" label="REWEAR" value={summary.rewear} />
        <Card testId="imp-revamp" label="REVAMP" value={summary.revamp} />
        <Card testId="imp-recycle" label="RECYCLE" value={summary.recycle} />
        <Card testId="imp-pending" label="PENDING ASSESSMENT" value={summary.pending} />
      </div>

      <div className="mt-8 rounded-2xl border border-[#121212]/10 bg-white p-6">
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#121212]/50">UPDATE A GARMENT'S JOURNEY</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_1fr_auto]">
          <select
            data-testid="impact-garment-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-xl border border-[#121212]/15 bg-white px-4 py-3 font-mono2 text-[10px] outline-none focus:border-[#1E3A2B]"
          >
            <option value="">SELECT GARMENT</option>
            {items.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} — {t.garment_type} ({t.status})
              </option>
            ))}
          </select>
          <select
            data-testid="impact-stage-select"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-xl border border-[#121212]/15 bg-white px-4 py-3 font-mono2 text-[10px] outline-none focus:border-[#1E3A2B]"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            data-testid="impact-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="NOTE (OPTIONAL)"
            className="rounded-xl border border-[#121212]/15 bg-white px-4 py-3 font-mono2 text-[10px] outline-none focus:border-[#1E3A2B]"
          />
          <button
            data-testid="impact-add-event"
            onClick={addEvent}
            className="rounded-full bg-[#121212] px-6 py-3 font-mono2 text-[10px] tracking-[0.2em] text-[#F5F3EF] hover:bg-[#1E3A2B]"
          >
            ADD
          </button>
        </div>
        <p className="mt-3 font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/40">
          EVERY CHANGE IS TIMESTAMPED AND VISIBLE ON THE CUSTOMER'S IMPACT PAGE.
        </p>
      </div>

      {items.length === 0 && <div className="mt-6"><Empty text="No garments contributed yet" /></div>}
    </div>
  );
}
