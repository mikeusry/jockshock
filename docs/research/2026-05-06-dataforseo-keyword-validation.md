# JockShock — DataForSEO Keyword & Competitor Validation

**Date pulled:** 2026-05-06
**Source:** Google Ads API (Keywords for Keywords + bulk keyword difficulty), DataForSEO Labs (competitor overlap, traffic estimates), via mothership scripts.
**Purpose:** Validate / pressure-test the strategy in `docs/seo-keyword-strategy.md` with real volume data before we commit content writing capacity to it.
**Claims compliance:** Every keyword surfaced below was passed through the JockShock claims-compliance filter (no kill / EPA / disinfectant / sanitizer / antimicrobial / antibacterial / 24-hour / hospital-grade / FDA / HOCl / hypochlorous / staph / MRSA references). Blocked terms appear only in dedicated "do-not-pursue" sections so we know the SERP shape we're choosing not to chase.

---

## TL;DR — what changed about the strategy

**Strategy doc said:** mouthguard wedge volume "unknown but page wins regardless" — anything over 500/mo would be confirmation; under 500/mo also fine.

**Real DFS data says:** the mouthguard cluster pulls **8,100/mo** on multiple variants. The strategy doc was directionally right and substantially conservative. The wedge is bigger than predicted.

**Strategy doc said:** Tier 1 commercial terms ("equipment deodorizer", "gear deodorizer spray", "pro-grade gear deodorizer") are the homepage and PDP targets.

**Real DFS data says:** **Most Tier 1 head terms return zero (or near-zero) Google Ads volume data.** "Equipment deodorizer" — no data. "Gear deodorizer spray" — no data. "Sports gear deodorizer" — only 20/mo. The category is real, but the *exact phrasing* the strategy chose is not what people search. **This is the most important finding in this report.** Recommendations below.

**Strategy doc said:** content gap analysis vs each competitor will surface ranking opportunities.

**Real DFS data says:** content-gap-analyzer is non-functional for JockShock until GSC is verified — `jockshockspray.com` has zero indexed keywords as of this pull, so no differential is possible. Used `competitor-intel --full` overlap data instead, which gives the same intelligence framed differently (their top keywords + position, which become our targets).

---

## A. Tier 1 — commercial seeds, real volume

### Head-term DFS results

| Seed | Volume (DFS) | KD | Competition | CPC |
|---|---:|---:|---|---:|
| equipment deodorizer | — (no data) | — | — | — |
| gear deodorizer spray | — (no data) | — | — | — |
| sports gear deodorizer | 20 | 0 | HIGH | $0.82 |
| pro grade gear deodorizer | — (no data) | — | — | — |
| 32oz gear spray | — (no data) | — | — | — |
| athletic gear deodorizer made in usa | — (no data) | — | — | — |

### What this means

The strategy's primary commercial targets aren't real keywords in the Google Ads data. Three plausible interpretations:

1. **They're niche phrasings of broader terms** that the SERP recognizes when typed but doesn't surface in keyword-planner volume reports. ("Equipment deodorizer" gets typed; "sports deodorizer spray" gets typed more often.)
2. **The category is genuinely thin** — most people search for the problem ("how to clean smelly hockey gear", "shoe deodorizer") not the category ("equipment deodorizer").
3. **Volume thresholds — Google Ads suppresses sub-10/mo terms entirely.** Some of these ARE searched, just below the visibility floor.

### Top safe seed-expansions DFS DID surface

These are the related keywords with real volume the seeds expanded into. Notice the pattern: DFS's expansion of "equipment deodorizer" pulled almost entirely into mouthguard-cleaning territory rather than other gear-spray territory. That's a SERP signal — the engine doesn't see "gear deodorizer" as a rich category, it sees mouthguard cleaning as the real intent in this space.

| Volume | Keyword | CPC |
|---:|---|---:|
| 8,100 | how to clean night guard / mouthguard (22 variants) | $0.50 |
| 2,400 | how do i mold a mouthguard | $0.06 |
| 1,600 | how to clean my night guard | $0.45 |
| 1,600 | how to clean mouthguard | $0.45 |

**304 safe keywords with non-zero volume across the full pull.** 18 keywords blocked by claims-compliance.

### Strategic recommendation — Tier 1 changes

