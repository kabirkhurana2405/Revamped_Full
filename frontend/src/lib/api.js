import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

export const fileUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return `${process.env.REACT_APP_BACKEND_URL}${p}`;
};

export function apiError(e, fallback = "Something went wrong. Try again.") {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || fallback;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(" ");
  return d?.msg || String(d);
}

export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
