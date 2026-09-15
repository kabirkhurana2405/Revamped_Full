import re
import uuid
from pathlib import Path
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Response
from pydantic import BaseModel

from db import db, pub, pubs
from security import get_current_user
from ai_provider import assess_garment
from share_card import render_impact_card

router = APIRouter(prefix="/api", tags=["takeback"])

UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

PATH_STAGES = {
    "REWEAR": "REWEAR PATH",
    "REVAMP": "REVAMP PATH",
    "RECYCLE": "RECYCLE PATH",
}


async def _add_event(takeback_id: str, user_id: str, stage: str, note: str = ""):
    await db.impact_events.insert_one(
        {
            "takeback_id": takeback_id,
            "user_id": user_id,
            "stage": stage,
            "note": note,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
    )


class TakeBackIn(BaseModel):
    brand: str = ""
    garment_type: str
    notes: str = ""


@router.post("/takeback")
async def create_submission(payload: TakeBackIn, request: Request):
    user = await get_current_user(request, db)
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": user["id"],
        "customer_name": user.get("name", ""),
        "customer_email": user.get("email", ""),
        "brand": payload.brand.strip(),
        "garment_type": payload.garment_type.strip(),
        "notes": payload.notes.strip(),
        "images": [],
        "ai": None,
        "human_review_status": "PENDING",
        "final_path": None,
        "discount_eligible": False,
        "status": "SUBMITTED",
        "created_at": now,
        "updated_at": now,
    }
    res = await db.takebacks.insert_one(doc)
    tid = str(res.inserted_id)
    await _add_event(tid, user["id"], "CONTRIBUTED", "Garment submitted for take-back")
    return {"id": tid, "status": "SUBMITTED"}


@router.post("/takeback/{tid}/images")
async def upload_images(tid: str, request: Request, files: list[UploadFile] = File(...)):
    user = await get_current_user(request, db)
    try:
        sub = await db.takebacks.find_one({"_id": ObjectId(tid)})
    except Exception:
        sub = None
    if not sub or sub.get("user_id") != user["id"]:
        raise HTTPException(status_code=404, detail="Submission not found")
    saved = []
    for f in files[:6]:
        ext = re.sub(r"[^a-zA-Z0-9.]", "", Path(f.filename or "img.jpg").suffix) or ".jpg"
        name = f"tb_{tid}_{uuid.uuid4().hex[:8]}{ext}"
        content = await f.read()
        if len(content) > 8 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large (max 8MB)")
        (UPLOAD_DIR / name).write_bytes(content)
        saved.append(f"/api/files/{name}")
    await db.takebacks.update_one(
        {"_id": ObjectId(tid)},
        {"$push": {"images": {"$each": saved}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"images": saved}


class AssessIn(BaseModel):
    submission_id: str


@router.post("/ai/assess-garment")
async def assess(payload: AssessIn, request: Request):
    user = await get_current_user(request, db)
    try:
        sub = await db.takebacks.find_one({"_id": ObjectId(payload.submission_id)})
    except Exception:
        sub = None
    if not sub or sub.get("user_id") != user["id"]:
        raise HTTPException(status_code=404, detail="Submission not found")
    result = await assess_garment(sub.get("images", []), sub.get("brand", ""), sub.get("garment_type", ""))
    needs_review = bool(result.get("needs_review"))
    await db.takebacks.update_one(
        {"_id": ObjectId(payload.submission_id)},
        {
            "$set": {
                "ai": result,
                "status": "UNDER_REVIEW" if needs_review else "AI_ASSESSED",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    await _add_event(
        payload.submission_id,
        user["id"],
        "AI CONDITION CHECK",
        "AI unsure — flagged for human review" if needs_review else "AI-assisted condition assessment",
    )
    await _add_event(payload.submission_id, user["id"], "ASSESSED", result.get("label", ""))
    return result


@router.get("/takeback/my")
async def my_takebacks(request: Request):
    user = await get_current_user(request, db)
    docs = await db.takebacks.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return {"submissions": pubs(docs)}


@router.get("/takeback/{tid}")
async def get_takeback(tid: str, request: Request):
    user = await get_current_user(request, db)
    try:
        sub = await db.takebacks.find_one({"_id": ObjectId(tid)})
    except Exception:
        sub = None
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.get("user_id") != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your submission")
    events = await db.impact_events.find({"takeback_id": tid}).sort("ts", 1).to_list(100)
    out = pub(sub)
    out["journey"] = pubs(events)
    out["label"] = f"RV-TB-{tid[-6:].upper()}"
    return out


@router.get("/impact/share/{tid}")
async def impact_share_card(tid: str, request: Request):
    user = await get_current_user(request, db)
    try:
        sub = await db.takebacks.find_one({"_id": ObjectId(tid)})
    except Exception:
        sub = None
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.get("user_id") != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your submission")
    events = await db.impact_events.find({"takeback_id": tid}).sort("ts", 1).to_list(20)
    contributed = await db.takebacks.count_documents({"user_id": sub["user_id"], "status": {"$ne": "REJECTED"}})
    png = render_impact_card(sub, events, contributed)
    return Response(content=png, media_type="image/png", headers={"Cache-Control": "no-store"})


@router.get("/impact/my")
async def my_impact(request: Request):
    user = await get_current_user(request, db)
    subs = await db.takebacks.find({"user_id": user["id"]}).sort("created_at", -1).to_list(500)

    def path_of(s):
        return s.get("final_path") or ((s.get("ai") or {}).get("recommendedPath"))

    active = [s for s in subs if s.get("status") != "REJECTED"]
    garments = []
    for s in subs:
        garments.append(
            {
                "id": str(s["_id"]),
                "label": f"RV-TB-{str(s['_id'])[-6:].upper()}",
                "garment_type": s.get("garment_type", ""),
                "brand": s.get("brand", ""),
                "status": s.get("status", ""),
                "path": path_of(s),
                "image": (s.get("images") or [None])[0],
                "created_at": s.get("created_at", ""),
            }
        )
    return {
        "contributed": len(active),
        "rewear": sum(1 for s in active if path_of(s) == "REWEAR"),
        "revamp": sum(1 for s in active if path_of(s) == "REVAMP"),
        "recycle": sum(1 for s in active if path_of(s) == "RECYCLE"),
        "pending": sum(1 for s in active if s.get("status") in ("SUBMITTED", "AI_ASSESSED", "UNDER_REVIEW")),
        "garments": garments,
    }


DEFAULT_LEVELS = [
    {"min": 0, "name": "NEWCOMER"},
    {"min": 4, "name": "CONTRIBUTOR"},
    {"min": 8, "name": "CYCLE REGULAR"},
    {"min": 16, "name": "LOOP LEGEND"},
]


@router.get("/rewards/my")
async def my_rewards(request: Request):
    user = await get_current_user(request, db)
    contributed = await db.takebacks.count_documents({"user_id": user["id"], "status": {"$ne": "REJECTED"}})
    settings = await db.settings.find_one({"_id": "rewards"}) or {}
    levels = settings.get("levels") or DEFAULT_LEVELS
    current = levels[0]
    next_level = None
    for i, lv in enumerate(levels):
        if contributed >= lv["min"]:
            current = lv
            next_level = levels[i + 1] if i + 1 < len(levels) else None
    return {
        "contributed": contributed,
        "level": current,
        "next_level": next_level,
        "levels": levels,
        "perks": ["Take-back discounts", "Early drop access", "Limited drops", "Badges"],
    }
