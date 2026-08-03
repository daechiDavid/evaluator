import { describe, expect, it } from "vitest";
import { commonOptionsSchema, feature1RequestSchema } from "@/domain/schemas";

describe("workspace schema", () => {
  it("does not require a feature 1 level field", () => {
    const options = commonOptionsSchema.parse({});
    expect(options.customRules).toBe("");
    const parsed = feature1RequestSchema.parse({ studentsCount: 1, targetLength: 60, subjects: [{ subject: "국어", criteria: ["성취기준"], elements: ["평가요소"] }], level: "하" });
    expect("level" in parsed).toBe(false);
  });
});
