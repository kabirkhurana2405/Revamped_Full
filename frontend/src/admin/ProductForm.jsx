import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import { api, fileUrl, apiError } from "../lib/api";

const SIZES = ["S", "M", "L", "XL", "XXL"];

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">{label}</span>
    <input
      {...props}
      className="mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1E3A2B]"
    />
  </label>
);

const Section = ({ title, children }) => (
  <div className="rounded-2xl border border-[#121212]/10 bg-white p-6">
    <p className="font-mono2 text-[9px] tracking-[0.3em] text-[#1E3A2B]">{title}</p>
    <div className="mt-4">{children}</div>
  </div>
);

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    compare_at: "",
    category: "T-Shirts",
    gender: ["Unisex"],
    collection: "DROP 001",
    material: "100% Cotton",
    gsm: 240,
    fit: "Oversized / Drop Shoulder",
    embroidery: true,
    care: "",
    status: "draft",
    featured: false,
    low_stock_threshold: 3,
    colors: [{ name: "Bone", hex: "#E9E4D9" }],
    variants: SIZES.map((s) => ({ size: s, stock: 0 })),
  });
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.get(`/admin/products/${id}`).then((r) => {
        const p = r.data;
        setForm({
          name: p.name,
          sku: p.sku,
          description: p.description || "",
          price: p.price,
          compare_at: p.compare_at || "",
          category: p.category || "T-Shirts",
          gender: p.gender || ["Unisex"],
          collection: p.collection || "",
          material: p.material || "",
          gsm: p.gsm || "",
          fit: p.fit || "",
          embroidery: !!p.embroidery,
          care: p.care || "",
          status: p.status || "draft",
          featured: !!p.featured,
          low_stock_threshold: p.low_stock_threshold ?? 3,
          colors: p.colors?.length ? p.colors : [{ name: "Bone", hex: "#E9E4D9" }],
          variants: p.variants?.length ? p.variants.map((v) => ({ size: v.size, stock: v.stock })) : SIZES.map((s) => ({ size: s, stock: 0 })),
        });
        setImages(p.images || []);
      });
    }
  }, [id, isNew]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.value ?? e }));

  const toggleGender = (g) =>
    setForm((f) => ({
      ...f,
      gender: f.gender.includes(g) ? f.gender.filter((x) => x !== g) : [...f.gender, g],
    }));

  const save = async () => {
    if (!form.name || !form.sku || !form.price) return toast.error("Name, SKU and price are required");
    setBusy(true);
    const payload = {
      ...form,
      price: Number(form.price),
      compare_at: form.compare_at ? Number(form.compare_at) : null,
      gsm: form.gsm ? Number(form.gsm) : null,
      variants: form.variants.map((v) => ({ size: v.size, stock: Number(v.stock) || 0 })),
    };
    try {
      if (isNew) {
        const { data } = await api.post("/admin/products", payload);
        toast.success("Product created — now add images");
        navigate(`/admin/products/${data.id}`);
      } else {
        await api.patch(`/admin/products/${id}`, payload);
        toast.success("Product saved");
      }
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const upload = async (files) => {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const { data } = await api.post(`/admin/products/${id}/images`, fd);
      setImages((im) => [...im, ...data.images]);
      toast.success("Images uploaded");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const removeImage = async (path) => {
    await api.delete(`/admin/products/${id}/images`, { params: { path } }).catch(() => {});
    setImages((im) => im.filter((x) => x !== path));
  };

  return (
    <div data-testid="product-form" className="max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {isNew ? "ADD PRODUCT" : "EDIT PRODUCT"}
      </h1>

      <div className="mt-6 space-y-4">
        <Section title="BASIC">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PRODUCT NAME *" data-testid="pf-name" value={form.name} onChange={set("name")} />
            <Field label="SKU *" data-testid="pf-sku" value={form.sku} onChange={set("sku")} />
          </div>
          <label className="mt-4 block">
            <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">DESCRIPTION</span>
            <textarea
              data-testid="pf-description"
              value={form.description}
              onChange={set("description")}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1E3A2B]"
            />
          </label>
        </Section>

        <Section title="PRICING">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PRICE (₹) *" data-testid="pf-price" type="number" value={form.price} onChange={set("price")} />
            <Field label="COMPARE-AT PRICE (₹)" type="number" value={form.compare_at} onChange={set("compare_at")} />
          </div>
          <p className="mt-3 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/45">GST 5% APPLIED AT CHECKOUT.</p>
        </Section>

        <Section title="CLASSIFICATION">
          <div className="flex flex-wrap gap-2">
            {["Men", "Women", "Unisex"].map((g) => (
              <button
                key={g}
                data-testid={`pf-gender-${g.toLowerCase()}`}
                onClick={() => toggleGender(g)}
                className={`rounded-full border px-4 py-2 font-mono2 text-[10px] tracking-[0.2em] ${
                  form.gender.includes(g) ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]" : "border-[#121212]/20"
                }`}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="COLLECTION" value={form.collection} onChange={set("collection")} />
            <Field label="CATEGORY" value={form.category} onChange={set("category")} />
          </div>
        </Section>

        <Section title="PRODUCT DETAILS">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="MATERIAL" value={form.material} onChange={set("material")} />
            <Field label="GSM" type="number" value={form.gsm} onChange={set("gsm")} />
            <Field label="FIT" value={form.fit} onChange={set("fit")} />
            <Field label="COLOUR NAME" value={form.colors[0]?.name || ""} onChange={(e) => setForm((f) => ({ ...f, colors: [{ ...f.colors[0], name: e.target.value }] }))} />
            <label className="block">
              <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">COLOUR</span>
              <input
                type="color"
                data-testid="pf-color"
                value={form.colors[0]?.hex || "#E9E4D9"}
                onChange={(e) => setForm((f) => ({ ...f, colors: [{ ...f.colors[0], hex: e.target.value }] }))}
                className="mt-1.5 h-10 w-20 cursor-pointer rounded-lg border border-[#121212]/15"
              />
            </label>
            <label className="flex items-center gap-3 pt-6">
              <input type="checkbox" checked={form.embroidery} onChange={(e) => setForm((f) => ({ ...f, embroidery: e.target.checked }))} />
              <span className="font-mono2 text-[10px] tracking-[0.2em]">EMBROIDERED</span>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">CARE INSTRUCTIONS</span>
            <input value={form.care} onChange={set("care")} className="mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1E3A2B]" />
          </label>
        </Section>

        <Section title="INVENTORY — STOCK PER SIZE">
          <div className="grid grid-cols-5 gap-3">
            {form.variants.map((v, i) => (
              <label key={v.size} className="block text-center">
                <span className="font-mono2 text-[9px] tracking-[0.2em] text-[#121212]/50">{v.size}</span>
                <input
                  data-testid={`pf-stock-${v.size}`}
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) =>
                    setForm((f) => {
                      const variants = [...f.variants];
                      variants[i] = { ...variants[i], stock: e.target.value };
                      return { ...f, variants };
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#121212]/15 bg-white px-2 py-2.5 text-center font-mono2 text-sm outline-none focus:border-[#1E3A2B]"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 max-w-[200px]">
            <Field label="LOW-STOCK THRESHOLD" type="number" value={form.low_stock_threshold} onChange={set("low_stock_threshold")} />
          </div>
        </Section>

        {!isNew && (
          <Section title="MEDIA">
            <div className="flex flex-wrap gap-3">
              {images.map((im) => (
                <div key={im} className="relative">
                  <img src={fileUrl(im)} alt="" className="h-24 w-20 rounded-xl border border-[#121212]/10 object-cover" />
                  <button
                    aria-label="Remove image"
                    onClick={() => removeImage(im)}
                    className="absolute -right-2 -top-2 rounded-full bg-[#121212] p-1 text-[#F5F3EF]"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              <button
                data-testid="pf-upload-btn"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-20 items-center justify-center rounded-xl border border-dashed border-[#121212]/25 font-mono2 text-[9px] tracking-[0.15em] text-[#121212]/50 hover:border-[#1E3A2B]"
              >
                + UPLOAD
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            </div>
          </Section>
        )}

        <Section title="STATUS">
          <div className="flex flex-wrap gap-2">
            {["draft", "active", "archived"].map((s) => (
              <button
                key={s}
                data-testid={`pf-status-${s}`}
                onClick={() => setForm((f) => ({ ...f, status: s }))}
                className={`rounded-full border px-4 py-2 font-mono2 text-[10px] tracking-[0.2em] ${
                  form.status === s ? "border-[#1E3A2B] bg-[#1E3A2B] text-[#F5F3EF]" : "border-[#121212]/20"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
            <label className="flex items-center gap-2 pl-4">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              <span className="font-mono2 text-[10px] tracking-[0.2em]">FEATURED</span>
            </label>
          </div>
        </Section>

        <button
          data-testid="pf-save"
          onClick={save}
          disabled={busy}
          className="w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.3em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B] disabled:opacity-60"
        >
          {busy ? "SAVING…" : "SAVE PRODUCT"}
        </button>
      </div>
    </div>
  );
}
