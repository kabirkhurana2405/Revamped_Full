import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Menu, X, Search, User, ShoppingBag } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const LINKS = [
  ["MEN", "/men"],
  ["WOMEN", "/women"],
  ["IMPACT", "/impact"],
  ["TAKE-BACK", "/take-back"],
  ["ABOUT", "/"],
];

export default function ShopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const onLanding = location.pathname === "/";
  const transparent = onLanding && !scrolled;

  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 40)), [scrollY]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(`/men?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          transparent ? "bg-transparent" : "border-b border-[#121212]/10 bg-[#F5F3EF]/85 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
          <Link to="/" data-testid="nav-logo" data-cursor="hover" className="text-[#121212]">
            <Logo markSize={22} wordmarkClass="text-sm md:text-lg" />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map(([label, to]) => (
              <Link
                key={label}
                to={to}
                data-testid={`nav-link-${label.toLowerCase()}`}
                data-cursor="hover"
                className={`font-mono2 text-[11px] tracking-[0.28em] transition-colors hover:text-[#1E3A2B] ${
                  location.pathname === to ? "text-[#1E3A2B]" : "text-[#121212]/70"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              data-testid="nav-search-btn"
              data-cursor="hover"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 text-[#121212]/80 transition-colors hover:text-[#1E3A2B]"
            >
              <Search size={18} />
            </button>
            <Link
              to={user ? "/account" : "/login"}
              data-testid="nav-account-btn"
              data-cursor="hover"
              aria-label="Account"
              className="p-2 text-[#121212]/80 transition-colors hover:text-[#1E3A2B]"
            >
              <User size={18} />
            </Link>
            <Link
              to="/cart"
              data-testid="nav-bag-btn"
              data-cursor="hover"
              aria-label="Bag"
              className="relative p-2 text-[#121212]/80 transition-colors hover:text-[#1E3A2B]"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1E3A2B] font-mono2 text-[8px] text-[#F5F3EF]">
                  {count}
                </span>
              )}
            </Link>
            <button
              data-testid="nav-menu-btn"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="p-2 text-[#121212] lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={submitSearch}
              className="border-t border-[#121212]/10 bg-[#F5F3EF] px-5 py-3 md:px-10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <input
                data-testid="nav-search-input"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="SEARCH THE COLLECTION"
                className="w-full bg-transparent font-mono2 text-xs tracking-[0.25em] text-[#121212] outline-none placeholder:text-[#121212]/40"
              />
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            className="fixed inset-0 z-[150] flex flex-col bg-[#121212] px-6 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#F5F3EF]">
                <Logo mono markSize={22} wordmarkClass="text-base" />
              </span>
              <button data-testid="mobile-menu-close" aria-label="Close menu" onClick={() => setOpen(false)} className="text-[#F5F3EF]">
                <X size={26} />
              </button>
            </div>
            <div className="mt-14 flex flex-col gap-3">
              {LINKS.map(([label, to], i) => (
                <motion.button
                  key={label}
                  data-testid={`mobile-link-${label.toLowerCase()}`}
                  onClick={() => {
                    setOpen(false);
                    navigate(to);
                  }}
                  className="text-left font-display text-4xl font-bold text-[#F5F3EF]"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 * i }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
            <button
              data-testid="mobile-download-app-btn"
              onClick={() => {
                setOpen(false);
                navigate(user ? "/account" : "/login");
              }}
              className="mt-auto rounded-full bg-[#F5F3EF] py-4 font-mono2 text-xs tracking-[0.3em] text-[#121212]"
            >
              {user ? "MY ACCOUNT" : "SIGN IN"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
