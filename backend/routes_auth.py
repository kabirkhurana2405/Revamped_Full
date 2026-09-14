import jwt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel, EmailStr

from db import db
from security import (
    hash_password,
    verify_password,
    set_auth_cookies,
    clear_auth_cookies,
    get_current_user,
    create_access_token,
    jwt_secret,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def sanitize(doc):
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


async def _check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("count", 0) >= 5:
        locked_until = rec.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")


async def _record_fail(identifier: str):
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {
            "$inc": {"count": 1},
            "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()},
        },
        upsert=True,
    )


@router.post("/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.strip().lower()
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "customer",
        "phone": "",
        "addresses": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    set_auth_cookies(response, str(res.inserted_id), email, "customer")
    return sanitize({**doc, "_id": res.inserted_id})


@router.post("/login")
async def login(payload: LoginIn, request: Request, response: Response):
    email = payload.email.strip().lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    await _check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await _record_fail(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    set_auth_cookies(response, str(user["_id"]), email, user.get("role", "customer"))
    return sanitize(user)


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"status": "logged_out"}


@router.get("/me")
async def me(request: Request):
    user = await get_current_user(request, db)
    user.pop("_id", None)
    return user


class ProfileIn(BaseModel):
    name: str | None = None
    phone: str | None = None
    addresses: list | None = None


@router.patch("/me")
async def update_profile(payload: ProfileIn, request: Request):
    from bson import ObjectId as _OID

    user = await get_current_user(request, db)
    updates = {}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.phone is not None:
        updates["phone"] = payload.phone.strip()
    if payload.addresses is not None:
        updates["addresses"] = payload.addresses[:5]
    if updates:
        await db.users.update_one({"_id": _OID(user["id"])}, {"$set": updates})
    return {"status": "updated"}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    from bson import ObjectId

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    response.set_cookie(
        key="access_token",
        value=create_access_token(str(user["_id"]), user["email"], user.get("role", "customer")),
        httponly=True,
        secure=True,
        samesite="none",
        max_age=43200,
        path="/",
    )
    return {"status": "refreshed"}
