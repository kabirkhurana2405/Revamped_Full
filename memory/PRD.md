# REVAMPED — Launch Landing Page PRD

## Original Problem Statement
Single-page premium launch site for REVAMPED, an Indian circular streetwear brand (tagline: STYLE. CYCLE. IMPACT.). Not ecommerce — a cinematic brand experience with a 3D oversized tee hero that disassembles into fabric particles on scroll, editorial sections explaining the take-back system (5% off per returned garment, max 4 / 20%), three garment paths (REWEAR / REVAMP / RECYCLE), a traceable impact philosophy, DROP 001 pilot (50 pieces, 3 designs, ₹999), a 3D phone app preview with 6 screens, and waitlist capture via a "Coming Soon" modal. Fashion-first, no NGO/eco clichés, no invented stats or partners.

## Architecture
- Frontend: React 19 + Tailwind + framer-motion (scroll reveals, springs) + lenis (momentum scroll) + Three.js / React Three Fiber (procedural extruded-geometry tee with fabric-fold vertex displacement, canvas-noise bump map, shader particle disassembly, drop trio scene, final CTA tee). Phone mockup is CSS 3D cuboid with live React app screens.
- Backend: FastAPI + MongoDB (waitlist collection) + Emergent-managed Resend email proxy (branded confirmation email, guardrail-gated).
- Key files: /app/frontend/src/App.js, /src/sections/* (Hero, StyleSection, ProblemSection, TakeBackSection, PathsSection, ImpactSection, DropSection, AppSection, FinalCTA, Footer), /src/components/* (Nav, Cursor, WaitlistModal, Marquee, primitives), /src/three/tee.jsx, /app/backend/server.py

## User Personas
- Streetwear buyer discovering the brand and DROP 001
- Early adopter joining the app waitlist / early access
- Returning customer using the take-back discount

## Core Requirements (static)
1. Communicate: fashion brand → bring old clothes back → three next lives → app tracks the loop
2. 3D tee hero with scroll-driven particle disassembly; mouse parallax
3. Interactive take-back calculator (0–4 garments, ₹999 → ₹799, 5%/garment, cap 20%)
4. Drop 001 trio showcase, no checkout
5. App preview with 6 branded screens + store buttons opening Coming Soon waitlist modal
6. Honest copy: no fake impact numbers (ledger starts at 0, dashboard marked DEMO)

## Implemented
2026-09-14 — v7 (E-COMMERCE MVP EXPANSION): Landing preserved at "/" (now with global nav + SHOP DROP 001 CTA). New: react-router multi-page app.
- Customer: /men + /women catalogue (shared, gender filter incl. Unisex, filters category/size/colour/price/availability, 4 sort modes, search), /product/:slug (gallery, size/stock, accordions, circularity section), /cart (save-for-later, take-back discount 0–4 garments = 5–20%), /checkout (Indian address flow, GST 5%, free shipping ≥₹999 pre-discount, TEST PAYMENT MODE — no fake gateway), /order/:num confirmation, /login (register+login JWT httpOnly cookies), /account (orders, profile, addresses), /impact (My Cycle aggregates + per-garment journey timeline modal; demo card for guests), /take-back (5-step flow), /take-back/assess (3-step AI condition check UI, mock provider, demo-labelled), /rewards (cycle levels from admin-editable rules). Mobile bottom tab bar on shop pages.
- Admin /admin (separate auth, role-guarded server-side): dashboard (real metrics + 14-day sales chart + pathway distribution, empty states), products CRUD + duplicate/archive + image upload, size-level inventory with adjustment movements, orders (status pipeline + tracking), customers (aggregates), take-back review (AI vs final decision stored separately, REWEAR/REVAMP/RECYCLE/REJECT), AI assessments + agreement rate, impact journey editor, settings (reward levels, AI/payment provider notes).
- Backend: modular (db/security/seed/ai_provider + routes_auth/shop/takeback/admin); JWT cookies + bcrypt + brute-force lockout; seed: admin, demo customer, 3 Drop 001 products with generated branded packshots, size-level stock totalling 50 pieces; uploads served at /api/files.
- Verified: curl chain (register/login/order RV-000001 with 10% take-back discount ₹944 total, stock 5→4, take-back → AI assess → admin override REVAMP vs AI REWEAR → agreement rate 50%); UI E2E (catalogue → product → bag → register → checkout → order RV-000002 ₹1,049 → account); admin dashboard/inventory/take-backs screenshots.
2026-09-14 — v2 (business model + performance revision):
- CRITICAL: take-back now clearly accepts clothes from ANY brand ("We take back all clothes" banner, any-brand copy across hero/take-back/app/final); removed all "Revamped-only return" wording
- Take-back rebuilt: BUY. WEAR. BRING IT BACK. + 4 steps (BRING IT / AI CHECK / SORT / IMPACT) + CLOSET → AI CHECK → SORT → NEW LIFE → IMPACT flow strip
- New section 05 AI CHECK: 2D scanning animation (scan line, corner brackets, CONDITION/WEAR/DAMAGE/REUSE POTENTIAL labels, AI ASSESSMENT → REWEAR, "AI assists, team verifies" disclaimer)
- Discount clarity: "5% OFF PER GARMENT", "BRING 1→4" grid, "up to 4 garments per purchase", "a discount, not a buy-back"
- 3D reduced to ONE WebGL canvas (hero tee only): removed hero particle disassembly, style/drop/final 3D scenes; hero tee now gentle rotate/float/mouse, pauses offscreen, low-power mode, static SVG fallback + reduced-motion fallback
- Phone mockup is pure CSS (tilt + parallax + screen transitions, no WebGL); 6 new app screens (Home, Bring It Back, AI Condition Check, Your Impact w/ SAMPLE DATA tag, Garment Journey 5-step timeline, Cycle Rewards)
- App download block: "THE CYCLE IS GOING MOBILE." + COMING SOON + store buttons → waitlist modal
- Impact: new headline "STYLE IS WHAT YOU WEAR..." + lightweight animated flow (Closet → Contribute → AI Check → 3 paths → New Life → Impact); ledger/50 counter/dots/DEMO dashboard retained
- Three Paths cards updated with condition-based copy
- Chapter numbering resequenced 01–09
2026-09-14 — v3 (brand mark): circular-loop "R" symbol (SVG, components/Logo.jsx: LogoMark + Logo lockup) added alongside existing Syne wordmark; placed in nav, mobile menu, footer, app screen headers, waitlist modal, email header (table-safe ring span), favicon (public/logo-mark.svg). Awaiting user's own logo file for refinement/swap.
2026-09-14 — v4 (logo redesign per user reference): mark rebuilt as three circulating arrows (charcoal #2B2B28) with red accent swooshes (#E23B3B) around a hanger + bold serif-contrast "V" monogram; mono variant (currentColor) for dark surfaces; placed in nav, mobile menu, footer, app screens, waitlist modal, favicon; email header ring tinted red to echo accent.
2026-09-14 — v5 (exact user logo): extracted the user's actual uploaded artwork (white→alpha, trimmed) as public/logo.png; LogoMark now renders the real image (bone circular chip variant for dark surfaces); favicon regenerated from the real mark (forest tile + bone disc) as public/logo-icon.png; interim SVG mark removed.
2026-09-14 — v6 (logo on garment + extra placements): exact logo rendered as chest embroidery on the 3D hero tee (texture decal) and all SVG tees via TeeSvg logoSrc; tonal bone variant (public/logo-bone.png) for dark garments (STATEMENT/CIRCULAR). Logo also added to hero eyebrow, take-back ring center, marquee separators, Problem-section watermark, Drop 001 header. "T-shirt" wording scrubbed (SHIRT/HOODIE, OVERSIZED SHIRT).

## Verified
- curl POST /api/waitlist → {"status":"joined","email_sent":true}; duplicate → "already"; count endpoint works
- Screenshots: hero, particle disassembly, all sections desktop + mobile hero/app; calculator 4 garments → ₹799/20%; modal join → success state

## Backlog
- P0: None blocking
- P1: Real app-store links when apps exist; swap procedural tee for scanned GLTF garment; waitlist count social proof on site
- P2: WebGL garment-journey tracer microsite; press/lookbook section; i18n (Hindi)

## Next Tasks
1. Replace procedural tee with production GLTF garment scan when asset is available
2. Add real social links (Instagram) and contact email in footer
3. Admin view of waitlist signups
