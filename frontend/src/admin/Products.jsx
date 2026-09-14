import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, fileUrl, inr, apiError } from "../lib/api";
import { Empty } from "./Dashboard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = () =>
    api.get("/admin/products", { params: q ? { q } : {} }).then((r) => setProducts(r.data.products)).catch(() => {});

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  const act = async (action, p) => {
    try {
      if (action === "duplicate") {
        await api.post(`/admin/products/${p.id}/duplicate`);
        toast.success("Duplicated as draft");
      } else if (action === "archive") {
        await api.patch(`/admin/products/${p.id}`, { ...p, status: "archived" });
        toast.success("Archived");
      } else if (action === "delete") {
        if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
        await api.delete(`/admin/products/${p.id}`);
        toast.success("Deleted");
      } else if (action === "activate") {
        await api.patch(`/admin/products/${p.id}`, { ...p, status: "active" });
        toast.success("Live");
      }
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div data-testid="admin-products">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">PRODUCTS</h1>
        <Link
          to="/admin/products/new"
          data-testid="add-product-btn"
          className="rounded-full bg-[#121212] px-6 py-3 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] hover:bg-[#1E3A2B]"
        >
          + ADD PRODUCT
        </Link>
      </div>

      <input
        data-testid="product-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="SEARCH NAME OR SKU"
        className="mt-5 w-full max-w-sm rounded-xl border border-[#121212]/15 bg-white px-4 py-3 font-mono2 text-[11px] tracking-[0.15em] outline-none focus:border-[#1E3A2B]"
      />

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[#121212]/10 bg-white">
        {products.length === 0 ? (
          <Empty text="No products found" />
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#121212]/10 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50">
                <th className="px-5 py-3.5">PRODUCT</th>
                <th>SKU</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th className="pr-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} data-testid={`product-row-${p.sku}`} className="border-b border-[#121212]/5 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                      <button onClick={() => navigate(`/admin/products/${p.id}`)} className="font-semibold hover:text-[#1E3A2B]">
                        {p.name}
                      </button>
                    </div>
                  </td>
                  <td className="font-mono2 text-[11px]">{p.sku}</td>
                  <td className="font-mono2 text-[11px]">{inr(p.price)}</td>
                  <td className="font-mono2 text-[11px]">{p.total_stock}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 font-mono2 text-[8px] tracking-[0.15em] ${
                        p.status === "active" ? "bg-[#1E3A2B]/10 text-[#1E3A2B]" : "bg-[#121212]/8 text-[#121212]/50"
                      }`}
                    >
                      {(p.status || "draft").toUpperCase()}
                    </span>
                  </td>
                  <td className="space-x-3 pr-5 text-right font-mono2 text-[9px] tracking-[0.15em]">
                    <button data-testid={`edit-${p.sku}`} onClick={() => navigate(`/admin/products/${p.id}`)} className="text-[#1E3A2B] hover:underline">
                      EDIT
                    </button>
                    <button onClick={() => act("duplicate", p)} className="text-[#121212]/60 hover:underline">
                      DUPLICATE
                    </button>
                    {p.status === "active" ? (
                      <button onClick={() => act("archive", p)} className="text-[#121212]/60 hover:underline">
                        ARCHIVE
                      </button>
                    ) : (
                      <button onClick={() => act("activate", p)} className="text-[#1E3A2B] hover:underline">
                        ACTIVATE
                      </button>
                    )}
                    <button onClick={() => act("delete", p)} className="text-red-700/70 hover:underline">
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
