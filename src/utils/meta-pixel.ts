/**
 * Southland Meta pixel (2459921147627824) — same pixel as checkout CAPI.
 * PageView is fired from BaseLayout. Do NOT fire Purchase here: checkout is
 * Shopify, and Nexus + the Shopify web pixel already send that event.
 */

export const META_PIXEL_ID = "2459921147627824";

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  const fn = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fn === "function" ? fn : undefined;
}

export function trackMeta(
  event: string,
  data?: Record<string, unknown>,
): void {
  const fn = fbq();
  if (!fn) return;
  if (data) fn("track", event, data);
  else fn("track", event);
}
