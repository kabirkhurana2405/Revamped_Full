import re
import uuid
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from pydantic import BaseModel

from db import db, pub, pubs
from security import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALL_SIZES = ["S", "M", "L", "XL", "XXL"]


def now():
    return datetime.now(timezone.utc).isoformat()


# ---------- METRICS ----------

@router.get("/metrics")
async def metrics(request: Request):
    await require_admin(request, db)
    orders = await db.orders.find({}).to_list(5000)
    total_sales = sum(o.get("total", 0) for o in orders)
    products_count = await db.products.count_documents({})
    products = await db.products.find({}).to_list(1000)
    low_stock = 0
    for p in products:
        threshold = p.get("low_stock_threshold", 3)
        low_stock += sum(1 for v in p.get("variants", []) if v.get("stock", 0) - v.get("reserved", 0) <= threshold)
    takebacks = await db.takebacks.count_documents({})

    pathway = {"REWEAR": 0, "REVAMP": 0, "RECYCLE": 0, "PENDING": 0}
    async for s in db.takebacks.find({}):
        path = s.get("final_path") or ((s.get("ai") or {}).get("recommendedPath"))
        pathway[path if path in pathway and s.get("status") != "REJECTED" else "PENDING"] += 1

    sales_by_day = {}
    for o in orders:
        day = (o.get("created_at") or "")[:10]
        if day:
            sales_by_day[day] = sales_by_day.get(day, 0) + o.get("total", 0)
    days = [(datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat() for i in range(13, -1, -1)]
    sales_series = [{"day": d, "total": sales_by_day.get(d, 0)} for d in days]

    recent = await db.orders.find({}).sort("created_at", -1).to_list(6)
    return {
        "total_sales": total_sales,
        "orders": len(orders),
        "products": products_count,
        "low_stock": low_stock,
        "takebacks": takebacks,
        "garments_contributed": takebacks,
        "pathway": pathway,
        "sales_series": sales_series,
        "recent_orders": pubs(recent),
    }


# ---------- PRODUCTS ----------

class VariantIn(BaseModel):
    size: str
    stock: int = 0


class ProductIn(BaseModel):
    name: str
    sku: str
    description: str = ""
    price: float
    compare_at: Optional[float] = None
    category: str = "T-Shirts"
    gender: List[str] = ["Unisex"]
    collection: str = "DROP 001"
    colors: List[dict] = []
    material: str = ""
    gsm: Optional[int] = None
    fit: str = ""
    embroidery: bool = False
    care: str = ""
    status: str = "draft"
    featured: bool = False
    low_stock_threshold: int = 3
    variants: List[VariantIn] = []


def _slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


@router.get("/products")
async def admin_products(request: Request, q: str = "", status: str = ""):
    await require_admin(request, db)
    query = {}
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"sku": {"$regex": q, "$options": "i"}}]
    if status:
        query["status"] = status
    docs = await db.products.find(query).sort("created_at", -1).to_list(500)
    out = []
    for d in docs:
        d = pub(d)
        d["total_stock"] = sum(v.get("stock", 0) - v.get("reserved", 0) for v in d.get("variants", []))
        out.append(d)
    return {"products": out}


@router.post("/products")
async def create_product(payload: ProductIn, request: Request):
    await require_admin(request, db)
    slug = _slugify(payload.name)
    if await db.products.find_one({"slug": slug}):
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"
    variants = [v.model_dump() for v in payload.variants] or [{"size": s, "stock": 0, "reserved": 0} for s in ALL_SIZES]
    for v in variants:
        v.setdefault("reserved", 0)
    doc = payload.model_dump()
    doc.update(
        {
            "slug": slug,
            "images": [],
            "variants": variants,
            "created_at": now(),
            "updated_at": now(),
        }
    )
    res = await db.products.insert_one(doc)
    return {"id": str(res.inserted_id), "slug": slug}


