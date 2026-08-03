import { expect, test } from "@playwright/test";

test("opens feature 1 without exposing API settings", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/feature-1");
  await expect(page.getByRole("heading", { name: /평가계획서의 근거/ })).toBeVisible();
  await expect(page.getByText("API 키 입력", { exact: true })).toHaveCount(0);
  await expect(page.getByText("상·중·하 선택", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /기능 2/ }).click();
  await expect(page.getByRole("heading", { name: /핵심 키워드/ })).toBeVisible();
  await page.getByRole("button", { name: /기능 3/ }).click();
  await expect(page.getByRole("heading", { name: /승인한 활동 주제/ })).toBeVisible();
});
