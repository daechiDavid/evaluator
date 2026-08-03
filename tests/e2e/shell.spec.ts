import { expect, test } from "@playwright/test";

test("opens feature 1 without exposing API settings", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/feature-1");
  await expect(page.getByRole("heading", { name: /평가계획서의 근거/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "조건 확인" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "평가계획서 업로드" })).toBeVisible();
  await expect(page.getByRole("button", { name: /문장 생성/ })).toHaveCount(0);
  await expect(page.locator(".feature1-subtitle")).toHaveCSS("white-space", "nowrap");
  await expect(page.locator(".brand-lockup img")).toBeVisible();
  await expect(page.locator(".feature1-steps > .panel")).toHaveCount(2);
  await expect(page.locator(".notice")).toHaveCount(0);
  await expect(page.getByText("API 키 입력", { exact: true })).toHaveCount(0);
  await expect(page.getByText("상·중·하 선택", { exact: true })).toHaveCount(0);
  const optionsDialog = page.getByRole("dialog", { name: "나만의 설정" });
  await page.getByRole("button", { name: "나만의 설정" }).click();
  await expect(optionsDialog).toBeVisible();
  await expect(optionsDialog.getByText("문장 작성 지침")).toBeVisible();
  await page.mouse.click(12, 12);
  await expect(optionsDialog).toHaveCount(0);
  const dataDialog = page.getByRole("dialog", { name: "저장&삭제" });
  await page.getByRole("button", { name: "저장&삭제" }).click();
  await expect(dataDialog).toBeVisible();
  await expect(dataDialog.getByRole("button", { name: "전체 엑셀 다운로드" })).toBeVisible();
  await expect(dataDialog.getByRole("button", { name: "전체 데이터 삭제" })).toBeVisible();
  await page.mouse.click(12, 12);
  await expect(dataDialog).toHaveCount(0);
  await page.getByRole("button", { name: /기능 2/ }).click();
  await expect(page.getByRole("heading", { name: /핵심 키워드/ })).toBeVisible();
  await page.getByRole("button", { name: /기능 3/ }).click();
  await expect(page.getByRole("heading", { name: /승인한 활동 주제/ })).toBeVisible();
  await expect(page.locator(".feature3-title")).toHaveCSS("white-space", "nowrap");
});

test("automatically generates after evaluation plan upload and clears temporary evidence", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.route("**/api/documents/extract-evaluation", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ subjects: [{ subject: "국어", area: "읽기", criteria: ["성취기준"], elements: ["평가요소"] }, { subject: "국어", area: "쓰기", criteria: ["성취기준"], elements: ["평가요소"] }] }) }));
  await page.route("**/api/generate/feature-1", async (route) => {
    const body = route.request().postDataJSON() as { studentIndices?: number[] };
    const indexes = body.studentIndices ?? [1];
    const results = indexes.map((studentIndex) => ({
      studentIndex,
      paragraph: "첫 문장입니다. 둘째 문장입니다.",
      sentences: [
        { text: "첫 문장입니다.", evidence: ["국어 · 읽기"], review: { passed: true, issues: [], characterCount: 8 } },
        { text: "둘째 문장입니다.", evidence: ["국어 · 쓰기"], review: { passed: true, issues: [], characterCount: 9 } },
      ],
      evidence: ["국어 · 읽기", "국어 · 쓰기"],
      status: "draft",
    }));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results }) });
  });
  await page.goto("/feature-1");
  await page.getByLabel("필요 학생 수").fill("2");
  await page.getByLabel("목표 글자 수").fill("60");
  await page.locator('input[type="file"]').setInputFiles({ name: "evaluation-plan.pdf", mimeType: "application/pdf", buffer: Buffer.from("mock evaluation plan") });
  await expect(page.getByRole("progressbar", { name: "기능1 문장 생성 진행률" })).toHaveAttribute("aria-valuenow", "2");
  await expect(page.getByText("생성 완료")).toBeVisible();
  await expect(page.getByRole("heading", { name: "학생 1" })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem("evaluator:v1:workspace") ?? "{}").feature1?.subjects ?? null)).toEqual([]);
});
