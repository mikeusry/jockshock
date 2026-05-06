<script lang="ts">
  /**
   * The hero "buy zone" of the JockShock PDP.
   * Variant selection + active image + add-to-cart, all client-side so the
   * selected variant updates without a full reload.
   */
  import { addCartItem, isCartUpdating } from "../stores/cart";

  type Variant = {
    id: string;
    sku: string;
    bottleCount: number;
    label: string;
    sublabel: string;
    image: string;
    perBottlePrice: string;
    isFeatured?: boolean;
    savingsLabel?: string;
    price: { amount: string; currencyCode: string };
    available: boolean;
    quantityAvailable?: number | null;
  };

  let { variants, initialSku }: { variants: Variant[]; initialSku: string } = $props();

  let selectedIndex = $state(
    Math.max(0, variants.findIndex((v) => v.sku === initialSku))
  );
  let selected = $derived(variants[selectedIndex] ?? variants[0]);

  function formatPrice(p: { amount: string; currencyCode: string }): string {
    const n = parseFloat(p.amount);
    return Number.isFinite(n)
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: p.currencyCode }).format(n)
      : `$${p.amount}`;
  }

  function handleAdd() {
    if (!selected || !selected.available) return;

    // Fire pixel event before adding so we capture the click intent even
    // if the cart mutation is slow.
    if (typeof window !== "undefined" && (window as any).pdPixel) {
      (window as any).pdPixel.track("add_to_cart", {
        sku: selected.sku,
        variant_id: selected.id,
        price: parseFloat(selected.price.amount),
        bottles: selected.bottleCount,
        sub_brand: "jockshock",
        persona: getStoredPersona(),
      });
    }

    addCartItem({ id: selected.id, quantity: 1 });
  }

  function getStoredPersona(): string {
    if (typeof document === "undefined") return "aaron";
    const match = document.cookie.match(/sl_persona=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    // Default JockShock persona is Aaron when nothing else stamped.
    return "aaron";
  }
</script>

<div class="hero-grid">
  <!-- IMAGE -->
  <div class="hero-image">
    <img src={selected.image} alt="JockShock {selected.label}" loading="eager" />
  </div>

  <!-- BUY ZONE -->
  <div class="hero-buy">
    <p class="eyebrow">Performance Protection for Serious Athletes</p>
    <h1 class="title">JockShock</h1>
    <p class="subhead">
      Pro-grade equipment deodorizer. Built for gear, not for the kitchen.
    </p>

    <!-- Variant cards -->
    <div class="variants" role="radiogroup" aria-label="Choose your pack">
      {#each variants as v, i}
        <button
          type="button"
          class="variant"
          class:selected={i === selectedIndex}
          class:featured={v.isFeatured}
          aria-pressed={i === selectedIndex}
          onclick={() => (selectedIndex = i)}
        >
          {#if v.isFeatured}
            <span class="variant-badge">Most Popular</span>
          {/if}
          <span class="variant-label">{v.label}</span>
          <span class="variant-sublabel">{v.sublabel}</span>
          <span class="variant-price">{formatPrice(v.price)}</span>
          <span class="variant-perbottle">{v.perBottlePrice}</span>
          {#if v.savingsLabel}
            <span class="variant-savings">{v.savingsLabel}</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Add to cart -->
    <button
      type="button"
      class="cta"
      onclick={handleAdd}
      disabled={!selected.available || $isCartUpdating}
    >
      {#if $isCartUpdating}
        Adding…
      {:else if !selected.available}
        Sold out
      {:else}
        Add to bag — {formatPrice(selected.price)}
      {/if}
    </button>

    <ul class="trust-row">
      <li>EPA-registered</li>
      <li>Made in USA</li>
      <li>30-day money-back</li>
    </ul>
  </div>
</div>

<style>
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 80px 5%;
    align-items: center;
    min-height: 90vh;
  }

  .hero-image {
    background: radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 70%);
    border-radius: 8px;
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 4 / 3;
  }
  .hero-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
  }

  .hero-buy {
    color: #f3f4f6;
  }

  .eyebrow {
    color: #facc15;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 700;
    font-size: 0.8125rem;
    margin-bottom: 16px;
  }
  .title {
    font-size: clamp(3rem, 5vw, 4.5rem);
    font-weight: 900;
    color: #fff;
    margin: 0 0 12px;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .subhead {
    font-size: 1.125rem;
    color: #9ca3af;
    margin: 0 0 32px;
    line-height: 1.5;
  }

  /* === Variant cards === */
  .variants {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 24px;
  }
  .variant {
    background: #141414;
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 16px 12px;
    cursor: pointer;
    color: #f3f4f6;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
    position: relative;
    font-family: inherit;
  }
  .variant:hover:not(.selected) {
    border-color: rgba(250, 204, 21, 0.4);
  }
  .variant.selected {
    border-color: #facc15;
    background: #1a1a1a;
  }
  .variant.featured.selected {
    box-shadow: 0 0 0 1px #facc15, 0 8px 24px rgba(250, 204, 21, 0.2);
  }
  .variant-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #facc15;
    color: #0a0a0a;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.625rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .variant-label {
    font-weight: 800;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #fff;
    margin-top: 4px;
  }
  .variant-sublabel {
    color: #9ca3af;
    font-size: 0.75rem;
  }
  .variant-price {
    color: #fff;
    font-size: 1.25rem;
    font-weight: 800;
    margin-top: 4px;
  }
  .variant-perbottle {
    color: #9ca3af;
    font-size: 0.6875rem;
  }
  .variant-savings {
    color: #facc15;
    font-size: 0.6875rem;
    font-weight: 700;
    margin-top: 2px;
  }

  /* === CTA === */
  .cta {
    width: 100%;
    background: #facc15;
    color: #0a0a0a;
    border: none;
    padding: 20px 24px;
    font-size: 1rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 4px;
    transition: transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease;
    font-family: inherit;
  }
  .cta:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(250, 204, 21, 0.35);
  }
  .cta:disabled {
    background: #4b5563;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .trust-row {
    list-style: none;
    padding: 0;
    margin: 24px 0 0;
    display: flex;
    gap: 16px;
    color: #9ca3af;
    font-size: 0.8125rem;
  }
  .trust-row li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .trust-row li::before {
    content: "✓";
    color: #facc15;
    font-weight: 800;
  }

  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 40px 5%;
      min-height: auto;
    }
    .hero-image {
      aspect-ratio: 1;
    }
    .variants {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .variant {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
      padding: 14px 16px;
      text-align: left;
    }
    .variant-label { flex: 0 0 auto; }
    .variant-sublabel { flex: 1; }
    .variant-price { margin-top: 0; margin-left: auto; }
    .variant-perbottle, .variant-savings { width: 100%; }
    .variant-badge {
      top: -8px;
      left: 12px;
      transform: none;
    }
    .trust-row {
      flex-wrap: wrap;
      gap: 12px 16px;
    }
  }
</style>
