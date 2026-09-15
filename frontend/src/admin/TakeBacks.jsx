import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fileUrl, apiError } from "../lib/api";
import { Empty } from "./Dashboard";

const DECISIONS = ["REWEAR", "REVAMP", "RECYCLE", "REJECT"];

export default function TakeBacks() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [notes, setNotes] = useState("");

  const load = () => api.get("/admin/takebacks").then((r) => setItems(r.data.takebacks)).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const decide = async (path) => {
    try {
      await api.patch(`/admin/takebacks/${open.id}`, {
        final_path: path === "REJECT" ? null : path,
        status: path,
        notes,
        discount_eligible: path !== "REJECT",
      });
      toast.success(`Marked ${path}`);
      setOpen(null);
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div data-testid="admin-takebacks">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">TAKE-BACK SUBMISSIONS</h1>
      <p className="mt-1 font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">
        AI RECOMMENDATION ≠ FINAL DECISION — YOUR CALL IS STORED SEPARATELY.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#121212]/10 bg-white">
        {items.length === 0 ? (
          <Empty text="No submissions yet" />
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#121212]/10 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50">
                <th className="px-5 py-3.5">ID</th>
                <th>CUSTOMER</th>
                <th>GARMENT</th>
                <th>AI RESULT</th>
                <th>FINAL PATH</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  data-testid={`takeback-row-${t.label}`}
                  onClick={() => {
                    setOpen(t);
                    setNotes(t.notes || "");
                  }}
                  className="cursor-pointer border-b border-[#121212]/5 last:border-0 hover:bg-[#F5F3EF]/60"
                >
                  <td className="px-5 py-3.5 font-mono2 text-[11px] font-bold">{t.label}</td>
                  <td>{t.customer_name || t.customer_email}</td>
                  <td className="font-mono2 text-[10px]">{t.garment_type} {t.brand ? `· ${t.brand}` : ""}</td>
                  <td className="font-mono2 text-[10px] text-[#121212]/60">
                    {t.ai ? (
                      t.ai.needs_review ? (
                        <span data-testid={`needs-review-${t.label}`} className="font-bold text-red-700">
                          NEEDS REVIEW
                        </span>
                      ) : (
                        `${t.ai.recommendedPath} (${t.ai.conditionScore})`
                      )
                    ) : (
                      "NOT RUN"
                    )}
                  </td>
                  <td className="font-mono2 text-[10px] font-bold text-[#1E3A2B]">{t.final_path || "—"}</td>
                  <td>
                    <span className="rounded-full bg-[#1E3A2B]/10 px-3 py-1 font-mono2 text-[8px] tracking-[0.15em] text-[#1E3A2B]">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" onClick={() => setOpen(null)}>
          <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm" />
          <div
            data-testid="takeback-detail"
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#F5F3EF] p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#1E3A2B]">{open.label}</p>
            <h3 className="mt-1 font-display text-xl font-extrabold">
              {open.garment_type} {open.brand ? `· ${open.brand}` : ""}
            </h3>
            <p className="mt-1 font-mono2 text-[10px] text-[#121212]/50">
              {open.customer_name} · {open.customer_email} · {(open.created_at || "").slice(0, 10)}
            </p>

            {open.images?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {open.images.map((im) => (
                  <img key={im} src={fileUrl(im)} alt="" className="h-24 w-24 rounded-xl border border-[#121212]/10 object-cover" />
                ))}
              </div>
            )}

            {open.ai ? (
              <div className="mt-5 rounded-2xl border border-[#121212]/10 bg-white/70 p-5">
                <p className="font-mono2 text-[8px] tracking-[0.25em] text-[#121212]/50">{open.ai.label}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono2 text-[10px] md:grid-cols-3">
                  <span>SCORE: <b>{open.ai.conditionScore}</b></span>
                  <span>WEAR: {open.ai.wear?.toUpperCase()}</span>
                  <span>STAINS: {open.ai.stains?.replace("_", " ").toUpperCase()}</span>
                  <span>DAMAGE: {open.ai.damage?.toUpperCase()}</span>
                  <span>STRUCTURE: {open.ai.structural?.toUpperCase()}</span>
                  <span>REUSE: {open.ai.reusePotential?.toUpperCase()}</span>
                </div>
                <p className="mt-3 font-mono2 text-[10px] tracking-[0.2em] text-[#1E3A2B]">
                  AI RECOMMENDS: {open.ai.recommendedPath}
                </p>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-[#121212]/20 p-4 font-mono2 text-[10px] tracking-[0.2em] text-[#121212]/45">
                AI ASSESSMENT NOT RUN YET.
              </p>
            )}

            {open.ai?.needs_review && (
              <p
                data-testid="takeback-needs-review"
                className="mt-3 rounded-xl bg-red-50 px-4 py-3 font-mono2 text-[9px] leading-relaxed tracking-[0.15em] text-red-800"
              >
                AI FLAGGED THIS FOR HUMAN REVIEW{open.ai.notes ? ` — ${open.ai.notes}` : ""}
              </p>
            )}

            {open.final_path && (
              <p className="mt-3 font-mono2 text-[10px] tracking-[0.2em] text-[#121212]">
                FINAL DECISION: <b className="text-[#1E3A2B]">{open.final_path}</b>
              </p>
            )}

            <textarea
              data-testid="takeback-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ADMIN NOTES"
              rows={2}
              className="mt-4 w-full rounded-xl border border-[#121212]/15 bg-white px-4 py-3 font-mono2 text-[10px] tracking-[0.1em] outline-none focus:border-[#1E3A2B]"
            />

            <div className="mt-4 grid grid-cols-4 gap-2">
              {DECISIONS.map((d) => (
                <button
                  key={d}
                  data-testid={`decide-${d.toLowerCase()}`}
                  onClick={() => decide(d)}
                  className={`rounded-full py-3 font-mono2 text-[9px] tracking-[0.2em] transition-colors ${
                    d === "REJECT"
                      ? "border border-red-700/40 text-red-800 hover:bg-red-800 hover:text-white"
                      : "bg-[#121212] text-[#F5F3EF] hover:bg-[#1E3A2B]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
