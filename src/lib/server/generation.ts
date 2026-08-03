import "server-only";
import { GeminiFailoverClient } from "@/lib/server/gemini";
import { reviewSentence, reviewSentences } from "@/domain/validators";
import { DEFAULT_WRITING_RULES } from "@/config/writing-rules";
import type { CommonOptions, EvaluationSubject, StudentResult } from "@/domain/schemas";
import { z } from "zod";

const modelSentenceResponseSchema = z.object({ sentences: z.array(z.string()).optional(), semanticIssues: z.array(z.string()).optional() });

function toSentences(value: unknown, expected: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, expected);
}

function promptRules(options?: CommonOptions): string {
  return [...DEFAULT_WRITING_RULES, ...(options?.customRules ? [options.customRules] : [])].join("\n- ");
}

function paragraphFrom(sentences: string[]): string {
  return sentences.join(" ");
}

async function makeSentences(prompt: string, expected: number, targetLength: number, options?: CommonOptions): Promise<{ sentences: string[]; reviews: ReturnType<typeof reviewSentences> }> {
  const client = new GeminiFailoverClient();
  let lastSentences: string[] = [];
  for (let attempt = 0; attempt <= 3; attempt += 1) {
    const response = await client.generateJson<unknown>({ text: `${prompt}\n\n작성 규칙:\n- ${promptRules(options)}\n- 반드시 JSON {"sentences":["문장"],"semanticIssues":["근거 부합·과장·낙인·차별 검수 결과"]}만 반환\n- 문장 수는 정확히 ${expected}개\n- 목표 글자 수는 문장당 ${targetLength}자 ±5자\n- semanticIssues에는 문제가 있을 때만 짧은 이유를 넣으세요.\n- 이전 결과에 문제가 있으면 구조와 표현을 충분히 바꿔 다시 작성하세요.` });
    const parsed = modelSentenceResponseSchema.safeParse(response);
    const sentences = toSentences(parsed.success ? parsed.data.sentences : [], expected);
    lastSentences = sentences;
    const reviews = reviewSentences(sentences, targetLength, options?.forbiddenExpressions);
    if (parsed.success && parsed.data.semanticIssues && parsed.data.semanticIssues.length > 0) {
      for (const review of reviews) {
        review.passed = false;
        review.issues.push(...parsed.data.semanticIssues);
      }
    }
    if (sentences.length === expected && reviews.every((review) => review.passed)) return { sentences, reviews };
  }
  const reviews = lastSentences.map((sentence) => reviewSentence(sentence, targetLength, options?.forbiddenExpressions));
  return { sentences: lastSentences, reviews };
}

function resultFor(studentIndex: number, sentences: string[], reviews: ReturnType<typeof reviewSentences>, evidence: string[]): StudentResult {
  return {
    studentIndex,
    paragraph: paragraphFrom(sentences),
    sentences: sentences.map((text, index) => ({ text, evidence, review: reviews[index] ?? reviewSentence(text, 20) })),
    evidence,
    status: reviews.length > 0 && reviews.every((review) => review.passed) ? "draft" : "review-needed",
  };
}

export async function generateFeature1Student(studentIndex: number, subjects: EvaluationSubject[], targetLength: number, options?: CommonOptions): Promise<StudentResult> {
  const elements = subjects.flatMap((subject) => subject.elements.map((element) => ({ subject: subject.subject, criteria: subject.criteria, element, upperDescriptor: subject.upperDescriptor })));
  const response = await makeSentences(`기능 1 교과 평가 문장을 작성하세요. 모든 문장은 한국어이며 ‘상’ 성취 중심이어야 합니다. 학생 ${studentIndex}의 근거는 다음 교과·성취기준·평가요소뿐입니다. 입력에 없는 활동, 수치, 수상, 역할과 구체적 성취를 추가하지 마세요.\n${JSON.stringify(elements)}`, elements.length, targetLength, options);
  return resultFor(studentIndex, response.sentences, response.reviews, elements.map((item) => `${item.subject} · ${item.element}`));
}

export async function generateFeature2Student(studentIndex: number, keywords: string[], targetLength: number, options?: CommonOptions): Promise<StudentResult> {
  const response = await makeSentences(`기능 2 행동특성 및 종합의견을 작성하세요. 학생 ${studentIndex}의 근거 키워드는 다음뿐입니다: ${keywords.join(", ")}. 학교생활 전반, 교우 관계, 학업 태도, 장점 또는 발전 가능성이 드러나는 네 문장을 작성하세요. 키워드에 없는 사건, 역할, 수치, 성취와 확인되지 않은 노력은 만들지 마세요.`, 4, targetLength, options);
  return resultFor(studentIndex, response.sentences, response.reviews, keywords);
}

export async function generateFeature3Student(studentIndex: number, topics: string[], targetLength: number, options?: CommonOptions): Promise<StudentResult> {
  const response = await makeSentences(`기능 3 창의적 체험활동 자율활동 문장을 작성하세요. 학생 ${studentIndex}에게 승인된 활동 주제는 다음 네 가지뿐입니다: ${topics.join(", ")}. 주제당 한 문장씩 네 문장을 작성하세요. 승인되지 않은 활동이나 구체적 사건을 추가하지 마세요.`, 4, targetLength, options);
  return resultFor(studentIndex, response.sentences, response.reviews, topics);
}
