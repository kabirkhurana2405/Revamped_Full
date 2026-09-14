import os
import hashlib

PROVIDER = os.environ.get("AI_PROVIDER", "mock")


async def assess_garment(images: list, brand: str, garment_type: str) -> dict:
    if PROVIDER == "mock":
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
        }
    raise NotImplementedError("Real AI provider not connected yet")
