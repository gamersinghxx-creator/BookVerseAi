import { test, expect } from "@playwright/test";

test("compare selection is reflected in the URL and restored from it", async ({ page }) => {
  await page.goto("/compare");
  await expect(page).toHaveURL(/\?a=.+&b=.+/);

  const [a, b] = await page.locator("select").all();
  // Pick titles that are not either picker's current value (those are disabled).
  await a.selectOption("walden");
  await expect(page).toHaveURL(/a=walden/);
  await b.selectOption("the-prince");
  await expect(page).toHaveURL(/b=the-prince/);

  // A shared link restores that comparison.
  await page.goto("/compare?a=the-art-of-war&b=pride-and-prejudice");
  await expect(page.getByRole("heading", { name: "The Art of War", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pride and Prejudice", level: 2 })).toBeVisible();
});

test("library search ranks a title match first", async ({ request }) => {
  const res = await request.get("/api/library?q=war");
  const { books } = await res.json();
  expect(books.length).toBeGreaterThan(0);
  // "The Art of War" (title) should outrank "War and..." only-tagline matches.
  expect(books[0].slug).toBe("the-art-of-war");
});

test("living search suggests the new seed titles", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "Search or summon a book" });
  await search.fill("dracula");
  await expect(page.getByRole("button", { name: /dracula/i })).toBeVisible({ timeout: 10_000 });
});
