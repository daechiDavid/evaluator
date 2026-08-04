"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { KEYWORD_GROUPS, KEYWORDS } from "@/config/keywords";
import { LIMITS } from "@/config/limits";
import { commonOptionsSchema, evaluationSubjectSchema, type StudentResult } from "@/domain/schemas";
import { clearStoredState, loadStoredState, saveStoredState, type StoredState } from "@/lib/client/storage";
import { downloadResultsXlsx, downloadWorkspaceXlsx } from "@/lib/client/export-xlsx";
import { AccessGate } from "@/components/AccessGate";
import { ResultCard } from "@/components/ResultCard";
import { SharedOptions } from "@/components/SharedOptions";

type Feature = StoredState["lastFeature"];
type OpenPopover = "options" | "data" | null;
type Feature1Progress = { phase: string; completed: number; total: number };

const subjectResponseSchema = z.object({ subjects: z.array(evaluationSubjectSchema) });

function initialState(feature: Feature): StoredState {
  return {
    commonOptions: commonOptionsSchema.parse({}),
    feature1: { studentsCount: 3, targetLength: 60, subjects: [], results: [] },
    feature2: { studentsCount: 3, targetLength: 60, students: Array.from({ length: 3 }, (_, index) => ({ studentIndex: index + 1, keywords: [] })), results: [] },
    feature3: { studentsCount: 3, targetLength: 60, topics: [], assignments: [], approved: false, results: [] },
    lastFeature: feature,
    updatedAt: new Date().toISOString(),
  };
}

class ApiError extends Error {
  readonly code: string;
  constructor(message: string, code: string) { super(message); this.code = code; }
}

async function requestJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json() as { error?: string; code?: string } & T;
  if (!response.ok) throw new ApiError(payload.error ?? "요청을 처리하지 못했습니다.", payload.code ?? "REQUEST_FAILED");
  return payload as T;
}

function updateResult(results: StudentResult[], next: StudentResult): StudentResult[] {
  const matches = (item: StudentResult) => item.studentIndex === next.studentIndex && item.subject === next.subject;
  return results.some(matches) ? results.map((item) => matches(item) ? next : item) : [...results, next].sort((a, b) => a.studentIndex - b.studentIndex);
}

function studentCountFromInput(value: string): number {
  if (value === "") return 0;
  return Math.min(LIMITS.maxStudents, Math.max(1, Number(value) || 1));
}

