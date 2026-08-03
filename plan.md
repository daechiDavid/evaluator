# 학생 평가문장 생성기 구현 계획

## 1. 기준 문서와 구현 목표

- 제품 요구사항: [`PRD.md`](./PRD.md)
- 제품 화면 설계: [`product-design.md`](./product-design.md)
- canonical 디자인 시스템: [`design.md`](./design.md)
- 아이디어 원본: [`idea.txt`](./idea.txt)

목표는 `PRD.md`의 모든 MVP 요구사항을 Next.js 기반 Vercel 웹앱으로 구현하는 것이다. 이 문서는 구현 순서와 기술 결정을 다루며 기능의 최종 의미와 인수 조건은 `PRD.md`를 우선한다.

현재 앱 스캐폴딩과 로컬 구현·자동 검증은 완료되어 있다. GitHub `evaluator` 원격 연결, Vercel 환경변수 주입, Preview/Production 배포와 실제 Gemini 호출 smoke test는 별도 릴리스 단계에서 수행한다.

## 2. 제품 분류

- 유형: 서버 기능을 포함한 반응형 웹앱
- 주 사용 환경: 최신 데스크톱 브라우저
- 보조 환경: 태블릿·모바일 브라우저
- 서버 역할: 문서 파싱, Gemini 생성·검수·장애조치, 입력 검증과 보안
- 클라이언트 역할: 기능별 입력, 배치 오케스트레이션, localStorage 복구, 결과 편집, XLSX와 클립보드
- 소스 관리: 기존 GitHub `evaluator` 저장소, GitHub CLI
- 배포: Vercel Git 연동, Vercel CLI

Next.js Route Handler와 Node.js 문서 파서가 필요하고 `idea.txt`가 Vercel 배포를 명시하므로, 원격 DB가 없어도 Vercel을 런타임·배포 대상으로 선택한다.

## 3. 선택 기술 스택

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 웹 프레임워크 | Next.js App Router + React + TypeScript strict | 같은 저장소에서 반응형 UI와 같은 출처 서버 API를 구성하고 Vercel Functions로 배포 |
| 패키지 관리자 | pnpm | 결정적 잠금 파일, 빠른 설치와 명확한 스크립트 관리 |
| 스타일 | CSS Modules + `globals.css` 디자인 토큰 | `design.md` 토큰을 직접 반영하고 불필요한 UI 프레임워크 종속을 피함 |
| 스키마 | Zod | 클라이언트 입력, API 계약, 모델 구조화 응답과 localStorage 버전을 공통 검증 |
| Gemini | 공식 Google Gen AI JavaScript SDK, `server-only` | API 키·프롬프트·외부 URL을 서버 모듈에 격리 |
| 브라우저 저장 | Web Storage `localStorage` | 짧은 텍스트·선택값·최근 결과를 서버 DB 없이 복구 |
| XLSX | ExcelJS, 내보내기 시 동적 import | XLSX 읽기·쓰기와 시트 제어를 한 라이브러리로 통합하고 초기 번들에서 제외 |
| DOCX | Mammoth 서버 어댑터 | DOCX의 읽을 수 있는 텍스트 추출에 집중 |
| PPTX | JSZip + fast-xml-parser 서버 어댑터 | PPTX의 슬라이드 XML과 텍스트 순서를 통제하며 추출 |
| 파일 판별 | `file-type` + 확장자·MIME 교차 검증 | 브라우저 제공 MIME만 신뢰하지 않음 |
| 인증 기본안 | Node `crypto` 해시 검증 + `jose` 서명 쿠키 | 사용자 DB 없이 공유 접근 코드와 HttpOnly 세션 구현 |
| 테스트 | Vitest, React Testing Library, Playwright | 규칙·컴포넌트·API·실제 브라우저 흐름을 계층별 검증 |
| 소스·릴리스 | GitHub `evaluator` 저장소 + GitHub CLI | 기존 원격 저장소를 재생성하지 않고 브랜치·Pull Request·병합을 CLI로 관리 |
| 배포 | Vercel Git 연동 + Vercel CLI | 브랜치/PR Preview와 `main` Production 자동 배포, 환경 분리, 비밀 주입과 배포 확인 |

패키지의 정확한 버전은 스캐폴딩 시점의 `package.json`과 `pnpm-lock.yaml`로 고정한다. Gemini 모델의 실제 식별자는 배포 전 공식 목록을 확인해 `GEMINI_MODEL`에 설정한다.

## 4. 데이터베이스 결정

### 4.1 결정

MVP에는 원격 데이터베이스 제공자를 선택하지 않는다. Firebase, Supabase, Cloudflare D1, Neon 중 선택 수는 0이다.

