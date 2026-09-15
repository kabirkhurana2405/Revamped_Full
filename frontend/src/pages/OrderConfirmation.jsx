import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import ShopShell from "../components/ShopShell";
import { api, inr } from "../lib/api";
import { LogoMark } from "../components/Logo";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem(`rv_order_${orderNumber}`) || "";
    api
      .get(`/orders/${orderNumber}`, { params: email ? { email } : {} })
      .then((r) => setOrder(r.data))
      .catch(() => {
        if (!location.state?.order) setError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  if (error)
    return (
      <ShopShell>
        <p className="py-24 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/50">ORDER NOT FOUND.</p>
      </ShopShell>
    );
  if (!order)
    return (
      <ShopShell>
        <p className="py-24 text-center font-mono2 text-xs tracking-[0.3em] text-[#121212]/40">LOADING…</p>
      </ShopShell>
    );

  return (
    <ShopShell>
      <div data-testid="order-confirmation" className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <LogoMark size={52} />
        </div>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-5xl">ORDER CONFIRMED.</h1>
        <p className="mt-3 font-mono2 text-xs tracking-[0.3em] text-[#1E3A2B]">{order.order_number}</p>

        {order.guest && (
          <div
            data-testid="guest-claim-banner"
            className="mt-6 rounded-2xl border border-[#1E3A2B]/25 bg-[#1E3A2B]/5 px-6 py-5 text-left"
          >
            <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#1E3A2B]">GUEST CHECKOUT — CLAIM THIS ORDER</p>
            <p className="mt-2 text-sm leading-relaxed text-[#121212]/70">
              Create an account with <b>{order.customer.email}</b> and this order appears in your account
              automatically — along with rewards and impact tracking. No forms to fill, nothing to link manually.
            </p>
            <Link
              to="/login"
              data-testid="claim-account-link"
              className="mt-3 inline-block font-mono2 text-[10px] tracking-[0.22em] text-[#1E3A2B] underline underline-offset-4"
            >
              CREATE ACCOUNT / SIGN IN →
            </Link>
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-[#121212]/10 bg-white/60 p-7 text-left">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#121212]/50">ITEMS</p>
          <div className="mt-3 space-y-2.5">
            {order.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-[#121212]/75">
                  {i.name} <span className="font-mono2 text-[10px]">× {i.qty} ({i.size})</span>
                </span>
                <span>{inr(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-[#121212]/10 pt-4 text-sm">
            <div className="flex justify-between text-[#121212]/60">
              <span>Subtotal</span>
              <span>{inr(order.subtotal)}</span>
            </div>
            {order.takeback_discount_amount > 0 && (
              <div className="flex justify-between text-[#1E3A2B]">
                <span>Take-back discount ({order.takeback_garments} garments — {order.takeback_discount_percent}%)</span>
                <span>−{inr(order.takeback_discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#121212]/60">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : inr(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-[#121212]/60">
              <span>GST</span>
              <span>{inr(order.gst)}</span>
            </div>
            <div className="flex justify-between border-t border-[#121212]/10 pt-3 font-display text-lg font-bold">
              <span>Total</span>
              <span>{inr(order.total)}</span>
            </div>
          </div>
          <div className="mt-5 border-t border-[#121212]/10 pt-4 text-sm text-[#121212]/60">
            <p className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">DELIVERY</p>
            <p className="mt-2">
              {order.customer.name} · {order.customer.phone}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} —{" "}
              {order.address.pincode}
            </p>
            <p className="mt-3 font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">PAYMENT</p>
            <p className="mt-1 font-mono2 text-[10px] tracking-[0.15em] text-[#121212]/70">TEST PAYMENT MODE — NO REAL CHARGE</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#1E3A2B]">YOUR CYCLE STARTS HERE.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={order.guest ? "/login" : "/account"}
              data-testid="track-order-btn"
              className="rounded-full bg-[#121212] px-7 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
            >
              {order.guest ? "CREATE ACCOUNT TO TRACK" : "TRACK ORDER"}
            </Link>
            <Link
              to="/impact"
              data-testid="view-impact-btn"
              className="rounded-full border border-[#121212] px-7 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#121212] transition-colors hover:bg-[#121212] hover:text-[#F5F3EF]"
            >
              VIEW IMPACT
            </Link>
            <Link
              to="/take-back"
              data-testid="bring-back-btn"
              className="rounded-full border border-[#121212] px-7 py-3.5 font-mono2 text-[10px] tracking-[0.25em] text-[#121212] transition-colors hover:bg-[#121212] hover:text-[#F5F3EF]"
            >
              BRING BACK CLOTHES
            </Link>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
