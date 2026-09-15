from datetime import datetime, timezone
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr

from db import db, pub
from security import get_current_user, get_optional_user

router = APIRouter(prefix="/api", tags=["shop"])

ALL_SIZES = ["S", "M", "L", "XL", "XXL"]


def _variant_available(v):
    return v.get("stock", 0) - v.get("reserved", 0)


def _decorate(d):
    d = pub(d)
    variants = d.get("variants", [])
    d["available_sizes"] = [v["size"] for v in variants if _variant_available(v) > 0]
    d["total_stock"] = sum(_variant_available(v) for v in variants)
    return d


@router.get("/products/meta")
async def product_meta():
    categories = await db.products.distinct("category", {"status": "active"})
    colors = await db.products.distinct("colors.name", {"status": "active"})
    return {"categories": categories, "colors": colors, "sizes": ALL_SIZES}


@router.get("/products")
async def list_products(
    gender: str = "",
    category: str = "",
    size: str = "",
    color: str = "",
    min_price: float = 0,
    max_price: float = 0,
    availability: str = "",
    sort: str = "featured",
    search: str = "",
):
    q = {"status": "active"}
    if gender.lower() in ("men", "women"):
        q["gender"] = {"$in": [gender.capitalize(), "Unisex"]}
    if category:
        q["category"] = category
    if search:
        q["name"] = {"$regex": search, "$options": "i"}
    if min_price:
        q["price"] = {"$gte": min_price}
    if max_price:
        q.setdefault("price", {})["$lte"] = max_price

    docs = await db.products.find(q).to_list(500)
    out = []
    for d in docs:
        variants = d.get("variants", [])
        if size and not any(v["size"] == size and _variant_available(v) > 0 for v in variants):
            continue
        if color and not any(c.get("name", "").lower() == color.lower() for c in d.get("colors", [])):
            continue
        if availability == "in_stock" and not any(_variant_available(v) > 0 for v in variants):
            continue
        out.append(_decorate(d))

    if sort == "price_asc":
        out.sort(key=lambda x: x.get("price", 0))
    elif sort == "price_desc":
        out.sort(key=lambda x: -x.get("price", 0))
    elif sort == "newest":
        out.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    else:
        out.sort(key=lambda x: (not x.get("featured", False), x.get("created_at", "")))
    return {"products": out, "count": len(out)}


@router.get("/products/{slug}")
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug})
    if not doc or doc.get("status") != "active":
        raise HTTPException(status_code=404, detail="Product not found")
    return _decorate(doc)


class OrderItemIn(BaseModel):
    product_id: str
    size: str
    qty: int = 1


class CustomerIn(BaseModel):
    name: str
    phone: str
    email: EmailStr


class AddressIn(BaseModel):
    line1: str
    line2: str = ""
    city: str
    state: str
    pincode: str


class OrderIn(BaseModel):
    items: List[OrderItemIn]
    customer: CustomerIn
    address: AddressIn
    takeback_garments: int = 0


@router.post("/orders")
async def create_order(payload: OrderIn, request: Request):
    user = await get_optional_user(request, db)
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    items = []
    subtotal = 0
    stock_updates = []
    for it in payload.items:
        if it.qty < 1 or it.qty > 5:
            raise HTTPException(status_code=400, detail="Invalid quantity")
        try:
            p = await db.products.find_one({"_id": ObjectId(it.product_id), "status": "active"})
        except Exception:
            p = None
        if not p:
            raise HTTPException(status_code=400, detail="A product in your bag is unavailable")
        variant = next((v for v in p.get("variants", []) if v["size"] == it.size), None)
        if not variant:
            raise HTTPException(status_code=400, detail=f"Size {it.size} unavailable for {p['name']}")
        if _variant_available(variant) < it.qty:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {p['name']} ({it.size})")
        subtotal += p["price"] * it.qty
        items.append(
            {
                "product_id": str(p["_id"]),
                "name": p["name"],
                "sku": p.get("sku", ""),
                "size": it.size,
                "qty": it.qty,
                "price": p["price"],
                "image": (p.get("images") or [None])[0],
            }
        )
        stock_updates.append((p["_id"], it.size, it.qty))

    garments = max(0, min(4, payload.takeback_garments))
    pct = garments * 5
    discount = round(subtotal * pct / 100)
    taxable = subtotal - discount
    gst = round(taxable * 0.05)
    shipping = 0 if subtotal >= 999 else 79
    total = taxable + gst + shipping

    for pid, size, qty in stock_updates:
        await db.products.update_one(
            {"_id": pid, "variants.size": size},
            {"$inc": {"variants.$.stock": -qty}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        await db.inventory_movements.insert_one(
            {
                "product_id": str(pid),
                "size": size,
                "type": "sale",
                "delta": -qty,
                "note": "Online order",
                "ts": datetime.now(timezone.utc).isoformat(),
            }
        )

    counter = await db.counters.find_one_and_update(
        {"_id": "order"}, {"$inc": {"seq": 1}}, upsert=True, return_document=True
    )
    order_number = f"RV-{counter['seq']:06d}"

    customer = payload.customer.model_dump()
    customer["email"] = customer["email"].strip().lower()
    order = {
        "order_number": order_number,
        "user_id": user["id"] if user else None,
        "guest": user is None,
        "customer": customer,
        "address": payload.address.model_dump(),
        "items": items,
        "subtotal": subtotal,
        "takeback_garments": garments,
        "takeback_discount_percent": pct,
        "takeback_discount_amount": discount,
        "gst": gst,
        "shipping": shipping,
        "total": total,
        "payment_mode": "TEST",
        "payment_status": "TEST_PAID",
        "status": "PLACED",
        "tracking": "",
        "status_history": [{"status": "PLACED", "ts": datetime.now(timezone.utc).isoformat()}],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.orders.insert_one(order)
    order["id"] = str(res.inserted_id)
    order.pop("_id", None)
    return order


@router.get("/orders/my")
async def my_orders(request: Request):
    user = await get_current_user(request, db)
    docs = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    return {"orders": [pub(d) for d in docs]}


@router.get("/orders/{order_number}")
async def get_order(order_number: str, request: Request, email: str = ""):
    user = await get_optional_user(request, db)
    doc = await db.orders.find_one({"order_number": order_number})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    if user and (doc.get("user_id") == user["id"] or user.get("role") == "admin"):
        return pub(doc)
    if doc.get("guest") and email and doc.get("customer", {}).get("email", "").lower() == email.strip().lower():
        return pub(doc)
    if doc.get("guest") and not user:
        raise HTTPException(status_code=401, detail="Log in or pass the checkout email to view this order")
    raise HTTPException(status_code=403, detail="Not your order")
