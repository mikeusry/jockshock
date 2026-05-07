# JockShock — Klaviyo Abandon-Cart Flow Blueprint

> **Status:** Drafted 2026-05-07. Code-side instrumentation is shipped; the Klaviyo flow itself is built inside the Klaviyo UI by following this blueprint. Site is wired to fire all the events; the flow just listens.

---

## What's wired in code (already shipped)

| Event in our code | Klaviyo metric name | Trigger |
|---|---|---|
| `viewed_product` | **Viewed Product** | PDP mount (every visit) |
| `added_to_cart` | **Added to Cart** | "Add to cart" button click |
| `viewed_cart` | **Viewed Cart** | First open of cart drawer per cart-id |
| `started_checkout` | **Started Checkout** | Click on Checkout button (drawer) |

All of these route through `/api/cart-event`, which only fires to Klaviyo when the `sl_email` cookie is present (set by lead-magnet form submit, or in the future by any form that captures email).

The point.dog pixel **also** fires the same events (named `view_product`, `add_to_cart`, `view_cart`, `begin_checkout`) for the CDP — these don't need an email and capture anonymous funnel.

In addition, **Klaviyo's native Shopify integration** independently fires:
- `Started Checkout` (when visitor reaches Shopify checkout page and enters email)
- `Placed Order` (when order completes)
- `Ordered Product`, `Fulfilled Order`, etc.

**Important: dedupe.** Our custom `Started Checkout` fires on click of the drawer's Checkout link. The Shopify-native `Started Checkout` fires only when they land on Shopify's checkout page with an email. They're complementary, not duplicates — but the abandon-cart flow needs to gate on Shopify's `Started Checkout` (the canonical one) and use ours as an earlier optional branch.

---

## Recommended flow architecture

### Flow 1: Pre-checkout abandon ("you put it in the cart but didn't even click checkout")

**Trigger:** `Added to Cart` (our metric)
**Entry filters:**
- Profile has email (gated by API)
- Has NOT received `Placed Order` in past 24h
- Has NOT received `Started Checkout` (Shopify metric) in past 1h
- Has NOT been through this flow in past 3 days

**Steps:**
1. Wait 4 hours
2. **Conditional split:** Has profile fired `Placed Order` since trigger?
   - YES → exit
   - NO → continue
3. **Email 1: "Did you forget your gear bag?"** — voice forks by `jockshock_persona`
   - **Aaron variant:** "Looks like you put a [PRODUCT_NAME] in the bag and walked away. The cart's still there. So's the funk."
   - **Pam variant:** "Hey — you got distracted (kids, life, who can blame you). Your JockShock cart is saved. Pick up where you left off."
   - **Carmen variant:** "Building a quote? We can lock in current pricing and put a hold on inventory. Just reply if you need any of the boring stuff (NET-30, MOQ, sport-specific protocol)."
4. Wait 20 hours
5. **Conditional split:** ordered yet?
   - YES → exit
   - NO → **Email 2** (only if 1 wasn't opened, or was opened but didn't click) — soft pitch + Field Guide PDF (lead-with-value, not discount)
6. Exit

**Why no discount in the pre-checkout flow:** at $24.99–$99.99, an unprompted discount conditions discount-shoppers. Save discounts for the lower-funnel post-checkout flow.

### Flow 2: Checkout abandon (canonical — they reached Shopify checkout, didn't pay)

