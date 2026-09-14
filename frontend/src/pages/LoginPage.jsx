import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ShopShell from "../components/ShopShell";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(params.get("next") || "/account");
    } catch (err) {
      setError(apiError(err, "Authentication failed"));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white/60 px-4 py-3 text-sm text-[#121212] outline-none transition-colors focus:border-[#1E3A2B]";

  return (
    <ShopShell>
      <div data-testid="login-page" className="mx-auto max-w-md">
        <div className="flex justify-center">
          <LogoMark size={44} />
        </div>
        <div className="mt-8 flex rounded-full border border-[#121212]/15 p-1">
          {[
            ["login", "SIGN IN"],
            ["register", "CREATE ACCOUNT"],
          ].map(([m, label]) => (
            <button
              key={m}
              data-testid={`auth-tab-${m}`}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-2.5 font-mono2 text-[10px] tracking-[0.25em] transition-colors ${
                mode === m ? "bg-[#121212] text-[#F5F3EF]" : "text-[#121212]/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">NAME</span>
              <input
                data-testid="auth-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
                required
              />
            </label>
          )}
          <label className="block">
            <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">EMAIL</span>
            <input
              data-testid="auth-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputCls}
              required
            />
          </label>
          <label className="block">
            <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">PASSWORD {mode === "register" && "(MIN 8 CHARS)"}</span>
            <input
              data-testid="auth-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={inputCls}
              required
            />
          </label>
          {error && (
            <p data-testid="auth-error" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            data-testid="auth-submit-btn"
            disabled={busy}
            className="w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B] disabled:opacity-60"
          >
            {busy ? "HOLD ON…" : mode === "login" ? "SIGN IN" : "JOIN REVAMPED"}
          </button>
        </form>
        <p className="mt-6 text-center font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/40">
          TEAM MEMBER? <Link to="/admin/login" className="underline underline-offset-4">ADMIN LOGIN</Link>
        </p>
      </div>
    </ShopShell>
  );
}
