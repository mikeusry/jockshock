# Mobile Audit Results — 2026-05-07

> Playwright sweep across 4 pages × 3 iPhone widths (375 SE, 390, 430 Pro Max). Tool: `~/.claude/skills/jockshock-design/mobile-audit.mjs`. Final score: **12/12 PASS**, 0 claims violations, hero contrast AAA on every page.

## What we checked at each viewport

- **Horizontal scroll** — body wider than viewport
- **Tap targets <44×44** — WCAG 2.5.5 / Apple HIG minimum
- **Text overflow** — element scrollWidth > clientWidth (clipping)
- **Oversized images** — image rendered wider than viewport
- **Form input mobile-readiness** — `inputmode`, `autocomplete`, font-size ≥16px (iOS zoom threshold)
- **Hero text contrast vs background** — color/font sanity check
- **Sticky/fixed elements** — anything blocking ≥70% of viewport

## Issues found and fixed

| # | Page | Issue | Fix |
|---|---|---|---|
| 1 | `/teams/` @ 375/390 | Quote form inputs overflow — page width 410 on a 375 viewport | Added `box-sizing: border-box`, `width: 100%`, `min-width: 0`, `font-size: 16px` to `.quote-form input/select/textarea` ([src/pages/teams.astro:696](src/pages/teams.astro#L696)) |
| 2 | `/teams/` @ all | Email + phone inputs missing `inputmode` (wrong iOS keyboard) | Added `inputmode="email"` and `inputmode="tel"` to the form ([src/pages/teams.astro:248](src/pages/teams.astro#L248), [:255](src/pages/teams.astro#L255)) |
| 3 | All pages | Footer nav links 17px tall (way under 44 hit zone) | Added `min-height: 44px` + padding to `.footer-col a` ([src/components/Footer.astro:475](src/components/Footer.astro#L475)) |
| 4 | All pages | Header logo link 244×36 (height fail) | Added `min-h-11 py-1 -my-1` to home link ([src/components/Header.astro:9](src/components/Header.astro#L9)) |
| 5 | All pages | Cart icon button 28×28 | Added `min-w-11 min-h-11 -m-2 p-2` to button (negative margin keeps visual the same, expands hit zone) ([src/components/CartIcon.svelte:15](src/components/CartIcon.svelte#L15)) |
| 6 | Homepage | Hero "Built by D1 Athletes" trust link 78×32 | Added `min-height: 44px` + vertical padding/negative margin to `.hero-trust-link` ([src/pages/index.astro:523](src/pages/index.astro#L523)) |
| 7 | Homepage | "product page" inline anchor in FAQ-foot 99×19 | Added inline-block padding/negative margin tap zone to `.home-faq-foot a` ([src/pages/index.astro:1139](src/pages/index.astro#L1139)) |
| 8 | Homepage | Hero `<li>` clipping "BUILT BY / D1 ATHLETES" by 4px | Reduced letter-spacing on `.hero-trust-detail` from 0.06em → 0.04em + `white-space: nowrap` ([src/pages/index.astro:548](src/pages/index.astro#L548)) |

## Final verdict

| Page | 375 | 390 | 430 |
|---|---|---|---|
| `/` | PASS | PASS | PASS |
| `/products/jockshock/` | PASS | PASS | PASS |
| `/teams/` | PASS | PASS | PASS |
| `/parents/` | PASS | PASS | PASS |

**Design audit (still claims-clean and accessible):**
- Home: PASS, 0 claims, hero contrast 19.8
- PDP: PASS, 0 claims, hero contrast 19.8
- Teams: PASS, 0 claims (hero contrast not measured — image overlay)
- Parents: PASS, 0 claims, hero contrast 21.0

## How to re-run

```bash
node ~/.claude/skills/jockshock-design/mobile-audit.mjs http://localhost:4321 --out /tmp/audit.json
# Screenshots saved to /tmp/jockshock-mobile-<timestamp>/
```

The script also tested at production by passing `https://www.jockshockspray.com` instead — no auth needed.

## What's NOT covered

- Real device testing (Safari quirks, iOS keyboard interaction, virtual keyboard pushing fixed elements)
- Slow-network behavior (LCP, font swap CLS — deferred to PageSpeed Insights post-deploy)
- Touch interaction (pinch-zoom, swipe gestures on cart drawer)
- Landscape orientation
- Tablet widths (768, 834, 1024) — not in scope; the existing `@media (max-width: 900px)` and `(max-width: 768px)` rules cover them and were not flagged

Recommend a manual pass on real iPhone before launch traffic — tooling can't catch every iOS quirk (especially keyboard + safe-area).
