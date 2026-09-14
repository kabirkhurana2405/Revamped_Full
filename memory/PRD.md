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
2026-09-14 — v1: All 10 sections with scroll choreography, 3D tee hero, calculator, phone preview, waitlist + Resend email.
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
