import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "../lib/api";

export default function Settings() {
  const [levels, setLevels] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((r) => setLevels(r.data.levels || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const save = async () => {
    try {
      await api.patch("/admin/settings", { levels: levels.map((l) => ({ min: Number(l.min) || 0, name: l.name })) });
      toast.success("Reward rules saved");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div data-testid="admin-settings" className="max-w-2xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">SETTINGS</h1>

      <div className="mt-6 rounded-2xl border border-[#121212]/10 bg-white p-6">
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#1E3A2B]">REWARD LEVELS</p>
        <p className="mt-1 text-sm text-[#121212]/60">Cycle levels by garments contributed. Editable anytime.</p>
        <div className="mt-4 space-y-2">
          {levels.map((l, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                data-testid={`level-min-${i}`}
                type="number"
                min="0"
                value={l.min}
                onChange={(e) => setLevels((ls) => ls.map((x, j) => (j === i ? { ...x, min: e.target.value } : x)))}
                className="w-24 rounded-xl border border-[#121212]/15 bg-white px-3 py-2.5 text-center font-mono2 text-sm outline-none focus:border-[#1E3A2B]"
              />
              <input
                data-testid={`level-name-${i}`}
                value={l.name}
                onChange={(e) => setLevels((ls) => ls.map((x, j) => (j === i ? { ...x, name: e.target.value.toUpperCase() } : x)))}
                className="flex-1 rounded-xl border border-[#121212]/15 bg-white px-4 py-2.5 font-mono2 text-[11px] tracking-[0.15em] outline-none focus:border-[#1E3A2B]"
              />
              <button
                onClick={() => setLevels((ls) => ls.filter((_, j) => j !== i))}
                className="font-mono2 text-[10px] text-red-700/70 hover:underline"
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            data-testid="level-add"
            onClick={() => setLevels((ls) => [...ls, { min: 0, name: "NEW LEVEL" }])}
            className="rounded-full border border-[#121212]/20 px-5 py-2.5 font-mono2 text-[9px] tracking-[0.2em] hover:border-[#121212]"
          >
            + ADD LEVEL
          </button>
          <button
            data-testid="settings-save"
            onClick={save}
            disabled={!loaded}
            className="rounded-full bg-[#121212] px-6 py-2.5 font-mono2 text-[9px] tracking-[0.2em] text-[#F5F3EF] hover:bg-[#1E3A2B]"
          >
            SAVE RULES
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#121212]/10 bg-white p-6">
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#1E3A2B]">AI PROVIDER</p>
        <p className="mt-2 text-sm text-[#121212]/60">
          Current provider: <span className="font-mono2 text-[11px]">GEMINI (gemini-3-flash-preview)</span> — live
          vision assessment of customer photos. AI recommends; your team confirms the final path. Failed or
          low-confidence assessments are flagged NEEDS HUMAN REVIEW instead of blocking the customer.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#121212]/10 bg-white p-6">
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#1E3A2B]">PAYMENTS</p>
        <p className="mt-2 text-sm text-[#121212]/60">
          TEST PAYMENT MODE is active — no real charges. The order pipeline is provider-ready; connect Razorpay (or
          another gateway) in the orders route when credentials are available.
        </p>
      </div>
    </div>
  );
}
