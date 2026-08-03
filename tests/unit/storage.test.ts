import { describe, expect, it } from "vitest";
import { commonOptionsSchema, extractedSubjectsResponseSchema, feature1RequestSchema, evaluationSubjectSchema } from "@/domain/schemas";
import { STORAGE_KEY, loadStoredState, saveStoredState } from "@/lib/client/storage";

describe("workspace schema", () => {
  it("does not require a feature 1 level field", () => {
    const options = commonOptionsSchema.parse({});
    expect(options.customRules).toBe("");
    const parsed = feature1RequestSchema.parse({ studentsCount: 1, targetLength: 60, subjects: [{ subject: "국어", criteria: ["성취기준"], elements: ["평가요소"] }], level: "하" });
    expect("level" in parsed).toBe(false);
  });

  it("keeps extracted subjects as an array at the API boundary", () => {
    const subject = { subject: "국어", criteria: ["성취기준"], elements: ["평가요소"] };
    expect(extractedSubjectsResponseSchema.parse({ subjects: [subject] }).subjects).toHaveLength(1);
    expect(() => extractedSubjectsResponseSchema.parse({ subjects: { subjects: [subject] } })).toThrow();
  });

  it("does not persist feature 1 evidence in browser storage", () => {
    const evidence = evaluationSubjectSchema.parse({ subject: "국어", criteria: ["성취기준"], elements: ["평가요소"] });
    const state = {
      commonOptions: commonOptionsSchema.parse({}),
      feature1: { studentsCount: 1, targetLength: 60, subjects: [evidence], results: [] },
      feature2: { studentsCount: 1, targetLength: 60, students: [{ studentIndex: 1, keywords: [] }], results: [] },
      feature3: { studentsCount: 1, targetLength: 60, topics: [], assignments: [], approved: false, results: [] },
      lastFeature: "feature1" as const,
      updatedAt: new Date().toISOString(),
    };
    saveStoredState(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").feature1.subjects).toEqual([]);
    expect(loadStoredState(state).feature1.subjects).toEqual([]);
  });
});
