"use client";

import { z } from "zod";
import { commonOptionsSchema, evaluationSubjectSchema, studentResultSchema } from "@/domain/schemas";

export const STORAGE_KEY = "evaluator:v1:workspace";

const storedStateSchema = z.object({
  commonOptions: commonOptionsSchema,
  feature1: z.object({ studentsCount: z.number(), targetLength: z.number(), subjects: z.array(evaluationSubjectSchema), results: z.array(studentResultSchema) }),
  feature2: z.object({ studentsCount: z.number(), targetLength: z.number(), students: z.array(z.object({ studentIndex: z.number(), keywords: z.array(z.string()) })), results: z.array(studentResultSchema) }),
  feature3: z.object({ studentsCount: z.number(), targetLength: z.number(), topics: z.array(z.string()), assignments: z.array(z.object({ studentIndex: z.number(), topics: z.array(z.string()) })), approved: z.boolean(), results: z.array(studentResultSchema) }),
  lastFeature: z.enum(["feature1", "feature2", "feature3"]),
  updatedAt: z.string(),
});

export type StoredState = z.infer<typeof storedStateSchema>;

function withoutTemporaryEvidence(state: StoredState): StoredState {
  return { ...state, feature1: { ...state.feature1, subjects: [] } };
}

export function loadStoredState(fallback: StoredState): StoredState {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = storedStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? withoutTemporaryEvidence(parsed.data) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredState(state: StoredState): "saved" | "failed" {
  if (typeof window === "undefined") return "failed";
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutTemporaryEvidence(state)));
    return "saved";
  } catch {
    return "failed";
  }
}

export function clearStoredState(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}
