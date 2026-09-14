import { useEffect, useState } from "react";
import { api, inr } from "../lib/api";
import { Empty } from "./Dashboard";

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/admin/customers").then((r) => setCustomers(r.data.customers)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-customers">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">CUSTOMERS</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#121212]/10 bg-white">
        {customers.length === 0 ? (
          <Empty text="No customers yet" />
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#121212]/10 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50">
                <th className="px-5 py-3.5">CUSTOMER</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>ORDERS</th>
                <th>TOTAL SPENT</th>
                <th>GARMENTS</th>
                <th>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} data-testid={`customer-row-${c.email}`} className="border-b border-[#121212]/5 last:border-0">
                  <td className="px-5 py-3.5 font-semibold">{c.name}</td>
                  <td className="font-mono2 text-[10px]">{c.email}</td>
                  <td className="font-mono2 text-[10px]">{c.phone || "—"}</td>
                  <td className="font-mono2 text-[11px]">{c.orders}</td>
                  <td className="font-mono2 text-[11px]">{inr(c.total_spent)}</td>
                  <td className="font-mono2 text-[11px] text-[#1E3A2B]">{c.garments_contributed}</td>
                  <td className="font-mono2 text-[10px] text-[#121212]/40">{(c.created_at || "").slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
