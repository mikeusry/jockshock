# JockShock NIL Program — Working Docs

This directory holds the working artifacts for JockShock's college-athlete NIL endorsement program. Targeting ~$15K Year 1 across one anchor athlete + 2-3 micros, sourced through direct personal relationships (no agencies — see [project_nil_direct_relationships.md](../../.claude/projects/-Users-mikeusry-CODING-JockShock/memory/project_nil_direct_relationships.md)).

## Files

| # | File | Purpose | Audience |
|---|---|---|---|
| 01 | [pitch-one-pager.md](01-pitch-one-pager.md) | Single-page partnership offer to hand the athlete | External — what Elena reads |
| 02 | [contract-template.md](02-contract-template.md) | Full NIL endorsement agreement template | External — what counsel reviews and the athlete signs |
| 03 | [measurement-and-operations.md](03-measurement-and-operations.md) | Internal playbook: setup, attribution, monthly reporting, evaluation | Internal — never share with athletes |

## Strategy ground truth

Decisions backing these artifacts trace to:

- [project_launch_strategy.md](../../.claude/projects/-Users-mikeusry-CODING-JockShock/memory/project_launch_strategy.md) — six load-bearing decisions for JockShock launch
- [project_nil_direct_relationships.md](../../.claude/projects/-Users-mikeusry-CODING-JockShock/memory/project_nil_direct_relationships.md) — direct relationships, no agencies, paper still required
- [docs/research/2026-05-perplexity-nil-endorser.md](../research/2026-05-perplexity-nil-endorser.md) — Perplexity NIL research (sport-archetype ranking, hybrid structure recommendation, brand-safety checklist)
- [project_d1_claim_risk.md](../../.claude/projects/-Users-mikeusry-CODING-JockShock/memory/project_d1_claim_risk.md) — "Built by D1 Athletes" framing (founders Mike, Karen, Joseph)

## Default deal structure (for the first deal)

| Term | Value |
|---|---|
| Length | 5 months (one season) with mutual renewal option |
| Base | $8,000 paid in 5 monthly installments of $1,600 |
| Performance | $4 per first-time order via athlete's code/URL, capped at $4,000 |
| Maximum total | $12,000 |
| Deliverables | 6/month (2 IG posts + 1 TikTok + 1 long-form + 1 in-person + 1 launch drop in month 1) |
| Approval window | 48 hours, brand reviews before publish |
| Exclusivity | Competing-product brands only, plus 30-day post-term carryover |
| Exit | 30 days without cause, immediate for material breach or conduct |

These defaults can shift per athlete. Adjust at deal-by-deal level — don't relitigate the framework.

## Who reads these and when

**Pitch one-pager (01):** Mike hands this to the athlete in person or sends a PDF before a call. Designed to read in under 5 minutes.

**Contract (02):** Goes to Southland Organics counsel for review the week we're targeting a specific athlete. Don't send a contract before counsel signs off on the variables. Then to the athlete with their representative (if any) for review. Counter-sign after their school NIL compliance office has approved.

**Operations playbook (03):** Whoever is running the deal day-to-day reads this before the athlete posts anything. Walk the verification checklist before Day 1 of the Term. Re-read the "When to walk away" section any time we're tempted to bend a rule.

## Open work before the first deal can sign

Tracked in the Tier 3 launch plan in conversation history. Not blockers for the contract template existing, but blockers for the deal being measurable:

- Cloudflare Workers KV logging on `/go/<slug>` for click-counting (not yet built)
- Per-athlete monthly attribution-report query in Nexus admin (manual SQL for now)
- Discount-code → utm_campaign fallback mapping in Klaviyo
- Behavior-reinforcement Klaviyo flow with athlete-attribution personalization (T3.1)

The deal can sign before all four are operational; the first monthly report can't go out until they are.
