"use client";

import { useMemo, useState } from "react";
import type { StudentResult } from "@/domain/schemas";
import { reviewSentence } from "@/domain/validators";

type Props = {
  result: StudentResult;
  targetLength: number;
  onChange: (result: StudentResult) => void;
  onConfirm: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
};

export function ResultCard({ result, targetLength, onChange, onConfirm, onRegenerate, onCopy }: Props) {
  const [editing, setEditing] = useState(false);
  const sentenceReviews = useMemo(() => result.sentences.map((sentence) => reviewSentence(sentence.text, targetLength)), [result.sentences, targetLength]);
  const hasIssues = sentenceReviews.some((review) => !review.passed);
  return (
    <article className="result-card">
      <div className="result-heading">
        <div>
          <span className="eyebrow">학생 순번</span>
          <h3>학생 {result.studentIndex}</h3>
        </div>
        <span className={`status status-${result.status}`}>{result.status === "confirmed" ? "확정" : hasIssues ? "검토 필요" : "초안"}</span>
      </div>
      <div className="sentence-stack">
        {result.sentences.map((sentence, index) => (
          <div className="sentence-row" key={`${result.studentIndex}-${index}`}>
            {editing ? (
              <textarea
                aria-label={`학생 ${result.studentIndex} 문장 ${index + 1}`}
                value={sentence.text}
                onChange={(event) => {
                  const nextSentences = result.sentences.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value, review: reviewSentence(event.target.value, targetLength) } : item);
                  onChange({ ...result, sentences: nextSentences, paragraph: nextSentences.map((item) => item.text).join(" "), status: "draft" });
                }}
              />
            ) : <p>{sentence.text}</p>}
            <div className="sentence-meta"><span>{sentenceReviews[index]?.characterCount ?? 0}자</span>{sentenceReviews[index]?.issues.map((issue) => <span className="issue" key={issue}>{issue}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="evidence"><span className="eyebrow">반영 근거</span><div className="chip-list">{result.evidence.map((item) => <span className="chip" key={item}>{item}</span>)}</div></div>
      <div className="result-actions">
        <button type="button" className="button-secondary" onClick={() => setEditing((value) => !value)}>{editing ? "편집 완료" : "직접 수정"}</button>
        <button type="button" className="button-secondary" onClick={onRegenerate}>문장 재생성</button>
        <button type="button" className="button-secondary" onClick={onCopy}>복사</button>
        <button type="button" className="button-primary" disabled={hasIssues} onClick={onConfirm}>{result.status === "confirmed" ? "확정됨" : "최종 확정"}</button>
      </div>
    </article>
  );
}
