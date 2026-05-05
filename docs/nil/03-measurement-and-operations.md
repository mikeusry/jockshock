# JockShock NIL — Measurement & Operations Playbook

> Internal doc. Not for sharing with athletes. Defines exactly how a JockShock NIL deal flows through our systems from "athlete posts" to "we know if it worked." Keeps the deal evaluable instead of vibed.

---

## The full attribution path (one sentence)

Athlete posts content with a vanity URL → URL stamps `utm_campaign=<athlete-slug>` → visitor lands on `/products/jockshock/` → adds to cart → checks out using the athlete's discount code → Shopify webhook fires to Nexus → Nexus tags the order → Klaviyo fires "Placed Order" with the campaign attribution → behavior-reinforcement flow begins → 60-day reorder cohort lands → we calculate per-athlete LTV.

If any step in that chain breaks, the deal becomes vibes. The whole point of this doc is to keep the chain intact.

---

## Per-athlete attribution stack — what we set up before the deal starts

Each new NIL athlete needs **four artifacts** created before their first content goes live. None of these block on the athlete; we set them all up the day the contract is signed.

### 1. Vanity URL slug
**Where:** `southland-platform/apps/astro-content/src/middleware.ts` (handled — see PR #2). The `/go/<slug>` route stamps `utm_source=jockshock-vanity`, `utm_medium=redirect`, `utm_campaign=<slug>`.

**What to do:** No code change per athlete. Just decide the slug and put it on Schedule A of the contract.

**Convention:**
- Lowercase, alphanumeric + hyphens
- Athlete first name only (e.g. `elena`) unless name conflicts force a fuller form (`elena-arenas`)
- Reserve the slug in our internal NIL roster doc the moment the contract is signed — first-come, first-served

### 2. Shopify discount code
**Where:** Shopify admin → Discounts → Create discount.

**Settings:**
- **Method:** Discount code (not automatic)
- **Code:** `[FIRSTNAMECAPS]20` (e.g. `ELENA20`)
- **Type:** Percentage discount, 20% off
- **Applies to:** Specific products → JockShock (all variants)
- **Customer eligibility:** All customers
- **Minimum requirements:** None
- **Usage limits:**
  - Limit number of times this discount can be used in total: leave UNCHECKED (we want unlimited within the campaign)
  - Limit to one use per customer: CHECKED (this is what makes it "first-time order only" for bonus calc)
- **Active dates:** Start date = contract effective date. End date = contract end date + 90 days (matches Section 6.2 of the contract template).
- **Combinations:** Don't allow combining with other discount codes (default).

**After saving:**
- Copy the code to the contract's Schedule A
- Add to the internal NIL roster doc

### 3. UTM-tagged tracking link for Athlete to share

The athlete shouldn't need to remember to add UTMs — the `/go/<slug>` redirect does it for them. So they just share `southlandorganics.com/go/elena` and we get the attribution automatically.

But for Instagram bio links, link-in-bio tools, etc., we generate the **expanded final URL** so they can drop it directly:
```
https://southlandorganics.com/products/jockshock/?utm_source=jockshock-vanity&utm_medium=redirect&utm_campaign=elena
```

Provide both the short form (for mid-roll mentions) and the expanded form (for bio links) in the athlete's onboarding email.

### 4. Klaviyo segment (for behavior-reinforcement flow attribution)

We need to know which buyers came from which athlete so the post-purchase Klaviyo flow can reference the right athlete (e.g., "Thanks for trusting Elena's recommendation. Here's how she uses JockShock between meets.").

**Setup (one-time per athlete):**
- Klaviyo → Audience → Segments → Create segment
- Name: `JockShock NIL — Elena attributed`
- Definition: `Placed Order` event where:
  - Discount code used contains `ELENA20`, OR
  - `utm_campaign` property equals `elena`
- Membership: Within the last 12 months

The `utm_campaign` property gets onto the Klaviyo profile via Nexus's `enrichCustomerProfile()` (already wired per the cross-repo recon). Confirm the order webhook is passing through the campaign — see "Verification checklist" below.

---

## Monthly attribution report — what we send the athlete

**Cadence:** First business day of each month, for the prior calendar month.

**Format:** Plain-text email or PDF (athlete's choice). Single page. No marketing fluff.

**Contents:**

```
JockShock × Elena Arenas — May 2026 Performance Report
─────────────────────────────────────────────────────

CLICKS
  Total /go/elena clicks               1,247
  Unique visitors                      1,083

CONVERSIONS
  First-time orders attributed             34
  Repeat orders from prior buyers          12
  Total orders attributed                  46

REVENUE
  Total attributed revenue           $2,289.54
  First-time order revenue           $1,547.66

YOUR PAYOUT
  Base (5/5 monthly installments)    $1,600.00
  Performance bonus                    $136.00
    (34 first-time orders × $4)
  ────────────────────────────────────────────
  Total May payout                   $1,736.00

CUMULATIVE (TERM TO DATE)
  First-time orders                       102
  Performance bonus paid              $408.00
  Performance bonus remaining       $3,592.00
```

**Source data:**
- Clicks: from Cloudflare worker logs or Vercel Analytics
- Orders: Nexus `orders` table filtered by discount code OR utm_campaign
- Revenue: Nexus `orders.total_amount` summed
- First-time vs. repeat: based on whether `customer_email` had a prior order in `orders`

This report is generated by a one-off Nexus admin tool we still need to build (Tier 3 followup — see "Open infrastructure work" below).

---

## How we evaluate the deal at the end of the Term

At Term end (month 5), we compute three numbers and compare them to a benchmark:

### 1. Per-Athlete CAC
```
Per-Athlete CAC = (Total compensation paid + per-order bonuses paid)
                  ───────────────────────────────────────────────
                  First-time orders attributed
```

**Benchmark:** $32 (our base-case blended CAC from the strategy memo).
**Pass:** Per-athlete CAC ≤ $40 (25% headroom for first NIL deal — they're learning, we're learning).
**Below $25:** Renew aggressively, expand to multi-year.
**Above $50:** Don't renew unless there's a non-attributed reason to keep them (e.g., they generated case-study content we'll use for years).

### 2. 60-day Cohort Repeat Rate
```
60-day repeat rate = First-time buyers (attributed to Athlete)
                     who placed a 2nd order within 60 days
                     ────────────────────────────────────────
                     Total first-time buyers (attributed to Athlete)
```

**Benchmark:** 40% (planning case from strategy memo) — this is the heavy-use behavior change indicator.
**Pass:** ≥ 25% (realistic v1 target).
**Below 15%:** Athlete brought price-sensitive one-time buyers, not buy-into-the-routine fans. Bad signal — reconsider both the athlete and the creative direction.

### 3. Content-Quality Halo (qualitative)
- How much of their content can we repurpose for paid ads?
- How many earned-media mentions did the partnership generate?
- Did their content land with B2B audiences (coaches, equipment managers commenting / DMing)?

This is a vibe-check, not a number, but the question to ask is: "If we got zero direct attribution, would we still wish we'd done this deal?"

---

## What we don't measure (and why)

- **Reach / impressions / engagement on the athlete's posts.** Athletes will report these from their dashboards. Useful for context, useless for ROI. We're paying for first-time buyers, not for views.
- **Brand awareness lift in surveys.** At our scale ($8K-12K deals), the survey instrument costs more than the deal. Lift studies are for $100K+ partnerships.
- **Athlete's follower growth during the term.** Not our business.
- **Sentiment of comments on the athlete's posts.** Pay attention if there's a brand-safety problem; otherwise don't try to optimize it.

---

## Verification checklist — run this BEFORE the athlete posts anything

Before Day 1 of the Term, walk through this checklist with whoever will run the deal day-to-day. Each item is binary — yes or fix it.

- [ ] Athlete's `/go/<slug>` redirect resolves correctly to the JockShock PDP
- [ ] The redirect stamps `utm_campaign=<slug>` (verify by checking the URL after the 302 lands)
- [ ] Athlete's discount code works at Shopify checkout (test with a $0.01 product if possible, or a self-purchase that you refund)
- [ ] When you place a test order with the discount code, Nexus's `orders` table receives the row WITH the discount code captured
- [ ] When you place a test order via the `/go/<slug>` URL (with discount code), the Klaviyo profile property reflects the `utm_campaign`
- [ ] Athlete has registered the deal with their school's NIL compliance office (NIL Go or equivalent) and provided written confirmation
- [ ] Athlete has signed the contract and Southland counsel has counter-signed
- [ ] Athlete has provided W-9 and ACH details
- [ ] First base-pay ACH has cleared
- [ ] Athlete has been onboarded with: their slug, their code, the short URL, the expanded URL, the do/don't list (FTC disclosure, claim guardrails), and your direct phone number for content review

If any of these fail at the start, the deal is broken from day 1 and the only way to fix it is to extend the Term to compensate.

---

## Open infrastructure work to make this fully operational

The following are still TODO and are not blockers for signing the first deal — but they need to be in place before the FIRST monthly report goes out. Tracked in Tier 3 of the holistic launch plan.

1. **Per-athlete attribution report query** in Nexus admin (Tier 3 followup) — currently this is a manual SQL query I'd run; should become a "Generate NIL Report" button that pulls clicks + orders + revenue + bonus calc.
2. **Discount-code → utm_campaign mapping** so Klaviyo segments can fall back to the discount code when an athlete shares the bare code without the vanity URL. Currently we'd need both the code AND the campaign to align — risk of leaks if the athlete just shares "use code ELENA20."
3. **Click-tracking on `/go/<slug>`** — Cloudflare middleware doesn't currently log click counts to a queryable store. Either add a Cloudflare Workers KV log or a per-redirect ping to a Nexus `vanity_clicks` table. Without this, the "clicks" line of the monthly report is empty.
4. **Klaviyo "behavior-reinforcement" flow with athlete-personalized references** (T3.1). The flow exists (ish); the personalization based on attributed athlete doesn't yet.

These are not on the athlete. These are on us.

---

## Pricing math reference (for negotiation flexibility)

Numbers below assume the strategy memo's Year 1 base case ($32 blended CAC, $58 AOV, 40% trained-heavy repeat rate, $128 12-month LTV).

| Per-athlete CAC | Implication |
|---|---|
| $25 | Crushed it. Renew immediately, expand to 12-month deal. |
| $32 | Matched blended CAC. Renew. |
| $40 | Acceptable for first-deal learning. Renew with sharper creative brief. |
| $50 | Marginal. Don't renew unless content-halo is strong. |
| $60+ | Failed against measurement. Don't renew. Use deliverable content as case-study anyway. |

If the athlete asks for more money:
- Don't raise the **base** — that hurts CAC math regardless of performance
- DO raise the **per-order bonus cap** — that pays them only when we win
- DO offer **revenue-share above a threshold** — e.g., "after $20K in attributed revenue, 8% rev share for the rest of the Term." Aligns incentives perfectly.

If we're under-paying for the value the athlete brings, raise it next renewal — don't bid against ourselves mid-term.

---

## When to walk away

Three scenarios where I'd kill a deal before signing, regardless of how much you like the person:

1. **Athlete won't agree to FTC disclosure.** Non-negotiable. Existential FTC risk.
2. **School's compliance office hasn't approved the deal structure.** Non-negotiable. Risk of athlete losing eligibility kills the deal anyway.
3. **Athlete or their representative wants to negotiate exclusivity past 30 days post-term.** That's an agency move, not a friendship move. Walk.

The rest is workshoppable.
