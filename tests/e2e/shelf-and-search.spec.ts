import { test, expect } from "@playwright/test";

test("living search suggests a seed book and navigates to it", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("textbox", { name: /search or summon a book/i });
  await search.fill("Medita");
  const suggestion = page.getByRole("button", { name: /meditations/i });
  await expect(suggestion).toBeVisible({ timeout: 10_000 });
  await suggestion.click();
  await expect(page).toHaveURL(/\/book\/meditations/);
  await expect(page.getByRole("heading", { name: "Meditations", level: 1 })).toBeVisible();
});

test("a book can be saved to and removed from the shelf", async ({ page }) => {
  await page.goto("/book/frankenstein");

  // The header "Save to shelf" button (full variant) is first in the DOM;
  // the "Continue wandering" orbs further down also have bookmark buttons.
  const save = page.getByRole("button", { name: /save to shelf/i }).first();
  await save.click();
  await expect(page.getByRole("button", { name: /on your shelf/i })).toBeVisible();

  await page.goto("/shelf");
  const card = page.getByRole("heading", { name: "Frankenstein" });
  await expect(card).toBeVisible();

  await page.getByRole("button", { name: /remove frankenstein from shelf/i }).click();
  await expect(page.getByText(/your shelf is empty/i)).toBeVisible();
});

test("reduced-motion users keep a visible cursor and static hero", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  // The custom-cursor class must not be applied (it hides the native cursor).
  await expect(page.locator("body")).not.toHaveClass(/has-custom-cursor/);
  await context.close();
});
