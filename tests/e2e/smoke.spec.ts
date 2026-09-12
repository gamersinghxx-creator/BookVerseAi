import { test, expect } from "@playwright/test";

test.describe("core pages", () => {
  test("home renders the hero and library", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/step inside/i);
    await expect(page.locator("#library")).toBeVisible();
    // Seed books are always present.
    await expect(page.getByRole("link", { name: /the art of war/i })).toBeVisible();
  });

  test("home renders the journey and closing CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /four moments/i })).toBeVisible();
    for (const act of ["Summon it", "Understand it", "See it", "Ask it"]) {
      await expect(page.getByRole("heading", { name: act, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: /watch it/i })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Summon a book", exact: true }),
    ).toBeVisible();
  });

  test("a seed book page renders its sections", async ({ page }) => {
    await page.goto("/book/meditations");
    await expect(page.getByRole("heading", { name: "Meditations", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /mind map/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /ask the tutor/i })).toBeVisible();
  });

  test("unknown book slug shows the 404", async ({ page }) => {
    const res = await page.goto("/book/this-book-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/hasn.t been painted yet/i)).toBeVisible();
  });

  test("shelf and compare pages load", async ({ page }) => {
    await page.goto("/shelf");
    await expect(page.getByRole("heading", { name: /my shelf/i })).toBeVisible();

    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /compare two books/i })).toBeVisible();
    await expect(page.locator("select")).toHaveCount(2);
  });

  test("health endpoint returns a well-formed body", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty("provider");
    expect(body).toHaveProperty("modelReady");
    expect(res.headers()["x-request-id"]).toBeTruthy();
  });

  test("generate rejects an empty title with the error envelope", async ({ request }) => {
    const res = await request.post("/api/generate", { data: { title: "" } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(body.error.requestId).toBeTruthy();
  });
});