### 4.2 이유

- 학생 명단·식별정보와 생성 결과를 서버에 영구 저장하지 않는 것이 핵심 요구사항이다.
- 입력과 결과는 브라우저 localStorage의 제한된 최근 이력으로 충분하다.
- 사용자 계정·기기 간 동기화·공유 작업·강한 전역 멱등성은 MVP 제외 범위다.
- 불필요한 원격 DB는 개인정보·운영·마이그레이션 범위를 확대한다.

### 4.3 대안 미선택

- Firebase: 실시간·오프라인 동기화와 모바일 중심 요구가 없다.
- Supabase: 관계형 CRUD, RLS, Auth, Storage를 현재 제품이 요구하지 않는다.
- Cloudflare D1: 앱 런타임은 Workers-first가 아니며 Vercel Node 문서 처리를 사용한다.
- Neon: 표준 Postgres와 ORM이 필요한 영구 서버 데이터 모델이 없다.

### 4.4 향후 전환 조건

기기 간 동기화, 사용자별 계정·이력, 전역 키 냉각, 정확히 한 번 실행되는 작업, 강한 합산 사용량 제한이 필수가 되면 별도 요구사항 변경 후 네 제공자 중 정확히 하나를 재평가한다. MVP에 임시 KV나 두 번째 저장소를 몰래 추가하지 않는다.

## 5. 핵심 아키텍처

```text
Browser
├─ React feature UI
├─ localStorage repository
├─ batch coordinator
├─ clipboard adapter
└─ XLSX exporter (lazy)
      │ same-origin POST, no secrets
      ▼
Next.js Route Handlers on Vercel Node runtime
├─ access/session guard
├─ Zod request validation
├─ document parser adapters
├─ generation service
├─ deterministic rule validators
├─ semantic review service
└─ GeminiFailoverClient
      ├─ key slot 1 / Google project 1
      ├─ key slot 2 / Google project 2
      └─ key slot 3 / Google project 3
```

### 5.1 서버 경계

- `@google/genai`, 환경변수, 시스템 프롬프트, 오류 원문과 키 풀은 `server-only` 모듈만 접근한다.
- Route Handler는 Node.js 런타임을 명시한다. 문서 ZIP/XML 파서 때문에 Edge 런타임을 선택하지 않는다.
- 요청·응답 Zod 스키마를 공유하되 서버 비밀 타입과 내부 오류 타입은 클라이언트에 export하지 않는다.
- 모든 생성·검수 응답은 `Cache-Control: no-store`를 사용한다.
- 업로드 원본은 메모리 또는 요청 한정 임시 공간에서만 처리하고 영구 저장하지 않는다.

### 5.2 클라이언트 경계

- localStorage 접근은 마운트 후 저장소 어댑터에서만 수행한다.
- 저장 복원 완료 전 자동 저장을 시작하지 않는다.
- 생성 API 결과는 스키마 검증 후 상태에 반영하고, 원본 SDK 오류를 보관하지 않는다.
- 배치는 작업 묶음별로 순차 또는 제한된 동시성으로 호출한다.
- XLSX는 사용자가 내보내기를 요청할 때만 로드한다.

### 5.3 접근 제어

- 기본안은 `APP_ACCESS_CODE_HASH`와 `APP_SESSION_SECRET`을 Vercel 환경변수로 둔다.
- 서버는 접근 코드를 일정 시간 검증해 Secure, HttpOnly, SameSite 쿠키를 발급한다.
- 모든 Gemini·문서 API는 세션 가드를 공통 적용한다.
- 접근 코드 원문은 저장·로그하지 않는다.
- Vercel Deployment Protection으로 확정되면 앱 접근 화면과 두 환경변수를 제거하되 API 보호 인수 조건은 유지한다.

## 6. 데이터 모델과 저장 스키마

### 6.1 공통 도메인

```ts
type FeatureKind = "feature1" | "feature2" | "feature3";
type StudentIndex = number;
type ResultStatus = "draft" | "review-needed" | "confirmed" | "failed";
type BatchStage = "queued" | "generating" | "format-review" | "similarity-review" | "complete" | "failed" | "unknown";
```

각 기능 모델은 원본 입력, 학생 순번별 선택, 생성 문장, 문장별 검수, 근거, 재생성 횟수와 확정 상태를 분리한다. 학생 이름·학번 필드는 정의하지 않는다.

### 6.2 localStorage 키

