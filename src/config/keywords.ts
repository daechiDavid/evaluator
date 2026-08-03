export type KeywordGroup = "school" | "relationship" | "study" | "growth";

export type Keyword = { id: string; label: string; group: KeywordGroup };

export const KEYWORD_GROUPS: Array<{ id: KeywordGroup; label: string }> = [
  { id: "school", label: "학교생활 전반" },
  { id: "relationship", label: "교우 관계" },
  { id: "study", label: "학업 태도" },
  { id: "growth", label: "장점 및 발전 가능성" },
];

export const KEYWORDS: Keyword[] = [
  ["책임감", "school"], ["성실성", "school"], ["규칙 준수", "school"], ["정리 정돈", "school"],
  ["배려", "relationship"], ["협력", "relationship"], ["경청", "relationship"], ["의사소통", "relationship"],
  ["리더십", "relationship"], ["공동체 의식", "relationship"], ["자기 주도성", "study"], ["집중력", "study"],
  ["탐구심", "study"], ["문제 해결력", "study"], ["창의성", "study"], ["발표력", "study"],
  ["끈기", "growth"], ["자신감", "growth"], ["발전 가능성", "growth"], ["긍정적 태도", "growth"],
].map(([label, group], index) => ({ id: `keyword-${index + 1}`, label, group: group as KeywordGroup }));