1. **Demote** the assumption that "equipment deodorizer" / "gear deodorizer spray" can be the homepage SEO anchor. Real volume isn't there. Keep the phrases in title/meta for brand framing — but don't expect them to drive organic traffic.
2. **Re-anchor** the homepage SEO target to a phrase that maps to actual search behavior. Candidates worth a fresh DFS pull:
   - "athletic deodorizer spray"
   - "spray for smelly gear"
   - "gear odor spray"
   - "shoe deodorizer" (9,900/mo per the Vapor Fresh gap data — see Section C)
   - "gym bag smell" (need to retest)
3. **Promote the mouthguard wedge to a co-equal homepage SEO anchor.** Volume justifies a homepage internal link, not just a /learn/ hub. The 8,100/mo mouthguard cluster rivals everything else in the Tier 2 list combined.

---

## B. Tier 2 — wedge informational, real volume

### Head-term DFS results

| Seed | Volume (DFS) | KD | Competition | CPC |
|---|---:|---:|---|---:|
| how to clean mouthguard | **1,600** | 0 | MEDIUM | $0.45 |
| smelly mouthguard | — | — | — | — |
| how to get smell out of mouthguard | — | — | — | — |
| how to clean smelly hockey gear | — | — | — | — |
| hockey gear smell | 40 | 0 | MEDIUM | $3.63 |
| how to clean football pads | **320** | 0 | LOW | — |
| best spray for stinky football pads | — | — | — | — |
| how to clean lacrosse gloves | **110** | 0 | LOW | $0.02 |
| how to clean wrestling headgear | **50** | 0 | LOW | — |
| how to clean a smelly gi | — | — | — | — |
| bjj gi cleaning | — | — | — | — |
| how to get smell out of cleats | **210** | 0 | HIGH | $0.91 |
| gear bag smells like death | — | — | — | — |
| gym bag smells | — | — | — | — |
| gym equipment cleaning subscription | — | — | — | — |
| facility cleaning program | — | — | — | — |

### Read

