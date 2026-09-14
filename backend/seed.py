import os
from pathlib import Path
from datetime import datetime, timezone

from db import db
from security import hash_password, verify_password

UPLOAD_DIR = Path("/app/backend/uploads")
PUBLIC_DIR = Path("/app/frontend/public")


def _gen_packshot(colorway: str, logo_file: str, out_name: str):
    from PIL import Image, ImageDraw

    S = 4
    W, H = 800, 840
    img = Image.new("RGB", (W, H), (245, 243, 239))
    d = ImageDraw.Draw(img)
    outline = [
        (67, 14), (34, 26), (8, 54), (27, 69), (47, 57), (47, 174),
        (100, 184), (153, 174), (153, 57), (173, 69), (192, 54),
        (166, 26), (133, 14), (116, 20), (100, 26), (84, 20),
    ]
    d.polygon([(x * S, y * S) for x, y in outline], fill=colorway)
    fold = tuple(max(0, c - 18) for c in Image.new("RGB", (1, 1), colorway).getpixel((0, 0)))
    for fx in (70, 96, 126):
        d.line([(fx * S, 80 * S), ((fx - 2) * S, 162 * S)], fill=fold, width=6)
    logo = Image.open(PUBLIC_DIR / logo_file).convert("RGBA")
    logo.thumbnail((128, 132))
    img.paste(logo, (104 * S, 50 * S), logo)
    img.save(UPLOAD_DIR / out_name)
    return f"/api/files/{out_name}"


PRODUCTS = [
    {
        "name": "DROP 001 — TEE 01 MINIMAL",
        "sku": "RV001-BONE",
        "price": 999,
        "compare_at": 1299,
        "colors": [{"name": "Bone", "hex": "#E9E4D9"}],
        "img": ("tee-01.png", "#E9E4D9", "logo.png"),
        "stocks": {"S": 3, "M": 5, "L": 5, "XL": 4, "XXL": 1},
        "featured": True,
    },
    {
        "name": "DROP 001 — TEE 02 STATEMENT",
        "sku": "RV001-FRST",
        "price": 999,
        "compare_at": 1299,
        "colors": [{"name": "Forest", "hex": "#22402F"}],
        "img": ("tee-02.png", "#22402F", "logo-bone.png"),
        "stocks": {"S": 3, "M": 4, "L": 5, "XL": 3, "XXL": 2},
        "featured": True,
    },
    {
        "name": "DROP 001 — TEE 03 CIRCULAR",
        "sku": "RV001-CHRC",
        "price": 999,
        "compare_at": 1299,
        "colors": [{"name": "Charcoal", "hex": "#2C2C29"}],
        "img": ("tee-03.png", "#2C2C29", "logo-bone.png"),
        "stocks": {"S": 3, "M": 4, "L": 4, "XL": 3, "XXL": 1},
        "featured": False,
    },
]


async def run_seed():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.products.create_index("slug", unique=True)
    await db.orders.create_index("order_number", unique=True)
    await db.impact_events.create_index("takeback_id")

    now = datetime.now(timezone.utc).isoformat()

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@revamped.in").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Revamped@Admin2026")
    admin = await db.users.find_one({"email": admin_email})
    if not admin:
        await db.users.insert_one(
            {
                "name": "Revamped Admin",
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "role": "admin",
                "phone": "",
                "addresses": [],
                "created_at": now,
            }
        )
    elif not verify_password(admin_password, admin.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    demo_email = "demo@revamped.in"
    if not await db.users.find_one({"email": demo_email}):
        await db.users.insert_one(
            {
                "name": "Demo Customer",
                "email": demo_email,
                "password_hash": hash_password("Revamped@Demo2026"),
                "role": "customer",
                "phone": "+91 98765 43210",
                "addresses": [],
                "created_at": now,
            }
        )

    if not await db.settings.find_one({"_id": "rewards"}):
        await db.settings.insert_one(
            {
                "_id": "rewards",
                "levels": [
                    {"min": 0, "name": "NEWCOMER"},
                    {"min": 4, "name": "CONTRIBUTOR"},
                    {"min": 8, "name": "CYCLE REGULAR"},
                    {"min": 16, "name": "LOOP LEGEND"},
                ],
            }
        )

    if await db.products.count_documents({}) == 0:
        import re

        for p in PRODUCTS:
            img_file, colorway, logo = p["img"]
            image_path = _gen_packshot(colorway, logo, img_file)
            slug = re.sub(r"[^a-z0-9]+", "-", p["name"].lower()).strip("-")
            await db.products.insert_one(
                {
                    "name": p["name"],
                    "slug": slug,
                    "sku": p["sku"],
                    "description": "Heavyweight oversized tee from Drop 001. 240 GSM, 100% cotton, drop shoulder, embroidered Revamped branding. Built to be worn hard — and brought back.",
                    "price": p["price"],
                    "compare_at": p["compare_at"],
                    "category": "T-Shirts",
                    "gender": ["Unisex"],
                    "collection": "DROP 001",
                    "images": [image_path],
                    "colors": p["colors"],
                    "material": "100% Cotton",
                    "gsm": 240,
                    "fit": "Oversized / Drop Shoulder",
                    "embroidery": True,
                    "care": "Machine wash cold, inside out. Hang dry. Do not bleach.",
                    "status": "active",
                    "featured": p["featured"],
                    "low_stock_threshold": 3,
                    "variants": [{"size": s, "stock": n, "reserved": 0} for s, n in p["stocks"].items()],
                    "created_at": now,
                    "updated_at": now,
                }
            )

    demo = await db.users.find_one({"email": demo_email})
    if demo and await db.takebacks.count_documents({"user_id": str(demo["_id"])}) == 0:
        tid = (
            await db.takebacks.insert_one(
                {
                    "user_id": str(demo["_id"]),
                    "customer_name": "Demo Customer",
                    "customer_email": demo_email,
                    "brand": "Other brand",
                    "garment_type": "Hoodie",
                    "notes": "Seeded sample submission",
                    "images": [],
                    "ai": {
                        "provider": "mock",
                        "demo": True,
                        "label": "AI DEMO / SAMPLE ASSESSMENT",
                        "conditionScore": 84,
                        "wear": "low",
                        "stains": "none_detected",
                        "damage": "none",
                        "structural": "intact",
                        "reusePotential": "high",
                        "recommendedPath": "REWEAR",
                    },
                    "human_review_status": "REVIEWED",
                    "final_path": "REWEAR",
                    "discount_eligible": True,
                    "status": "REWEAR",
                    "created_at": now,
                    "updated_at": now,
                }
            )
        ).inserted_id
        for stage, note in [
            ("CONTRIBUTED", "Garment submitted for take-back"),
            ("AI CONDITION CHECK", "AI-assisted condition assessment"),
            ("ASSESSED", "AI DEMO / SAMPLE ASSESSMENT"),
            ("SORTED", "Reviewed by Revamped team"),
            ("REWEAR PATH", "Final decision: REWEAR"),
        ]:
            await db.impact_events.insert_one(
                {
                    "takeback_id": str(tid),
                    "user_id": str(demo["_id"]),
                    "stage": stage,
                    "note": note,
                    "ts": now,
                }
            )
