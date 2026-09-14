import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, Ruler } from "lucide-react";
import { toast } from "sonner";
import ShopShell from "../components/ShopShell";
import { api, fileUrl, inr, apiError } from "../lib/api";
import { useCart } from "../context/CartContext";

function Accordion({ title, children, open, onToggle, testId }) {
  return (
    <div className="border-t border-[#121212]/10">
      <button
        data-testid={testId}
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left font-mono2 text-[11px] tracking-[0.28em] text-[#121212]"
      >
        {title}
        <span className="text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-[#121212]/70">{children}</div>}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [openSection, setOpenSection] = useState("DESCRIPTION");
  const [sizeGuide, setSizeGuide] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setP(null);
    setSize("");
    api
      .get(`/products/${slug}`)
      .then((r) => setP(r.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound)
    return (
      <ShopShell>
        <p className="py-24 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/50">PRODUCT NOT FOUND.</p>
      </ShopShell>
    );
  if (!p)
    return (
      <ShopShell>
        <p className="py-24 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/40">LOADING…</p>
      </ShopShell>
    );

  const variant = p.variants?.find((v) => v.size === size);
  const stockForSize = variant ? variant.stock - (variant.reserved || 0) : null;
  const stockLabel = !size
    ? "SELECT A SIZE"
    : stockForSize <= 0
      ? "OUT OF STOCK"
      : stockForSize <= (p.low_stock_threshold || 3)
        ? `LOW STOCK — ${stockForSize} LEFT`
        : "IN STOCK";

  const tryAdd = (then) => {
    if (!size) return toast.error("Select a size first");
    if (stockForSize <= 0) return toast.error("That size is out of stock");
    add(p, size, qty);
    if (then) then();
  };

  const sections = {
    DESCRIPTION: p.description,
    "FABRIC & FIT": `${p.material || ""}${p.gsm ? ` · ${p.gsm} GSM` : ""}. Fit: ${p.fit || "—"}.${p.embroidery ? " Embroidered Revamped branding." : ""}`,
    CARE: p.care || "Machine wash cold.",
    SHIPPING: "Ships across India in 3–7 working days. Free shipping on orders over ₹999.",
  };

  return (
    <ShopShell wide>
      <div data-testid="product-page" className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-[#121212]/10 bg-white/60">
            {p.images?.[imgIdx] ? (
              <img src={fileUrl(p.images[imgIdx])} alt={p.name} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="aspect-[4/5] w-full bg-[#ECE8E0]" />
            )}
          </div>
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {p.images.map((im, i) => (
                <button
                  key={i}
                  data-testid={`gallery-thumb-${i}`}
                  onClick={() => setImgIdx(i)}
                  className={`h-20 w-16 overflow-hidden rounded-xl border ${i === imgIdx ? "border-[#1E3A2B]" : "border-[#121212]/10"}`}
                >
                  <img src={fileUrl(im)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#1E3A2B]">{p.collection}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{p.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-display text-2xl font-bold">{inr(p.price)}</p>
            {p.compare_at > p.price && (
              <p className="font-mono2 text-sm text-[#121212]/40 line-through">{inr(p.compare_at)}</p>
            )}
          </div>

          {p.colors?.length > 0 && (
            <div className="mt-7">
              <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">COLOUR</p>
              <div className="mt-2 flex gap-2">
                {p.colors.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="h-8 w-8 rounded-full border border-[#121212]/20"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">SIZE</p>
              <button
                data-testid="size-guide-btn"
                onClick={() => setSizeGuide(true)}
                className="flex items-center gap-1.5 font-mono2 text-[10px] tracking-[0.2em] text-[#121212]/60 underline-offset-4 hover:underline"
              >
                <Ruler size={12} /> SIZE GUIDE
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.variants?.map((v) => {
                const avail = v.stock - (v.reserved || 0);
                return (
                  <button
                    key={v.size}
                    data-testid={`size-${v.size}`}
                    disabled={avail <= 0}
                    onClick={() => setSize(v.size)}
                    className={`h-11 min-w-12 rounded-full border px-4 font-mono2 text-xs transition-colors ${
                      size === v.size
                        ? "border-[#121212] bg-[#121212] text-[#F5F3EF]"
                        : avail <= 0
                          ? "cursor-not-allowed border-[#121212]/10 text-[#121212]/30 line-through"
                          : "border-[#121212]/20 text-[#121212] hover:border-[#121212]"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
            <p
              data-testid="stock-status"
              className={`mt-3 font-mono2 text-[10px] tracking-[0.25em] ${
                size && stockForSize > 0 ? "text-[#1E3A2B]" : "text-[#121212]/50"
              }`}
            >
              {stockLabel}
            </p>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-[#121212]/20">
              <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3">
                <Minus size={14} />
              </button>
              <span data-testid="qty-display" className="w-8 text-center font-mono2 text-sm">{qty}</span>
              <button aria-label="Increase" onClick={() => setQty((q) => Math.min(5, q + 1))} className="p-3">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              data-testid="add-to-bag-btn"
              onClick={() => tryAdd()}
              className="flex-1 rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
            >
              ADD TO BAG
            </button>
            <button
              data-testid="buy-now-btn"
              onClick={() => tryAdd(() => navigate("/checkout"))}
              className="flex-1 rounded-full border border-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#121212] transition-colors hover:bg-[#121212] hover:text-[#F5F3EF]"
            >
              BUY NOW
            </button>
          </div>

          <div className="mt-10">
            {Object.entries(sections).map(([title, body]) => (
              <Accordion
                key={title}
                title={title}
                testId={`accordion-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                open={openSection === title}
                onToggle={() => setOpenSection(openSection === title ? "" : title)}
              >
                {body}
              </Accordion>
            ))}
            <Accordion
              title="CIRCULARITY"
              testId="accordion-circularity"
              open={openSection === "CIRCULARITY"}
              onToggle={() => setOpenSection(openSection === "CIRCULARITY" ? "" : "CIRCULARITY")}
            >
              <p className="font-mono2 text-[10px] tracking-[0.25em] text-[#1E3A2B]">THIS GARMENT HAS A NEXT LIFE.</p>
              <p className="mt-2">
                When you&rsquo;re done with it, bring it back to Revamped. It doesn&rsquo;t have to be a Revamped
                garment — we accept clothes from any brand through our take-back program, and you get 5% off per
                contributed garment (up to 4) on your next purchase.
              </p>
              <Link
                to="/take-back"
                data-testid="learn-takeback-link"
                className="mt-3 inline-block font-mono2 text-[10px] tracking-[0.25em] text-[#1E3A2B] underline underline-offset-4"
              >
                LEARN ABOUT TAKE-BACK →
              </Link>
            </Accordion>
          </div>
        </div>
      </div>

      {sizeGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" onClick={() => setSizeGuide(false)}>
          <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm" />
          <div data-testid="size-guide-modal" className="relative w-full max-w-sm rounded-2xl bg-[#F5F3EF] p-7" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg font-bold">SIZE GUIDE — OVERSIZED</p>
            <table className="mt-4 w-full font-mono2 text-[11px] text-[#121212]/80">
              <thead>
                <tr className="border-b border-[#121212]/15 text-left text-[#121212]/50">
                  <th className="py-2">SIZE</th>
                  <th>CHEST (IN)</th>
                  <th>LENGTH (IN)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["S", "42", "27"],
                  ["M", "44", "28"],
                  ["L", "46", "29"],
                  ["XL", "48", "30"],
                  ["XXL", "50", "31"],
                ].map((r) => (
                  <tr key={r[0]} className="border-b border-[#121212]/8">
                    <td className="py-2">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              data-testid="size-guide-close"
              onClick={() => setSizeGuide(false)}
              className="mt-5 w-full rounded-full bg-[#121212] py-3 font-mono2 text-[10px] tracking-[0.3em] text-[#F5F3EF]"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </ShopShell>
  );
}