| 키 | 내용 |
| --- | --- |
| `evaluator:v1:meta` | 스키마 버전, 마지막 기능, 수정 시각, 보관 인덱스 |
| `evaluator:v1:common-options` | 사용자 보충 작성 원칙 |
| `evaluator:v1:feature-1` | 업로드 후 추출 구조, 학생 수·목표 길이, 결과·검수·확정 상태; 사용자 수준 필드와 파일 원본 제외 |
| `evaluator:v1:feature-2` | 학생별 키워드와 결과·검수·확정 상태 |
| `evaluator:v1:feature-3` | 활동 주제, 승인 배정과 결과·검수·확정 상태 |

JSON 파싱 후 반드시 Zod 검증을 거친다. 쓰기는 디바운스하되 생성 완료·확정·초기화는 즉시 반영한다. 용량 초과와 손상 데이터는 기능별로 격리한다.

### 6.3 마이그레이션

- `storage/migrations/v1.ts`부터 순차 마이그레이션 함수를 둔다.
- 알 수 없는 미래 버전은 덮어쓰지 않고 내보내기 또는 삭제를 요청한다.
- 오래된 미확정 이력 정리는 사용자에게 영향을 보여준 후 수행한다.
- IndexedDB 전환은 저장소 인터페이스를 유지하고 별도 PRD 변경으로 처리한다.

## 7. API와 서비스 모듈

### 7.1 API 초안

| 경로 | 역할 | PRD |
| --- | --- | --- |
| `POST /api/access` | 접근 코드 검증과 세션 발급 | FR-003 |
| `DELETE /api/access` | 세션 종료 | FR-003 |
| `POST /api/documents/extract-evaluation` | 기능 1 문서 검증·추출 | FR-101~104 |
| `POST /api/documents/extract-activities` | 기능 3 활동 주제 추출 | FR-301 |
| `POST /api/generate/feature-1` | 교과 평가 작업 묶음 생성 | FR-105~108, FR-401~408 |
| `POST /api/generate/feature-2` | 행동특성 작업 묶음 생성 | FR-201~204, FR-401~408 |
| `POST /api/generate/feature-3` | 자율활동 작업 묶음 생성 | FR-301~304, FR-401~408 |
| `POST /api/review/similarity` | 필요 시 전체 묶음 의미 중복 재검수 | FR-406 |

선택 문장 재생성은 기능별 생성 API에 문장 범위와 기존 통과 문장 요약을 전달한다. 클라이언트는 프롬프트, 모델명, 키 슬롯을 지정하지 않는다.

### 7.2 문서 파서

- 공통 인터페이스: `parse(file): ParsedDocument`.
- PDF·이미지: 파일 검증 후 Gemini의 지원 입력 형식으로 전달한다.
- DOCX: Mammoth 결과를 문단 단위로 정규화한다.
- PPTX: ZIP 안의 슬라이드 XML을 번호 순으로 읽고 텍스트·표 셀을 추출한다.
- XLSX: 워크시트·행·셀을 순서와 함께 텍스트 구조로 변환한다.
- 모든 파서는 추출 한도, 빈 결과, 암호화·손상·지원하지 않는 구조를 명시적 오류로 반환한다.

### 7.3 GeminiFailoverClient

1. 환경 설정 모듈이 키 1·2·3을 숫자 순으로 읽는다.
2. 빈 선택 키와 같은 값의 중복 키를 제외한다.
3. 키 1과 모델이 없으면 시작하지 않는다.
4. 인증·권한 오류 또는 429만 다음 슬롯 전환 대상으로 정규화한다.
5. 짧은 429는 남은 함수 실행 시간 안에서 Retry-After 또는 지수 백오프+지터를 최대 한 차례 적용한다.
6. 400·404·콘텐츠 거부는 전환하지 않는다.
7. 5xx/503은 같은 슬롯에서 제한된 백오프 후 종료하고 키를 확산하지 않는다.
8. 불명확한 타임아웃은 다른 키로 즉시 재호출하지 않는다.
9. 성공 또는 마지막 키에서 중단한다.
10. 로그에는 슬롯 번호, 정규화 오류, 전환 여부와 시간만 남긴다.

### 7.4 규칙 검사 파이프라인

1. 구조화 응답 스키마
2. 문장 수
3. 공백·줄바꿈·문장부호 제외 글자 수 ±5
4. 마침표 및 명사형 종결
5. 영어 알파벳과 금지 표현
6. 번호·불릿·마크다운·불필요 기호
7. 근거 부합·할루시네이션·낙인·차별 의미 검수
8. 정확 일치·표현 구조·의미 유사도
9. 문제 문장만 최대 세 번 재생성
10. 교사 검토 또는 확정