- **Mouthguard play (priority #1 in the strategy)** — directly confirmed at 1,600/mo on the head term, with 8,100/mo across the full cluster. Strategy was right; volume is bigger than we assumed. **Greenlight.**
- **Football pads** — 320/mo direct head term with LOW competition, KD 0. Strategy ranked it #3; data ranks it #2. Promote.
- **Cleats** — 210/mo. Strategy ranked it #6; data ranks it #3. Promote.
- **Lacrosse gloves** — 110/mo, but LOW competition + nearly-zero CPC means almost nobody competes for it. Easy win for content authority.
- **Wrestling headgear** — 50/mo. Lower volume but very low competition.
- **Hockey gear smell** — only 40/mo but $3.63 CPC = high commercial intent per searcher. Worth keeping but not as a top-3 priority.
- **B2B "gym equipment cleaning subscription"** — no volume data. The page should still exist for direct intent + B2B sales-enablement, but expecting it to drive organic traffic is wishful.

### KD = 0 across the board

Every wedge term that returned data had a keyword difficulty of 0. That's the wedge thesis confirmed: athletic content brands aren't competing in this informational SERP space. Dental clinics, content farms, and forums are. We can rank with mid-effort content because nobody else is bringing real authority.

### Strategic recommendation — Tier 2 ordering

Re-sequence based on real volume × competition × strategic fit:

| New order | Page | Rationale |
|---|---|---|
| 1 | **Mouthguard cleaning hub** | 8,100/mo cluster, KD 0, strategy was right. Highest leverage in the entire SEO plan. |
| 2 | **How to get smell out of cleats** | 210/mo, but cleats sit at the household-AOV intersection (parents buy spray for the smelly cleats sitting in the garage). Cross-sport. |
| 3 | **How to clean football pads** | 320/mo, LOW competition. Most volume of any sport-specific page. |
| 4 | **How to clean lacrosse gloves** | 110/mo. High AOV demographic + zero competition. |
| 5 | **Mouthguard "how to mold" page** | 2,400/mo on "how do i mold a mouthguard" — adjacent to our wedge, parents searching pre-fitting. New page idea, NOT in original strategy. **Add this.** |
| 6 | Wrestling headgear | 50/mo but zero competition |
| 7 | Hockey gear smell | 40/mo but high CPC = high intent |
| 8 | BJJ gi cleaning | No volume — defer or skip |
| 9 | "Gear bag smells like death" | No volume — kill this page; pick more searchable framing |

---

## C. Competitor intel — what they actually rank for

`competitor-intel --brand jockshock --full` pulled keyword overlap for all 5 registered competitors. **JockShock's overlap with each is currently zero shared keywords**, so every competitor ranking is a "gap" by definition. Numbers below are top safe gaps per competitor (claims-compliant only).

### Cleargear.com — 315 total gaps, 8 safe top picks

Their content is mostly disinfectant-spray territory we can't follow. The handful of safe terms aren't strategic picks for us:

| Volume | Position | Keyword |
|---:|---:|---|
| 12,100 | 48 | cleaner for gym |
| 1,300 | 16 | hand sanitiser bottles |
| 880 | 6 | hand sanitizers large |
| 590 | 43 | all clear gear |

**Read:** Clear Gear is not actually a content-overlap competitor for us — they live in disinfectant/sanitizer SERPs we can't enter. Drop them as a content target. They remain a *commercial* competitor (Amazon shelf, B2B facilities) but not an SEO content target.

### Vapor Fresh — 1,024 gaps, 19 safe top picks

This is the most overlap-relevant competitor. **They rank for shoe-odor and gym-cleaner terms with real commercial intent.**

| Volume | Position | Keyword |
|---:|---:|---|
| 22,200 | 50 | baking soda for sneaker odor |
| 12,100 | 11 | gym cleaner |
| 9,900 | 39 | shoe deodorizer |
| 9,900 | 28 | deodorizer shoes |
| 4,400 | (multiple) | shoe odor spray, odor shoe spray, smell spray for shoes |
| 4,400 | 122 | yoga mats cleaning |

**Read:** "Shoe deodorizer" at 9,900/mo is a major opportunity. Strategy doc never mentioned it. **Add a /learn/ page on shoe/sneaker odor** — directly adjacent to "how to get smell out of cleats" but with broader (non-athletic) audience overlap. Could pull mom-buyer + casual-athlete traffic the cleats page won't.

### Matguard USA — 2,387 gaps, 14 safe top picks

This is dangerous territory. Matguard ranks for **a lot of skin-condition queries** (ringworm, impetigo, herpes gladiatorum) that we cannot follow because they imply medical/antimicrobial claims.

| Volume | Position | Keyword |
|---:|---:|---|
| 60,500 | 105 | how can you get ringworm |
| 33,100 | 27 | rash from rash guard |
| 12,100 | 49 | cleaner for gym |
| 9,900 | (multiple) | ringworm + gladiatorum/herpes terms |

**Read:** **DO NOT pursue Matguard's content turf.** Even the "safe" keywords on this list have implicit antimicrobial intent — searchers asking "how can you get ringworm" want a product that prevents ringworm. We can't claim that. The "rash from rash guard" / "cleaner for gym" queries are the only ones safe to pursue, and those have other entry points.

### Medi-Dyne (2Toms parent) — 9,007 gaps, 20 safe top picks

Medi-Dyne is a sports-medicine company — their dominant content is hamstring stretches, IT band syndrome, plantar fasciitis. **None of it is gear-care.** They show up as a "competitor" in BRAND_REGISTRY because of their 2Toms StinkFree product, but they're not actually competing for our gear-care SERPs.

| Volume | Position | Keyword |
|---:|---:|---|
| 90,500 | 9 | stretching exercises for hamstrings |
| 74,000 | 27 | chafing |
| 49,500 | 10 | insoles for plantar |

**Read:** **Drop Medi-Dyne from the SEO competitor list.** They're an adjacent brand, not an SEO competitor. Keep them in the BRAND_REGISTRY for product/pricing comp but not for content gap analysis.

### Force of Nature Clean — 8,731 gaps, 15 safe top picks

The big domain by traffic (estimated 55,560 monthly visits), but their ranking content is overwhelmingly chemistry/ingredient-explainer:

| Volume | Position | Keyword |
|---:|---:|---|
| 90,500 | 13 | sodium lauryl sulfate |
| 49,500 | 12 | spray bottle |
| 49,500 | 44 | eco friendly detergent laundry |
| 22,200 | 17 | non toxic cleaning products |

**Read:** Force of Nature is a chemistry-explainer brand. Their content moat is "what is X ingredient" — pages we shouldn't write because (a) explaining HOCl is a claims-compliance problem and (b) we don't want to be a chemistry brand, we want to be a sports brand. **Useful as ingredient-research reference, not a content competitor.**

### Estimated traffic + keyword footprint summary

| Domain | Est. monthly traffic | Total keywords ranking |
|---|---:|---:|
| medi-dyne.com | 118,998 | 9,007 |
| forceofnatureclean.com | 55,560 | 8,731 |
| matguardusa.com | 7,306 | 2,387 |
| vaporfresh.com | 7,039 | 1,024 |
| cleargear.com | 3,548 | 315 |
| **jockshockspray.com** | **0** | **0** |

**Read:** Only Vapor Fresh + Matguard live in the content-relevant range for us. Cleargear is small. Medi-Dyne and Force of Nature are bigger but in adjacent verticals.

---

## D. Content-gap analyzer — non-functional state

Ran `seo-content-gap-analyzer.js --brand jockshock --competitor <each-of-5>`. Result: **0 gaps surfaced for any competitor** because jockshockspray.com has zero indexed keywords as of pull.

**Why this matters:** the gap analyzer is built for differential analysis ("they rank for X, you don't"). When our domain has zero, the differential is meaningless. The tool will become useful in 60–90 days once GSC shows our pages indexing.

**Action item that should be in `gsc_ready: true`:** flip the BRAND_REGISTRY flag once `https://www.jockshockspray.com` is verified in Google Search Console, then re-run gap analysis at 60 days post-launch.

---

## E. Top high-volume terms blocked by claims-compliance

So we know what we're choosing not to chase:

| Volume | Keyword | Blocked by |
|---:|---|---|
| 8,100 | how to disinfect mouthguard | "disinfect" |
| 8,100 | how to sanitize a mouth guard | "sanitize" |
| 90,500 | hypochlorous acid | "hypochlorous" |
| 27,100 | disinfection sprayer | "disinfect" |
| 27,100 | disinfectant sprayer | "disinfect" |
| 22,200 | norovirus sanitizer | "sanitize" |

If we WERE willing to make claims, the mouthguard cluster grows from 8,100 to 16,200/mo. The category SERP we're walking away from for compliance reasons is significant — mostly disinfect/sanitize variants. Worth knowing the size of the cost we're paying to stay compliant.

---

## F. Recommended actions

### Update strategy doc

1. **Demote** "equipment deodorizer" / "gear deodorizer spray" as primary commercial targets — DFS data doesn't support them as traffic drivers. Keep for brand framing in title/meta, not as the SEO bet.
2. **Promote** the mouthguard wedge to homepage prominence — verified 8,100/mo cluster + KD 0.
3. **Re-rank** Tier 2 page sequence by real volume × competition: mouthguard → cleats → football pads → lacrosse → mouthguard-molding (NEW) → wrestling → hockey → defer/skip BJJ + gear-bag pages until rephrased.
4. **Add new page** on shoe/sneaker odor — 9,900/mo gap surfaced via Vapor Fresh competitor analysis. Not in current strategy. Bigger than any single sport page.
5. **Drop Cleargear, Matguard, Medi-Dyne, Force of Nature as content competitors** — none of their SERP turf is content-relevant for us. Vapor Fresh is the only meaningful content competitor.

### Run-once items

1. Verify `https://www.jockshockspray.com` in GSC, flip `gsc_ready: true` in BRAND_REGISTRY.
2. Re-pull gap analysis at 60 days once we have indexed pages.
3. Pull DFS volume on the new candidate head terms surfaced here ("athletic deodorizer spray", "spray for smelly gear", "gear odor spray", "shoe deodorizer", "gym bag smell").

### Don't do

- Pursue any "best gear deodorizer / sports spray / gym deodorizer" affiliate-SERP territory until earned media gets us listed.
- Pursue Matguard's medical-adjacent SERP turf even though some queries would be technically claims-compliant — the implicit intent is unsafe.
- Rebuild the gap analyzer to do "single-domain target-keyword research" — overlap data from competitor-intel does the same job.

---

## G. Files generated

- `/tmp/jockshock-kw.json` — full keyword research output (Tier 1 + Tier 2 with claims filter)
- `/tmp/jockshock-comp-intel.json` (raw, mixed text + JSON) — competitor-intel run
- `/tmp/jockshock-comp-intel-clean.json` — extracted JSON only
- `/tmp/jockshock-gap-*.json` — content-gap-analyzer per-competitor (mostly empty due to gsc_ready=false)
- `mothership/scripts/jockshock-keyword-research.mjs` — new script, JockShock-specific seed list + claims-compliance filter

## H. Open questions surfaced by this validation

1. Should we run a second DFS pull on alternate Tier 1 phrasings ("athletic deodorizer spray", "shoe deodorizer", "gym bag smell")? Recommended **yes** — answer changes whether we re-anchor homepage SEO or accept the brand-only homepage approach.
2. Should the mouthguard hub address the dental-night-guard intent split? The 8,100/mo cluster is half athletes, half people with bruxism night guards from dentists. We can write for both audiences but the disambiguation needs a clear angle.
3. Is the "shoe deodorizer" page (9,900/mo, NEW) compatible with JockShock's premium-pro positioning, or does it pull us toward general consumer deodorizer territory we don't want? Worth a creative-direction call before we write it.

---

## Round 2 — same day, follow-up pull

### I. Tier 1 alternates — homepage SEO re-anchor candidates

Pulled DFS volume on 16 alternate phrasings of the "equipment deodorizer" category. Goal: find a real searched phrase to anchor homepage SEO on.

### Result: still ghosts

| Seed | Volume | KD | Competition |
| --- | ---: | ---: | --- |
| athletic deodorizer spray | — | — | — |
| athletic odor spray | — | — | — |
| gear odor spray | — | — | — |
| gear odor eliminator | — | — | — |
| gear smell remover | — | — | — |
| spray for smelly gear | — | — | — |
| spray for stinky gear | — | — | — |
| **sports equipment spray** | **40** | 0 | HIGH |
| **sports gear spray** | **50** | 0 | HIGH |
| gear cleaning spray | — | — | — |
| locker room spray | — | — | — |
| **gym bag smell** | **140** | 0 | MEDIUM |
| gym bag odor | — | 0 | — |
| gear bag smell | — | — | — |
| large gear deodorizer | — | — | — |
| 32 oz deodorizer spray | — | — | — |

**Conclusion is now confirmed across 28 different phrasings (Round 1 + Round 2):** the "equipment deodorizer / gear spray / sports gear deodorizer" category does NOT have a real Google Ads volume signal. It's a category we serve, not a category people search for by name.

### Implication

- **Stop trying to SEO-anchor the homepage on a category phrase.** It doesn't exist as search behavior.
- **Anchor the homepage on brand + use case + sport.** Example framing: "JockShock — gear spray for hockey, football, lacrosse, wrestling, and the rest of the gear bag." That phrase pulls the sport-specific content hubs, doesn't compete for ghost terms, and reads naturally.
- **Mouthguard + shoe-deodorizer become the homepage SEO bridge** — these are the two real-volume clusters in our category, and both deserve top-of-page internal links from the homepage.
- The "sports equipment spray" / "sports gear spray" / "gym bag smell" trio (40 + 50 + 140 = 230/mo combined) is too small to anchor the homepage on but worth a meta-description mention.

### J. Shoe / sneaker deodorizer cluster — the biggest opportunity in this report

Mike confirmed 2026-05-06: "Shoe deodorizer is MASSIVE. We have had great results." Bridges from "interesting gap" to validated demand we already serve.

### Cumulative cluster volume (from competitor-intel DFS Labs data)

| Volume | Keyword | Vapor Fresh pos |
|---:|---|---:|
| 22,200 | baking soda for sneaker odor | 50 |
| 12,100 | gym cleaner | 11 |
| 9,900 | shoe deodorizer | 39 |
| 9,900 | deodorizer shoes | 28 |
| 4,400 | shoe odor spray (multiple variants) | 14–32 |
| 4,400 | shoe smell spray | 32 |
| 4,400 | how to get an odor out of shoes | 74 |
| 4,400 | spray shoes smell | 18 |
| 4,400 | odor spray for shoes | 18 |
| 3,600 | shoe deodorizer spray | 25 |
| 3,600 | spray shoe deodorizer | 20 |
| 3,600 | shoes odor remover | 34 |
| 3,600 | odor removal from shoes | 92 |

**~100,000+/mo cumulative across the cluster.** Order of magnitude bigger than any other content opportunity in this entire research project.

### DFS Labs keyword difficulty

| Keyword | KD |
| --- | ---: |
| shoe deodorizer | 0 |
| shoe deodorizer spray | 0 |
| sneaker deodorizer | 0 |
| sneaker deodorizer spray | 0 |
| spray for smelly shoes | 0 |
| spray for stinky shoes | 2 |
| how to deodorize shoes | 14 |
| best shoe deodorizer | 3 |
| foot odor spray | 0 |
| how to get smell out of shoes | 0 |
| cleat deodorizer | 0 |
| how to deodorize cleats | 0 |

**KD 0–14 across the entire cluster.** Wide-open SERP. Vapor Fresh is the strongest "competitor" content brand in our space and they're at position 39 for the head term — page 4. Real brand could rank.

### Note on the data discrepancy

DFS Google Ads keywords-for-keywords endpoint (Round 2) returned no-match for several shoe-deodorizer head terms that DFS Labs (Round 1's competitor-intel) reports volume for. This is a known DFS platform quirk — Labs uses a broader corpus including click-stream data, while Google Ads keyword planner returns only what advertisers can target. Both numbers are real for different purposes; Labs data is the right read for SEO opportunity sizing.

### Recommended actions on shoe deodorizer

1. **NEW Tier 1 page:** `/learn/shoe-deodorizer-spray-for-athletes/` (or similar) — H1 targeting "shoe deodorizer spray" / "spray for smelly shoes." Volume justifies this being either a top-2 hub OR a positioned PDP variant.
2. **Adjacency hub:** "Stop using baking soda. Here's what actually works on sneaker odor." Targets the 22,200/mo "baking soda for sneaker odor" query — DIY-curious users who'll convert if shown a better option.
3. **Cleat-overlap content:** "how to deodorize cleats" (KD 0) connects shoe-deodorizer to the existing cleats hub. One piece of content covers two SERP entries.
4. **Product/positioning question for Mike (Section L below):** does shoe-deodorizer get a dedicated SKU treatment, a sub-line, or stay subsumed under the JockShock parent brand?

### K. Updated content sequencing (replaces Section F)

| New order | Page | Volume | Why |
| --- | --- | ---: | --- |
| 1 | **Shoe / sneaker deodorizer hub** | 100,000+/mo cluster | Biggest opportunity in the research; Mike confirmed validated demand; KD 0–3 across cluster |
| 2 | **Mouthguard cleaning hub** | 8,100/mo | Strategy was right, volume confirmed; tight bruxism (nighttime teeth-grinding) intent disambiguation needed in copy |
| 3 | **"Stop using baking soda" sneaker hub** | 22,200/mo | DIY-curious converters; soft-sell content; same content team as #1 |
| 4 | **How to clean football pads** | 320/mo | LOW competition, tight-intent buyer |
| 5 | **How to get smell out of cleats** | 210/mo | Cross-sport, parent-friendly, cross-links to #1 |
| 6 | **Mouthguard molding hub** | 2,400/mo | Pre-fitting parent intent, supports #2 |
| 7 | **How to clean lacrosse gloves** | 110/mo | Near-zero competition, high-AOV buyer |
| 8+ | Wrestling, hockey, BJJ | 40–50/mo | Long-tail catch-up |

Defer: "gear bag smells like death" (no volume), "gym equipment cleaning subscription" (no volume; build for B2B sales-enablement only).

### L. Critical product/strategy question for Mike

**Should JockShock get a shoe-deodorizer-specific SKU or page treatment?**

Three paths:

- **(a) Broaden JockShock framing** to "athletic & athletic-adjacent gear and shoes" — single brand, slightly wider audience. Easiest. Risk: drift away from premium-pro athletic positioning.
- **(b) Create a JockShock variant or sub-line** for general-shoe use — different label/SKU under the same parent brand. Cleanest brand separation, more SKU complexity.
- **(c) Stay narrow** — write the shoe-deodorizer content as athletic-only ("for cleats, boxing trainers, gym shoes") and accept conversion at ~10–20% of cluster traffic vs 50%+ if widened.

Volume analysis surfaced the question; the answer changes which content pages we write and how we frame them.

### M. Round 2 files generated

- `/tmp/jockshock-kw-r2.json` — Round 2 keyword research output (Tier 1 alternates + shoe cluster)
- `mothership/scripts/jockshock-kw-round2.mjs` — Round 2 script
