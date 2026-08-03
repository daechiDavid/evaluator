"use client";

import { useState } from "react";

export function AccessGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="access-page">
      <div className="access-card">
        <span className="eyebrow">Evaluator</span>
        <h1>교사 문장 생성 작업을 시작합니다.</h1>
        <p>서비스 접근 코드를 입력하세요. Gemini API 키는 이 화면에서 입력하거나 저장하지 않습니다.</p>
        <form onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }); if (!response.ok) throw new Error("접근 코드를 확인해 주세요."); onSuccess(); } catch (caught) { setError(caught instanceof Error ? caught.message : "접근 코드를 확인해 주세요."); } finally { setBusy(false); } }}>
          <label>접근 코드<input autoFocus type="password" value={code} onChange={(event) => setCode(event.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button-primary" disabled={busy || code.length === 0} type="submit">{busy ? "확인 중…" : "계속"}</button>
        </form>
      </div>
    </main>
  );
}