문자열 검사는 순수 함수로 구현하고 Gemini 의미 검수와 분리한다.

## 8. 예정 폴더 구조

```text
.
├─ AGENTS.md
├─ PRD.md
├─ plan.md
├─ product-design.md
├─ design.md
├─ idea.txt
├─ assets/signature/final/          # canonical 고정 자산
├─ public/assets/signature/final/   # manifest 검증 후 동일 자산 배포본
├─ src/
│  ├─ app/
│  │  ├─ access/page.tsx
│  │  ├─ feature-1/page.tsx
│  │  ├─ feature-2/page.tsx
│  │  ├─ feature-3/page.tsx
│  │  └─ api/
│  │     ├─ access/route.ts
│  │     ├─ documents/
│  │     ├─ generate/
│  │     └─ review/
│  ├─ components/
│  │  ├─ brand/
│  │  ├─ shell/
│  │  ├─ forms/
│  │  └─ results/
│  ├─ features/
│  │  ├─ feature-1/
│  │  ├─ feature-2/
│  │  └─ feature-3/
│  ├─ domain/
│  │  ├─ schemas/
│  │  ├─ validators/
│  │  ├─ similarity/
│  │  └─ batch/
│  ├─ lib/
│  │  ├─ client/storage/
│  │  ├─ client/export/
│  │  └─ server/
│  │     ├─ auth/
│  │     ├─ documents/
│  │     ├─ gemini/
│  │     └─ security/
│  ├─ config/
│  │  ├─ keywords.ts
│  │  ├─ writing-rules.ts
│  │  └─ limits.ts
│  └─ styles/
├─ tests/
│  ├─ fixtures/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ scripts/verify-brand-assets.mjs
├─ .env.example
├─ next.config.ts
├─ package.json
└─ pnpm-lock.yaml
```

## 9. 구현 마일스톤과 작업

### M0. 기반과 보안 경계

- [x] 기존 저장소 연결 규칙과 안전한 원격 이력 확인 절차를 문서화한다. 저장소를 다시 만들거나 이력을 덮어쓰지 않는다. (`NFR-009`)
- [x] `.gitignore`에 비밀·Vercel 로컬 메타데이터를 포함하고 pnpm/Next.js/TypeScript 구성을 추가한다. (`NFR-007`, `NFR-009`)
- [x] canonical 자산을 `public/` 배포본으로 복사하고 manifest 해시 검증 스크립트를 만든다. (`NFR-008`)
- [x] D.Y. Kim 토큰, 앱 셸, 승인 favicon·Creator credit을 적용한다. (`FR-001`, `NFR-003`, `NFR-008`)
- [x] `.env.example`, 서버 전용 환경 스키마와 API 비밀 경계를 추가한다. (`FR-009`, `FR-601`, `FR-602`, `FR-606`)
- [x] 접근 코드·HttpOnly 세션 가드와 Origin/CSP/보안 헤더를 구현한다. (`FR-003`)

완료 기준: 비밀 없이 앱이 빌드되고, 생성 API는 인증 없이는 거부되며, 브랜드 manifest 검증이 통과한다.

### M1. 공통 도메인·저장·검수

- [x] 학생 순번, 기능 상태, 문장, 근거, 검수, 배치 스키마를 정의한다. (`FR-002`, `FR-401~408`, `FR-501~502`)
- [x] localStorage 저장소·복원 게이트·스키마 검증·용량 오류·초기화를 구현한다. (`FR-005~008`)
- [x] 공통 작성 옵션과 코드 기반 기본 규칙을 구현한다. (`FR-004`)
- [x] 결정적 형식·길이·언어·표식 검사기를 구현한다. (`FR-401~405`)
- [x] 문자열 및 의미 중복 파이프라인과 85점/세 번 상한을 구현한다. (`FR-406`)
- [x] 결과 편집·근거·확정 공통 컴포넌트를 구현한다. (`FR-407~408`)

완료 기준: fixture 문장을 API 없이 검수하고 저장·복원·수정·확정할 수 있다.

### M2. Gemini와 문서 처리

- [x] `GeminiFailoverClient`와 오류 정규화·백오프·관측 경계를 구현한다. (`FR-601~607`)
- [x] 구조화 응답, 프롬프트 격리와 서버 시스템 지시를 구현한다. (`FR-404~405`)
- [x] MIME·크기·손상 검증과 PDF/이미지/DOCX/PPTX/XLSX 파서 어댑터를 구현한다. (`FR-101~104`, `FR-301`, `NFR-002`)
- [x] `no-store`, 일반화 오류, CSP와 보안 헤더를 구현한다. (`FR-606`, `NFR-002`)

