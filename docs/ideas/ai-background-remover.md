# AI Background Remover — Refined Idea

## Problem Statement

> How might we give the 1M+ users losing access to remove.bg (shutting down December 2026) a privacy-first, e-commerce-ready alternative that processes images without uploading them to a server?

---

## Recommended Direction

**The remove.bg Successor, Built for the Market Gap.**

remove.bg is shutting down on December 1, 2026 and migrating users to Canva. That's a massive, time-sensitive migration opportunity for a focused alternative. The window to capture organic SEO momentum ("remove.bg alternative") is open **right now**.

The product is a consumer-facing SaaS web app that:
1. Removes image backgrounds instantly in the browser (no upload, no server, no privacy concern)
2. Outputs e-commerce-ready results (white background, square crop, Amazon/Shopify presets)
3. Offers freemium pricing (free: preview quality, paid: HD + batch + no watermark)

The technical foundation is `@imgly/background-removal` (MIT license, WASM-based ONNX model running entirely in-browser). This eliminates server costs for the AI processing step and enables a strong "your images never leave your device" privacy story — something remove.bg never had.

RAW camera format support is architecturally planned but explicitly deferred to v2. The initial release targets the far larger JPEG/PNG/WebP-using e-commerce seller and creator audience, not professional photographers.

The white-label API is not an MVP concern. It becomes a natural product evolution once the consumer tool has real usage data and a proven AI pipeline.

---

## Key Assumptions to Validate

- [ ] **In-browser ONNX quality is acceptable** — Test `@imgly/background-removal` against a diverse set of product photos, portraits, and complex edges. Compare output quality to remove.bg. If quality gap is >20%, reconsider server-side AI provider fallback. *How to test: 30-minute demo test before any coding.*
- [ ] **Processing speed on mid-range hardware is <5 seconds** — Run on a 3-year-old MacBook and a mid-range Android Chrome browser. If >8s, the UX is broken. *How to test: benchmark before shipping.*
- [ ] **remove.bg's sunset drives real search intent** — Check Google Trends for "remove.bg alternative" velocity. If traffic is already climbing, the SEO play is validated. *How to test: 5 minutes on Google Trends right now.*
- [ ] **E-commerce sellers will pay for platform presets** — The upgrade hook (white bg, square crop, Amazon/Shopify aspect ratios) must feel like a genuine time-saver, not a gimmick. *How to test: post 3 mockups in r/ecommerce and ask for feedback before building paid tier.*

---

## MVP Scope

**In (must ship day 1–2):**
- Landing page with headline, upload area, sample images, before/after demo
- Drag-and-drop + file picker upload (JPEG, PNG, WebP, GIF — single frame)
- In-browser AI background removal via `@imgly/background-removal`
- Processing state (progress indicator, not just a spinner)
- Results screen: checkerboard preview, before/after slider, color background picker
- PNG download (transparent)
- Mobile-responsive layout
- Basic error handling (unsupported format, oversized file, processing failure)
- File size limit clearly displayed (e.g. 25MB max)

**In (can ship day 2–3):**
- WebP download option
- "Try a sample image" flow with 3 preloaded demos
- Footer with format support info, FAQ, privacy statement
- Basic SEO (title, meta description, OG tags)

**Not in v1:**
- RAW camera formats (CR2, NEF, ARW, DNG...) — server-side decode required, 2–5 days additional work
- Batch processing — post-MVP, requires quota system
- User accounts / authentication — not needed for freemium if using local storage for free limits
- API access / white-label — v2
- PDF page selection, SVG rasterization, animated GIF frame selection — v2
- HEIC/HEIF (requires native decoder or conversion service) — v2
- Payment integration — scaffold architecture but don't build billing in v1

---

## Not Doing (and Why)

- **20+ format pipeline on day 1** — The spec lists 30+ formats. JPEG + PNG + WebP covers >90% of real-world uploads. Ship narrow and deep, not wide and shallow.
- **Self-hosted AI model (custom GPU server)** — Unnecessary cost and complexity. `@imgly/background-removal` runs in the browser for free. Switch to server-side only if quality proves insufficient.
- **RAW format support in MVP** — Despite being marked "critical," this requires `libraw` native binaries, a persistent server (not serverless), and 2–5 additional build days. Photographers are a smaller audience than e-commerce sellers. Launch to the larger audience first.
- **Video/animated GIF frame-by-frame** — Technically fascinating, commercially premature. Add to roadmap.
- **API-first architecture** — The API is a distribution channel, not the product. Build the consumer tool first; the API is a natural extraction of what already works.
- **Accounts and database in v1** — Use browser local storage for free usage tracking. No auth = no friction = faster first-use conversion.

---

## Open Questions

- Which AI provider is the fallback if in-browser ONNX quality is insufficient? (ClipDrop API: $0.002/image; Stability AI; PhotoRoom API — all have free tiers)
- What's the freemium gate? Options: (a) 3 free downloads/day, (b) free preview always + pay for HD, (c) free forever with watermark. This determines whether monetization requires auth.
- Does the "no server" story hold if RAW support launches in v2? Plan: add a single lightweight serverless endpoint for RAW → JPEG conversion only; AI still runs in-browser.
- Domain name and brand identity — what's the product name? This affects SEO from day 1.

---

## Stack Decision

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript | Matches spec; handles both static pages and API routes |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible, consistent |
| AI Engine | `@imgly/background-removal` (in-browser WASM) | MIT license, no server cost, privacy story |
| Fallback AI | ClipDrop API or remove.bg API (if quality gap) | Pay-per-call, no infrastructure |
| Image processing | Sharp (server-side, for RAW v2 / format conversion) | Industry standard |
| Deployment | Vercel | Zero config, matches stack |
| Payments (v2) | Stripe | Standard, well-documented |

---

## Roadmap Sketch

| Phase | Scope | Timeline |
|-------|-------|----------|
| **v1 — MVP** | Landing + upload + in-browser AI + results + PNG download | 1–2 days |
| **v1.1** | WebP export, sample images, FAQ, SEO polish | Day 2–3 |
| **v2 — Formats** | HEIC, SVG, PDF, animated GIF frame selection, RAW via server endpoint | Week 2 |
| **v2.1 — Monetization** | Freemium gate, Stripe, HD download tier | Week 3 |
| **v3 — E-commerce** | Platform presets, batch upload, background templates | Month 2 |
| **v4 — API** | REST API + docs + API key management | Month 3 |

---

## Competitive Timing Note

> **remove.bg is shutting down December 1, 2026.** It has 1M+ monthly users. Google searches for "remove.bg alternative" will spike in Q4 2026. Shipping by November 2026 and targeting this keyword is a legitimate growth strategy with a hard deadline. This is not a coincidence — it's the window.
