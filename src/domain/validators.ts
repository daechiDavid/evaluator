import { FORBIDDEN_EXPRESSIONS } from "@/config/writing-rules";
import { LIMITS } from "@/config/limits";

export type SentenceReview = {
  passed: boolean;
  issues: string[];
  characterCount: number;
};

export function characterCount(text: string): number {
  return [...text].filter((char) => !/[\s\p{P}\p{S}]/u.test(char)).length;
}

export function splitSentences(text: string): string[] {
  return text.split(/(?<=\.)\s+/u).map((sentence) => sentence.trim()).filter(Boolean);
}

export function reviewSentence(text: string, targetLength: number, customForbidden: string[] = []): SentenceReview {
  const issues: string[] = [];
  const count = characterCount(text);
  if (count < targetLength - 5 || count > targetLength + 5) issues.push(`글자 수 ${count}자: 목표 ${targetLength}자 ±5자 범위를 벗어남`);
  if (!text.endsWith(".")) issues.push("문장이 마침표로 끝나지 않음");
  if (/[A-Za-z]/u.test(text)) issues.push("영어 알파벳이 포함됨");
  if (/^\s*(?:[-*•]|\d+[.)]|#+)\s/u.test(text)) issues.push("번호·불릿·마크다운 표식이 포함됨");
  if (/[{}[\]<>`]/u.test(text)) issues.push("불필요한 기호가 포함됨");
  if (!["함.", "됨.", "임.", "있음.", "보임.", "기대됨.", "나타남.", "기름."].some((ending) => text.endsWith(ending))) {
    issues.push("명사형 종결 어미가 아님");
  }
  const forbidden = [...FORBIDDEN_EXPRESSIONS, ...customForbidden];
  for (const expression of forbidden) if (expression && text.includes(expression)) issues.push(`금지 표현 포함: ${expression}`);
  return { passed: issues.length === 0, issues, characterCount: count };
}

export function similarityScore(left: string, right: string): number {
  const tokenize = (value: string) => new Set(value.replace(/[.!?,]/g, " ").split(/\s+/u).filter(Boolean));
  const a = tokenize(left);
  const b = tokenize(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

export function reviewSentences(sentences: string[], targetLength: number, customForbidden: string[] = []): SentenceReview[] {
  const reviews = sentences.map((sentence) => reviewSentence(sentence, targetLength, customForbidden));
  for (let index = 0; index < reviews.length; index += 1) {
    for (let other = index + 1; other < reviews.length; other += 1) {
      if (similarityScore(sentences[index], sentences[other]) >= 85) {
        reviews[index].passed = false;
        reviews[other].passed = false;
        reviews[index].issues.push("같은 결과 안에서 의미 또는 표현이 중복됨");
        reviews[other].issues.push("같은 결과 안에서 의미 또는 표현이 중복됨");
      }
    }
  }
  return reviews;
}

export function clampRegenerationCount(value: number): number {
  return Math.min(Math.max(value, 0), LIMITS.maxRegenerations);
}