완료 기준: 모의 Gemini로 세 키 오류 매트릭스가 통과하고 모든 파일 fixture가 구조화 결과 또는 명시적 오류를 반환한다.

### M3. 기능 1

- [x] 다중 파일 업로드·검증·진행 화면을 구현한다. (`FR-101~102`)
- [x] 평가 구조 편집, 추출 결과 검토와 오류 재처리 경계를 구현한다. (`FR-103~104`)
- [x] 학생 수·목표 길이를 구현하고 기능 1 요청·저장 스키마에서 사용자 수준 필드를 제외한다. (`FR-105`)
- [x] 서버가 모든 교과·순번·평가요소에 ‘상’ 기준을 고정 적용하는 교과 배치와 근거 제한, 교과별 결과 조회·재생성·확정을 구현한다. (`FR-106~108`, `FR-501~502`)

완료 기준: 다중 평가계획서 fixture에서 충돌을 제외하고 두 교과·여러 학생 결과를 교과별로 확정할 수 있으며, 수준 선택 없이 모든 결과가 서버의 ‘상’ 기준으로 생성된다.

### M4. 기능 2

- [x] 네 영역 기본 키워드 데이터와 선택기를 구현한다. (`FR-201`)
- [x] 학생별 복수 선택·사용자 칩·복사·최소 한 개 검증을 구현한다. (`FR-202`)
- [x] 네 문장 생성, 키워드 근거 연결과 사실 제한 검수를 구현한다. (`FR-203~204`)

완료 기준: 관찰 기록 UI 없이 서로 다른 키워드 조합의 네 문장을 생성·검수·확정한다.

### M5. 기능 3

- [x] 직접·문서 추출 주제 목록과 네 개 최소 조건을 구현한다. (`FR-301`)
- [x] 학생별 네 주제 무작위 배정·교체·재배정과 중복 방지를 구현한다. (`FR-302`)
- [x] 승인 게이트와 승인 취소 규칙을 구현한다. (`FR-303`)
- [x] 주제별 네 문장과 근거 연결을 구현한다. (`FR-304`)

완료 기준: 승인 전 생성이 차단되고 승인된 주제만 결과에 반영된다.

### M6. 배치·XLSX·클립보드

- [x] 작업 묶음 분할, 진행 상태, 부분 결과 보존, 실패 재시도 경계를 구현한다. (`FR-501~502`)
- [x] 생성 중 버튼 잠금과 오류·추가 비용 안내를 구현한다. (`FR-502`)
- [x] 통합·기능별 XLSX와 근거 열을 구현한다. (`FR-503`)
- [x] 개별·전체 복사와 권한 실패 대체 UI를 구현한다. (`FR-504`)

완료 기준: 부분 실패 fixture에서 성공 결과가 유지되고, 확정 결과만 올바른 순번·시트로 내보내진다.

### M7. 품질·접근성·Git 연동 배포

- [x] 데스크톱·태블릿·모바일 반응형과 핵심 화면 동작을 구현한다. (`NFR-003~006`)
- [x] Origin/CSRF 경계, 입력 크기, 접근 제어, CSP와 로그 비식별 경계를 구현한다. (`NFR-001~002`)
- [x] 기본 기능 탭 E2E, 규칙·저장 스키마 단위 테스트와 브랜드 검증을 자동화한다. (`NFR-010`)
- [ ] Vercel 프로젝트를 기존 GitHub `evaluator` 원격에 연결하고 Production Branch가 `main`인지 확인한다. (`NFR-009`)
- [ ] 기능 브랜치/PR의 자동 Preview에서 비식별 smoke test를 통과한 뒤 CLI로 PR을 병합하고 자동 Production 배포를 확인한다. (`NFR-009`)

완료 기준: 타입·린트·단위·통합·E2E·빌드·비밀 스캔·브랜드 해시가 모두 통과하고 배포 검증 기록이 남는다.

## 10. 현재 package scripts

현재 `package.json`에 다음 스크립트가 실제 명령으로 정의되어 있다.

