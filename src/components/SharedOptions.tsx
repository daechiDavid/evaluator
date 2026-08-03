"use client";

import type { CommonOptions } from "@/domain/schemas";

export function SharedOptions({ value, onChange, open, onToggle }: { value: CommonOptions; onChange: (value: CommonOptions) => void; open: boolean; onToggle: () => void }) {
  return (
    <div className="shared-options">
      <button type="button" className="data-button shared-options-button" aria-haspopup="dialog" aria-expanded={open} onClick={onToggle}>나만의 설정</button>
      {open && <div className="shared-options-body popover-panel" role="dialog" aria-label="나만의 설정">
        <label>문장 작성 지침<textarea value={value.customRules} onChange={(event) => onChange({ ...value, customRules: event.target.value })} placeholder="예: 문장을 지나치게 과장하지 않고 차분하게 작성" /></label>
        <div className="two-column">
          <label>금지 표현<input value={value.forbiddenExpressions.join(", ")} onChange={(event) => onChange({ ...value, forbiddenExpressions: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="쉼표로 구분" /></label>
          <label>권장 표현<input value={value.recommendedExpressions.join(", ")} onChange={(event) => onChange({ ...value, recommendedExpressions: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="쉼표로 구분" /></label>
        </div>
      </div>}
    </div>
  );
}
