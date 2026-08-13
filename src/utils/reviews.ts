/**
 * Published reviews from Nexus. Same corpus as the Southland PDP — JockShock
 * is a Southland Shopify product, and the public API defaults to brand=southland.
 *
 * Fails soft. A Nexus blip must not 500 the buy page.
 *
 * Display policy (Reviews! project): do not present a thin/empty block as a
 * review corpus. The form always renders. The aggregate stars wait for ≥3.
 * Never fabricate a rating for JSON-LD or the buy block.
 */

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  author: string;
  verified: boolean;
  createdAt: string;
  images: Array<{ url: string }>;
  smartQuote: string;
  publicReply: { content: string; author: string } | null;
  reviewType: "review" | "question" | "rating";
}

export interface ReviewAggregate {
  averageRating: number;
  reviewCount: number;
  ratingCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ProductReviewData {
  aggregate: ReviewAggregate;
  reviews: ProductReview[];
  questions: ProductReview[];
}

const DEFAULT_NEXUS_BASE = "https://nexus.southlandorganics.com";
const TIMEOUT_MS = 5000;

/** Show the average / histogram only once there is a real corpus. */
export const JOCKSHOCK_AGGREGATE_FLOOR = 3;

export const EMPTY_AGGREGATE: ReviewAggregate = {
  averageRating: 0,
  reviewCount: 0,
  ratingCount: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function nexusBase(): string {
  return import.meta.env.NEXUS_API_BASE || DEFAULT_NEXUS_BASE;
}

/** `gid://shopify/Product/3827189317730` → `3827189317730` */
export function numericShopifyId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

export async function fetchProductReviews(
  shopifyGid: string,
): Promise<ProductReviewData | null> {
  const productId = numericShopifyId(shopifyGid);

  try {
    const res = await fetch(
      `${nexusBase()}/api/public/reviews?shopify_product_id=${encodeURIComponent(productId)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );

    if (!res.ok) {
      console.error(`[reviews] Nexus responded ${res.status} ${res.statusText}`);
      return null;
    }

    const json: {
      aggregate?: ReviewAggregate;
      reviews?: ProductReview[];
      questions?: ProductReview[];
    } = await res.json();
    if (!json?.aggregate) return null;

    return {
      aggregate: {
        averageRating: json.aggregate.averageRating ?? 0,
        reviewCount: json.aggregate.reviewCount ?? 0,
        ratingCount: json.aggregate.ratingCount ?? 0,
        distribution: {
          1: json.aggregate.distribution?.[1] ?? 0,
          2: json.aggregate.distribution?.[2] ?? 0,
          3: json.aggregate.distribution?.[3] ?? 0,
          4: json.aggregate.distribution?.[4] ?? 0,
          5: json.aggregate.distribution?.[5] ?? 0,
        },
      },
      reviews: json.reviews ?? [],
      questions: json.questions ?? [],
    };
  } catch (err) {
    console.error("[reviews] Fetch failed:", err);
    return null;
  }
}