| 스크립트 | 명령 |
| --- | --- |
| `dev` | `next dev` |
| `typecheck` | `tsc --noEmit` |
| `lint` | `next lint` 또는 채택한 ESLint flat config 실행 명령 |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:e2e` | `playwright test` |
| `verify:brand` | `node scripts/verify-brand-assets.mjs` |
| `build` | `next build` |

Next.js 버전에 `next lint`가 없으면 `eslint .`을 실제 `lint` 스크립트로 고정한다. Preview와 Production은 package script의 직접 배포가 아니라 GitHub push/PR/`main` 병합으로 생성한다. 구현 전에 존재하지 않는 스크립트가 성공했다고 보고하지 않는다.

## 11. CLI 전용 초기화 순서

비어 있지 않은 문서 루트를 보존하기 위해 `create-next-app`으로 루트를 덮어쓰지 않고 pnpm으로 필요한 구성을 추가한다.

```bash
corepack enable
pnpm init
pnpm add next react react-dom zod @google/genai server-only exceljs mammoth jszip fast-xml-parser file-type jose
pnpm add -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
pnpm exec playwright install chromium
```

이후 구현 파일과 `package.json` 스크립트는 계획된 구조로 작성하고, 다음 검증을 실행한다.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm verify:brand
pnpm build
```

## 12. 환경변수 계획

`.env.example`에는 값 없이 다음 이름과 설명만 기록한다.

```dotenv
GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_MODEL=
APP_ACCESS_CODE_HASH=
APP_SESSION_SECRET=
```

- Production 목표는 세 프로젝트 키 모두 설정이다.
- 앱 실행 필수값은 키 1과 모델이며 키 2·3은 장애 중 축소 운영을 위해 선택값으로 파싱한다.
- 공유 접근 코드 방식이 아닌 Vercel 보호를 확정하면 마지막 두 변수는 제거한다.
- `NEXT_PUBLIC_` 이름으로 비밀값을 만들지 않는다.
- `.env.local`, 계정 이메일, 프로젝트 ID, 결제정보와 실제 키는 커밋하지 않는다.

## 13. GitHub 연동 Vercel 배포 순서

GitHub에는 `evaluator` 저장소가 이미 존재하고 Google 프로젝트와 키 세 개도 사용자가 보유한 선행 조건으로 본다. 저장소를 다시 생성하지 않으며 GitHub 작업은 GitHub CLI, Vercel 작업은 Vercel CLI로 수행한다. CLI가 여는 브라우저 인증과 GitHub App 권한 동의는 허용하지만 대시보드 수동 연결은 기본 절차로 사용하지 않는다.

### 13.1 GitHub 인증과 기존 원격 확인

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth status --active --hostname github.com
gh api user --jq .login
gh repo view <github-owner>/evaluator --json nameWithOwner,url,isEmpty,defaultBranchRef,viewerPermission
```

- 현재 폴더에 `.git`이 없을 때만 `git init -b main`을 실행한다.
- `gh auth setup-git --hostname github.com`으로 HTTPS Git 인증을 연결한 뒤 기존 저장소 URL을 `origin`으로 추가한다.
- `origin`이 이미 있으면 덮어쓰지 말고 `git remote -v`로 `evaluator`를 가리키는지 확인한다.
- `git ls-remote --heads origin` 결과가 비어 있지 않으면 먼저 `git fetch origin`으로 이력을 확인하고 안전하게 합친다. `--force`, `--force-with-lease`, 이력 재작성과 원격 덮어쓰기는 사용하지 않는다.
- 저장소가 이미 존재하므로 `gh repo create`는 실행하지 않는다.

```bash
git init -b main
gh auth setup-git --hostname github.com
git remote add origin https://github.com/<github-owner>/evaluator.git
git remote -v
git ls-remote --heads origin
```

### 13.2 Vercel 프로젝트와 GitHub 저장소 연결

로컬 `.git`의 `origin`을 먼저 확정해야 `vercel git connect`가 같은 원격 저장소를 찾을 수 있다.

```bash
pnpm dlx vercel@latest login --github
pnpm dlx vercel@latest link
pnpm dlx vercel@latest env add GEMINI_API_KEY_1 production
pnpm dlx vercel@latest env add GEMINI_API_KEY_2 production
pnpm dlx vercel@latest env add GEMINI_API_KEY_3 production
pnpm dlx vercel@latest env add GEMINI_MODEL production
pnpm dlx vercel@latest env add APP_ACCESS_CODE_HASH production
pnpm dlx vercel@latest env add APP_SESSION_SECRET production
pnpm dlx vercel@latest git connect --yes
pnpm dlx vercel@latest git ls
```

Preview에는 테스트에 필요한 최소 키만 `vercel env add <NAME> preview`로 별도 주입한다. 프로덕션 키를 Preview 부하 테스트에 상시 공유하지 않는다. 접근 제어 대안이 확정되면 관련 환경변수 명령을 그 결정에 맞춰 조정한다. 연결 후 Production Branch가 `main`인지 CLI 조회 결과와 첫 배포 메타데이터로 확인한다.

### 13.3 최초 기준선과 정상 릴리스 흐름

원격 저장소가 비어 있을 때만 검증된 최초 기준 커밋을 `main`에 한 번 push한다. 원격에 커밋이 있으면 먼저 그 이력을 통합하며 초기화 목적으로 강제 push하지 않는다. 이후 모든 일반 변경은 기능 브랜치와 Pull Request를 거친다.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm verify:brand
pnpm build
git push -u origin main
```