export function EvaluatorWorkspace({ initialFeature }: { initialFeature: Feature }) {
  const router = useRouter();
  const [state, setState] = useState<StoredState>(() => initialState(initialFeature));
  const [hydrated, setHydrated] = useState(false);
  const [storageStatus, setStorageStatus] = useState<"idle" | "saved" | "failed">("idle");
  const [message, setMessage] = useState("");
  const [needsAccess, setNeedsAccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [feature1Progress, setFeature1Progress] = useState<Feature1Progress | null>(null);
  const [selectedFeature1Subject, setSelectedFeature1Subject] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const popoverGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage is unavailable during SSR; this gate prevents the server placeholder from being overwritten.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadStoredState(initialState(initialFeature)));
    setHydrated(true);
  }, [initialFeature]);
  useEffect(() => { if (!hydrated) return; const timer = window.setTimeout(() => setStorageStatus(saveStoredState({ ...state, updatedAt: new Date().toISOString() })), 350); return () => window.clearTimeout(timer); }, [state, hydrated]);
  useEffect(() => {
    if (!openPopover) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (popoverGroupRef.current && !popoverGroupRef.current.contains(event.target as Node)) setOpenPopover(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenPopover(null); };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openPopover]);

  const feature2Students = useMemo(() => Array.from({ length: state.feature2.studentsCount }, (_, index) => state.feature2.students.find((student) => student.studentIndex === index + 1) ?? { studentIndex: index + 1, keywords: [] }), [state.feature2.students, state.feature2.studentsCount]);
  const feature1ResultSubjects = useMemo(() => Array.from(new Set(state.feature1.results.map((result) => result.subject).filter((subject): subject is string => Boolean(subject)))), [state.feature1.results]);
  const activeFeature1Subject = feature1ResultSubjects.includes(selectedFeature1Subject) ? selectedFeature1Subject : feature1ResultSubjects[0] ?? "";

  const feature = state.lastFeature;
  const setFeature = (next: Feature) => { setState((current) => ({ ...current, lastFeature: next })); router.push(`/${next.replace("feature", "feature-")}`); };
  const commonOptions = state.commonOptions;
  const setCommonOptions = (value: StoredState["commonOptions"]) => setState((current) => ({ ...current, commonOptions: value }));

  const reportError = (error: unknown) => { if (error instanceof ApiError && error.code === "UNAUTHORIZED") setNeedsAccess(true); setMessage(error instanceof ApiError ? "요청을 처리하지 못했습니다." : error instanceof Error ? error.message : "요청을 처리하지 못했습니다."); };
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); setFallbackText(""); setMessage("클립보드에 복사했습니다."); } catch { setFallbackText(text); setMessage("클립보드 권한이 없어 아래 텍스트를 직접 복사해 주세요."); } };
  const clearAll = () => { if (!window.confirm("현재 브라우저에 저장된 세 기능의 작업과 결과를 모두 삭제할까요?")) return; clearStoredState(); setState(initialState(feature)); setStorageStatus("saved"); setOpenPopover(null); setMessage("브라우저 저장 데이터를 삭제했습니다."); };
  const exportAll = () => {
    const feature1Sheets = new Map<string, StudentResult[]>();
    for (const result of state.feature1.results) {
      const subject = result.subject ?? result.evidence[0]?.split(" · ")[0] ?? "기능1";
      feature1Sheets.set(subject, [...(feature1Sheets.get(subject) ?? []), result]);
    }
    void downloadWorkspaceXlsx([
      ...Array.from(feature1Sheets.entries()).map(([name, results]) => ({ name: `기능1_${name}`, results, evidenceLabel: name })),
      { name: "기능2_행동특성", results: state.feature2.results, evidenceLabel: "키워드" },
      { name: "기능3_자율활동", results: state.feature3.results, evidenceLabel: "활동 주제" },
    ]);
    setOpenPopover(null);
  };

  if (!hydrated) return <main className="loading-page"><span className="status-point" />저장된 작업을 불러오는 중…</main>;
  if (needsAccess) return <AccessGate onSuccess={() => { setNeedsAccess(false); setMessage("접근이 확인되었습니다."); }} />;

  const handleSubjectExtraction = async (files: FileList | null) => {
    if (!files?.length) return;
    const studentsCount = state.feature1.studentsCount;
    const targetLength = state.feature1.targetLength;
    if (studentsCount < 1) { setMessage("필요 학생 수를 입력하세요."); return; }
    setBusy(true); setProgress(""); setMessage(""); setFeature1Progress({ phase: "계획서를 읽는 중", completed: 0, total: studentsCount });
    try {
      const form = new FormData();
      Array.from(files).slice(0, LIMITS.maxFiles).forEach((file) => form.append("files", file));
      const response = await fetch("/api/documents/extract-evaluation", { method: "POST", body: form });
      const payload = await response.json() as { subjects?: unknown; error?: string; code?: string };
      if (!response.ok) throw new ApiError(payload.error ?? "문서를 분석하지 못했습니다.", payload.code ?? "DOCUMENT_FAILED");
      const parsed = subjectResponseSchema.parse(payload);
      setFeature1Progress({ phase: "평가 요소를 추출하는 중", completed: 0, total: studentsCount });
      await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
      setState((current) => ({ ...current, feature1: { ...current.feature1, subjects: parsed.subjects, results: [] } }));
      await generateFeature1(undefined, { subjects: parsed.subjects, studentsCount, targetLength });
    } catch (error) { setFeature1Progress((value) => value ? { ...value, phase: "처리 실패" } : null); reportError(error); } finally { setBusy(false); }
  };

  const handleActivityExtraction = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true); setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/documents/extract-activities", { method: "POST", body: form });
      const payload = await response.json() as { topics?: unknown; error?: string; code?: string };
      if (!response.ok) throw new ApiError(payload.error ?? "활동 주제를 분석하지 못했습니다.", payload.code ?? "DOCUMENT_FAILED");
      const rawTopics = Array.isArray(payload.topics) ? payload.topics : z.object({ topics: z.array(z.string()) }).parse(payload.topics).topics;
      setState((current) => ({ ...current, feature3: { ...current.feature3, topics: [...new Set([...current.feature3.topics, ...rawTopics.map((topic) => topic.trim()).filter(Boolean)])], approved: false } }));
      setMessage(`${rawTopics.length}개 활동 주제를 불러왔습니다.`);
    } catch (error) { reportError(error); } finally { setBusy(false); }
  };

  const generateFeature1 = async (studentIndex?: number, overrides: { subjects?: z.infer<typeof subjectResponseSchema>["subjects"]; studentsCount?: number; targetLength?: number } = {}) => {
    const current = state.feature1;
    const subjects = overrides.subjects ?? current.subjects;
    const studentsCount = overrides.studentsCount ?? current.studentsCount;
    const targetLength = overrides.targetLength ?? current.targetLength;
    if (studentsCount < 1) { setMessage("필요 학생 수를 입력하세요."); return; }
    if (subjects.length === 0) { setMessage("먼저 평가계획서를 업로드해 교과 구조를 추출하세요."); return; }
    setBusy(true); setProgress(""); setMessage("");
    try {
      const indexes = studentIndex ? [studentIndex] : Array.from({ length: studentsCount }, (_, index) => index + 1);
      setFeature1Progress({ phase: studentIndex ? "문장 재생성 준비 중" : "문장 생성 준비 중", completed: 0, total: indexes.length });
      let allResults: StudentResult[] = studentIndex ? state.feature1.results : [];
      for (let offset = 0; offset < indexes.length; offset += LIMITS.maxBatchStudents) {
        const chunk = indexes.slice(offset, offset + LIMITS.maxBatchStudents);
        const chunkLabel = chunk.length === 1 ? `${chunk[0]}번 학생` : `${chunk[0]}~${chunk[chunk.length - 1]}번 학생`;
        setFeature1Progress({ phase: `${chunkLabel} 문장을 생성하는 중`, completed: offset, total: indexes.length });
        const payload = await requestJson<{ results: StudentResult[] }>("/api/generate/feature-1", { ...current, subjects, targetLength, studentsCount: chunk.length, studentIndices: chunk, commonOptions, ...(studentIndex ? { regenerateStudentIndex: studentIndex } : {}) });
        allResults = payload.results.reduce(updateResult, allResults);
        setFeature1Progress({ phase: `${chunkLabel} 문장 생성 완료`, completed: offset + chunk.length, total: indexes.length });
        setState((value) => ({ ...value, feature1: { ...value.feature1, subjects, results: allResults } }));
      }
      setFeature1Progress({ phase: "생성 완료", completed: indexes.length, total: indexes.length });
      setState((value) => ({ ...value, feature1: { ...value.feature1, subjects: [], results: allResults } }));
      setMessage("기능 1 문장 생성을 완료했습니다. 과목별 결과를 검토하고 필요하면 직접 수정하세요.");
    } catch (error) { setFeature1Progress((value) => value ? { ...value, phase: "생성 실패" } : null); reportError(error); } finally { setBusy(false); setProgress(""); }
  };

  const setFeature2Students = (students: typeof state.feature2.students) => setState((current) => ({ ...current, feature2: { ...current.feature2, students } }));
  const generateFeature2 = async () => {
    if (state.feature2.studentsCount < 1) { setMessage("필요 학생 수를 입력하세요."); return; }
    if (feature2Students.some((student) => student.keywords.length < 1)) { setMessage("각 학생 순번에 키워드를 한 개 이상 선택하세요."); return; }
    setBusy(true); setProgress(""); setMessage("");
    try { let results: StudentResult[] = []; for (let offset = 0; offset < feature2Students.length; offset += LIMITS.maxBatchStudents) { const students = feature2Students.slice(offset, offset + LIMITS.maxBatchStudents); setProgress(`작업 묶음 ${Math.floor(offset / LIMITS.maxBatchStudents) + 1} / ${Math.ceil(feature2Students.length / LIMITS.maxBatchStudents)} 생성 중`); const payload = await requestJson<{ results: StudentResult[] }>("/api/generate/feature-2", { ...state.feature2, studentsCount: students.length, students, commonOptions }); results = [...results, ...payload.results]; setState((value) => ({ ...value, feature2: { ...value.feature2, students: feature2Students, results } })); } setMessage("기능 2 문장 생성을 완료했습니다."); } catch (error) { reportError(error); } finally { setBusy(false); setProgress(""); }
  };

  const randomizeAssignments = () => {
    const topics = state.feature3.topics;
    if (state.feature3.studentsCount < 1) { setMessage("필요 학생 수를 입력하세요."); return; }
    if (topics.length < 4) { setMessage("활동 주제를 네 개 이상 입력하세요."); return; }
    const assignments = Array.from({ length: state.feature3.studentsCount }, (_, index) => ({ studentIndex: index + 1, topics: [...topics].sort(() => Math.random() - 0.5).slice(0, 4) }));
    setState((current) => ({ ...current, feature3: { ...current.feature3, assignments, approved: false, results: [] } }));
  };
  const generateFeature3 = async () => {
    if (!state.feature3.approved || state.feature3.assignments.length !== state.feature3.studentsCount) { setMessage("모든 학생의 주제 배정을 검토하고 승인하세요."); return; }
    setBusy(true); setProgress(""); setMessage("");
    try { let results: StudentResult[] = []; for (let offset = 0; offset < state.feature3.assignments.length; offset += LIMITS.maxBatchStudents) { const assignments = state.feature3.assignments.slice(offset, offset + LIMITS.maxBatchStudents); setProgress(`작업 묶음 ${Math.floor(offset / LIMITS.maxBatchStudents) + 1} / ${Math.ceil(state.feature3.assignments.length / LIMITS.maxBatchStudents)} 생성 중`); const payload = await requestJson<{ results: StudentResult[] }>("/api/generate/feature-3", { ...state.feature3, studentsCount: assignments.length, assignments, commonOptions }); results = [...results, ...payload.results]; setState((value) => ({ ...value, feature3: { ...value.feature3, results } })); } setMessage("기능 3 문장 생성을 완료했습니다."); } catch (error) { reportError(error); } finally { setBusy(false); setProgress(""); }
  };

  const renderResults = (results: StudentResult[], targetLength: number, evidenceLabel: string, regenerate: (index: number) => Promise<void>, setResults: (results: StudentResult[]) => void) => (
    <section className="results-section">
      <div className="section-heading"><div><span className="eyebrow">결과 검수</span><h2>{results.length}개 결과</h2></div><div className="result-tools"><button type="button" className="button-secondary" onClick={() => void copy(results.filter((result) => result.status === "confirmed").map((result) => `학생 ${result.studentIndex}\n${result.paragraph}`).join("\n\n"))} disabled={!results.some((result) => result.status === "confirmed")}>전체 복사</button><button type="button" className="button-secondary" onClick={() => void downloadResultsXlsx(evidenceLabel, results, evidenceLabel)} disabled={!results.some((result) => result.status === "confirmed")}>엑셀 다운로드</button></div></div>
      {results.length === 0 ? <div className="empty-state">생성된 결과가 여기에 표시됩니다. 문장을 생성한 뒤 교사가 직접 검토하고 확정해야 합니다.</div> : <div className="result-list">{results.map((result) => <ResultCard key={result.studentIndex} result={result} targetLength={targetLength} onChange={(next) => setResults(updateResult(results, next))} onConfirm={() => setResults(updateResult(results, { ...result, status: "confirmed" }))} onRegenerate={() => void regenerate(result.studentIndex)} onCopy={() => void copy(result.paragraph)} />)}</div>}
    </section>
  );

  const renderFeature1Results = () => {
    const results = state.feature1.results;
    if (results.length === 0) return <section className="results-section"><div className="section-heading"><div><span className="eyebrow">생성 결과</span><h2>과목별 결과</h2></div></div><div className="empty-state">평가계획서를 업로드하면 과목별 결과가 여기에 표시됩니다.</div></section>;
    const subjectResults = results.filter((result) => result.subject === activeFeature1Subject).sort((left, right) => left.studentIndex - right.studentIndex);
    const subjectCopy = subjectResults.map((result) => `${result.studentIndex}\n${result.paragraph}`).join("\n\n");
    return <section className="results-section">
      <div className="section-heading"><div><span className="eyebrow">생성 결과</span><h2>과목별 결과</h2></div><button type="button" className="button-secondary" onClick={() => void copy(subjectCopy)} disabled={!activeFeature1Subject}>현재 과목 전체 복사</button></div>
      <div className="subject-tabs" role="tablist" aria-label="과목 선택">{feature1ResultSubjects.map((subject) => <button type="button" role="tab" aria-selected={subject === activeFeature1Subject} className={subject === activeFeature1Subject ? "subject-tab active" : "subject-tab"} key={subject} onClick={() => setSelectedFeature1Subject(subject)}>{subject}</button>)}</div>
      <div className="subject-result-list">{subjectResults.map((result) => <div className="subject-result-row" key={`${result.subject}-${result.studentIndex}`}><span className="student-number" aria-label={`학생 ${result.studentIndex}`}>{result.studentIndex}</span><textarea aria-label={`${activeFeature1Subject} 학생 ${result.studentIndex} 문단`} rows={4} value={result.paragraph} onChange={(event) => setState((current) => ({ ...current, feature1: { ...current.feature1, results: updateResult(current.feature1.results, { ...result, paragraph: event.target.value, status: "draft" }) } }))} /></div>)}</div>
    </section>;
  };

  const renderFeature1 = () => <>
    <div className="feature-intro"><span className="eyebrow">기능 1 · 교과 평가</span><h1>평가계획서의 근거로 교과 문장을 만듭니다.</h1><p className="feature1-subtitle">학생 이름 없이 순번만 사용합니다. 문장 생성은 항상 ‘상’ 성취 기준으로 수행되며, 상·중·하 선택은 제공하지 않습니다.</p></div>
    <div className="feature1-steps">
    <section className="panel"><div className="section-heading"><div><span className="eyebrow">1단계</span><h2>조건 확인</h2></div></div><div className="two-column"><label>필요 학생 수<input type="number" min={1} max={LIMITS.maxStudents} value={state.feature1.studentsCount || ""} onChange={(event) => setState((current) => ({ ...current, feature1: { ...current.feature1, studentsCount: studentCountFromInput(event.target.value), results: [] } }))} /></label><label>목표 글자 수<input type="number" min={20} max={LIMITS.maxTargetLength} value={state.feature1.targetLength} onChange={(event) => setState((current) => ({ ...current, feature1: { ...current.feature1, targetLength: Math.min(LIMITS.maxTargetLength, Math.max(20, Number(event.target.value) || 20)), results: [] } }))} /></label></div><div className="fixed-rule"><span className="status-point status-point-brass" />모든 문장은 ‘상’ 성취 기준으로 생성됩니다.</div></section>
    <section className="panel"><div className="section-heading"><div><span className="eyebrow">2단계</span><h2>평가계획서 업로드</h2></div><label className="button-secondary file-button">평가계획서 업로드<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.xlsx" disabled={busy} onChange={(event) => void handleSubjectExtraction(event.target.files)} /></label></div><p className="privacy-note">평가계획서를 업로드하면 교과별 영역을 확인한 뒤 설정한 학생 수만큼 자동으로 문장을 생성합니다.</p>{state.feature1.subjects.length > 0 && !busy && <div className="empty-state">{state.feature1.subjects.length}개 교과 영역을 확인했습니다. 아래 결과를 검토해 주세요.</div>}{busy && <div className="inline-loading"><span className="status-point" />{feature1Progress?.phase ?? "문장을 생성하는 중…"}</div>}</section>
    </div>
    {feature1Progress && <div className="generation-progress" role="status" aria-live="polite"><div className="generation-progress-heading"><strong>{feature1Progress.phase}</strong><span>{feature1Progress.completed} / {feature1Progress.total}명</span></div><div className="progress-track" role="progressbar" aria-label="기능1 문장 생성 진행률" aria-valuemin={0} aria-valuemax={feature1Progress.total} aria-valuenow={feature1Progress.completed}><span className="progress-fill" style={{ width: `${feature1Progress.total > 0 ? Math.round((feature1Progress.completed / feature1Progress.total) * 100) : 0}%` }} /></div></div>}
    {renderFeature1Results()}
  </>;

  const toggleKeyword = (studentIndex: number, label: string) => setFeature2Students(feature2Students.map((student) => student.studentIndex === studentIndex ? { ...student, keywords: student.keywords.includes(label) ? student.keywords.filter((item) => item !== label) : [...student.keywords, label].slice(0, LIMITS.maxKeywordsPerStudent) } : student));

  const renderFeature2 = () => <>
    <div className="feature-intro"><span className="eyebrow">기능 2 · 행동특성 및 종합의견</span><h1>핵심 키워드로 네 문장을 구성합니다.</h1><p>관찰 기록이나 학생 명단은 받지 않습니다. 선택하거나 직접 입력한 키워드만 근거로 사용합니다.</p></div>
    <section className="panel"><div className="two-column"><label>필요 학생 수<input type="number" min={1} max={LIMITS.maxStudents} value={state.feature2.studentsCount || ""} onChange={(event) => setState((current) => ({ ...current, feature2: { ...current.feature2, studentsCount: studentCountFromInput(event.target.value) } }))} /></label><label>한 문장당 목표 글자 수<input type="number" min={20} max={LIMITS.maxTargetLength} value={state.feature2.targetLength} onChange={(event) => setState((current) => ({ ...current, feature2: { ...current.feature2, targetLength: Math.min(LIMITS.maxTargetLength, Math.max(20, Number(event.target.value) || 20)) } }))} /></label></div><button className="button-secondary" type="button" onClick={() => { const source = feature2Students[0]?.keywords ?? []; setFeature2Students(feature2Students.map((student) => ({ ...student, keywords: [...source] }))); }}>학생 1 키워드를 전체에 복사</button></section>
    <section className="student-grid">{feature2Students.map((student) => <article className="student-card" key={student.studentIndex}><div className="student-card-heading"><h2>학생 {student.studentIndex}</h2><span>{student.keywords.length}개 선택</span></div>{KEYWORD_GROUPS.map((group) => <div className="keyword-group" key={group.id}><span className="eyebrow">{group.label}</span><div className="chip-list">{KEYWORDS.filter((keyword) => keyword.group === group.id).map((keyword) => <button type="button" className={`chip chip-button ${student.keywords.includes(keyword.label) ? "chip-selected" : ""}`} key={keyword.id} onClick={() => toggleKeyword(student.studentIndex, keyword.label)}>{keyword.label}</button>)}</div></div>)}<label>직접 입력한 키워드<input placeholder="예: 차분한 태도" onKeyDown={(event) => { if (event.key !== "Enter") return; event.preventDefault(); const value = event.currentTarget.value.trim(); if (value) { toggleKeyword(student.studentIndex, value); event.currentTarget.value = ""; } }} /></label><div className="chip-list">{student.keywords.filter((keyword) => !KEYWORDS.some((item) => item.label === keyword)).map((keyword) => <button type="button" className="chip chip-selected chip-button" key={keyword} onClick={() => toggleKeyword(student.studentIndex, keyword)}>{keyword} ×</button>)}</div></article>)}</section>
    <div className="primary-actions"><button type="button" className="button-primary" onClick={() => void generateFeature2()} disabled={busy}>{busy ? "생성 중…" : `학생 ${state.feature2.studentsCount}명 네 문장 생성`}</button><span className="action-hint">예상 문장 수: {state.feature2.studentsCount * 4}개</span>{progress && <span className="action-hint" role="status">{progress}</span>}</div>
    {renderResults(state.feature2.results, state.feature2.targetLength, "기능2", async (index) => { setBusy(true); try { const student = feature2Students.find((item) => item.studentIndex === index); if (!student) return; const payload = await requestJson<{ results: StudentResult[] }>("/api/generate/feature-2", { ...state.feature2, students: [student], commonOptions }); setState((current) => ({ ...current, feature2: { ...current.feature2, results: payload.results.reduce(updateResult, current.feature2.results) } })); } catch (error) { reportError(error); } finally { setBusy(false); } }, (results) => setState((current) => ({ ...current, feature2: { ...current.feature2, results } })))}
  </>;

  const renderFeature3 = () => <>
    <div className="feature-intro"><span className="eyebrow">기능 3 · 자율활동</span><h1 className="feature3-title">승인한 활동 주제 네 가지를 문장으로 만듭니다.</h1><p>학생 순번별 주제를 검토하고 승인한 뒤에만 생성합니다. 입력하지 않은 활동과 사건은 추가하지 않습니다.</p></div>
    <section className="panel"><div className="two-column"><label>필요 학생 수<input type="number" min={1} max={LIMITS.maxStudents} value={state.feature3.studentsCount || ""} onChange={(event) => setState((current) => ({ ...current, feature3: { ...current.feature3, studentsCount: studentCountFromInput(event.target.value), approved: false } }))} /></label><label>한 문장당 목표 글자 수<input type="number" min={20} max={LIMITS.maxTargetLength} value={state.feature3.targetLength} onChange={(event) => setState((current) => ({ ...current, feature3: { ...current.feature3, targetLength: Math.min(LIMITS.maxTargetLength, Math.max(20, Number(event.target.value) || 20)) } }))} /></label></div><div className="two-column"><label>활동 주제 직접 입력<input placeholder="주제를 입력하고 Enter를 누르세요" onKeyDown={(event) => { if (event.key !== "Enter") return; event.preventDefault(); const value = event.currentTarget.value.trim(); if (value && !state.feature3.topics.includes(value)) { setState((current) => ({ ...current, feature3: { ...current.feature3, topics: [...current.feature3.topics, value], approved: false } })); event.currentTarget.value = ""; } }} /></label><label className="button-secondary file-button">문서에서 주제 추출<input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.xlsx" onChange={(event) => void handleActivityExtraction(event.target.files?.[0])} /></label></div><div className="chip-list">{state.feature3.topics.map((topic) => <button type="button" className="chip chip-selected chip-button" key={topic} onClick={() => setState((current) => ({ ...current, feature3: { ...current.feature3, topics: current.feature3.topics.filter((item) => item !== topic), assignments: [], approved: false, results: [] } }))}>{topic} ×</button>)}</div><p className="privacy-note">유효 주제: {state.feature3.topics.length}개 / 최소 4개</p><button type="button" className="button-secondary" onClick={randomizeAssignments} disabled={state.feature3.topics.length < 4}>학생별 네 주제 무작위 배정</button></section>
    {state.feature3.assignments.length > 0 && <section className="panel"><div className="section-heading"><div><span className="eyebrow">검토 단계</span><h2>학생별 배정</h2></div><button type="button" className={state.feature3.approved ? "button-secondary" : "button-primary"} onClick={() => setState((current) => ({ ...current, feature3: { ...current.feature3, approved: !current.feature3.approved, results: [] } }))}>{state.feature3.approved ? "승인 취소" : "배정 승인"}</button></div><div className="assignment-grid">{state.feature3.assignments.map((assignment) => <div className="assignment-card" key={assignment.studentIndex}><strong>학생 {assignment.studentIndex}</strong><div className="assignment-topics">{assignment.topics.map((topic, topicIndex) => <label key={`${assignment.studentIndex}-${topicIndex}`}>주제 {topicIndex + 1}<select value={topic} onChange={(event) => setState((current) => ({ ...current, feature3: { ...current.feature3, approved: false, results: [], assignments: current.feature3.assignments.map((item) => item.studentIndex === assignment.studentIndex ? { ...item, topics: item.topics.map((value, index) => index === topicIndex ? event.target.value : value) } : item) } }))}><option value={topic}>{topic}</option>{state.feature3.topics.filter((candidate) => candidate === topic || !assignment.topics.includes(candidate)).map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}</select></label>)}</div></div>)}</div></section>}
    <div className="primary-actions"><button type="button" className="button-primary" onClick={() => void generateFeature3()} disabled={busy || !state.feature3.approved}>{busy ? "생성 중…" : `학생 ${state.feature3.studentsCount}명 자율활동 생성`}</button><span className="action-hint">승인된 주제만 생성 근거로 사용합니다.</span>{progress && <span className="action-hint" role="status">{progress}</span>}</div>
    {renderResults(state.feature3.results, state.feature3.targetLength, "기능3", async (index) => { setBusy(true); try { const assignment = state.feature3.assignments.find((item) => item.studentIndex === index); if (!assignment) return; const payload = await requestJson<{ results: StudentResult[] }>("/api/generate/feature-3", { ...state.feature3, assignments: [assignment], commonOptions }); setState((current) => ({ ...current, feature3: { ...current.feature3, results: payload.results.reduce(updateResult, current.feature3.results) } })); } catch (error) { reportError(error); } finally { setBusy(false); } }, (results) => setState((current) => ({ ...current, feature3: { ...current.feature3, results } })))}
  </>;

  return <main className="app-frame">
    <header className="app-header"><div className="brand-lockup"><Image src="/assets/signature/final/dyk-symbol-on-light.svg" alt="D.Y. Kim" width={52} height={52} /><div className="brand-copy"><span className="eyebrow">D.Y. Kim</span><span className="product-name">Evaluator</span></div></div><nav aria-label="주요 기능">{(["feature1", "feature2", "feature3"] as Feature[]).map((item) => <button type="button" className={feature === item ? "nav-button active" : "nav-button"} key={item} onClick={() => setFeature(item)}>{item === "feature1" ? "기능 1 · 교과 평가" : item === "feature2" ? "기능 2 · 행동특성" : "기능 3 · 자율활동"}</button>)}</nav><div className="header-actions" ref={popoverGroupRef}><SharedOptions value={commonOptions} onChange={setCommonOptions} open={openPopover === "options"} onToggle={() => setOpenPopover((current) => current === "options" ? null : "options")} /><div className="data-menu"><button type="button" className="data-button" aria-haspopup="dialog" aria-expanded={openPopover === "data"} onClick={() => setOpenPopover((current) => current === "data" ? null : "data")}>저장&amp;삭제</button>{openPopover === "data" && <div className="data-menu-panel popover-panel" role="dialog" aria-label="저장&amp;삭제"><button type="button" className="button-secondary" onClick={exportAll}>전체 엑셀 다운로드</button><button type="button" className="button-secondary" onClick={clearAll}>전체 데이터 삭제</button></div>}</div></div></header>
    <div className="save-bar"><span className="status-point" />{storageStatus === "failed" ? "저장 실패 · 메모리에서 계속 작업" : storageStatus === "saved" ? "이 브라우저에 저장됨" : "저장 준비됨"}</div>
    {message && <p className="sr-only" role="status">{message}</p>}
    {fallbackText && <div className="fallback-copy"><label>직접 복사할 결과<textarea readOnly value={fallbackText} /></label><button type="button" className="button-secondary" onClick={() => setFallbackText("")}>닫기</button></div>}
    <div key={feature}>{feature === "feature1" ? renderFeature1() : feature === "feature2" ? renderFeature2() : renderFeature3()}</div>
    <footer className="app-footer"><span>학생 식별정보를 입력하지 않는 비식별 작업 공간</span><Image src="/assets/signature/final/dyk-credit-on-light.svg" alt="by D.Y. Kim" width={110} height={28} /></footer>
  </main>;
}
