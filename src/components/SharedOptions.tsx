"use client";

import type { CommonOptions } from "@/domain/schemas";

export function SharedOptions({ value, onChange }: { value: CommonOptions; onChange: (value: CommonOptions) => void }) {
  return (
    <details className="shared-options">
      <summary>공통 작성 옵션 <span className="summary-hint">모든 기능에 적용</span></summary>
      <div className="shared-options-body">
        <label>추가 작성 원칙<textarea value={value.customRules} onChange={(event) => onChange({ ...value, customRules: event.target.value })} placeholder="예: 문장을 지나치게 과장하지 않고 차분하게 작성" /></label>
        <div className="two-column">
          <label>금지 표현<input value={value.forbiddenExpressions.join(", ")} onChange={(event) => onChange({ ...value, forbiddenExpressions: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="쉼표로 구분" /></label>
          <label>권장 표현<input value={value.recommendedExpressions.join(", ")} onChange={(event) => onChange({ ...value, recommendedExpressions: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="쉼표로 구분" /></label>
        </div>
      </div>
    </details>
  );
}
