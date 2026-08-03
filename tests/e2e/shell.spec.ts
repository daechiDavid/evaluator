import { expect, test } from "@playwright/test";

test("opens feature 1 without exposing API settings", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/feature-1");
  await expect(page.getByRole("heading", { name: /평가계획서의 근거/ })).toBeVisible();
  await expect(page.getByText("API 키 입력", { exact: true })).toHaveCount(0);
  await expect(page.getByText("상·중·하 선택", { exact: true })).toHaveCount(0);
  const optionsDialog = page.getByRole("dialog", { name: "공통 작성 옵션" });
  await page.getByRole("button", { name: /공통 작성 옵션/ }).click();
  await expect(optionsDialog).toBeVisible();
  await page.mouse.click(12, 12);
  await expect(optionsDialog).toHaveCount(0);
  const dataDialog = page.getByRole("dialog", { name: "브라우저 데이터 관리" });
  await page.getByRole("button", { name: "브라우저 데이터 관리" }).click();
  await expect(dataDialog).toBeVisible();
  await page.mouse.click(12, 12);
  await expect(dataDialog).toHaveCount(0);
  await page.getByRole("button", { name: /기능 2/ }).click();
  await expect(page.getByRole("heading", { name: /핵심 키워드/ })).toBeVisible();
  await page.getByRole("button", { name: /기능 3/ }).click();
  await expect(page.getByRole("heading", { name: /승인한 활동 주제/ })).toBeVisible();
});