@router.get("/products/{pid}")
async def admin_get_product(pid: str, request: Request):
    await require_admin(request, db)
    doc = await db.products.find_one({"_id": ObjectId(pid)})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return pub(doc)


@router.patch("/products/{pid}")
async def update_product(pid: str, payload: ProductIn, request: Request):
    await require_admin(request, db)
    doc = payload.model_dump()
    doc["updated_at"] = now()
    for v in doc.get("variants", []):
        v.setdefault("reserved", 0)
    await db.products.update_one({"_id": ObjectId(pid)}, {"$set": doc})
    return {"status": "updated"}


@router.post("/products/{pid}/duplicate")
async def duplicate_product(pid: str, request: Request):
    await require_admin(request, db)
    doc = await db.products.find_one({"_id": ObjectId(pid)})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    doc.pop("_id")
    doc["name"] = doc["name"] + " (COPY)"
    doc["sku"] = doc.get("sku", "") + "-COPY"
    doc["slug"] = _slugify(doc["name"]) + "-" + uuid.uuid4().hex[:4]
    doc["status"] = "draft"
    doc["created_at"] = now()
    doc["updated_at"] = now()
    res = await db.products.insert_one(doc)
    return {"id": str(res.inserted_id)}


@router.delete("/products/{pid}")
async def delete_product(pid: str, request: Request):
    await require_admin(request, db)
    await db.products.delete_one({"_id": ObjectId(pid)})
    return {"status": "deleted"}


@router.post("/products/{pid}/images")
async def upload_product_images(pid: str, request: Request, files: list[UploadFile] = File(...)):
    await require_admin(request, db)
    doc = await db.products.find_one({"_id": ObjectId(pid)})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    saved = []
    for f in files[:8]:
        ext = re.sub(r"[^a-zA-Z0-9.]", "", Path(f.filename or "img.jpg").suffix) or ".jpg"
        name = f"prod_{pid}_{uuid.uuid4().hex[:8]}{ext}"
        content = await f.read()
        if len(content) > 8 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large (max 8MB)")
        (UPLOAD_DIR / name).write_bytes(content)
        saved.append(f"/api/files/{name}")
    await db.products.update_one(
        {"_id": ObjectId(pid)},
        {"$push": {"images": {"$each": saved}}, "$set": {"updated_at": now()}},
    )
    return {"images": saved}


@router.delete("/products/{pid}/images")
async def remove_product_image(pid: str, request: Request, path: str):
    await require_admin(request, db)
    await db.products.update_one({"_id": ObjectId(pid)}, {"$pull": {"images": path}, "$set": {"updated_at": now()}})
    return {"status": "removed"}


# ---------- INVENTORY ----------

@router.get("/inventory")
async def inventory(request: Request):
    await require_admin(request, db)
    docs = await db.products.find({}).to_list(500)
    rows = []
    for p in docs:
        for v in p.get("variants", []):
            available = v.get("stock", 0) - v.get("reserved", 0)
            rows.append(
                {
                    "product_id": str(p["_id"]),
                    "product": p.get("name", ""),
                    "sku": f"{p.get('sku', '')}-{v['size']}",
                    "size": v["size"],
                    "stock": v.get("stock", 0),
                    "reserved": v.get("reserved", 0),
                    "available": available,
                    "low": available <= p.get("low_stock_threshold", 3),
                }
            )
    return {"rows": rows}


class AdjustIn(BaseModel):
    product_id: str
    size: str
    delta: int
    note: str = ""


