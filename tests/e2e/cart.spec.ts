import { test, expect } from '@playwright/test';

test.describe('JockShock cart flow', () => {
  // Each test gets a fresh browser context (Playwright default) so localStorage
  // and cookies are already isolated between tests. We only need to clear
  // storage when a specific test cares about a clean cart.
  async function resetCart(page: import('@playwright/test').Page) {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  test('homepage renders with all 3 buy buttons enabled', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JockShock/);

    // 5 JockShockBuyButton instances on the page (header, hero, how-it-works,
    // 3 pricing cards = 6, but how-it-works is .cta-secondary so 5 .cta-primary
    // total). All should be enabled now that all 3 variants are in stock.
    const enabledBuyButtons = page.locator('button.cta-primary:not([disabled])');
    await expect(enabledBuyButtons.first()).toBeVisible();
    expect(await enabledBuyButtons.count()).toBeGreaterThanOrEqual(3);
  });

  test('clicking Athlete Pack ADD TO CART opens drawer with the right item', async ({ page }) => {
    await page.goto('/');

    // The Athlete Pack pricing card is the .featured one with the 3-bottles
    // variant. Find its ADD TO CART button.
    const athleteCard = page.locator('.pricing-card.featured');
    await expect(athleteCard).toContainText('ATHLETE PACK');
    await expect(athleteCard).toContainText('3 Bottles');

    const addToCart = athleteCard.locator('button.cta-primary', { hasText: /ADD TO CART/i });
    await addToCart.click();

    // Cart drawer should open with the line item
    const drawer = page.getByRole('dialog', { name: /your cart/i });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    // Line item inside the drawer should reference the JockShock product
    await expect(drawer.getByRole('link', { name: /jockshock/i })).toBeVisible();

    // Subtotal inside the drawer should reflect $59.99
    await expect(drawer.getByText(/\$59\.99/).first()).toBeVisible();

    // Checkout link should be a real Shopify checkout URL. Southland uses a
    // Shopify Plus custom checkout domain, so accept either form.
    const checkout = drawer.getByRole('link', { name: /checkout/i });
    await expect(checkout).toBeVisible();
    const href = await checkout.getAttribute('href');
    expect(href).toMatch(/(southland-organics\.myshopify\.com|shop\.southlandorganics\.com)\/.*(checkouts?|cart)\//);
  });

  test('cart persists to localStorage across reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('.pricing-card.featured button.cta-primary').click();

    const drawer = page.getByRole('dialog', { name: /your cart/i });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    await page.reload();

    // Cart icon button should announce "Open your cart 1" after reload
    // (proves the persistent-atom rehydrated from localStorage)
    await expect(page.getByRole('button', { name: /open your cart\s*1/i })).toBeVisible({ timeout: 10_000 });
  });
});
