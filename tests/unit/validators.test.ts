import { describe, expect, it } from "vitest";
import { characterCount, reviewSentence, similarityScore } from "@/domain/validators";

describe("sentence validators", () => {
  it("counts Korean characters without whitespace and punctuation", () => {
    expect(characterCount("가나다, 라마.")) .toBe(5);
  });

  it("enforces format, language and target length", () => {
    const result = reviewSentence("학생의 책임감이 돋보임.", 10);
    expect(result.passed).toBe(true);
    expect(reviewSentence("- Student", 10).issues).toContain("영어 알파벳이 포함됨");
  });

  it("finds high lexical similarity", () => {
    expect(similarityScore("책임감 있게 참여함.", "책임감 있게 참여함.")).toBe(100);
  });
});
