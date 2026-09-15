import hashlib
import json
import os
import re
import uuid
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.environ.get("AI_PROVIDER", "mock")
UPLOAD_DIR = Path("/app/backend/uploads")
GEMINI_MODEL = "gemini-3-flash-preview"
CONFIDENCE_FLOOR = 0.5

SYSTEM_MESSAGE = (
    "You are the garment condition assessment engine for REVAMPED, a circular fashion "
    "take-back programme in India. You inspect photos of pre-owned garments and return "
    "strict JSON condition reports. You only report what is actually visible in the "
    "photos, and you lower your confidence when photos are blurry, dark or ambiguous."
)

ASSESS_PROMPT = """Assess this pre-owned garment for a fashion take-back programme.
Customer-declared garment type: {garment_type}
Customer-declared brand (any brand is accepted, may be blank): {brand}

Judge from the photos: overall condition, visible wear, stains, tears or damage,
structural integrity (seams, elastic, zips, collars) and reuse potential.

Routing rules:
- REWEAR: good condition, can be resold as-is after cleaning
- REVAMP: usable but needs repair, redesign or upcycling
- RECYCLE: end-of-life, only fibre recovery

Respond with ONLY a JSON object (no markdown, no prose):
{{
  "conditionScore": <integer 0-100>,
  "wear": "low|moderate|high",
  "stains": "none_detected|minor|significant",
  "damage": "none|minor|significant",
  "structural": "intact|compromised",
  "reusePotential": "high|medium|low",
  "recommendedPath": "REWEAR|REVAMP|RECYCLE",
  "confidence": <number 0-1, how sure you are given the photo quality>,
  "notes": "<one short sentence on what you observed>"
}}"""


def _mock(images: list, brand: str, garment_type: str) -> dict:
    h = int(hashlib.sha256(f"{brand}|{garment_type}|{len(images)}".encode()).hexdigest(), 16)
    score = 55 + h % 42
    wear = "low" if score >= 75 else "moderate"
    stains = "none_detected" if h % 3 else "minor"
    damage = "none" if score >= 80 else ("minor" if score >= 62 else "significant")
    path = "REWEAR" if score >= 78 else ("REVAMP" if score >= 62 else "RECYCLE")
    return {
        "provider": "mock",
        "demo": True,
        "label": "AI DEMO / SAMPLE ASSESSMENT",
        "conditionScore": score,
        "wear": wear,
        "stains": stains,
        "damage": damage,
        "structural": "intact" if score >= 60 else "compromised",
        "reusePotential": "high" if score >= 78 else ("medium" if score >= 62 else "low"),
        "recommendedPath": path,
        "confidence": 0.9,
        "needs_review": False,
        "notes": "",
    }


def _review_fallback(reason: str, provider: str) -> dict:
    return {
        "provider": provider,
        "demo": False,
        "label": "NEEDS HUMAN REVIEW",
        "conditionScore": None,
        "wear": None,
        "stains": None,
        "damage": None,
        "structural": None,
        "reusePotential": None,
        "recommendedPath": None,
        "confidence": 0,
        "needs_review": True,
        "notes": reason,
    }


def _parse_report(raw: str) -> dict:
    text = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            raise ValueError("No JSON object in model response")
        return json.loads(m.group(0))


def _normalise(data: dict) -> dict:
    def enum(key, allowed, default):
        v = str(data.get(key, "")).strip().lower()
        return v if v in allowed else default

    try:
        score = max(0, min(100, int(round(float(data.get("conditionScore"))))))
    except Exception:
        score = None
    try:
        confidence = max(0.0, min(1.0, float(data.get("confidence", 0.5))))
    except Exception:
        confidence = 0.5
    path = str(data.get("recommendedPath", "")).strip().upper()
    if path not in ("REWEAR", "REVAMP", "RECYCLE"):
        path = None
    return {
        "conditionScore": score,
        "wear": enum("wear", ("low", "moderate", "high"), "moderate"),
        "stains": enum("stains", ("none_detected", "minor", "significant"), "none_detected"),
        "damage": enum("damage", ("none", "minor", "significant"), "none"),
        "structural": enum("structural", ("intact", "compromised"), "intact"),
        "reusePotential": enum("reusePotential", ("high", "medium", "low"), "medium"),
        "recommendedPath": path,
        "confidence": confidence,
        "notes": str(data.get("notes", ""))[:240],
    }


async def _gemini(images: list, brand: str, garment_type: str) -> dict:
    from emergentintegrations.llm.chat import (
        LlmChat,
        UserMessage,
        FileContentWithMimeType,
        TextDelta,
        StreamDone,
    )

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return _review_fallback("AI key not configured", "gemini")

    files = []
    for url in images[:6]:
        path = UPLOAD_DIR / str(url).split("/")[-1]
        if not path.exists():
            continue
        mime = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }.get(path.suffix.lower())
        if mime:
            files.append(FileContentWithMimeType(file_path=str(path), mime_type=mime))
    if not files:
        return _review_fallback("No usable photos found for AI analysis", "gemini")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"assess-{uuid.uuid4().hex[:12]}",
        system_message=SYSTEM_MESSAGE,
    ).with_model("gemini", GEMINI_MODEL)

    prompt = ASSESS_PROMPT.format(garment_type=garment_type or "unknown", brand=brand or "not specified")
    parts = []
    async for ev in chat.stream_message(UserMessage(text=prompt, file_contents=files)):
        if isinstance(ev, TextDelta):
            parts.append(ev.content)
        elif isinstance(ev, StreamDone):
            break

    report = _normalise(_parse_report("".join(parts)))
    needs_review = (
        report["recommendedPath"] is None
        or report["conditionScore"] is None
        or report["confidence"] < CONFIDENCE_FLOOR
    )
    return {
        "provider": "gemini",
        "model": GEMINI_MODEL,
        "demo": False,
        "label": "AI ASSESSMENT — GEMINI VISION",
        "needs_review": needs_review,
        **report,
    }


async def assess_garment(images: list, brand: str, garment_type: str) -> dict:
    if PROVIDER == "gemini":
        try:
            return await _gemini(images, brand, garment_type)
        except Exception as e:
            return _review_fallback(f"AI service unavailable ({type(e).__name__})", "gemini")
    return _mock(images, brand, garment_type)
