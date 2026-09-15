"""One-off: generate on-model editorial product photography for DROP 001 via Gemini Nano Banana,
save to uploads, and point each product's images at the new photos."""
import asyncio
import base64
import io
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image

load_dotenv("/app/backend/.env")
sys.path.insert(0, "/app/backend")

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent  # noqa: E402
import pymongo  # noqa: E402

UPLOAD = Path("/app/backend/uploads")
LOGO = Path("/app/frontend/public/logo.png")
API_KEY = os.environ["EMERGENT_LLM_KEY"]
MODEL = "gemini-3.1-flash-image-preview"

PRODUCTS = [
    {
        "id": "6aa85ef4a80753107ce01e64",
        "key": "tee01",
        "color": "light cream bone",
        "color_note": "warm off-white bone",
    },
    {
        "id": "6aa85ef4a80753107ce01e65",
        "key": "tee02",
        "color": "deep forest green",
        "color_note": "dark forest green",
    },
    {
        "id": "6aa85ef5a80753107ce01e66",
        "key": "tee03",
        "color": "dark charcoal",
        "color_note": "near-black charcoal",
    },
]

EDITORIAL = (
    "Editorial streetwear lookbook photograph shot on 35mm film: a young Indian model with a confident, "
    "relaxed posture wearing a heavyweight oversized {color} t-shirt — 240 GSM cotton, drop shoulders, boxy "
    "drape — with a small circular embroidered logo on the left chest (use the attached reference logo exactly: "
    "three circulating arrows with red accents around a hanger monogram). Urban raw-concrete backdrop, soft "
    "golden-hour side light, muted film grain tones, fashion-magazine composition, torso-up front framing. "
    "Photorealistic, no text, no watermark, no other graphics on the garment."
)

DETAIL = (
    "Macro close-up product photograph of the left chest area of a heavyweight {color} cotton t-shirt worn by "
    "a model: a small circular embroidered logo stitched in thread (use the attached reference logo exactly: "
    "three circulating arrows with red accents around a hanger monogram), visible 240 GSM fabric grain and "
    "stitch texture, shallow depth of field, soft natural daylight, premium streetwear product photography. "
    "Photorealistic, no text, no watermark."
)


async def generate(prompt: str, out_path: Path) -> bool:
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"photogen-{uuid.uuid4().hex[:10]}",
        system_message="You are an expert fashion product photographer. Return only the generated image.",
    )
    chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
    logo_b64 = base64.b64encode(LOGO.read_bytes()).decode("utf-8")
    msg = UserMessage(text=prompt, file_contents=[ImageContent(logo_b64)])
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"  !! no image returned for {out_path.name} (text: {str(text)[:120]})")
        return False
    data = base64.b64decode(images[0]["data"])
    im = Image.open(io.BytesIO(data)).convert("RGB")
    if max(im.size) > 1600:
        im.thumbnail((1600, 1600), Image.LANCZOS)
    im.save(out_path, "JPEG", quality=88)
    print(f"  saved {out_path.name} {im.size}")
    return True


async def main():
    client = pymongo.MongoClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    for p in PRODUCTS:
        paths = []
        for kind, tmpl in (("editorial", EDITORIAL), ("detail", DETAIL)):
            out = UPLOAD / f"prod_{p['id']}_{kind}.jpg"
            ok = False
            for attempt in range(2):
                try:
                    ok = await generate(tmpl.format(color=p["color"]), out)
                except Exception as e:
                    print(f"  !! attempt {attempt + 1} failed for {out.name}: {type(e).__name__}: {str(e)[:160]}")
                if ok:
                    break
                await asyncio.sleep(5)
            if ok:
                paths.append(f"/api/files/{out.name}")
        if paths:
            db.products.update_one({"_id": __import__("bson").ObjectId(p["id"])}, {"$set": {"images": paths}})
            print(f"  DB updated for {p['key']}: {paths}")
        else:
            print(f"  !! all generations failed for {p['key']} — DB untouched")
    print("DONE")


if __name__ == "__main__":
    asyncio.run(main())
