export const LIMITS = {
  maxStudents: 60,
  maxBatchStudents: 8,
  maxTargetLength: 500,
  minTargetLength: 20,
  maxFiles: 20,
  maxFileBytes: 12 * 1024 * 1024,
  maxKeywordsPerStudent: 12,
  maxTopics: 200,
  maxCommonOptionsLength: 2_000,
  maxCustomKeywordLength: 40,
  maxTopicLength: 120,
  maxRegenerations: 3,
} as const;

export const ACCEPTED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "webp", "docx", "pptx", "xlsx"] as const;
export type AcceptedExtension = (typeof ACCEPTED_EXTENSIONS)[number];

export function isTargetLength(value: number): boolean {
  return Number.isInteger(value) && value >= LIMITS.minTargetLength && value <= LIMITS.maxTargetLength;
}