일반 변경의 Preview/Production 흐름은 다음과 같다.

```bash
git switch -c feat/<change-name>
git push -u origin feat/<change-name>
gh pr create --base main --head feat/<change-name>
gh pr checks --watch
pnpm dlx vercel@latest list --environment preview --status READY
pnpm dlx vercel@latest inspect <preview-deployment-url>
pnpm dlx vercel@latest curl / --deployment <preview-deployment-url>
gh pr merge --squash --delete-branch
pnpm dlx vercel@latest list --environment production --status READY
pnpm dlx vercel@latest inspect <production-deployment-url>
pnpm dlx vercel@latest logs <production-deployment-url>
```

기능 브랜치 push와 Pull Request가 Preview를 자동 생성하고, 검증된 Pull Request의 `main` 병합이 Production을 자동 생성한다. 배포 URL과 커밋 SHA가 대상 PR 또는 병합 커밋과 일치하는지 확인한다. `vercel deploy`와 `vercel deploy --prod`는 정상 릴리스에 사용하지 않으며 Git 연동 장애의 진단·복구가 필요하고 사용자가 명시적으로 승인한 경우에만 예외로 사용한다.

## 14. 검증 전략

### 14.1 단위 테스트

- 글자 수 계산과 ±5 경계
- 마침표·명사형·영어·숫자·표식·금지 표현
- 기능 1 요청·저장 스키마의 수준 필드 부재와 서버 ‘상’ 기준 고정 적용
- 키워드 최소값과 복사
- 활동 주제 네 개·학생 내 중복 방지
- localStorage 직렬화·마이그레이션·용량/손상 오류
- exact/표현 중복과 재생성 상한
- 키 풀 빈 값·중복 제거와 오류별 전환 행렬

### 14.2 통합 테스트

- 파일 fixture별 파서와 구조화 추출
- Route Handler 인증, Zod 검증, `no-store`, 일반화 오류
- 모의 Gemini로 생성→규칙 검사→선택 재생성→확정
- 1→2→3 장애조치, 성공 중단, 비전환 오류와 마지막 실패
- XLSX 시트·열·순번·근거 검증

### 14.3 E2E

- 접근→복원→기능 1 전체 흐름
- 기능 2 키워드 복사→네 문장→확정
- 기능 3 주제 부족→배정→승인→생성
- 부분 실패→실패만 재시도
- 새로고침 복원과 전체 삭제
- 클립보드 성공·거부 대체 경로
- 데스크톱·모바일 핵심 경로와 키보드 탐색

### 14.4 보안·릴리스

- 클라이언트 번들·소스맵에서 키 값, 서버 프롬프트, Google URL, SDK 서버 코드 검색
- 실제 문자열을 로그로 보내지 않는지 검증
- CSP, 보안 헤더, Origin/CSRF, MIME·용량 제한 검증
- canonical와 public 자산 manifest SHA-256 비교
- 실제 학생 데이터 없이 배포 smoke test

## 15. 주요 위험과 대응

