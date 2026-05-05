<script lang="ts">
  import { addCartItem, isCartUpdating } from "../stores/cart";

  interface Props {
    variantId: string | null;
    quantity?: number;
    label?: string;
    classList?: string;
  }

  let {
    variantId,
    quantity = 1,
    label = "ADD TO CART",
    classList = "cta-primary",
  }: Props = $props();

  function handleClick() {
    if (!variantId) return;
    addCartItem({ id: variantId, quantity });
  }
</script>

<button
  type="button"
  class={classList}
  disabled={!variantId || $isCartUpdating}
  onclick={handleClick}
>
  {#if !variantId}
    COMING SOON
  {:else if $isCartUpdating}
    ADDING…
  {:else}
    {label}
  {/if}
</button>
