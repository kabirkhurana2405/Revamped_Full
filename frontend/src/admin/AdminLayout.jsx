import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Users, RotateCcw,
  ScanLine, Leaf, Settings as SettingsIcon, LogOut, Store,
} from "lucide-react";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

const NAV = [
  ["DASHBOARD", "/admin", LayoutDashboard, true],
  ["PRODUCTS", "/admin/products", Package],
  ["INVENTORY", "/admin/inventory", Boxes],
  ["ORDERS", "/admin/orders", ShoppingCart],
  ["CUSTOMERS", "/admin/customers", Users],
  ["TAKE-BACK", "/admin/takebacks", RotateCcw],
  ["AI ASSESSMENTS", "/admin/assessments", ScanLine],
  ["IMPACT", "/admin/impact", Leaf],
  ["SETTINGS", "/admin/settings", SettingsIcon],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!user || user.role !== "admin") navigate("/admin/login");
    else setReady(true);
  }, [user, navigate]);

  if (!ready)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#F5F3EF]/50">CHECKING ACCESS…</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F7F6F2] text-[#121212]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-[#121212] p-5 md:flex">
        <Link to="/admin" className="flex items-center gap-2 text-[#F5F3EF]">
          <span className="rounded-full bg-[#F5F3EF] p-1">
            <LogoMark size={18} />
          </span>
          <span className="font-display text-sm font-extrabold tracking-[0.15em]">ADMIN</span>
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV.map(([label, to, Icon, end]) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              data-testid={`admin-nav-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 font-mono2 text-[10px] tracking-[0.2em] transition-colors ${
                  isActive ? "bg-[#1E3A2B] text-[#F5F3EF]" : "text-[#F5F3EF]/50 hover:bg-white/5 hover:text-[#F5F3EF]"
                }`
              }
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-mono2 text-[10px] tracking-[0.2em] text-[#F5F3EF]/50 hover:text-[#F5F3EF]">
          <Store size={15} /> VIEW STORE
        </Link>
        <button
          data-testid="admin-logout"
          onClick={async () => {
            await logout();
            navigate("/admin/login");
          }}
          className="mt-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-left font-mono2 text-[10px] tracking-[0.2em] text-[#F5F3EF]/50 hover:text-red-300"
        >
          <LogOut size={15} /> SIGN OUT
        </button>
      </aside>

      <div className="flex-1 md:ml-56">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#121212]/10 bg-[#F7F6F2]/90 px-5 py-3 backdrop-blur md:hidden">
          <span className="font-display text-sm font-extrabold tracking-[0.15em]">REVAMPED ADMIN</span>
          <button data-testid="admin-logout-mobile" onClick={async () => { await logout(); navigate("/admin/login"); }} className="font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/60">
            SIGN OUT
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-b border-[#121212]/10 bg-[#F7F6F2] px-3 py-2 md:hidden">
          {NAV.map(([label, to, Icon, end]) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono2 text-[8px] tracking-[0.15em] ${
                  isActive ? "bg-[#1E3A2B] text-[#F5F3EF]" : "text-[#121212]/50"
                }`
              }
            >
              <Icon size={12} /> {label}
            </NavLink>
          ))}
        </nav>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
