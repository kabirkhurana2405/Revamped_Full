"""Backend regression tests for guest checkout, order claiming, and AI/admin metrics."""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend .env parse
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = BASE_URL + "/api"

ADMIN_EMAIL = "admin@revamped.in"
ADMIN_PASS = "Revamped@Admin2026"
DEMO_EMAIL = "demo@revamped.in"
DEMO_PASS = "Revamped@Demo2026"


def _pick_active_product():
    r = requests.get(f"{API}/products?gender=men")
    r.raise_for_status()
    products = r.json()["products"]
    for p in products:
        if p.get("available_sizes"):
            return p
    pytest.skip("No active product with stock available")


def _order_payload(product, garments=0, email=None, name="Guest QA"):
    return {
        "items": [{"product_id": product["id"], "size": product["available_sizes"][0], "qty": 1}],
        "customer": {"name": name, "phone": "9999999999", "email": email},
        "address": {"line1": "Flat 1", "line2": "", "city": "Mumbai", "state": "MH", "pincode": "400001"},
        "takeback_garments": garments,
    }


# ---------- Guest checkout & order visibility ----------
class TestGuestCheckout:
    def test_guest_order_create_and_email_gated_get(self):
        product = _pick_active_product()
        email = f"guest.qa.{uuid.uuid4().hex[:8]}@test.com"
        s = requests.Session()  # no auth
        r = s.post(f"{API}/orders", json=_order_payload(product, garments=2, email=email))
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["guest"] is True
        assert order["user_id"] is None
        assert order["takeback_discount_percent"] == 10
        assert order["order_number"].startswith("RV-")
        order_num = order["order_number"]

        # 401 without auth or email
        r1 = requests.get(f"{API}/orders/{order_num}")
        assert r1.status_code == 401

        # 401 with wrong email
        r2 = requests.get(f"{API}/orders/{order_num}", params={"email": "wrong@test.com"})
        assert r2.status_code == 401

        # 200 with correct email
        r3 = requests.get(f"{API}/orders/{order_num}", params={"email": email})
        assert r3.status_code == 200
        assert r3.json()["order_number"] == order_num

    def test_guest_order_claim_via_register(self):
        product = _pick_active_product()
        email = f"claim.reg.{uuid.uuid4().hex[:8]}@test.com"
        # place guest order
        r = requests.post(f"{API}/orders", json=_order_payload(product, email=email))
        assert r.status_code == 200
        order_num = r.json()["order_number"]

        # register with same email
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"name": "Claimer", "email": email, "password": "password123"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("claimed_orders", 0) >= 1

        # order now visible in /orders/my
        r2 = s.get(f"{API}/orders/my")
        assert r2.status_code == 200
        order_nums = [o["order_number"] for o in r2.json()["orders"]]
        assert order_num in order_nums

    def test_guest_order_claim_via_login(self):
        # register user first
        email = f"claim.login.{uuid.uuid4().hex[:8]}@test.com"
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"name": "Claim Login", "email": email, "password": "password123"})
        assert r.status_code == 200
        # logout
        s.post(f"{API}/auth/logout")
        s.cookies.clear()

        # place guest order same email
        product = _pick_active_product()
        r = requests.post(f"{API}/orders", json=_order_payload(product, email=email))
        assert r.status_code == 200
        order_num = r.json()["order_number"]

        # login
        s2 = requests.Session()
        r = s2.post(f"{API}/auth/login", json={"email": email, "password": "password123"})
        assert r.status_code == 200, r.text
        assert r.json().get("claimed_orders", 0) >= 1

        r2 = s2.get(f"{API}/orders/my")
        assert order_num in [o["order_number"] for o in r2.json()["orders"]]


# ---------- Admin visibility ----------
class TestAdminGuest:
    @pytest.fixture(scope="class")
    def admin_session(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        if r.status_code != 200:
            pytest.skip(f"admin login failed: {r.status_code} {r.text}")
        return s

    def test_admin_orders_lists_guest(self, admin_session):
        r = admin_session.get(f"{API}/admin/orders")
        assert r.status_code == 200
        orders = r.json().get("orders", r.json()) if isinstance(r.json(), dict) else r.json()
        # Accept either shape
        if isinstance(orders, dict):
            orders = orders.get("orders", [])
        assert isinstance(orders, list)
        guests = [o for o in orders if o.get("guest")]
        assert len(guests) >= 1
        assert guests[0].get("customer", {}).get("email")

    def test_ai_metrics_has_needs_review(self, admin_session):
        r = admin_session.get(f"{API}/admin/ai-metrics")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "needs_review" in data, data
        assert isinstance(data["needs_review"], int)


# ---------- Logged-in regression ----------
class TestLoggedInOrder:
    def test_demo_login_and_order(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
        assert r.status_code == 200, r.text
        product = _pick_active_product()
        r = s.post(f"{API}/orders", json=_order_payload(product, email=DEMO_EMAIL, name="Demo"))
        assert r.status_code == 200, r.text
        o = r.json()
        assert o["guest"] is False
        assert o["user_id"] is not None
        # visible in /orders/my
        r2 = s.get(f"{API}/orders/my")
        assert r2.status_code == 200
        assert o["order_number"] in [x["order_number"] for x in r2.json()["orders"]]


# ---------- Impact share card ----------
class TestImpactShareCard:
    def _login(self, email, password):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": email, "password": password})
        assert r.status_code == 200, r.text
        return s

    def _demo_takeback(self, s):
        r = s.get(f"{API}/takeback/my")
        r.raise_for_status()
        subs = r.json()["submissions"]
        if not subs:
            pytest.skip("Demo user has no take-back submissions")
        return subs[0]["id"]

    def test_owner_gets_png_card(self):
        s = self._login(DEMO_EMAIL, DEMO_PASS)
        tid = self._demo_takeback(s)
        r = s.get(f"{API}/impact/share/{tid}")
        assert r.status_code == 200
        assert r.headers["content-type"] == "image/png"
        assert r.content[:4] == b"\x89PNG"
        assert len(r.content) > 20000  # a real rendered card, not a stub

    def test_other_user_forbidden_and_guest_unauthorized(self):
        owner = self._login(DEMO_EMAIL, DEMO_PASS)
        tid = self._demo_takeback(owner)
        other = self._login("buyer@test.com", "password123")
        r = other.get(f"{API}/impact/share/{tid}")
        assert r.status_code in (403, 404)
        r2 = requests.get(f"{API}/impact/share/{tid}")
        assert r2.status_code == 401
