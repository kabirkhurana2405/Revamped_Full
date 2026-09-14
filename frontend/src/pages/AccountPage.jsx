import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import ShopShell from "../components/ShopShell";
import { api, inr, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLOR = {
  PLACED: "bg-[#121212] text-[#F5F3EF]",
  CONFIRMED: "bg-[#1E3A2B] text-[#F5F3EF]",
  PACKED: "bg-[#1E3A2B] text-[#F5F3EF]",
  SHIPPED: "bg-[#5E8B6F] text-[#121212]",
  "OUT FOR DELIVERY": "bg-[#5E8B6F] text-[#121212]",
  DELIVERED: "bg-[#E9E4D9] text-[#121212]",
};

export default function AccountPage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [address, setAddress] = useState({ line1: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    if (user === false) navigate("/login?next=/account");
    if (user) {
      setProfile({ name: user.name || "", phone: user.phone || "" });
      api.get("/orders/my").then((r) => setOrders(r.data.orders)).catch(() => {});
    }
  }, [user, navigate]);

  if (!user) return null;

  const saveProfile = async () => {
    try {
      await api.patch("/auth/me", profile);
      setUser({ ...user, ...profile });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const addAddress = async () => {
    if (!address.line1 || !address.city || !address.pincode) return toast.error("Fill address, city and pincode");
    const addresses = [...(user.addresses || []), address];
    try {
      await api.patch("/auth/me", { addresses });
      setUser({ ...user, addresses });
      setAddress({ line1: "", city: "", state: "", pincode: "" });
      toast.success("Address saved");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const cards = [
    ["ORDERS", `${orders.length} orders`, "/account"],
    ["IMPACT", "Your contribution history", "/impact"],
    ["TAKE-BACK", "Submitted garments", "/take-back"],
    ["REWARDS", "Your cycle level", "/rewards"],
  ];

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#1E3A2B]";

  return (
    <ShopShell>
      <div data-testid="account-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              HELLO, {user.name?.split(" ")[0]?.toUpperCase()}.
            </h1>
            <p className="mt-2 font-mono2 text-[10px] tracking-[0.25em] text-[#121212]/50">{user.email}</p>
          </div>
          <button
            data-testid="logout-btn"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="rounded-full border border-[#121212]/20 px-6 py-2.5 font-mono2 text-[10px] tracking-[0.25em] text-[#121212]/70 hover:bg-[#121212] hover:text-[#F5F3EF]"
          >
            SIGN OUT
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(([title, sub, to]) => (
            <Link
              key={title}
              to={to}
              data-testid={`account-card-${title.toLowerCase()}`}
              className="rounded-2xl border border-[#121212]/10 bg-white/60 p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="font-display text-base font-bold tracking-wide">{title}</p>
              <p className="mt-1.5 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50">{sub.toUpperCase()}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">MY ORDERS</p>
            <div className="mt-4 space-y-3">
              {orders.length === 0 && (
                <p className="rounded-2xl border border-dashed border-[#121212]/20 p-6 text-sm text-[#121212]/50">
                  No orders yet. <Link to="/men" className="underline">Shop Drop 001</Link>.
                </p>
              )}
              {orders.map((o) => (
                <div key={o.id} data-testid={`order-row-${o.order_number}`} className="rounded-2xl border border-[#121212]/10 bg-white/60 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm font-bold">{o.order_number}</p>
                    <span className={`rounded-full px-3 py-1 font-mono2 text-[8px] tracking-[0.2em] ${STATUS_COLOR[o.status] || "bg-[#121212] text-[#F5F3EF]"}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50">
                    {(o.created_at || "").slice(0, 10)} · {o.items.reduce((a, i) => a + i.qty, 0)} ITEMS · {inr(o.total)}
                  </p>
                  <p className="mt-1 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50">
                    {o.items.map((i) => `${i.name} (${i.size})`).join(", ")}
                  </p>
                  {o.tracking && (
                    <p className="mt-1 font-mono2 text-[9px] tracking-[0.15em] text-[#1E3A2B]">TRACKING: {o.tracking}</p>
                  )}
                  {o.takeback_discount_amount > 0 && (
                    <p className="mt-1 font-mono2 text-[9px] tracking-[0.15em] text-[#1E3A2B]">
                      CIRCULAR DISCOUNT APPLIED: −{inr(o.takeback_discount_amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <div>
              <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">PROFILE</p>
              <div className="mt-4 space-y-3">
                <input data-testid="profile-name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Name" />
                <input data-testid="profile-phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="Phone" />
                <button data-testid="profile-save-btn" onClick={saveProfile} className="rounded-full bg-[#121212] px-7 py-3 font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF] hover:bg-[#1E3A2B]">
                  SAVE PROFILE
                </button>
              </div>
            </div>
            <div>
              <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#1E3A2B]">ADDRESSES</p>
              <div className="mt-4 space-y-3">
                {(user.addresses || []).map((a, i) => (
                  <p key={i} className="rounded-xl border border-[#121212]/10 bg-white/60 p-4 text-sm text-[#121212]/70">
                    {a.line1}, {a.city}, {a.state} — {a.pincode}
                  </p>
                ))}
                <input data-testid="address-line1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className={inputCls} placeholder="Address" />
                <div className="grid grid-cols-3 gap-3">
                  <input data-testid="address-city" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className={inputCls} placeholder="City" />
                  <input value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} className={inputCls} placeholder="State" />
                  <input data-testid="address-pincode" value={address.pincode} onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))} className={inputCls} placeholder="Pincode" />
                </div>
                <button data-testid="address-save-btn" onClick={addAddress} className="rounded-full border border-[#121212] px-7 py-3 font-mono2 text-[10px] tracking-[0.25em] text-[#121212] hover:bg-[#121212] hover:text-[#F5F3EF]">
                  ADD ADDRESS
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ShopShell>
  );
}
