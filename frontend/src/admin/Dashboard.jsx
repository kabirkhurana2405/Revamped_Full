import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, inr } from "../lib/api";

export const Card = ({ label, value, testId }) => (
  <div data-testid={testId} className="rounded-2xl border border-[#121212]/10 bg-white p-5">
    <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">{label}</p>
    <p className="mt-2 font-display text-2xl font-extrabold md:text-3xl">{value}</p>
  </div>
);

export const Empty = ({ text = "No data yet" }) => (
  <p className="rounded-2xl border border-dashed border-[#121212]/20 p-8 text-center font-mono2 text-[10px] tracking-[0.25em] text-[#121212]/40">
    {text.toUpperCase()}
  </p>
);

function BarChart({ series }) {
  const max = Math.max(...series.map((s) => s.total), 1);
  if (series.every((s) => s.total === 0)) return <Empty text="No sales data yet" />;
  return (
    <div className="flex h-40 items-end gap-1.5">
      {series.map((s) => (
        <div key={s.day} className="group relative flex-1">
          <div
            className="w-full rounded-t bg-[#1E3A2B]/85 transition-all group-hover:bg-[#1E3A2B]"
            style={{ height: `${Math.max(3, (s.total / max) * 150)}px` }}
          />
          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#121212] px-2 py-0.5 font-mono2 text-[8px] text-[#F5F3EF] opacity-0 transition-opacity group-hover:opacity-100">
            {s.day.slice(5)} · {inr(s.total)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [m, setM] = useState(null);

  useEffect(() => {
    api.get("/admin/metrics").then((r) => setM(r.data)).catch(() => {});
  }, []);

  if (!m) return <p className="py-20 text-center font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/40">LOADING…</p>;

  const pathwayTotal = Object.values(m.pathway).reduce((a, b) => a + b, 0);

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">DASHBOARD</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Card testId="metric-sales" label="TOTAL SALES" value={inr(m.total_sales)} />
        <Card testId="metric-orders" label="ORDERS" value={m.orders} />
        <Card testId="metric-products" label="PRODUCTS" value={m.products} />
        <Card testId="metric-low-stock" label="LOW STOCK" value={m.low_stock} />
        <Card testId="metric-takebacks" label="TAKE-BACKS" value={m.takebacks} />
        <Card testId="metric-garments" label="GARMENTS CONTRIBUTED" value={m.garments_contributed} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#121212]/10 bg-white p-6">
          <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">SALES — LAST 14 DAYS</p>
          <div className="mt-5">
            <BarChart series={m.sales_series} />
          </div>
        </div>
        <div className="rounded-2xl border border-[#121212]/10 bg-white p-6">
          <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">PATHWAY DISTRIBUTION</p>
          {pathwayTotal === 0 ? (
            <div className="mt-5"><Empty text="No take-back data yet" /></div>
          ) : (
            <div className="mt-5 space-y-3">
              {["REWEAR", "REVAMP", "RECYCLE", "PENDING"].map((k) => (
                <div key={k}>
                  <div className="flex justify-between font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/60">
                    <span>{k}</span>
                    <span>{m.pathway[k]}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#121212]/8">
                    <div
                      className={`h-full rounded-full ${k === "PENDING" ? "bg-[#8E8B83]" : "bg-[#1E3A2B]"}`}
                      style={{ width: `${(m.pathway[k] / pathwayTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#121212]/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">RECENT ORDERS</p>
          <Link to="/admin/orders" className="font-mono2 text-[9px] tracking-[0.2em] text-[#1E3A2B] underline underline-offset-4">
            VIEW ALL
          </Link>
        </div>
        {m.recent_orders.length === 0 ? (
          <div className="mt-5"><Empty text="No orders yet" /></div>
        ) : (
          <div className="mt-4 space-y-2">
            {m.recent_orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-[#121212]/8 px-4 py-3 text-sm">
                <span className="font-mono2 text-[11px]">{o.order_number}</span>
                <span className="text-[#121212]/60">{o.customer?.name}</span>
                <span className="font-mono2 text-[11px]">{inr(o.total)}</span>
                <span className="rounded-full bg-[#1E3A2B]/10 px-3 py-1 font-mono2 text-[8px] tracking-[0.15em] text-[#1E3A2B]">{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
