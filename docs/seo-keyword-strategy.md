# JockShock SEO Keyword Strategy

> **Status:** Drafted 2026-05-07. **Updated 2026-05-06** with DataForSEO validation findings and the brand-widening decision. Original v1 strategy synthesized from live Google SERP research + competitor pricing memory + brand brief, without DFS volume data. v2 incorporates DFS data (`docs/research/2026-05-06-dataforseo-keyword-validation.md`) and the 2026-05-06 brand-widening decision (athletic + athletic-adjacent gear AND shoes).

> **Brand framing (locked 2026-05-06):** JockShock is "athletic and athletic-adjacent gear and shoes." Single brand, single SKU line. See `project_brand_widening_athletic_adjacent.md`. The widening is the strategic context for the v2 changes throughout this doc.

> **Hard rule:** Zero kill claims, zero EPA references, zero "disinfectant / sanitizer / antimicrobial / 24-hour / hospital-grade / HOCl / hypochlorous acid" language anywhere on-site. JockShock is a **deodorizer**. Search terms in this doc that contain forbidden language are flagged (do not use; ranked here only to surface intent we cannot serve, or to design content that out-flanks competitors who can't avoid those terms).

---

## TL;DR — what we're targeting (v2, post-DFS)

DFS validation flipped the priorities. Original strategy bet the homepage on category phrases ("equipment deodorizer," "gear deodorizer spray") — DFS confirmed those are ghost terms with zero search volume across 28 phrasings. Real SEO traffic lives in two places we now lead with: **shoe-deodorizer cluster** (~100K/mo, validated demand per Mike) and **mouthguard cleaning** (8,100/mo cluster, KD 0).

| Tier | Term | Intent | Why |
|---|---|---|---|
| **Primary 1 — flagship hub** | **Shoe deodorizer spray** + cluster | Commercial / problem-aware | ~100K/mo cluster volume. Biggest SEO opportunity in the project. KD 0–14 across cluster, Vapor Fresh at pos 39 = wide-open SERP. Mike confirmed Southland has shipped real shoe-deodorizer results — validated demand, not hypothesis. |
| **Primary 2 — flagship content** | **How to clean a mouthguard** | Informational / problem-aware | 8,100/mo cluster. Original strategy was right; DFS confirmed bigger than predicted. Dental clinics own the SERP, no athletic brand presence. Bruxism (nighttime teeth-grinding) intent dominates; copy must disambiguate athletic-mouthguard up front. |
| **Primary 3 — DIY converter** | **Stop using baking soda** sneaker odor | Informational / DIY | 22,200/mo head term. Same content team as #1; converts DIY-curious users by contrast. |
| **Sport hub** | How to clean [football pads / cleats / lacrosse gloves / wrestling headgear] | Informational / DIY | 50–320/mo each. KD 0, LOW competition. Real-volume sport-specific pages now ordered by DFS data, not gut. |
| **Adjacent** | How to mold a mouthguard | Informational / pre-purchase | 2,400/mo. NEW page idea (not in v1). Parents pre-fitting mouthguards — supports the mouthguard hub. |
| **Brand homepage** | (no SEO anchor — see Section "Homepage SEO" below) | — | DFS confirmed "equipment deodorizer / gear spray / sports gear deodorizer" have no Google Ads volume. Homepage anchors on brand + use case + sport, not category phrase. |
| **B2B** | Gym equipment cleaning subscription | Commercial / B2B | No DFS volume. Build for sales-enablement, not organic traffic. Fred's gym channel uses this page; nobody is searching for it. |

**Brand framing (locked 2026-05-06):** "athletic and athletic-adjacent gear and shoes." Captures shoe-deodorizer cluster without sub-line. See `project_brand_widening_athletic_adjacent.md`.

**Demoted from v1:** "equipment deodorizer" / "pro-grade gear deodorizer" / "32oz gear spray" — confirmed ghost terms across 28 DFS pulls. Keep them in title/meta for brand framing only. They are NOT homepage SEO anchors.

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

## Homepage SEO — accept that there's no anchor

DFS validation across 28 phrasings (Round 1 + Round 2) confirmed the "equipment deodorizer / gear spray / sports gear deodorizer / athletic deodorizer" category does NOT have meaningful Google Ads search volume. People don't type the category by name. They type the problem ("smelly hockey gear"), the surface ("shoe deodorizer"), or the sport ("how to clean football pads").

**Strategic implication:** stop trying to make the homepage rank for a category phrase. The homepage's SEO job is brand framing, not organic traffic capture. The traffic capture happens on `/learn/` hubs (Tier 1 + Tier 2 below) that internal-link back to the homepage and PDP.

### How to deploy on the homepage

- **`<title>`:** Already strong: *"JockShock — Pro-Grade Equipment Deodorizer for Serious Athletes"*. Keep — it's brand framing, not a ranking play.
- **H1:** *"Built for the locker room. Not for the laundry room."* — keep. Brand line, not SEO.
- **Body / above-fold paragraph:** can stay narrow ("for serious athletes") OR widen to mention shoes alongside gear. Per the 2026-05-06 brand-widening decision (`project_brand_widening_athletic_adjacent.md`), shoe / sneaker mentions are now native to the brand and can appear naturally in body copy.
- **Meta description:** mention what we ARE in plain language — "pro-grade deodorizer for athletic gear and shoes, made in USA, powered by ZeroPoint Technology." Don't keyword-stuff a phrase nobody searches for.
- **Internal links from homepage to /learn/ hubs:** mouthguard hub + shoe-deodorizer hub get above-the-fold internal links. Those hubs are the SEO bridge — they pull traffic, then funnel back to the homepage and PDP.

### How to deploy on the PDP

- **`<title>`:** Already strong. Keep.
- **Body copy:** can mention shoes / sneakers / cleats explicitly as use cases alongside gear. Not the headline, but in the body. See item 3 of the rollout plan at the bottom of this doc.
- **Schema.org Product:** already in place per the Astro template; no SEO change needed.

---

## Tier 1 — flagship content (ranking + traffic)

These are the two highest-leverage SEO plays in the entire strategy. Both validated by DFS data (`docs/research/2026-05-06-dataforseo-keyword-validation.md`). Both should be among the first 3 content hubs published.

### Tier 1a — Shoe / sneaker deodorizer hub (NEW; biggest opportunity)

**Page:** `/learn/shoe-deodorizer-spray/`
**Target cluster:** "shoe deodorizer," "shoe deodorizer spray," "sneaker deodorizer," "spray for smelly shoes," "spray for stinky shoes," "how to deodorize shoes," "how to get smell out of shoes," "best shoe deodorizer," "foot odor spray," "cleat deodorizer."
**Cluster volume:** ~100,000+/mo cumulative (Vapor Fresh competitor-gap data).
**Difficulty:** KD 0–14 across the cluster. Vapor Fresh, the strongest content competitor in our space, ranks at position 39 for the head term — wide-open SERP.
**Why this is now the priority:** Mike confirmed Southland has shipped real shoe-deodorizer results — validated demand, not hypothesis. Combined with the brand-widening to "athletic and athletic-adjacent gear AND shoes," this isn't a category extension; it's a native-fit content piece.
**Voice:** Aaron-led, written for "athletes and athletic-adjacent" audience — cleats, gym shoes, training shoes, running shoes, kids' sneakers. Don't narrow it to athletes-only.
**JSON-LD:** `Article` + `FAQPage` (PAA: "Why do my running shoes smell?", "Does spraying shoes actually work?", "Will shoe spray damage leather sneakers?", "Can I use this on my kid's cleats?", "What's the best way to dry shoes after spraying?")
**Internal link:** to PDP, to Tier 1b mouthguard hub, to cleats sport hub.
**Cross-link plan:** every sport hub references "and yes, this works on the cleats too — see [shoe deodorizer hub] for more."

### Tier 1b — Mouthguard cleaning hub (validated; was v1 priority #1)

**Page:** `/learn/how-to-clean-a-mouthguard/`
**Target cluster:** "how to clean mouthguard," "how to get smell out of mouthguard," "smelly mouthguard," "how to clean my mouthguard," 22 close variants.
**Cluster volume:** 8,100/mo (DFS confirmed).
**Difficulty:** KD 0. Dental clinics own the SERP, no athletic brand presence.
**Critical disambiguation:** the SERP is **dominantly bruxism intent** (nighttime teeth-grinding, dental retainers from dentists), not athletic mouthguards. Page intro and meta description must clearly position the page for athletes (boxing, football, hockey, lacrosse, wrestling, BJJ) within the first 80 words. Recommend an early "If you're here for a dental night guard…" sub-section that gracefully diverts the bruxism searcher to dental resources, then continues with the athletic-mouthguard answer for the right reader. Counter-intuitive but it improves dwell time and reduces SERP CTR-back.
**Voice:** Aaron, with a "this is what your dentist won't tell you" angle.
**JSON-LD:** `Article` + `FAQPage` (PAA: "Why does my mouthguard smell?", "Can I put a mouthguard in the dishwasher?", "How often should I replace a mouthguard?", "Is it safe to use cleaning spray on a mouthguard?", "What's the difference between a sports mouthguard and a dental night guard?").
**Internal link:** to PDP.

### Tier 1c — "Stop using baking soda" sneaker hub (NEW)

**Page:** `/learn/baking-soda-doesnt-fix-sneaker-odor/` (or similar)
**Target:** "baking soda for sneaker odor" (22,200/mo, head term).
**Why:** DIY-curious users searching for a home remedy. Convert by contrast — show that baking soda absorbs odor temporarily but doesn't address the bacterial source, while JockShock does. Soft-sell, not aggressive.
**Voice:** Aaron, slightly more educational. Not preachy.
**Internal link:** to Tier 1a shoe-deodorizer hub.

---

## Tier 2 — sport hubs (re-ranked by real DFS volume)

One page per sport. Each is a 1,500–2,500-word how-to that covers the routine for that sport's specific gear. **Re-ranked from v1 by DFS-validated volume × competition.**

| Order | Page | Slug | Target query | Notes |
|---|---|---|---|---|
| 1 | Football | `/learn/clean-football-pads/` | "how to clean football pads" | 320/mo, KD 0, LOW comp. Highest sport-specific volume. Matguard owns the SERP with claims-language we can't follow — counter with D1 athlete proof + the routine. |
| 2 | Cleats | `/learn/get-smell-out-of-cleats/` | "how to get smell out of cleats" | 210/mo, KD 0, HIGH comp. Cross-sport (soccer, lacrosse, baseball, football). Parent-driven. Cross-links to Tier 1a shoe-deodorizer hub. |
| 3 | Lacrosse | `/learn/clean-lacrosse-gloves/` | "how to clean lacrosse gloves" | 110/mo, KD 0, LOW comp. High-AOV parent buyer. Near-zero competition makes this an easy win. |
| 4 | Wrestling | `/learn/clean-wrestling-headgear/` | "how to clean wrestling headgear" | 50/mo, KD 0, LOW comp. Skin-contact angle resonates here. |
| 5 | Hockey | `/learn/hockey-gear-smell/` | "hockey gear smell" | 40/mo, KD 0, MEDIUM comp. High CPC ($3.63) signals high commercial intent. |
| 6 | BJJ / MMA | `/learn/clean-bjj-gi/` | "how to clean a smelly gi" | No DFS volume. Defer until first 5 hubs publish; revisit if MMA gym channel B2B activity warrants. |

### Mouthguard-molding adjacency (NEW page idea, supports Tier 1b)

**Page:** `/learn/how-to-mold-a-mouthguard/`
**Target:** "how do i mold a mouthguard" — 2,400/mo, KD 0.
**Why:** parents pre-fitting a kid's mouthguard before the season. Adjacent to Tier 1b but with pre-purchase intent. Page reviews the boil-and-bite process, links to JockShock as the post-fitting routine. Cross-link to Tier 1b for the cleaning side.

### B2B / sales-enablement page

**Page:** `/learn/gym-equipment-cleaning-program-for-facilities/`
**Target:** "gym equipment cleaning subscription" / "facility cleaning program."
**Volume:** No DFS signal — these aren't real searches.
**Build for:** Fred's gym channel sales-enablement, NOT organic traffic. Page exists so Fred can email a link, not so it ranks. Keeps `/teams/` lander narrow + persona-targeted.

### Pages dropped from v1

- ~~`/learn/gear-bag-smells-like-death/`~~ — DFS shows no volume on the head term. Kill or rewrite under a query that searches.
- ~~Dedicated MMA/BJJ hub~~ — no DFS volume on "how to clean a smelly gi" or "bjj gi cleaning." Deferred until other hubs are live and B2B MMA gym data justifies revisiting.

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

## Execution sequencing (v2, post-DFS)

| Order | Page | Why first |
|---|---|---|
| 1 | **Shoe / sneaker deodorizer hub** (Tier 1a) | Biggest SEO opportunity in the project — ~100K/mo cluster, KD 0–14, validated demand. |
| 2 | **Mouthguard cleaning hub** (Tier 1b) | 8,100/mo cluster confirmed, KD 0. Original priority #1, still strong. |
| 3 | **"Stop using baking soda" sneaker hub** (Tier 1c) | 22,200/mo head term. Same content team as #1; soft-sell DIY-curious converters. |
| 4 | Football pads (Tier 2 #1) | 320/mo, LOW competition — highest sport-specific volume. |
| 5 | Cleats (Tier 2 #2) | 210/mo, cross-sport, parent-driven. Cross-links to Tier 1a. |
| 6 | Mouthguard molding (NEW) | 2,400/mo, KD 0. Pre-purchase parent intent, supports Tier 1b. |
| 7 | Lacrosse gloves (Tier 2 #3) | 110/mo, near-zero competition. |
| 8 | Wrestling, hockey (Tier 2 #4–5) | Low volume but specialty audiences. |
| 9 | Gym equipment cleaning subscription | B2B sales-enablement, not organic. Lower priority since DFS shows no real volume. |

Realistic cadence: 1 hub per 2 weeks if Mike or Fred drafts; 1 per week if a writer is involved.

**Demoted from v1 sequencing:**
- "Gear bag smells like death" — DFS shows no volume on the head term. Either kill or rewrite under a query that searches.
- Hockey ranked #2 in v1 — DFS data dropped it to #5 (only 40/mo).
- Standalone BJJ/MMA gi page — defer until other hubs are live.

---

## Validation — DONE

DataForSEO validation completed 2026-05-06. Findings in `docs/research/2026-05-06-dataforseo-keyword-validation.md`. Two rounds of pulls (Tier 1 commercial seeds, Tier 2 wedge informational seeds, Tier 1 alternates, shoe-deodorizer cluster expansion, competitor intel for all 5 registered competitors). This v2 strategy doc reflects what those pulls showed.

**Content-gap analyzer is non-functional until GSC verifies `https://www.jockshockspray.com`** — site has zero indexed keywords today. Re-run gap analysis at 60 days post-launch (after pages have indexed) to identify queries competitors rank for that we still don't.

**SEO competitor list pruned:** Cleargear, Matguard, Medi-Dyne, Force of Nature dropped as content competitors (their SERP territory is disinfect/sanitize/medical/chemistry — none of which we follow). Vapor Fresh remains as the only meaningful content competitor in our space.

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