**Trigger:** `Started Checkout` (Klaviyo's native Shopify metric — NOT ours)
**Entry filters:**
- Has NOT placed an order since trigger
- Has NOT been through this flow in past 5 days

**Steps:**
1. Wait 1 hour
2. **Email 1:** "Your JockShock cart is still here." Direct link to `$started_checkout_url` from the event. Persona-forked voice.
3. Wait 22 hours
4. **Conditional split:** ordered?
   - YES → exit
   - NO → **Email 2:** Social proof (founder credentials — D1 athletes, made in Georgia, 30-day no-hassle guarantee). No discount yet.
5. Wait 48 hours
6. **Conditional split:** ordered?
   - YES → exit
   - NO → **Email 3 (final):** Now offer **10% off** with a 24-hour expiry. Persona-forked.
7. Exit

### Flow 3: Browse abandon (low-priority, ship later)

**Trigger:** `Viewed Product` (our metric)
**Entry filters:** has email + hasn't added to cart in 24h + hasn't been through this flow in 7 days
**Steps:** wait 24h → 1 email → exit. Soft, value-driven, no discount.

---

## Persona forking

Every email in Flow 1 + Flow 2 should fork by the `jockshock_persona` profile property:

- `aaron` (default — the athlete) — direct, "your gear, your call" voice
- `pam` (sports parent) — empathetic, "we know your week is chaos" voice
- `carmen` (gym/team buyer) — operational, "lock pricing, hold inventory, ask about NET-30" voice

In Klaviyo: use a **conditional split** on `person.jockshock_persona`. Three branches. Maintain three template variants per email. Default to Aaron if missing.

---

## Smart-sending + caps

- Smart-send: **on** for all flows (avoids hitting same person twice in 16h)
- Daily cap: 1 abandon email per profile per day
- Quiet hours: 9 PM – 8 AM local time

---

## Discount logic

- Flow 1 (pre-checkout): **no discount, ever.** Lead with the field guide / brand story.
- Flow 2 (checkout abandon): **10% off in Email 3 only**, 24-hour expiry, single-use code (`SHOCK10` or per-profile dynamic). Don't email the code if profile already has a non-launch promo applied.
- Flow 3 (browse): **no discount.**

The Field Guide is the asset that does heavy lifting in the early steps — content over discount.

---

## Subject line sketches (persona-forked)

**Flow 2, Email 1 (cart waiting):**
- Aaron: "Your gear bag fix is one click away."
- Pam: "Your JockShock cart is still saved."
- Carmen: "Want us to hold this quote at current pricing?"

**Flow 2, Email 3 (10% off):**
- Aaron: "10% off — only because you've been thinking about it."
- Pam: "10% off your first bottle (yes, even the 6-pack)."
- Carmen: "Final round — 10% off the team pack, 24 hours."

---

## What you need to do in Klaviyo

1. **Confirm Klaviyo↔Shopify integration is on** for the Southland Shopify store.
   - Klaviyo Settings → Integrations → Shopify → check `southland-organics.myshopify.com` is connected and syncing.
   - Confirm `Started Checkout` and `Placed Order` events are flowing in.

2. **Create the JockShock-specific list:** "JockShock — Field Guide Subscribers". Grab the list id, paste into Vercel as `KLAVIYO_LEAD_MAGNET_LIST_ID`.

3. **Confirm a private API key exists** with **Lists** + **Profiles** + **Events** scopes. Paste into Vercel as `KLAVIYO_PRIVATE_API_KEY`. Same key powers `/api/lead-magnet` and `/api/cart-event`.

4. **Build Flow 1 (pre-checkout abandon)** per the architecture above. Easiest to clone Klaviyo's "Abandoned Cart" template flow and replace the trigger metric + filters.

5. **Build Flow 2 (checkout abandon)** using the Shopify-native `Started Checkout` metric. This is the workhorse.

6. **Build Flow 3 (browse abandon)** — optional, ship after Flow 1 + 2 are running.

7. **Skip the welcome flow for now.** Once the Field Guide PDF is hosted, we'll layer that flow on top — triggered by list subscribe — and it'll be persona-forked the same way.

---

## Smoke test plan

After deploy + flows are built:
1. From an incognito browser, fill the footer field-guide form. Verify `sl_email` cookie sets, profile created in Klaviyo with `jockshock_persona=aaron` (or whatever cookie is set).
2. Add a SKU to cart. Check Klaviyo profile for `Added to Cart` event within 30 seconds.
3. Click Checkout from drawer. Check for `Started Checkout` (our metric — fires immediately) AND, after entering email on Shopify, `Started Checkout` (Klaviyo's native Shopify metric).
4. Don't pay. 1 hour later, Flow 2 Email 1 should land.
5. Pay → verify `Placed Order` event arrives + flow exits.

Document the result of step 5 — that's the dedupe edge case.