@router.post("/inventory/adjust")
async def adjust_inventory(payload: AdjustIn, request: Request):
    admin = await require_admin(request, db)
    p = await db.products.find_one({"_id": ObjectId(payload.product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    variant = next((v for v in p.get("variants", []) if v["size"] == payload.size), None)
    if not variant:
        raise HTTPException(status_code=400, detail="Variant not found")
    if variant.get("stock", 0) + payload.delta < 0:
        raise HTTPException(status_code=400, detail="Stock cannot go below zero")
    await db.products.update_one(
        {"_id": p["_id"], "variants.size": payload.size},
        {"$inc": {"variants.$.stock": payload.delta}, "$set": {"updated_at": now()}},
    )
    await db.inventory_movements.insert_one(
        {
            "product_id": payload.product_id,
            "sku": f"{p.get('sku', '')}-{payload.size}",
            "size": payload.size,
            "type": "adjustment",
            "delta": payload.delta,
            "note": payload.note,
            "by": admin.get("email", ""),
            "ts": now(),
        }
    )
    return {"status": "adjusted", "new_stock": variant.get("stock", 0) + payload.delta}


@router.get("/inventory/movements")
async def movements(request: Request, product_id: str = ""):
    await require_admin(request, db)
    q = {"product_id": product_id} if product_id else {}
    docs = await db.inventory_movements.find(q).sort("ts", -1).to_list(100)
    return {"movements": pubs(docs)}


# ---------- ORDERS ----------

@router.get("/orders")
async def admin_orders(request: Request, status: str = ""):
    await require_admin(request, db)
    q = {"status": status} if status else {}
    docs = await db.orders.find(q).sort("created_at", -1).to_list(500)
    return {"orders": pubs(docs)}


class OrderUpdateIn(BaseModel):
    status: Optional[str] = None
    tracking: Optional[str] = None


@router.patch("/orders/{oid}")
async def update_order(oid: str, payload: OrderUpdateIn, request: Request):
    await require_admin(request, db)
    order = await db.orders.find_one({"_id": ObjectId(oid)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    updates = {"updated_at": now()}
    if payload.tracking is not None:
        updates["tracking"] = payload.tracking
    if payload.status:
        updates["status"] = payload.status
        await db.orders.update_one(
            {"_id": order["_id"]},
            {"$push": {"status_history": {"status": payload.status, "ts": now()}}},
        )
    await db.orders.update_one({"_id": order["_id"]}, {"$set": updates})
    return {"status": "updated"}


# ---------- CUSTOMERS ----------

@router.get("/customers")
async def customers(request: Request):
    await require_admin(request, db)
    users = await db.users.find({"role": "customer"}).to_list(1000)
    out = []
    for u in users:
        uid = str(u["_id"])
        orders = await db.orders.find({"user_id": uid}).to_list(500)
        garments = await db.takebacks.count_documents({"user_id": uid, "status": {"$ne": "REJECTED"}})
        out.append(
            {
                "id": uid,
                "name": u.get("name", ""),
                "email": u.get("email", ""),
                "phone": u.get("phone", ""),
                "orders": len(orders),
                "total_spent": sum(o.get("total", 0) for o in orders),
                "garments_contributed": garments,
                "created_at": u.get("created_at", ""),
            }
        )
    return {"customers": out}


# ---------- TAKE-BACKS ----------

@router.get("/takebacks")
async def admin_takebacks(request: Request, status: str = ""):
    await require_admin(request, db)
    q = {"status": status} if status else {}
    docs = await db.takebacks.find(q).sort("created_at", -1).to_list(500)
    out = []
    for d in docs:
        d = pub(d)
        d["label"] = f"RV-TB-{d['id'][-6:].upper()}"
        out.append(d)
    return {"takebacks": out}


class ReviewIn(BaseModel):
    final_path: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    discount_eligible: Optional[bool] = None


@router.patch("/takebacks/{tid}")
async def review_takeback(tid: str, payload: ReviewIn, request: Request):
    admin = await require_admin(request, db)
    try:
        sub = await db.takebacks.find_one({"_id": ObjectId(tid)})
    except Exception:
        sub = None
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    updates = {"updated_at": now()}
    if payload.notes is not None:
        updates["notes"] = payload.notes
    if payload.discount_eligible is not None:
        updates["discount_eligible"] = payload.discount_eligible
    if payload.status:
        updates["status"] = payload.status
        updates["human_review_status"] = "REVIEWED"
    if payload.final_path:
        if payload.final_path not in ("REWEAR", "REVAMP", "RECYCLE"):
            raise HTTPException(status_code=400, detail="Invalid path")
        updates["final_path"] = payload.final_path
        updates["human_review_status"] = "REVIEWED"
        updates["status"] = payload.final_path if not payload.status else payload.status
    await db.takebacks.update_one({"_id": sub["_id"]}, {"$set": updates})

    uid = sub.get("user_id", "")
    if payload.final_path:
        await db.impact_events.insert_one(
            {"takeback_id": tid, "user_id": uid, "stage": "SORTED", "note": "Reviewed by Revamped team", "ts": now()}
        )
        await db.impact_events.insert_one(
            {
                "takeback_id": tid,
                "user_id": uid,
                "stage": f"{payload.final_path} PATH",
                "note": f"Final decision: {payload.final_path} (by {admin.get('email', '')})",
                "ts": now(),
            }
        )
    return {"status": "updated"}


# ---------- AI METRICS ----------

@router.get("/ai-metrics")
async def ai_metrics(request: Request):
    await require_admin(request, db)
    subs = await db.takebacks.find({"ai": {"$ne": None}}).to_list(1000)
    by_path = {"REWEAR": 0, "REVAMP": 0, "RECYCLE": 0}
    decided = 0
    agree = 0
    for s in subs:
        rec = (s.get("ai") or {}).get("recommendedPath")
        if rec in by_path:
            by_path[rec] += 1
        if s.get("final_path"):
            decided += 1
            if s["final_path"] == rec:
                agree += 1
    return {
        "assessments": len(subs),
        "recommendations": by_path,
        "human_decisions": decided,
        "overrides": decided - agree,
        "agreement_rate": round(agree / decided * 100, 1) if decided else None,
        "needs_review": sum(1 for s in subs if (s.get("ai") or {}).get("needs_review")),
    }


# ---------- IMPACT ----------

@router.get("/impact/summary")
async def impact_summary(request: Request):
    await require_admin(request, db)
    subs = await db.takebacks.find({}).to_list(1000)
    return {
        "total": len(subs),
        "rewear": sum(1 for s in subs if s.get("final_path") == "REWEAR"),
        "revamp": sum(1 for s in subs if s.get("final_path") == "REVAMP"),
        "recycle": sum(1 for s in subs if s.get("final_path") == "RECYCLE"),
        "pending": sum(1 for s in subs if s.get("status") in ("SUBMITTED", "AI_ASSESSED", "UNDER_REVIEW")),
    }


class ImpactEventIn(BaseModel):
    takeback_id: str
    stage: str
    note: str = ""


@router.post("/impact-events")
async def add_impact_event(payload: ImpactEventIn, request: Request):
    await require_admin(request, db)
    try:
        sub = await db.takebacks.find_one({"_id": ObjectId(payload.takeback_id)})
    except Exception:
        sub = None
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    await db.impact_events.insert_one(
        {
            "takeback_id": payload.takeback_id,
            "user_id": sub.get("user_id", ""),
            "stage": payload.stage.strip().upper(),
            "note": payload.note.strip(),
            "ts": now(),
        }
    )
    return {"status": "added"}


# ---------- SETTINGS ----------

@router.get("/settings")
async def get_settings(request: Request):
    await require_admin(request, db)
    doc = await db.settings.find_one({"_id": "rewards"}) or {}
    doc.pop("_id", None)
    return doc


class SettingsIn(BaseModel):
    levels: List[dict]


@router.patch("/settings")
async def update_settings(payload: SettingsIn, request: Request):
    await require_admin(request, db)
    levels = sorted(payload.levels, key=lambda x: x.get("min", 0))
    await db.settings.update_one({"_id": "rewards"}, {"$set": {"levels": levels}}, upsert=True)
    return {"status": "saved"}
