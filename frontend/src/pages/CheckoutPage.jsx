import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import ShopShell from "../components/ShopShell";
import { api, inr, apiError } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">{label}</span>
    <input
      {...props}
      className="mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white/60 px-4 py-3 text-sm text-[#121212] outline-none transition-colors focus:border-[#1E3A2B]"
    />
  </label>
);

export default function CheckoutPage() {
  const { items, subtotal, takeback, takebackPercent, discount, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (user)
      setForm((f) => ({
        ...f,
        name: f.name || user.name || "",
        phone: f.phone || user.phone || "",
        email: f.email || user.email || "",
      }));
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const taxable = subtotal - discount;
  const gst = Math.round(taxable * 0.05);
  const shipping = items.length === 0 ? 0 : subtotal >= 999 ? 0 : 79;
  const total = taxable + gst + shipping;

  const placeOrder = async () => {
    if (!items.length) return toast.error("Your bag is empty");
    if (!form.name || !form.phone || !form.email || !form.line1 || !form.city || !form.state || !form.pincode)
      return toast.error("Fill in all required fields");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ product_id: i.product_id, size: i.size, qty: i.qty })),
        customer: { name: form.name, phone: form.phone, email: form.email },
        address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
        takeback_garments: takeback,
      });
      clear();
      sessionStorage.setItem(`rv_order_${data.order_number}`, form.email.trim().toLowerCase());
      navigate(`/order/${data.order_number}`, { state: { order: data } });
    } catch (e) {
      toast.error(apiError(e, "Could not place order"));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ShopShell>
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">CHECKOUT</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">01 — CUSTOMER</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="NAME *" data-testid="checkout-name" value={form.name} onChange={set("name")} />
              <Field label="PHONE *" data-testid="checkout-phone" value={form.phone} onChange={set("phone")} />
              <Field label="EMAIL *" data-testid="checkout-email" type="email" value={form.email} onChange={set("email")} />
            </div>
            {user === false && (
              <p
                data-testid="guest-checkout-note"
                className="mt-4 rounded-xl border border-[#1E3A2B]/25 bg-[#1E3A2B]/5 px-4 py-3 font-mono2 text-[9px] leading-relaxed tracking-[0.18em] text-[#1E3A2B]"
              >
                CHECKING OUT AS GUEST — CREATE AN ACCOUNT LATER WITH THE SAME EMAIL AND THIS ORDER JOINS YOUR ACCOUNT
                AUTOMATICALLY.
              </p>
            )}
          </section>
          <section>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">02 — DELIVERY</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="ADDRESS *" data-testid="checkout-address" value={form.line1} onChange={set("line1")} />
              </div>
              <div className="sm:col-span-2">
                <Field label="APARTMENT / LANDMARK" value={form.line2} onChange={set("line2")} />
              </div>
              <Field label="CITY *" data-testid="checkout-city" value={form.city} onChange={set("city")} />
              <Field label="STATE *" data-testid="checkout-state" value={form.state} onChange={set("state")} />
              <Field label="PINCODE *" data-testid="checkout-pincode" value={form.pincode} onChange={set("pincode")} />
            </div>
          </section>
          <section>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">03 — PAYMENT</p>
            <div data-testid="test-payment-card" className="mt-4 rounded-2xl border-2 border-dashed border-[#121212]/25 bg-white/50 p-6">
              <p className="font-mono2 text-[10px] tracking-[0.25em] text-[#121212]">TEST PAYMENT MODE</p>
              <p className="mt-2 text-sm leading-relaxed text-[#121212]/60">
                Development only — no real payment is charged. Razorpay / UPI / cards plug in here when the
                payment provider is connected.
              </p>
            </div>
          </section>
        </div>

        <div className="h-max rounded-3xl border border-[#121212]/10 bg-white/60 p-7">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">ORDER</p>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={`${i.product_id}-${i.size}`} className="flex justify-between text-sm">
                <span className="text-[#121212]/70">
                  {i.name} <span className="font-mono2 text-[10px]">× {i.qty} ({i.size})</span>
                </span>
                <span>{inr(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2.5 border-t border-[#121212]/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#121212]/60">Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#1E3A2B]">
                <span>Circular discount — {takeback} garment{takeback > 1 ? "s" : ""} ({takebackPercent}%)</span>
                <span data-testid="checkout-discount">−{inr(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#121212]/60">Shipping</span>
              <span>{shipping === 0 ? "FREE" : inr(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#121212]/60">GST (5%)</span>
              <span>{inr(gst)}</span>
            </div>
            <div className="flex justify-between border-t border-[#121212]/10 pt-3 font-display text-lg font-bold">
              <span>Total</span>
              <span data-testid="checkout-total">{inr(total)}</span>
            </div>
          </div>
          <button
            data-testid="place-order-btn"
            onClick={placeOrder}
            disabled={placing}
            className="mt-6 w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B] disabled:opacity-60"
          >
            {placing ? "PLACING ORDER…" : "PLACE ORDER — TEST PAYMENT"}
          </button>
          <p className="mt-3 text-center font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/40">
            NO REAL CHARGE. DEVELOPMENT MODE.
          </p>
          <Link to="/cart" className="mt-3 block text-center font-mono2 text-[10px] tracking-[0.2em] text-[#121212]/50 underline underline-offset-4">
            BACK TO BAG
          </Link>
        </div>
      </div>
    </ShopShell>
  );
}
