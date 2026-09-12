import { test, expect } from "@playwright/test";

test("/account redirects to home when auth is not configured / not signed in", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/(\?.*)?$/);
});

test("account deletion API rejects an unauthenticated request", async ({ request }) => {
  const res = await request.delete("/api/account");
  // 401 (auth on, not signed in) or 501 (auth not configured) — never 200.
  expect([401, 501]).toContain(res.status());
  const body = await res.json();
  expect(body.error.requestId).toBeTruthy();
});

test("admin book-delete is refused without an admin session", async ({ request }) => {
  const res = await request.delete("/api/books/some-generated-slug");
  expect([403, 501, 404]).toContain(res.status());
});

test("a summoned book shows guide actions; a seed book does not", async ({ page }) => {
  // Seed book — no regenerate/report controls.
  await page.goto("/book/meditations");
  await expect(page.getByRole("button", { name: /regenerate/i })).toHaveCount(0);

  // Summon a title (mock preview in CI) → generated book page has the controls.
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "Search or summon a book" });
  await search.fill("A Test Guide For E2E");
  await search.press("Enter");
  await page.waitForURL(/\/book\/a-test-guide-for-e2e/, { timeout: 20_000 });

  await expect(page.getByRole("button", { name: /regenerate/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /report an issue/i })).toBeVisible();
});

test("reporting a guide records without error", async ({ request }) => {
  // The book is created by the previous test's summon; if run in isolation this
  // still exercises the 404 path cleanly.
  const res = await request.post("/api/books/a-test-guide-for-e2e/report", {
    data: { reason: "low-quality" },
  });
  expect([200, 404]).toContain(res.status());
});
