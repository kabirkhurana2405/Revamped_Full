import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Heart, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import ShopShell from "../components/ShopShell";
import { api, fileUrl, inr } from "../lib/api";
import { useCart } from "../context/CartContext";

function useWishlist() {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rv_wish") || "[]");
    } catch {
      return [];
    }
  });
  const toggle = (id) =>
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("rv_wish", JSON.stringify(next));
      return next;
    });
  return [ids, toggle];
}

function ProductCard({ p }) {
  const { add } = useCart();
  const [wish, toggleWish] = useWishlist();
  const wished = wish.includes(p.id);
  const quickAdd = () => {
    if (!p.available_sizes?.length) return toast.error("Out of stock");
    add(p, p.available_sizes.includes("M") ? "M" : p.available_sizes[0]);
  };
  return (
    <div data-testid={`product-card-${p.slug}`} className="group">
      <div className="relative overflow-hidden rounded-2xl border border-[#121212]/10 bg-white/60">
        <Link to={`/product/${p.slug}`} data-cursor="hover">
          {p.images?.[0] ? (
            <img
              src={fileUrl(p.images[0])}
              alt={p.name}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-[#ECE8E0]" />
          )}
        </Link>
        <button
          aria-label="Wishlist"
          data-testid={`wishlist-${p.slug}`}
          onClick={() => toggleWish(p.id)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors ${
            wished ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]" : "border-[#121212]/15 bg-white/70 text-[#121212]"
          }`}
        >
          <Heart size={15} fill={wished ? "currentColor" : "none"} />
        </button>
        {p.total_stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#121212] px-3 py-1 font-mono2 text-[9px] tracking-[0.2em] text-[#F5F3EF]">
            SOLD OUT
          </span>
        )}
        <button
          data-testid={`quick-add-${p.slug}`}
          onClick={quickAdd}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-full bg-[#121212] py-3 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] opacity-0 transition-all duration-300 hover:bg-[#1E3A2B] group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100"
        >
          <Plus size={13} /> QUICK ADD
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link to={`/product/${p.slug}`} className="font-display text-sm font-bold tracking-wide transition-colors hover:text-[#1E3A2B]">
            {p.name}
          </Link>
          <p className="mt-1 font-mono2 text-[9px] tracking-[0.18em] text-[#121212]/50">
            {p.category} · {(p.gender || []).join("/")}
          </p>
          <p className="mt-1 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50">
            {p.available_sizes?.length ? p.available_sizes.join("  ") : "OUT OF STOCK"}
          </p>
        </div>
        <p className="whitespace-nowrap font-display text-sm font-bold">{inr(p.price)}</p>
      </div>
    </div>
  );
}

const SORTS = [
  ["featured", "FEATURED"],
  ["newest", "NEWEST"],
  ["price_asc", "PRICE LOW → HIGH"],
  ["price_desc", "PRICE HIGH → LOW"],
];

export default function Catalogue({ gender }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ categories: [], colors: [], sizes: [] });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const get = (k) => searchParams.get(k) || "";
  const setParam = (k, v) => {
    const next = new URLSearchParams(searchParams);
    if (v) next.set(k, v);
    else next.delete(k);
    setSearchParams(next);
  };

  useEffect(() => {
    api.get("/products/meta").then((r) => setMeta(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { gender };
    ["category", "size", "color", "availability", "sort", "search", "max_price"].forEach((k) => {
      const v = searchParams.get(k);
      if (v) params[k] = v;
    });
    api
      .get("/products", { params })
      .then((r) => setProducts(r.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [gender, searchParams]);

  const title = gender === "women" ? "WOMEN" : "MEN";

  const FilterGroup = ({ label, children }) => (
    <div className="border-t border-[#121212]/10 py-4">
      <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );

  const Chip = ({ active, onClick, children, testId }) => (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 font-mono2 text-[10px] tracking-[0.15em] transition-colors ${
        active ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]" : "border-[#121212]/15 text-[#121212]/70 hover:border-[#121212]/40"
      }`}
    >
      {children}
    </button>
  );

  const filters = (
    <div>
      <FilterGroup label="CATEGORY">
        {meta.categories.map((c) => (
          <Chip key={c} testId={`filter-cat-${c}`} active={get("category") === c} onClick={() => setParam("category", get("category") === c ? "" : c)}>
            {c.toUpperCase()}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="SIZE">
        {meta.sizes.map((s) => (
          <Chip key={s} testId={`filter-size-${s}`} active={get("size") === s} onClick={() => setParam("size", get("size") === s ? "" : s)}>
            {s}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="COLOUR">
        {meta.colors.map((c) => (
          <Chip key={c} testId={`filter-color-${c}`} active={get("color") === c} onClick={() => setParam("color", get("color") === c ? "" : c)}>
            {c.toUpperCase()}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="PRICE">
        <Chip testId="filter-price-under-1000" active={get("max_price") === "1000"} onClick={() => setParam("max_price", get("max_price") === "1000" ? "" : "1000")}>
          UNDER ₹1000
        </Chip>
      </FilterGroup>
      <FilterGroup label="AVAILABILITY">
        <Chip
          testId="filter-in-stock"
          active={get("availability") === "in_stock"}
          onClick={() => setParam("availability", get("availability") === "in_stock" ? "" : "in_stock")}
        >
          IN STOCK
        </Chip>
      </FilterGroup>
    </div>
  );

  return (
    <ShopShell wide>
      <div data-testid="catalogue-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight md:text-7xl">{title}</h1>
            <p className="mt-2 text-sm text-[#121212]/60">The current Revamped collection.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="filters-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[#121212]/15 px-4 py-2.5 font-mono2 text-[10px] tracking-[0.2em] lg:hidden"
            >
              <SlidersHorizontal size={13} /> FILTERS
            </button>
            <select
              data-testid="sort-select"
              value={get("sort") || "featured"}
              onChange={(e) => setParam("sort", e.target.value === "featured" ? "" : e.target.value)}
              className="rounded-full border border-[#121212]/15 bg-transparent px-4 py-2.5 font-mono2 text-[10px] tracking-[0.15em] outline-none"
            >
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {get("search") && (
          <p className="mt-4 font-mono2 text-[11px] tracking-[0.2em] text-[#1E3A2B]">
            RESULTS FOR &ldquo;{get("search").toUpperCase()}&rdquo;{" "}
            <button className="underline" onClick={() => setParam("search", "")}>
              CLEAR
            </button>
          </p>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>{filters}</aside>
          <div>
            {loading ? (
              <p className="py-20 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/40">LOADING…</p>
            ) : products.length === 0 ? (
              <p className="py-20 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/40">
                NOTHING HERE YET — DROP 001 IS LOADING.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
