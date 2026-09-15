import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Bookmark } from "lucide-react";
import ShopShell from "../components/ShopShell";
import { fileUrl, inr } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, setQty, remove, add, subtotal, takeback, setTakeback, takebackPercent, discount } = useCart();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rv_saved") || "[]");
    } catch {
      return [];
    }
  });

  const saveForLater = (item) => {
    remove(item.product_id, item.size);
    const next = [...saved, item];
    setSaved(next);
    localStorage.setItem("rv_saved", JSON.stringify(next));
  };

  const restore = (item) => {
    const next = saved.filter((x) => !(x.product_id === item.product_id && x.size === item.size));
    setSaved(next);
    localStorage.setItem("rv_saved", JSON.stringify(next));
    add({ id: item.product_id, slug: item.slug, name: item.name, price: item.price, images: [item.image] }, item.size, item.qty);
  };

  const checkout = () => navigate("/checkout");

  return (
    <ShopShell>
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">YOUR BAG</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono2 text-xs tracking-[0.3em] text-[#121212]/50">YOUR BAG IS EMPTY.</p>
          <Link
            to="/men"
            data-testid="cart-shop-link"
            className="mt-6 inline-block rounded-full bg-[#121212] px-8 py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
          >
            SHOP DROP 001
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            {items.map((it) => (
              <div
                key={`${it.product_id}-${it.size}`}
                data-testid={`cart-item-${it.size}`}
                className="flex gap-4 border-t border-[#121212]/10 py-5"
              >
                <Link to={`/product/${it.slug}`} className="h-28 w-22 shrink-0 overflow-hidden rounded-xl border border-[#121212]/10 bg-white/60">
                  {it.image && <img src={fileUrl(it.image)} alt={it.name} className="h-full w-full object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/product/${it.slug}`} className="font-display text-sm font-bold hover:text-[#1E3A2B]">
                        {it.name}
                      </Link>
                      <p className="mt-1 font-mono2 text-[10px] tracking-[0.2em] text-[#121212]/50">SIZE {it.size}</p>
                    </div>
                    <p className="font-display text-sm font-bold">{inr(it.price * it.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-[#121212]/20">
                      <button aria-label="Decrease" onClick={() => setQty(it.product_id, it.size, it.qty - 1)} className="p-2">
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center font-mono2 text-xs">{it.qty}</span>
                      <button aria-label="Increase" onClick={() => setQty(it.product_id, it.size, it.qty + 1)} className="p-2">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        data-testid="save-for-later-btn"
                        onClick={() => saveForLater(it)}
                        className="flex items-center gap-1.5 font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50 hover:text-[#1E3A2B]"
                      >
                        <Bookmark size={11} /> SAVE FOR LATER
                      </button>
                      <button
                        data-testid="remove-item-btn"
                        aria-label="Remove"
                        onClick={() => remove(it.product_id, it.size)}
                        className="text-[#121212]/50 hover:text-red-700"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {saved.length > 0 && (
              <div className="mt-10">
                <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">SAVED FOR LATER</p>
                {saved.map((it) => (
                  <div key={`${it.product_id}-${it.size}`} className="mt-3 flex items-center justify-between rounded-xl border border-[#121212]/10 p-4">
                    <p className="text-sm">
                      {it.name} — <span className="font-mono2 text-xs">{it.size}</span>
                    </p>
                    <button
                      data-testid="restore-item-btn"
                      onClick={() => restore(it)}
                      className="font-mono2 text-[10px] tracking-[0.2em] text-[#1E3A2B] underline underline-offset-4"
                    >
                      MOVE TO BAG
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-3xl border border-[#1E3A2B]/25 bg-[#1E3A2B]/5 p-6 md:p-8">
              <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">TAKE-BACK DISCOUNT</p>
              <p className="mt-2 font-display text-xl font-bold">Bringing clothes with you?</p>
              <p className="mt-1 text-sm text-[#121212]/60">
                Any brand, any garment. 5% off per garment — up to 4 garments, 20% off.
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                {[0, 1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    data-testid={`cart-takeback-${v}`}
                    onClick={() => setTakeback(v)}
                    className={`h-11 w-11 rounded-full border font-mono2 text-xs transition-all ${
                      takeback === v
                        ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]"
                        : "border-[#121212]/20 text-[#121212]/70 hover:border-[#121212]/50"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {takeback > 0 && (
                <p className="mt-3 font-mono2 text-[10px] tracking-[0.2em] text-[#1E3A2B]">
                  {takeback} GARMENT{takeback > 1 ? "S" : ""} → {takebackPercent}% OFF APPLIED
                </p>
              )}
              <p className="mt-2 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/40">
                CONTINUE WITHOUT CONTRIBUTING — IT&rsquo;S OPTIONAL.
              </p>
            </div>
          </div>

          <div className="h-max rounded-3xl border border-[#121212]/10 bg-white/60 p-7">
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">SUMMARY</p>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#121212]/60">Subtotal</span>
                <span data-testid="cart-subtotal">{inr(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#1E3A2B]">
                  <span>Circular discount ({takebackPercent}%)</span>
                  <span data-testid="cart-discount">−{inr(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#121212]/50">
                <span>Shipping & GST</span>
                <span className="font-mono2 text-[10px] tracking-[0.15em]">AT CHECKOUT</span>
              </div>
              <div className="flex justify-between border-t border-[#121212]/10 pt-3 font-display text-lg font-bold">
                <span>Estimated total</span>
                <span data-testid="cart-total">{inr(subtotal - discount)}</span>
              </div>
            </div>
            <button
              data-testid="checkout-btn"
              onClick={checkout}
              className="mt-6 w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
            >
              CHECKOUT
            </button>
          </div>
        </div>
      )}
    </ShopShell>
  );
}
