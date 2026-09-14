import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "../lib/api";
import { Empty } from "./Dashboard";

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [movements, setMovements] = useState([]);
  const [adjust, setAdjust] = useState(null); // {row}
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");

  const load = () => {
    api.get("/admin/inventory").then((r) => setRows(r.data.rows)).catch(() => {});
    api.get("/admin/inventory/movements").then((r) => setMovements(r.data.movements)).catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  const submitAdjust = async () => {
    if (!delta) return toast.error("Enter a non-zero adjustment");
    try {
      const { data } = await api.post("/admin/inventory/adjust", {
        product_id: adjust.product_id,
        size: adjust.size,
        delta: Number(delta),
        note,
      });
      toast.success(`Stock now ${data.new_stock}`);
      setAdjust(null);
      setDelta(0);
      setNote("");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div data-testid="admin-inventory">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">INVENTORY</h1>
      <p className="mt-1 font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">SIZE-LEVEL STOCK · 50-PIECE PILOT</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#121212]/10 bg-white">
        {rows.length === 0 ? (
          <Empty text="No inventory yet" />
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#121212]/10 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50">
                <th className="px-5 py-3.5">PRODUCT</th>
                <th>SKU</th>
                <th>SIZE</th>
                <th>STOCK</th>
                <th>RESERVED</th>
                <th>AVAILABLE</th>
                <th>STATUS</th>
                <th className="pr-5 text-right">ADJUST</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sku} data-testid={`inv-row-${r.sku}`} className="border-b border-[#121212]/5 last:border-0">
                  <td className="px-5 py-3 font-medium">{r.product}</td>
                  <td className="font-mono2 text-[10px]">{r.sku}</td>
                  <td className="font-mono2 text-[11px]">{r.size}</td>
                  <td className="font-mono2 text-[11px]">{r.stock}</td>
                  <td className="font-mono2 text-[11px]">{r.reserved}</td>
                  <td className="font-mono2 text-[11px] font-bold">{r.available}</td>
                  <td>
                    {r.low ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 font-mono2 text-[8px] tracking-[0.15em] text-red-800">LOW</span>
                    ) : (
                      <span className="rounded-full bg-[#1E3A2B]/10 px-3 py-1 font-mono2 text-[8px] tracking-[0.15em] text-[#1E3A2B]">OK</span>
                    )}
                  </td>
                  <td className="pr-5 text-right">
                    <button
                      data-testid={`adjust-${r.sku}`}
                      onClick={() => setAdjust(r)}
                      className="rounded-full border border-[#121212]/20 px-4 py-1.5 font-mono2 text-[9px] tracking-[0.15em] hover:bg-[#121212] hover:text-[#F5F3EF]"
                    >
                      ADJUST
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8">
        <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#121212]/50">STOCK MOVEMENTS</p>
        <div className="mt-3 space-y-2">
          {movements.length === 0 && <Empty text="No movements yet" />}
          {movements.slice(0, 20).map((mv) => (
            <div key={mv.id} className="flex items-center justify-between rounded-xl border border-[#121212]/8 bg-white px-4 py-3 font-mono2 text-[10px]">
              <span>{mv.sku || mv.product_id?.slice(-6)}</span>
              <span className="text-[#121212]/50">{mv.type?.toUpperCase()}</span>
              <span className={mv.delta >= 0 ? "text-[#1E3A2B]" : "text-red-700"}>
                {mv.delta >= 0 ? `+${mv.delta}` : mv.delta}
              </span>
              <span className="text-[#121212]/40">{(mv.ts || "").slice(0, 16).replace("T", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {adjust && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" onClick={() => setAdjust(null)}>
          <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm" />
          <div data-testid="adjust-modal" className="relative w-full max-w-sm rounded-2xl bg-[#F5F3EF] p-7" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg font-bold">ADJUST STOCK</p>
            <p className="mt-1 font-mono2 text-[10px] tracking-[0.2em] text-[#121212]/50">
              {adjust.product} — {adjust.sku} (current {adjust.stock})
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={() => setDelta((d) => d - 1)} className="h-11 w-11 rounded-full border border-[#121212]/20 font-mono2">−</button>
              <input
                data-testid="adjust-delta"
                type="number"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-24 rounded-xl border border-[#121212]/15 bg-white px-3 py-2.5 text-center font-mono2 outline-none focus:border-[#1E3A2B]"
              />
              <button onClick={() => setDelta((d) => d + 1)} className="h-11 w-11 rounded-full border border-[#121212]/20 font-mono2">+</button>
            </div>
            <input
              data-testid="adjust-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="NOTE (RESTOCK, DAMAGED, …)"
              className="mt-4 w-full rounded-xl border border-[#121212]/15 bg-white px-4 py-2.5 font-mono2 text-[10px] tracking-[0.15em] outline-none focus:border-[#1E3A2B]"
            />
            <button
              data-testid="adjust-save"
              onClick={submitAdjust}
              className="mt-5 w-full rounded-full bg-[#121212] py-3.5 font-mono2 text-[10px] tracking-[0.28em] text-[#F5F3EF] hover:bg-[#1E3A2B]"
            >
              SAVE ADJUSTMENT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
