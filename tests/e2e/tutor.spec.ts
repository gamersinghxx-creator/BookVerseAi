import { test, expect } from "@playwright/test";

test("the AI tutor answers a question (mock or live)", async ({ page }) => {
  await page.goto("/book/the-art-of-war");

  const tutor = page.getByText("Your AI tutor").locator("xpath=ancestor::div[contains(@class,'card')]");
  await expect(tutor).toBeVisible();

  // The greeting is the first assistant message.
  await expect(tutor).toContainText(/tutor for "The Art of War"/i);

  // Use a suggested question pill.
  const pill = tutor.getByRole("button").filter({ hasText: "?" }).first();
  await pill.click();

  // An answer streams into a new assistant bubble.
  await expect
    .poll(async () => (await tutor.innerText()).length, { timeout: 15_000 })
    .toBeGreaterThan(120);
});

test("route progress bar appears on navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /the art of war/i }).click();
  await expect(page).toHaveURL(/\/book\/the-art-of-war/);
  await expect(page.getByRole("heading", { name: "The Art of War", level: 1 })).toBeVisible();
});
