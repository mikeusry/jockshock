# /learn Hub Imagery — Punch List for Joseph

> **Created 2026-06-09.** Owner: Joseph (creative). Tracked in Nexus.
> **Problem:** all 8 `/learn` articles use the SAME hero image — the product
> bottle (`JockShock/jockshock-32oz-single-2026.png`). The copy is
> context-specific (feet, mouthguard, football pads…) but the imagery is not.
> Need one contextual hero per article.

## Spec for each image

- **Hero slot:** the article template renders the hero at `c_fit,w_700` — supply at least **1400×934** (2× for retina), landscape-ish.
- **Format:** JPG or PNG, upload to Cloudinary under `JockShock/learn/<slug>-hero`.
- **Aesthetic (brand brief §Visual / §Skepticism Triggers):** real gear / real context, matte/athletic, locker-room or field energy. **NOT** stock "model spraying a pristine helmet on white," NOT cleaning-aisle product-on-white, NOT a mom in frame. Aaron should not bounce.
- **Product can appear** in-context (bottle next to the gear), but the *subject* is the gear/situation, not the bottle alone.
- **Claims:** imagery implies deodorizing/gear-care, never medical/sanitizing.

## Per-article shot list

| Article (slug) | Current hero | Needed contextual image |
|---|---|---|
| `shoe-deodorizer-spray` | bottle | Athletic shoes / cleats / sneakers — a gym-shoe pile or cleats by a bag, bottle in frame |
| `smelly-feet-spray` (NEW) | bottle | Cleats/boots being pulled off post-practice; feet+footwear context (no bare-feet close-up that reads medical) |
| `baking-soda-doesnt-fix-sneaker-odor` | bottle | Sneakers with the baking-soda "hack" (open box in a shoe) — contrast framing |
| `get-smell-out-of-cleats` | bottle | Muddy/used cleats — soccer/football/lacrosse/baseball mix |
| `clean-football-pads` | bottle | Football shoulder pads / helmet on a bench or in a locker |
| `clean-lacrosse-gloves` | bottle | Lacrosse gloves + stick, gear-bag context |
| `how-to-clean-a-mouthguard` | bottle | Athletic mouthguard (boil-and-bite, colored) — NOT a clinical dental night-guard, to win the athlete intent |
| `how-to-mold-a-mouthguard` | bottle | Mouthguard being fitted / boil-and-bite process, athletic context |

## Handoff

- Source from existing Cloudinary lifestyle assets first if any fit (e.g. the `beckham*` shots) — otherwise shoot/source new.
- Upload to `JockShock/learn/<slug>-hero`, then either Joseph hands the public IDs back to Mike/Claude to swap into each article's `HERO_*` constant, or whoever's editing the article updates the one-line Cloudinary URL.
- Until contextual images land, the bottle hero stays (acceptable fallback, not ideal).
