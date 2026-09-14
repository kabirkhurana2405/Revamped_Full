# Auth Testing Playbook — REVAMPED

## Credentials (also in /app/memory/test_credentials.md)
- Admin: admin@revamped.in / Revamped@Admin2026 (role: admin)
- Demo customer: demo@revamped.in / Revamped@Demo2026 (role: customer)

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`; unique index on users.email.

## Step 2: API Testing
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@revamped.in","password":"Revamped@Admin2026"}'
cat cookies.txt
curl -b cookies.txt http://localhost:8001/api/auth/me
```
Login returns the user object and sets access_token + refresh_token httpOnly cookies.
/me returns the same user via cookie. Admin-only endpoints: /api/admin/* must 403 for customers, 401 when logged out.

## Step 3: Logout / Refresh
```
curl -b cookies.txt -X POST http://localhost:8001/api/auth/refresh
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8001/api/auth/logout
```
