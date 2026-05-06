/**
 * Lightweight persona stamping for JockShock.
 *
 * Sets the same cookie name (`sl_persona`) used by southland-platform's
 * persona module so visitors who later land on southlandorganics.com carry
 * the JockShock-stamped persona forward, and vice versa. Domain is set to
 * the apex when possible so cookies share across subdomains.
 *
 * This does NOT replicate southland-platform's full persona model
 * (segmentId, journey stage, etc.) — JockShock's role is just to declare
 * the persona; the rest gets enriched downstream when the visitor hits
 * a southland-platform surface.
 */

const COOKIE_DAYS = 365;
const COOKIE_NAME = "sl_persona";
const SEGMENT_COOKIE = "sl_segment";

type JockShockPersona = "aaron" | "pam" | "carmen";

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  // Strip leading "www." so the cookie shares across subdomains.
  const host = window.location.hostname.replace(/^www\./, "");
  // localhost / IP literal: don't set domain attribute.
  const domainAttr = host && !/^\d+\.\d+\.\d+\.\d+$/.test(host) && host !== "localhost"
    ? `; domain=.${host}`
    : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domainAttr}; SameSite=Lax`;
}

export function setPersona(persona: JockShockPersona): void {
  setCookie(COOKIE_NAME, persona, COOKIE_DAYS);
  setCookie(SEGMENT_COOKIE, "sports", COOKIE_DAYS);

  if (typeof window !== "undefined" && (window as unknown as { pdPixel?: { track: (event: string, props?: Record<string, unknown>) => void } }).pdPixel) {
    (window as unknown as { pdPixel: { track: (event: string, props?: Record<string, unknown>) => void } }).pdPixel.track("persona_stamped", {
      persona,
      segment: "sports",
      sub_brand: "jockshock",
      source: "lander",
    });
  }
}