| 위험 | 영향 | 대응 |
| --- | --- | --- |
| Gemini 3.5 Flash Lite 모델 ID·기능 변경 | 배포 실패 | `GEMINI_MODEL` 분리, 배포 전 공식 모델 확인, 구조화 응답 계약 테스트 |
| Vercel 요청 크기·시간 제한 | 대형 문서·배치 실패 | 파일/학생 하드 제한, 문서·교과·학생 묶음 분할, Preview 벤치마크 |
| PPTX/DOCX 구조 다양성 | 추출 누락 | 파서 어댑터·fixture 확대, 빈/불완전 추출을 교사 검토로 전환 |
| localStorage 용량·평문 | 저장 실패·공용 PC 노출 | 최근 이력 상한, 용량 오류, 내보내기·전체 삭제, 식별정보 입력 금지 |
| 의미 유사도 비교 비용 | 지연·비용 증가 | 문자열 사전 필터, 묶음 비교, 세 번 상한, 문장만 재생성 |
| 서버 DB 없는 불명확한 타임아웃 | 중복 호출·비용 | `unknown` 상태, 즉시 다른 키 호출 금지, 사용자 확인 재시도 |
| 서버리스 인스턴스 간 키 상태 미공유 | 소진 키 재확인 | 요청 내부 장애조치로 한정, 슬롯별 모니터링, 필요 시 별도 요구사항으로 저장소 검토 |
| 세 프로젝트 비용 합산 | 비용 예측 어려움 | 각 Google 프로젝트 한도와 비용 알림, 앱 작업당 호출 상한, 합산 운영 기록 |
| 전역 속도 제한 저장소 부재 | 분산 요청 통제가 약함 | 접근 제어, 요청 크기·동시성·작업당 상한, Vercel 플랫폼 보호를 배포 전 검증 |
| 공유 접근 코드의 확장성 | 사용자별 권한 없음 | MVP 한정, 실제 다중 사용자 계정 필요 시 DB·Auth 요구사항 재설계 |
| 사용자 입력 프롬프트 인젝션 | 규칙 우회·오염 | 데이터 필드 격리, 길이/문자 제한, 고정 서버 프롬프트·스키마 |
| GitHub 인증·Vercel Git 연결 권한 누락 | 자동 Preview/Production 미생성 | CLI 인증 상태, 저장소 소유·관리 권한, `origin`, `vercel git ls`를 연결 전에 확인 |
| 기존 `evaluator` 원격 이력과 로컬 문서 충돌 | 최초 push 실패·이력 손실 | 원격 heads 조회와 fetch 후 통합, 강제 push·저장소 재생성 금지 |

## 16. 구현 전 확정할 사항

1. `PRD.md`의 OQ-001~006을 검토한다.
2. 접근 제어 기본안을 공유 코드로 확정할지 결정한다.
3. 파일 개수·크기, 학생 수, 목표 글자 수, 보관 이력 상한을 Preview 스파이크로 수치화한다.
4. ExcelJS 브라우저 번들 크기와 대량 XLSX 생성 시간을 측정한다.
5. PPTX 표·텍스트 fixture로 ZIP/XML 파서의 충분성을 확인한다.
6. 실제 Gemini 모델 ID, 구조화 출력, PDF/이미지 입력과 오류 모양을 확인한다.
7. 세 Google 프로젝트의 키 제한·결제·할당량과 운영 책임을 확인한다.

## 17. 요구사항 추적성

| 마일스톤/횡단 검증 | 연결 요구사항 |
| --- | --- |
| M0 기반·앱 셸·접근 제어 | FR-001, FR-003, FR-009, NFR-003, NFR-008, NFR-009 |
| M1 순번·공통 옵션·브라우저 저장 | FR-002, FR-004, FR-005, FR-006, FR-007, FR-008 |
| M1 공통 생성·검수·확정 | FR-401, FR-402, FR-403, FR-404, FR-405, FR-406, FR-407, FR-408 |
| M2 문서·Gemini 기반 | FR-101, FR-102, FR-103, FR-104, FR-301 |
| M2 서버 연동·키 장애조치 | FR-601, FR-602, FR-603, FR-604, FR-605, FR-606, FR-607 |
| M3 기능 1 | FR-105, FR-106, FR-107, FR-108 |
| M4 기능 2 | FR-201, FR-202, FR-203, FR-204 |
| M5 기능 3 | FR-302, FR-303, FR-304 |
| M6 배치·복구·내보내기 | FR-501, FR-502, FR-503, FR-504 |
| M7 보안·품질·Git 연동 출시 | NFR-001, NFR-002, NFR-004, NFR-005, NFR-006, NFR-007, NFR-009, NFR-010 |

하나의 요구사항이 여러 마일스톤에 영향을 주더라도 위 표는 주된 완료 책임을 나타낸다. 릴리스 시에는 각 ID에 자동 테스트 또는 수동 검증 증거를 직접 연결한다.

## 18. 문서 단계 완료 조건

- `PRD.md`의 모든 `FR-*`가 마일스톤 또는 횡단 검증 항목에 연결되어 있다.
- `product-design.md`가 세 기능, 공통 옵션, 데이터 관리, 복원, 오류, 내보내기와 반응형 상태를 포함한다.
- `AGENTS.md`가 선택 스택, 계획 명령, 폴더 구조, 보안·브랜드 규칙을 포함한다.
- `design.md`와 `assets/signature/final/manifest.json`이 canonical 설치본과 일치한다.
- 원격 데이터베이스 제공자는 0개이며 소스·PR 작업은 GitHub CLI, 연결·환경변수·검증은 Vercel CLI, 실제 Preview/Production 생성은 GitHub 연동 자동 배포로 문서화되어 있다.
- 실제 비밀값, 계정 이메일, 프로젝트 ID와 결제정보가 저장소 문서에 없다.
