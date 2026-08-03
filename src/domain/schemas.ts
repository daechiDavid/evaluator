import { z } from "zod";
import { LIMITS, isTargetLength } from "@/config/limits";

export const commonOptionsSchema = z.object({
  customRules: z.string().max(LIMITS.maxCommonOptionsLength).default(""),
  forbiddenExpressions: z.array(z.string().max(80)).max(30).default([]),
  recommendedExpressions: z.array(z.string().max(80)).max(30).default([]),
});

export const evaluationSubjectSchema = z.object({
  subject: z.string().trim().min(1).max(80),
  grade: z.string().trim().max(30).default(""),
  semester: z.string().trim().max(30).default(""),
  area: z.string().trim().max(120).default(""),
  criteria: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
  elements: z.array(z.string().trim().min(1).max(300)).min(1).max(30),
  upperDescriptor: z.string().trim().max(1_000).default(""),
});

export const feature1RequestSchema = z.object({
  studentsCount: z.number().int().min(1).max(LIMITS.maxStudents),
  targetLength: z.number().int().refine(isTargetLength),
  subjects: z.array(evaluationSubjectSchema).min(1).max(30),
  studentIndices: z.array(z.number().int().min(1).max(LIMITS.maxStudents)).max(LIMITS.maxStudents).optional(),
  commonOptions: commonOptionsSchema.optional(),
  regenerateStudentIndex: z.number().int().min(1).optional(),
});

export const feature2StudentSchema = z.object({
  studentIndex: z.number().int().min(1).max(LIMITS.maxStudents),
  keywords: z.array(z.string().trim().min(1).max(LIMITS.maxCustomKeywordLength)).min(1).max(LIMITS.maxKeywordsPerStudent),
});

export const feature2RequestSchema = z.object({
  studentsCount: z.number().int().min(1).max(LIMITS.maxStudents),
  targetLength: z.number().int().refine(isTargetLength),
  students: z.array(feature2StudentSchema).min(1).max(LIMITS.maxStudents),
  commonOptions: commonOptionsSchema.optional(),
});

export const feature3RequestSchema = z.object({
  studentsCount: z.number().int().min(1).max(LIMITS.maxStudents),
  targetLength: z.number().int().refine(isTargetLength),
  assignments: z.array(z.object({
    studentIndex: z.number().int().min(1).max(LIMITS.maxStudents),
    topics: z.array(z.string().trim().min(1).max(LIMITS.maxTopicLength)).length(4),
  })).min(1).max(LIMITS.maxStudents),
  commonOptions: commonOptionsSchema.optional(),
});

export const generatedSentenceSchema = z.object({
  text: z.string(),
  evidence: z.array(z.string()).default([]),
  review: z.object({
    passed: z.boolean(),
    issues: z.array(z.string()),
    characterCount: z.number().int().nonnegative(),
  }),
});

export const studentResultSchema = z.object({
  studentIndex: z.number().int().positive(),
  paragraph: z.string(),
  sentences: z.array(generatedSentenceSchema),
  evidence: z.array(z.string()),
  status: z.enum(["draft", "review-needed", "confirmed", "failed"]),
});

export type CommonOptions = z.infer<typeof commonOptionsSchema>;
export type EvaluationSubject = z.infer<typeof evaluationSubjectSchema>;
export type Feature1Request = z.infer<typeof feature1RequestSchema>;
export type Feature2Request = z.infer<typeof feature2RequestSchema>;
export type Feature3Request = z.infer<typeof feature3RequestSchema>;
export type StudentResult = z.infer<typeof studentResultSchema>;
