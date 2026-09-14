import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, inr, apiError } from "../lib/api";
import { Empty } from "./Dashboard";

const STATUSES = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);
  const [tracking, setTracking] = useState("");

  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data.orders)).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const update = async (id, payload) => {
    try {
      await api.patch(`/admin/orders/${id}`, payload);
      toast.success("Order updated");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div data-testid="admin-orders">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">ORDERS</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#121212]/10 bg-white">
        {orders.length === 0 ? (
          <Empty text="No orders yet" />
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#121212]/10 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50">
                <th className="px-5 py-3.5">ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>AMOUNT</th>
                <th>PAYMENT</th>
                <th>TAKE-BACK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr
                    key={o.id}
                    data-testid={`order-row-${o.order_number}`}
                    onClick={() => {
                      setOpen(open?.id === o.id ? null : o);
                      setTracking(o.tracking || "");
                    }}
                    className="cursor-pointer border-b border-[#121212]/5 hover:bg-[#F5F3EF]/60"
                  >
                    <td className="px-5 py-3.5 font-mono2 text-[11px] font-bold">{o.order_number}</td>
                    <td>{o.customer?.name}</td>
                    <td className="font-mono2 text-[10px]">{(o.created_at || "").slice(0, 10)}</td>
                    <td className="font-mono2 text-[10px]">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                    <td className="font-mono2 text-[11px]">{inr(o.total)}</td>
                    <td className="font-mono2 text-[9px] text-[#121212]/50">{o.payment_status}</td>
                    <td className="font-mono2 text-[10px] text-[#1E3A2B]">
                      {o.takeback_garments > 0 ? `${o.takeback_garments} GARMENTS / −${o.takeback_discount_percent}%` : "—"}
                    </td>
                    <td>
                      <span className="rounded-full bg-[#1E3A2B]/10 px-3 py-1 font-mono2 text-[8px] tracking-[0.15em] text-[#1E3A2B]">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                  {open?.id === o.id && (
                    <tr key={`${o.id}-detail`} className="border-b border-[#121212]/5 bg-[#F5F3EF]/70">
                      <td colSpan={8} className="px-5 py-5">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div>
                            <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">ITEMS</p>
                            {o.items.map((i, idx) => (
                              <p key={idx} className="mt-1.5 text-sm">
                                {i.name} — {i.size} × {i.qty} · {inr(i.price * i.qty)}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">DELIVERY</p>
                            <p className="mt-1.5 text-sm text-[#121212]/70">
                              {o.customer?.name} · {o.customer?.phone}
                              <br />
                              {o.address?.line1}, {o.address?.city}, {o.address?.state} — {o.address?.pincode}
                            </p>
                          </div>
                          <div>
                            <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">UPDATE STATUS</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {STATUSES.map((s) => (
                                <button
                                  key={s}
                                  data-testid={`status-${s.replace(/\s+/g, "-")}`}
                                  onClick={() => update(o.id, { status: s })}
                                  className={`rounded-full border px-3 py-1.5 font-mono2 text-[8px] tracking-[0.15em] ${
                                    o.status === s
                                      ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]"
                                      : "border-[#121212]/20 hover:border-[#121212]"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <input
                                data-testid="tracking-input"
                                value={tracking}
                                onChange={(e) => setTracking(e.target.value)}
                                placeholder="TRACKING ID / LINK"
                                className="flex-1 rounded-xl border border-[#121212]/15 bg-white px-3 py-2 font-mono2 text-[10px] outline-none focus:border-[#1E3A2B]"
                              />
                              <button
                                data-testid="tracking-save"
                                onClick={() => update(o.id, { tracking })}
                                className="rounded-full bg-[#121212] px-4 py-2 font-mono2 text-[9px] tracking-[0.15em] text-[#F5F3EF]"
                              >
                                SAVE
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
