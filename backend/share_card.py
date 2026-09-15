"""Branded 1080x1080 impact share card renderer (Instagram feed / WhatsApp / X)."""
import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONTS = Path("/app/backend/assets/fonts")
LOGO = Path("/app/frontend/public/logo.png")

BONE = "#F5F3EF"
CHARCOAL = "#121212"
FOREST = "#1E3A2B"
RED = "#E23B3B"
MUTED = "#8E8B83"


def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def _tracked(text: str) -> str:
    return " ".join(text)


def render_impact_card(sub: dict, events: list, contributed: int) -> bytes:
    W = H = 1080
    PAD = 72
    img = Image.new("RGB", (W, H), BONE)
    d = ImageDraw.Draw(img)

    # --- header ---
    logo = Image.open(LOGO).convert("RGBA").resize((112, 112), Image.LANCZOS)
    img.paste(logo, (PAD, 58), logo)
    d.text((PAD + 136, 96), "REVAMPED", font=_font("Syne-ExtraBold.ttf", 52), fill=CHARCOAL, anchor="lm")
    d.line([(PAD, 214), (W - PAD, 214)], fill=CHARCOAL, width=2)

    # --- garment identity ---
    label = f"RV-TB-{str(sub.get('_id', ''))[-6:].upper()}"
    d.text((PAD, 252), _tracked("GARMENT JOURNEY"), font=_font("SpaceMono-Regular.ttf", 24), fill=FOREST)
    d.text((PAD - 6, 292), label, font=_font("Syne-ExtraBold.ttf", 96), fill=CHARCOAL)
    garment = (sub.get("garment_type") or "GARMENT").upper()
    brand = (sub.get("brand") or "ANY BRAND").upper()
    date = (sub.get("created_at") or "")[:10]
    d.text((PAD, 416), f"{garment}  ·  {brand}  ·  {date}", font=_font("SpaceMono-Regular.ttf", 26), fill=MUTED)

    # --- path pill ---
    path = sub.get("final_path") or (sub.get("ai") or {}).get("recommendedPath") or "IN THE LOOP"
    pill_font = _font("SpaceMono-Bold.ttf", 30)
    pill_text = f"{path} PATH" if path in ("REWEAR", "REVAMP", "RECYCLE") else "IN THE LOOP"
    tw = d.textlength(pill_text, font=pill_font)
    d.rounded_rectangle([PAD, 470, PAD + tw + 56, 534], radius=32, fill=FOREST)
    d.text((PAD + 28, 502), pill_text, font=pill_font, fill=BONE, anchor="lm")

    # --- journey timeline (max 4: first 3 + outcome) ---
    stages = events if len(events) <= 4 else events[:3] + events[-1:]
    y = 580
    for i, e in enumerate(stages):
        cx = PAD + 10
        if i < len(stages) - 1:
            d.line([(cx, y + 12), (cx, y + 58)], fill="#C9C4B8", width=3)
        d.ellipse([cx - 9, y, cx + 9, y + 18], fill=FOREST)
        d.text((cx + 28, y - 4), (e.get("stage") or "").upper(), font=_font("SpaceMono-Bold.ttf", 24), fill=CHARCOAL)
        note = (e.get("note") or "")[:58]
        meta = f"{(e.get('ts') or '')[:10]}{'  ·  ' + note if note else ''}"
        d.text((cx + 28, y + 28), meta, font=_font("SpaceMono-Regular.ttf", 19), fill=MUTED)
        y += 62
    if not stages:
        d.text((PAD, y), "JOURNEY STARTS ON PICKUP", font=_font("SpaceMono-Regular.ttf", 22), fill=MUTED)

    # --- bottom band ---
    band_top = H - 172
    d.rectangle([0, band_top, W, H], fill=CHARCOAL)
    d.ellipse([PAD, band_top + 52, PAD + 26, band_top + 78], fill=RED)
    stat = f"{contributed} GARMENT{'S' if contributed != 1 else ''} IN THE LOOP"
    d.text((PAD + 44, band_top + 48), stat, font=_font("SpaceMono-Bold.ttf", 32), fill=BONE)
    d.text(
        (PAD + 44, band_top + 104),
        _tracked("STYLE. CYCLE. IMPACT."),
        font=_font("SpaceMono-Regular.ttf", 20),
        fill="#B9B3A4",
    )
    d.text(
        (W - PAD, band_top + 65),
        _tracked("JOIN THE CYCLE"),
        font=_font("SpaceMono-Bold.ttf", 20),
        fill=BONE,
        anchor="ra",
    )

    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()
