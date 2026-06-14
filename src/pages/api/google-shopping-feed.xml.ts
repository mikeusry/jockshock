/**
 * /api/google-shopping-feed.xml — JockShock's own Google Shopping feed.
 *
 * WHY (T-904): JockShock needs its OWN Merchant Center account claimed to
 * jockshockspray.com so its PMax feed links + asset-group final URL all share
 * the jockshockspray.com domain (Google rejects a cross-domain mismatch:
 * "Final url and shopping merchant url does not have the same domain"). The
 * Southland Nexus feed links to southlandorganics.com — wrong brand surface for
 * an athlete buyer. This feed is served FROM jockshockspray.com, links TO
 * jockshockspray.com, and is what the new JockShock MC fetches.
 *
 * The 3 packs are VARIANTS of one Shopify product (handle "jockshock"); each
 * becomes its own offer (id = variant SKU) sharing an item_group_id so GMC
 * groups them. Pulled live from Shopify Storefront — single source of truth,
 * never drifts from the PDP.
 *
 * Claims-clean: deodorizer framing only. No kill-microbe/sanitize/disinfect/
 * antimicrobial/EPA/24-hour/staph/MRSA. "Kill the funk" (odor) is Mike-approved.
 *
 * Point the JockShock Merchant Center scheduled fetch at:
 *   https://www.jockshockspray.com/api/google-shopping-feed.xml
 */
import type { APIRoute } from "astro";
import { config } from "../../utils/config";

const SITE = "https://www.jockshockspray.com";
const PRODUCT_HANDLE = "jockshock";
const BRAND = "JockShock";

// Cloudinary product shots per variant SKU (the feed image_link).
const VARIANT_IMAGES: Record<string, string> = {
  "JOCKSHOCK-32oz":
    "https://res.cloudinary.com/southland-organics/image/upload/c_pad,b_white,w_1200,h_1200,f_auto,q_auto/JockShock/jockshock-32oz-single-2026.png",
  "JOCKSHOCK-3x32oz-Pack":
    "https://res.cloudinary.com/southland-organics/image/upload/c_pad,b_white,w_1200,h_1200,f_auto,q_auto/JockShock/jockshock-3pack-athlete-2026.png",
  "JOCKSHOCK-6x32oz-Pack":
    "https://res.cloudinary.com/southland-organics/image/upload/c_pad,b_white,w_1200,h_1200,f_auto,q_auto/JockShock/jockshock-6pack-team-2026.png",
};

// Shipping weight per pack (lb), filled bottle ≈ 2.25 lb each + packaging.
// GMC flags items missing shipping_weight, so every offer needs one.
const VARIANT_SHIPPING_LB: Record<string, number> = {
  "JOCKSHOCK-32oz": 2.4,
  "JOCKSHOCK-3x32oz-Pack": 7.2,
  "JOCKSHOCK-6x32oz-Pack": 14.2,
};

const VARIANT_DESCRIPTIONS: Record<string, string> = {
  "JOCKSHOCK-32oz":
    "Pro-grade equipment deodorizer — goes after gear funk at the source, not the surface. Cleats, pads, mouthguard, gym bag. 32 oz. No fragrance, no bleach. Built by D1 athletes. Powered by ZeroPoint Technology. Made in USA. 30-day money-back.",
  "JOCKSHOCK-3x32oz-Pack":
    "JockShock Athlete Pack — three 32 oz bottles of pro-grade gear deodorizer. Treat cleats, pads, mouthguard, and gym bag at the source. No fragrance, no bleach. Powered by ZeroPoint Technology. Made in USA. 30-day money-back.",
  "JOCKSHOCK-6x32oz-Pack":
    "JockShock Team Pack — six 32 oz bottles. Built for the whole roster. Pro-grade gear deodorizer that goes after funk at the source. No fragrance, no bleach. Powered by ZeroPoint Technology. Made in USA. 30-day money-back.",
};

interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

const FEED_QUERY = `{
  product(handle: "${PRODUCT_HANDLE}") {
    id
    title
    handle
    featuredImage { url }
    variants(first: 20) {
      nodes { id title sku availableForSale price { amount currencyCode } }
    }
  }
}`;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const { shopifyShop: shop, publicShopifyAccessToken: token, apiVersion } = config;

  let product: {
    id: string;
    title: string;
    handle: string;
    featuredImage: { url: string } | null;
    variants: { nodes: ShopifyVariant[] };
  } | null = null;

  try {
    const res = await fetch(`https://${shop}/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: FEED_QUERY }),
    });
    if (!res.ok) throw new Error(`Shopify ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    product = json.data?.product ?? null;
  } catch (err) {
    return new Response(`Feed generation failed: ${String(err)}`, { status: 500 });
  }

  if (!product) {
    return new Response("JockShock product not found", { status: 404 });
  }

  // item_group_id ties the variant offers together (numeric Shopify product id)
  const itemGroupId = product.id.split("/").pop() || "jockshock";
  const link = `${SITE}/products/${product.handle}/`;

  const items = product.variants.nodes
    .filter((v) => v.sku && VARIANT_IMAGES[v.sku]) // only the 3 known sellable packs
    .map((v) => {
      const sku = v.sku as string;
      const price = `${parseFloat(v.price.amount).toFixed(2)} ${v.price.currencyCode}`;
      const title = `${BRAND} — ${v.title}`;
      const image =
        VARIANT_IMAGES[sku] || product!.featuredImage?.url || "";
      const description = VARIANT_DESCRIPTIONS[sku] || title;
      return [
        `    <item>`,
        `      <g:id>${esc(sku)}</g:id>`,
        `      <g:item_group_id>${esc(itemGroupId)}</g:item_group_id>`,
        `      <g:title>${esc(title)}</g:title>`,
        `      <g:description>${esc(description)}</g:description>`,
        `      <g:link>${esc(link)}?variant=${esc(v.id.split("/").pop() || "")}</g:link>`,
        `      <g:image_link>${esc(image)}</g:image_link>`,
        `      <g:availability>${v.availableForSale ? "in_stock" : "out_of_stock"}</g:availability>`,
        `      <g:price>${esc(price)}</g:price>`,
        `      <g:brand>${esc(BRAND)}</g:brand>`,
        `      <g:condition>new</g:condition>`,
        `      <g:mpn>${esc(sku)}</g:mpn>`,
        `      <g:identifier_exists>no</g:identifier_exists>`,
        `      <g:product_type>Athletic Gear Deodorizer</g:product_type>`,
        // 3049 = Health & Beauty > Personal Care > Foot Care > Foot Odor Removers.
        // The prior value (469 = bare "Health & Beauty") was too broad — Google
        // couldn't place it, fell back to scanning the title, and false-flagged
        // the 6-pack ("Team Pack — 6 Bottles") under a weapons policy. A precise
        // odor-remover category fixes the misclassification.
        `      <g:google_product_category>3049</g:google_product_category>`,
        `      <g:shipping_weight>${esc(((VARIANT_SHIPPING_LB[sku] || 2.4) * 453.592).toFixed(0))} g</g:shipping_weight>`,
        `    </item>`,
      ].join("\n");
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>JockShock Product Feed</title>
    <link>${SITE}</link>
    <description>Google Shopping product feed for JockShock</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
