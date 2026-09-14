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

## Implemented (2026-09-14)
- All 10 sections with scroll choreography, numbered chapters, editorial marquee
- 3D tee (procedural, fabric folds/bump), hero disassembly particles, style spec focus, drop trio entrance, final CTA tee
- Custom cursor (hover expand + EXPLORE over 3D), magnetic buttons, Lenis smooth scroll, grain overlay
- Take-back ring + working discount calculator
- Impact ledger zeros, animated 0→50 counter, 50-dot field organizing into three arcs, DEMO dashboard card
- CSS-3D rotating phone with 6 live app screens (Home/Return/Impact/Journey/Rewards/Drop)
- Waitlist API (dedupe, count endpoint) + Resend confirmation email (verified sent)
- Sticky glass nav, mobile menu, mobile-specific layouts

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
