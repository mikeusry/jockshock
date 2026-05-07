# JockShock SEO Keyword Strategy

> **Status:** Drafted 2026-05-07. **Updated 2026-05-06** with DataForSEO validation findings and the brand-widening decision. Original v1 strategy synthesized from live Google SERP research + competitor pricing memory + brand brief, without DFS volume data. v2 incorporates DFS data (`docs/research/2026-05-06-dataforseo-keyword-validation.md`) and the 2026-05-06 brand-widening decision (athletic + athletic-adjacent gear AND shoes).

> **Brand framing (locked 2026-05-06):** JockShock is "athletic and athletic-adjacent gear and shoes." Single brand, single SKU line. See `project_brand_widening_athletic_adjacent.md`. The widening is the strategic context for the v2 changes throughout this doc.

> **Hard rule:** Zero kill claims, zero EPA references, zero "disinfectant / sanitizer / antimicrobial / 24-hour / hospital-grade / HOCl / hypochlorous acid" language anywhere on-site. JockShock is a **deodorizer**. Search terms in this doc that contain forbidden language are flagged (do not use; ranked here only to surface intent we cannot serve, or to design content that out-flanks competitors who can't avoid those terms).

---

## TL;DR — what we're targeting

| Tier | Term | Intent | Why |
|---|---|---|---|
| **Primary (homepage + PDP)** | **Equipment deodorizer** | Commercial / category | Owns the category. Crowded but no premium player wins. Whitespace. |
| **Primary 2 (PDP + brand)** | **Pro-grade gear deodorizer** | Commercial / problem-aware | "Pro-grade" intent is split tactical-vs-athletic. No brand owns athletic side. We do. |
| **Primary 3 (PDP variant)** | **32oz gear spray for athletes** | Commercial / format-specific | Format-specific buyers searching by ounce/bottle size — competitors are 8oz/16oz, our 32oz is differentiated. |
| **Wedge — flagship content** | **How to clean a smelly mouthguard** | Informational / problem-aware | Owned entirely by dental clinics. ZERO sports brand presence. Highest-leverage gap in the entire SERP set. |
| **Wedge — content hub** | **How to clean smelly [sport] gear** (×6 sports) | Informational / DIY | Replicates Clear Gear's sport-hub play but without their claims. Hockey, football, lacrosse, wrestling, MMA, soccer. |
| **B2B** | **Gym equipment cleaning subscription** | Commercial / B2B | No brand owns "subscription program for facilities" content angle. Fred's gym-channel program. |

---

## Why these picks

### Strategic constraints that shaped the picks

1. **No Amazon** — so any keyword where SERP is dominated by Amazon listings is a hard fight. We're targeting intent that lands on our DTC site or our content, not on a marketplace.
2. **No claims** — eliminates ~60% of obvious gear-care queries (anything ending in "spray that kills bacteria," "gear sanitizer," "disinfectant for football pads," etc.). Every direct competitor relies on those terms; we can't.
3. **Premium positioning** — value-per-oz queries actively undermine our brand. We don't pursue them.
4. **Heavy-use behavior change is the load-bearing mechanism** — our content needs to teach the routine, not just sell the bottle. SEO that supports "teach the routine" is doubly valuable.

### What the SERPs actually look like (research-backed)

Three things repeated across every SERP we pulled:

- **Commercial queries are Amazon-dominated and crowded.** Direct fights for "equipment deodorizer" or "sports odor spray" require either a paid moat (Amazon) or content authority. We're choosing content authority.
- **Informational queries are owned by content farms, dental clinics, and forums.** Brand DTCs barely show. This is JockShock's wedge.
- **Every dominant competitor leans on EPA / disinfectant / kill claims.** That's a vulnerability — Google is increasingly skeptical of unsubstantiated health claims, and a deodorizer-first brand can rank against them by being clean about what the product actually does.

---

## Tier 1 — Commercial keywords (own these on PDP + homepage)

These are direct buy-intent queries. Goal: rank top 10 in 6–9 months for the brand pages.

| Term | Page | Reason |
|---|---|---|
| **equipment deodorizer** | Homepage H1 / title | Category-owning term. "Built for gear, not for the kitchen." |
| **gear deodorizer spray** | Homepage / PDP | Long-tail synonym. |
| **sports gear deodorizer** | PDP | Crowded but uncontested by premium brands. |
| **pro-grade gear deodorizer** | PDP secondary | Brand-aligned phrase, low competition for athletic side. |
| **32oz gear spray** | PDP variant page | Format-specific. Most competitors don't sell 32oz. |
| **athletic gear deodorizer made in usa** | About / PDP | Long-tail with high commercial intent. We have the proof. |

### How to deploy

- **Homepage `<title>`:** Already strong: *"JockShock — Pro-Grade Equipment Deodorizer for Serious Athletes"*. Keep.
- **Homepage H1:** *"Built for the locker room. Not for the laundry room."* — this is a brand line, not an SEO line. Add a Tier-1-keyword paragraph above the fold, e.g. an eyebrow + a single supporting sentence:
    > **Pro-Grade Equipment Deodorizer · 32oz · Made in USA**
    > Engineered for athletic gear. Powered by ZeroPoint Technology.
- **PDP `<title>`:** Already strong: *"JockShock — Pro-Grade Equipment Deodorizer"*. Keep.
- **Meta descriptions** (homepage + PDP): include "equipment deodorizer," "32oz," "ZeroPoint Technology," "made in USA" — naturally, not stuffed.

---

## Tier 2 — Wedge content (the long-game flywheel)

These are informational queries where competitors are weak or absent. Each becomes its own SEO landing page on `/learn/<slug>/` or similar. **This is where most of the SEO value will come from over months 2–12.**

### The mouthguard play (priority #1)

**Page:** `/learn/how-to-clean-a-mouthguard-and-keep-it-from-stinking/`
**Target:** "how to get smell out of mouthguard" + "how to clean mouthguard" + "smelly mouthguard"
**Why this is the highest-leverage page in the entire strategy:** dental clinics own this SERP and they recommend dishwashers / vinegar / replacement. Zero athletic brands have a presence. We have a 32oz spray that's safe on mouthguards and skin — we own this answer the moment we publish.
**Voice:** Aaron, with a "this is what your dentist won't tell you" angle.
**JSON-LD:** `Article` + `FAQPage` (PAA: "Why does my mouthguard smell?", "Can I put a mouthguard in the dishwasher?", "How often should I replace a mouthguard?")
**Internal link:** to PDP.

### The sport hubs (priority #2 — content series)

One page per sport. Each is a 1,500–2,500-word how-to that covers *the routine* (the load-bearing strategic mechanism) for that sport's specific gear.

| Page | Slug | Target query | Notes |
|---|---|---|---|
| Hockey | `/learn/clean-smelly-hockey-gear/` | "how to clean smelly hockey gear" | Highest-volume sport-specific SERP. Clear Gear ranks here. |
| Football | `/learn/clean-football-pads/` | "how to clean football pads" / "best spray for stinky football pads" | Matguard owns this with pro-team social proof — we counter with D1 athlete proof + the routine. |
| Lacrosse | `/learn/clean-lacrosse-gear/` | "how to clean lacrosse gloves" | Mike's research suggests lacrosse parents are high-AOV — make it a featured hub. |
| Wrestling | `/learn/clean-wrestling-gear-and-headgear/` | "how to clean wrestling headgear" | Skin-contact angle plays well here. |
| MMA / BJJ | `/learn/clean-bjj-gi-and-mouthguard/` | "how to clean a smelly gi" | Adjacent; MMA gym channel matters for B2B. |
| Soccer / cleats | `/learn/get-smell-out-of-soccer-cleats/` | "how to get smell out of cleats" | High-volume, parent-driven query. |

### The "gear bag" pages

**Page 1:** `/learn/gear-bag-smells-like-death/`
**Target:** "gear bag smells like death" / "gym bag smells like" / "gear bag funk"
**Why:** Forum threads + content farms own this. Outside Online has a thin piece. We can write the definitive guide in our voice. High emotional resonance — these are problem-aware buyers.

**Page 2:** `/learn/why-gear-stinks-and-how-to-stop-it-permanently/`
**Target:** mid-funnel "why does gear smell" / "what makes pads smell"
**Why:** Sets up the routine + premise for the product without selling it. Trust-building.

### The B2B page

**Page:** `/learn/gym-equipment-cleaning-program-for-facilities/`
**Target:** "gym equipment cleaning subscription" / "facility cleaning program" / "athletic equipment care for gyms"
**Why:** No brand owns the "subscription program for facilities" angle. This page becomes the SEO landing for Fred's gym-channel program — replaces / reinforces `/teams/`.

---

## Tier 3 — supporting content (publish opportunistically)

Smaller hubs / blog posts that catch long-tail. Each is 500–1,200 words. Write when energy is there; not load-bearing.

- "JockShock vs Clear Gear" comparison (carefully written — no claims, just position + format + price + made-in-USA)
- "JockShock vs Febreze" (deodorizer comparison, no kill claims either way)
- "What is ZeroPoint Technology" (brand education, links to all PDP + sport hubs)
- "Field guide for parents: a year of athletic gear care" (lead-magnet companion, gated)
- "When to replace your gear vs clean it"
- "Travel sports parents: gear care from the back of a minivan"

---

## What we are deliberately NOT pursuing

- **Anything with "EPA-registered," "kills bacteria," "disinfectant," "sanitizer," "hospital-grade," "antimicrobial," "antibacterial," "24-hour," "HOCl," "hypochlorous acid"** — claims compliance. Forbidden everywhere.
- **"Best gear deodorizer" / "best sports spray"** — these SERPs are owned by affiliate sites that won't include us until after launch. Pursue via earned media, not on-site SEO.
- **"Cheap gear spray" / "value gear deodorizer"** — undermines premium positioning.
- **Amazon-style queries** ("equipment deodorizer amazon," "[brand] reviews") — we don't sell on Amazon, ever.
- **Athlete's foot / staph / MRSA / wound-care** queries — adjacent but unsafe to claim against.

---

## On-page implementation checklist

For every new content page (Tier 2 + Tier 3):

- [ ] Single H1 matches the user's query phrasing
- [ ] First paragraph answers the question in ≤80 words (featured snippet bait)
- [ ] PAA-style FAQ block at the bottom with 5–7 Q&A pairs
- [ ] FAQPage JSON-LD on every page that has the FAQ block
- [ ] Article JSON-LD with author = "JockShock" / publisher = Organization @id
- [ ] Internal link to PDP **and** to the most-related sport hub
- [ ] Internal link from at least one other hub back to this one (so they form a graph, not a tree)
- [ ] Lead-magnet form (Field Guide PDF) inserted at ~60% scroll depth, not top
- [ ] Hero image: real product or real gear (Cloudinary, w_1200, dpr_auto, alt text describes the actual scene, not the brand)
- [ ] No claims violations (run through the playwright-audit forbidden-phrase list before publish)

---

## Execution sequencing (what to write first)

| Order | Page | Why first |
|---|---|---|
| 1 | Mouthguard cleaning hub | Largest SERP gap, highest publishable-immediately leverage |
| 2 | Hockey gear cleaning hub | Largest sport-specific SERP, Clear Gear has direct presence (validates demand) |
| 3 | Football pads cleaning hub | Mid-spring through fall, highest-traffic sport |
| 4 | "Gear bag smells like death" hub | Emotional, viral-shareable on social |
| 5 | Gym equipment cleaning subscription page | B2B SEO — supports gym channel sales |
| 6 | Lacrosse gear cleaning | High-AOV parent buyer |
| 7+ | Remaining sport hubs (wrestling / BJJ / soccer) | Long-tail catch-up after the leverage pages publish |

Realistic cadence: 1 hub per 2 weeks if Mike or Fred drafts; 1 per week if a writer is involved.

---

## Validation — what to check in DataForSEO

Before committing to the long-tail content hubs (months 2–6), verify with DataForSEO:

1. Pull volume + KD (keyword difficulty) for each Tier 1 term to confirm priority.
2. Pull top-ranking pages for each Tier 2 hub query — confirm SERP shape matches the research above.
3. Pull the "Top 10 keywords" report on `cleargear.com`, `vaporfresh.com`, `medi-dyne.com` (2Toms section), and `matguardusa.com` — see what they actually rank for. Pick the gaps.
4. Run "Content Gap" between `cleargear.com` + `jockshockspray.com` once we're indexed — see queries Clear Gear ranks for that we don't.

If volume on the mouthguard query is low (under 500/mo), the PAGE still wins — it's a wedge that converts because anyone searching it has a real problem and zero athletic brand is answering them. Volume isn't the only metric.

---

## Tracking

For every page in the strategy, set up:

- GSC site-property and verify (`https://www.jockshockspray.com`)
- Submit sitemap (`/sitemap.xml`) — already exists, just submit
- Track impressions + position weekly for primary terms
- Track form-submit rate from each content page → lead-magnet
- Track PDP click-throughs from each content page

Stop publishing in any direction that's not converting impressions into either form-fills or PDP clicks within 90 days.

---

## Open questions

- Do we need an in-house writer / part-time content lead? At 1 hub per 2 weeks, this is meaningful work for 6 months.
- Should the Field Guide PDF and the on-site sport hubs be the same content (re-purposed) or different? Recommended: PDF is the *general routine*, hubs are *sport-specific applications* of the routine. Different but linked.
- Mouthguard hub — should it carry a "made in USA" / dental-safety angle to address the dental-clinic SERP competition? Recommended: yes, in the meta description and an FAQ entry, not the H1.
