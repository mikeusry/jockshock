import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/pages/api/lead-magnet";

const CIO_HOST = "https://track.customer.io/api/v1/customers";
const SHOPIFY_HOST = "https://test-shop.myshopify.com/admin/api/2025-04";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/lead-magnet", () => {
  beforeEach(() => {
    vi.stubEnv("CUSTOMERIO_SITE_ID", "cio-site");
    vi.stubEnv("CUSTOMERIO_TRACK_API_KEY", "cio-track");
    vi.stubEnv("SHOPIFY_SHOP", "test-shop.myshopify.com");
    vi.stubEnv("SHOPIFY_ADMIN_TOKEN", "shopify-admin");
    vi.stubEnv("SENDGRID_API_KEY", "sg-should-not-be-used");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("identifies, tracks field_guide_requested, mints JS- code, and never calls SendGrid", async () => {
    const fetchCalls: { url: string; init?: RequestInit }[] = [];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      fetchCalls.push({ url, init });

      if (url.includes("api.sendgrid.com")) {
        throw new Error("SendGrid must not be called");
      }

      if (url === `${CIO_HOST}/test%40example.com` && init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        if ("jockshock_discount_code" in body) {
          expect(body.jockshock_discount_code).toMatch(/^JS-/);
          return jsonResponse({});
        }
        expect(body).toMatchObject({
          email: "test@example.com",
          sub_brand: "jockshock",
          jockshock_lead_source: "jockshock-footer-field-guide",
          jockshock_lead_magnet: "gear-smell-field-guide",
        });
        return jsonResponse({});
      }

      if (
        url === `${CIO_HOST}/test%40example.com/events` &&
        init?.method === "POST"
      ) {
        const body = JSON.parse(String(init.body));
        expect(body.name).toBe("field_guide_requested");
        expect(body.data.source).toBe("jockshock-footer-field-guide");
        return jsonResponse({});
      }

      if (url === `${SHOPIFY_HOST}/price_rules.json` && init?.method === "POST") {
        return jsonResponse({ price_rule: { id: 9001 } });
      }

      if (
        url === `${SHOPIFY_HOST}/price_rules/9001/discount_codes.json` &&
        init?.method === "POST"
      ) {
        const body = JSON.parse(String(init.body));
        expect(body.discount_code.code).toMatch(/^JS-[A-Z2-9]{8}$/);
        return jsonResponse({ discount_code: { code: body.discount_code.code } });
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? ""}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("http://localhost/api/lead-magnet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        source: "jockshock-footer-field-guide",
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, queued: true, emailed: false });

    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("api.sendgrid.com"),
      expect.anything(),
    );

    const identifyCall = fetchCalls.find((c) => {
      if (c.url !== `${CIO_HOST}/test%40example.com` || c.init?.method !== "PUT") {
        return false;
      }
      const body = JSON.parse(String(c.init.body));
      return "email" in body && !("jockshock_discount_code" in body);
    });
    expect(identifyCall).toBeDefined();

    const trackCall = fetchCalls.find(
      (c) => c.url.endsWith("/events") && c.init?.method === "POST",
    );
    expect(trackCall).toBeDefined();

    const mintWrite = fetchCalls.find((c) => {
      if (c.url !== `${CIO_HOST}/test%40example.com` || c.init?.method !== "PUT") {
        return false;
      }
      const body = JSON.parse(String(c.init.body));
      return "jockshock_discount_code" in body;
    });
    expect(mintWrite).toBeDefined();
  });
});
