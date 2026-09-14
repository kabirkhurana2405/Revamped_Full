import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../lib/api";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") {
        setError("This account is not an admin.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(apiError(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#F5F3EF] outline-none placeholder:text-[#F5F3EF]/30 focus:border-[#5E8B6F]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-5">
      <div data-testid="admin-login" className="w-full max-w-sm">
        <div className="flex justify-center">
          <span className="rounded-full bg-[#F5F3EF] p-2">
            <LogoMark size={36} />
          </span>
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-extrabold tracking-[0.1em] text-[#F5F3EF]">
          REVAMPED ADMIN
        </h1>
        <p className="mt-1 text-center font-mono2 text-[9px] tracking-[0.35em] text-[#5E8B6F]">STYLE. CYCLE. IMPACT.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            data-testid="admin-email"
            type="email"
            placeholder="ADMIN EMAIL"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputCls}
            required
          />
          <input
            data-testid="admin-password"
            type="password"
            placeholder="PASSWORD"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={inputCls}
            required
          />
          {error && (
            <p data-testid="admin-login-error" className="rounded-xl bg-red-900/40 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
          <button
            data-testid="admin-login-btn"
            disabled={busy}
            className="w-full rounded-full bg-[#F5F3EF] py-4 font-mono2 text-[11px] tracking-[0.3em] text-[#121212] transition-colors hover:bg-[#5E8B6F] disabled:opacity-60"
          >
            {busy ? "SIGNING IN…" : "ENTER ADMIN"}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center font-mono2 text-[9px] tracking-[0.25em] text-[#F5F3EF]/40 hover:text-[#F5F3EF]">
          ← BACK TO STORE
        </Link>
      </div>
    </div>
  );
}
