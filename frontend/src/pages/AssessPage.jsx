import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import ShopShell from "../components/ShopShell";
import { api, fileUrl, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const SLOT_LABELS = ["FRONT", "BACK", "CLOSE-UP OF DAMAGE", "LABEL / MATERIAL"];

export default function AssessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ garment_type: "", brand: "", notes: "" });
  const [files, setFiles] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  if (user === false) {
    navigate("/login?next=/take-back/assess");
    return null;
  }

  const addFiles = (list) => {
    const next = [...files, ...Array.from(list)].slice(0, 6);
    setFiles(next);
  };

  const startSubmission = async () => {
    if (!form.garment_type.trim()) return toast.error("Tell us what you're bringing");
    setBusy(true);
    try {
      const { data } = await api.post("/takeback", form);
      setSubmissionId(data.id);
      setStep(2);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const uploadAndContinue = async () => {
    if (!files.length) return toast.error("Add at least one photo");
    setBusy(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      await api.post(`/takeback/${submissionId}/images`, fd);
      setStep(3);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const runAssessment = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/ai/assess-garment", { submission_id: submissionId });
      setResult(data);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-[#121212]/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#1E3A2B]";

  const rows = result
    ? [
        ["CONDITION SCORE", `${result.conditionScore} / 100`],
        ["WEAR", result.wear?.replace("_", " ").toUpperCase()],
        ["STAINS", result.stains?.replace("_", " ").toUpperCase()],
        ["TEARS / DAMAGE", result.damage?.toUpperCase()],
        ["STRUCTURAL CONDITION", result.structural?.toUpperCase()],
        ["REUSE POTENTIAL", result.reusePotential?.toUpperCase()],
      ]
    : [];

  return (
    <ShopShell>
      <div data-testid="assess-page" className="mx-auto max-w-2xl">
        <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#1E3A2B]">STEP {step} / 3</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">AI CONDITION CHECK</h1>

        {step === 1 && (
          <div className="mt-10">
            <p className="font-display text-xl font-bold">WHAT ARE YOU BRINGING?</p>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">GARMENT TYPE *</span>
                <input
                  data-testid="assess-garment-type"
                  value={form.garment_type}
                  onChange={(e) => setForm((f) => ({ ...f, garment_type: e.target.value }))}
                  placeholder="Hoodie, shirt, jeans…"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#121212]/50">BRAND (ANY BRAND WORKS)</span>
                <input
                  data-testid="assess-brand"
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="Any brand, any label"
                  className={inputCls}
                />
              </label>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  data-testid="assess-take-photo"
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#121212]/20 py-5 font-mono2 text-[10px] tracking-[0.25em] text-[#121212] transition-colors hover:border-[#1E3A2B]"
                >
                  <Camera size={15} /> TAKE PHOTO
                </button>
                <button
                  data-testid="assess-upload-photo"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#121212]/20 py-5 font-mono2 text-[10px] tracking-[0.25em] text-[#121212] transition-colors hover:border-[#1E3A2B]"
                >
                  <Upload size={15} /> UPLOAD PHOTO
                </button>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </div>
              {files.length > 0 && (
                <p className="font-mono2 text-[10px] tracking-[0.2em] text-[#1E3A2B]">{files.length} PHOTO{files.length > 1 ? "S" : ""} READY</p>
              )}
              <button
                data-testid="assess-continue-1"
                onClick={startSubmission}
                disabled={busy}
                className="w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B] disabled:opacity-60"
              >
                {busy ? "CREATING…" : "CONTINUE →"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-10">
            <p className="font-display text-xl font-bold">ADD PHOTOS</p>
            <p className="mt-2 text-sm text-[#121212]/60">Up to 6 photos. More angles = better assessment.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {SLOT_LABELS.map((l, i) => (
                <div key={l} className="relative flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-[#121212]/25 bg-white/40 p-3 text-center">
                  {files[i] ? (
                    <>
                      <img src={URL.createObjectURL(files[i])} alt={l} className="absolute inset-0 h-full w-full rounded-2xl object-cover" />
                      <button
                        aria-label="Remove"
                        onClick={() => setFiles((f) => f.filter((_, x) => x !== i))}
                        className="absolute right-2 top-2 rounded-full bg-[#121212] p-1.5 text-[#F5F3EF]"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <span className="font-mono2 text-[8px] tracking-[0.2em] text-[#121212]/45">{l}</span>
                  )}
                </div>
              ))}
            </div>
            <button
              data-testid="assess-add-more"
              onClick={() => fileRef.current?.click()}
              className="mt-4 w-full rounded-2xl border border-[#121212]/20 py-4 font-mono2 text-[10px] tracking-[0.25em] text-[#121212] hover:border-[#1E3A2B]"
            >
              + ADD PHOTOS
            </button>
            <button
              data-testid="assess-continue-2"
              onClick={uploadAndContinue}
              disabled={busy}
              className="mt-3 w-full rounded-full bg-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B] disabled:opacity-60"
            >
              {busy ? "UPLOADING…" : "CONTINUE →"}
            </button>
          </div>
        )}

        {step === 3 && !result && (
          <div className="mt-10 text-center">
            <div className="relative mx-auto h-56 overflow-hidden rounded-3xl bg-[#121212] md:h-64">
              <div className="scan-line absolute left-4 right-4 h-0.5 bg-[#5E8B6F] shadow-[0_0_16px_rgba(94,139,111,0.9)]" />
              <p className="absolute inset-0 flex items-center justify-center font-mono2 text-[10px] tracking-[0.35em] text-[#F5F3EF]/60">
                GARMENT LOADED
              </p>
            </div>
            <button
              data-testid="run-assessment-btn"
              onClick={runAssessment}
              disabled={busy}
              className="mt-6 rounded-full bg-[#121212] px-10 py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B] disabled:opacity-60"
            >
              {busy ? "ASSESSING…" : "RUN AI ASSESSMENT →"}
            </button>
          </div>
        )}

        {result && (
          <div data-testid="assess-result" className="mt-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E23B3B]" />
              <span className="font-mono2 text-[9px] tracking-[0.25em] text-[#F5F3EF]">{result.label}</span>
            </div>
            <div className="mt-5 overflow-hidden rounded-3xl border border-[#121212]/10 bg-white/60">
              {rows.map(([k, v], i) => (
                <div key={k} className={`flex items-center justify-between px-6 py-4 ${i > 0 ? "border-t border-[#121212]/8" : ""}`}>
                  <span className="font-mono2 text-[10px] tracking-[0.22em] text-[#121212]/55">{k}</span>
                  <span className="font-mono2 text-[11px] tracking-[0.15em] text-[#121212]">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-[#1E3A2B] px-6 py-5">
                <span className="font-mono2 text-[10px] tracking-[0.25em] text-[#F5F3EF]/70">RECOMMENDED PATH</span>
                <span data-testid="recommended-path" className="font-display text-xl font-extrabold text-[#F5F3EF]">
                  {result.recommendedPath}
                </span>
              </div>
            </div>
            <p className="mt-4 text-center font-mono2 text-[9px] leading-relaxed tracking-[0.15em] text-[#121212]/45">
              DEMO ASSESSMENT — A REAL AI VISION SERVICE PLUGS INTO /api/ai/assess-garment LATER.
              <br />
              THE REVAMPED TEAM CONFIRMS THE FINAL PATH. AI RECOMMENDATION ≠ FINAL DECISION.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/impact"
                data-testid="assess-view-impact"
                className="flex-1 rounded-full bg-[#121212] py-4 text-center font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
              >
                VIEW MY IMPACT
              </Link>
              <button
                data-testid="assess-another"
                onClick={() => {
                  setStep(1);
                  setFiles([]);
                  setResult(null);
                  setSubmissionId(null);
                  setForm({ garment_type: "", brand: "", notes: "" });
                }}
                className="flex-1 rounded-full border border-[#121212] py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#121212] transition-colors hover:bg-[#121212] hover:text-[#F5F3EF]"
              >
                ADD ANOTHER GARMENT
              </button>
            </div>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
