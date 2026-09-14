import { Link, useLocation } from "react-router-dom";
import { Home, Shirt, Leaf, RotateCcw, User } from "lucide-react";

const TABS = [
  { label: "HOME", to: "/", icon: Home },
  { label: "SHOP", to: "/men", icon: Shirt },
  { label: "IMPACT", to: "/impact", icon: Leaf },
  { label: "TAKE-BACK", to: "/take-back", icon: RotateCcw },
  { label: "ACCOUNT", to: "/account", icon: User },
];

export default function MobileTabBar() {
  const location = useLocation();
  if (location.pathname === "/" || location.pathname.startsWith("/admin")) return null;
  return (
    <nav
      data-testid="mobile-tabbar"
      className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-around border-t border-[#121212]/10 bg-[#F5F3EF]/95 py-2 backdrop-blur-xl md:hidden"
    >
      {TABS.map((t) => {
        const active = location.pathname === t.to;
        return (
          <Link
            key={t.label}
            to={t.to}
            data-testid={`tab-${t.label.toLowerCase()}`}
            className={`flex flex-col items-center gap-1 px-2 py-1 ${active ? "text-[#1E3A2B]" : "text-[#121212]/50"}`}
          >
            <t.icon size={18} strokeWidth={1.8} />
            <span className="font-mono2 text-[7px] tracking-[0.18em]">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
