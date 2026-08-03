# Project Instructions

## 1. 프로젝트 개요

이 프로젝트의 목적은 초등학교 교사가 학생 식별정보를 입력하지 않고 교과 평가, 행동특성 및 종합의견, 자율활동 문장을 생성·검수·확정·내보낼 수 있는 Vercel 웹앱을 만드는 것이다.

주요 사용자:

- 한 학급의 평가 문장을 작성하는 초등학교 교사

핵심 기능:

- 평가계획서에서 교과·성취기준·평가요소와 ‘상’ 기준 참고 내용을 추출하고 모든 학생 순번에 ‘상’ 성취 중심 교과 문장 생성
- 복수 선택·직접 입력 키워드로 학생 순번별 행동특성 네 문장 생성
- 활동 주제 추출·직접 입력, 학생별 네 주제 배정과 자율활동 문장 생성
- 서버 규칙·의미·중복 검수, 교사 편집·확정, XLSX·명시적 클립보드 복사
- localStorage 복구와 서로 다른 세 Google 프로젝트 키의 서버 전용 장애조치

가장 중요한 기준:

- `PRD.md`의 기능과 제외 범위를 누락하거나 되돌리지 않을 것
- 학생 이름·학번·반·연락처를 받거나 서버에 결과를 영구 저장하지 않을 것
- API 키·프롬프트·모델명·Google API 주소를 클라이언트에 노출하지 않을 것
- 성공한 배치 결과를 부분 실패 때문에 잃지 않을 것
- 교사가 검토·확정하기 전 생성 결과를 완성으로 취급하지 않을 것

요구사항의 source of truth는 `PRD.md`, 구현 순서는 `plan.md`, 화면 설계는 `product-design.md`, 시각 정체성은 `design.md`다. 충돌 시 이 역할 구분을 유지하고 임의로 문서를 합치지 않는다.

## 2. 기술 스택

- Frontend: Next.js App Router, React, TypeScript strict
- Styling: CSS Modules, `globals.css`, canonical D.Y. Kim 토큰
- Backend: Next.js Route Handlers, Vercel Functions의 Node.js 런타임
- AI: Google Gen AI JavaScript SDK, server-only `GeminiFailoverClient`
- Validation: Zod 및 순수 TypeScript 규칙 검사기
- Browser storage: localStorage, 버전 스키마와 마이그레이션
- Documents: Mammoth, JSZip, fast-xml-parser, ExcelJS, file-type
- Export: ExcelJS 동적 import, Clipboard API
- Access control: Node crypto + jose 기반 공유 접근 코드/HttpOnly 세션을 기본안으로 사용
- Database: 없음; Firebase, Supabase, Cloudflare D1, Neon을 MVP에 추가하지 않음
- Package manager: pnpm
- Testing: Vitest, React Testing Library, Playwright
- Source control: 기존 GitHub `evaluator` 저장소, GitHub CLI
- Deployment: Vercel Git 연동, Vercel CLI

정확한 패키지 버전은 앱 스캐폴딩 후 `package.json`과 `pnpm-lock.yaml`을 기준으로 판단한다. 새로운 라이브러리를 추가하기 전에 다음을 확인한다.

1. 기존 의존성이나 플랫폼 API로 구현할 수 있는가?
2. 직접 구현하는 편이 더 단순하고 안전한가?
3. 클라이언트 번들, 서버 시작 시간과 유지보수 비용이 적절한가?
4. Node 런타임에서만 사용해야 하는 패키지가 클라이언트 그래프에 들어가지 않는가?

## 3. 주요 명령어

앱 스캐폴딩과 `package.json` scripts가 현재 구현되어 있다. 아래 명령은 실제 로컬 검증과 배포 절차에 사용한다.

- 의존성 설치: `pnpm install`
- 개발 서버: `pnpm dev`
- 타입 검사: `pnpm typecheck`
- 린트 검사: `pnpm lint`
- 단위·통합 테스트: `pnpm test`
- E2E 테스트: `pnpm test:e2e`
- 브랜드 자산 검증: `pnpm verify:brand`
- 프로덕션 빌드: `pnpm build`
- GitHub 저장소 확인: `gh repo view <github-owner>/evaluator`
- Vercel Git 연결 확인: `pnpm dlx vercel@latest git ls`
- Preview 생성: 기능 브랜치 push 후 `gh pr create`
- Production 생성: 검증된 Pull Request를 `gh pr merge --squash --delete-branch`로 `main`에 병합

검증할 때는 `package.json`에 실제 정의된 명령만 사용한다. 배포 전 타입, 린트, 테스트, 브랜드 자산 검증과 빌드를 먼저 실행한다. Preview와 Production은 Vercel 직접 배포 script가 아니라 GitHub 연동으로 자동 생성한다.

## 4. 폴더 구조

현재 루트 문서, 브랜드 자산과 애플리케이션 폴더는 `plan.md`에 따라 구현되어 있다.

- `idea.txt`: 원본 아이디어와 세부 운영 규칙
- `PRD.md`: 기능·비기능 요구사항과 인수 조건
- `plan.md`: 구현 결정, 순서, CLI 배포와 위험
- `product-design.md`: 앱 정보구조, 화면, 상태와 반응형 동작
- `design.md`: 변경하지 않는 canonical D.Y. Kim 디자인 시스템
- `assets/signature/final/`: 승인된 고정 브랜드 자산과 manifest
- `public/assets/signature/final/`: 구현 시 manifest를 보존해 복사할 웹 배포 자산
- `src/app/`: App Router 화면과 같은 출처 API
- `src/features/`: 기능 1·2·3 전용 UI와 상태
- `src/components/`: 브랜드, 앱 셸, 폼, 결과 공통 컴포넌트
- `src/domain/`: Zod 스키마, 규칙, 중복과 배치 도메인
- `src/lib/client/`: localStorage, XLSX와 클립보드 어댑터
- `src/lib/server/`: 접근 제어, 문서 파서, Gemini와 서버 보안
- `src/config/`: 키워드, 작성 규칙과 입력 한도
- `tests/`: 비식별 fixture, 단위, 통합과 E2E

새 파일을 만들기 전에 관련 요구사항 ID와 기존 폴더의 유사 구현을 확인한다. 기능 1·2·3이 공유해야 하는 규칙을 각 기능에 복제하지 않는다.

## 5. 코딩 원칙

- 모든 신규 코드는 TypeScript strict로 작성한다.
- `any`, 무근거 타입 단언과 `@ts-ignore` 사용을 피한다.
- 클라이언트와 서버 경계를 파일 수준에서 명확히 하고 서버 모듈은 `server-only`로 보호한다.
- 컴포넌트와 함수는 하나의 책임을 갖게 한다.
- 결정적 형식 검사는 순수 함수로, Gemini 의미 검수는 외부 어댑터로 분리한다.
- 모든 외부 입력과 localStorage 복원값은 Zod로 검증한다.
- 저장 스키마를 바꿀 때 버전과 마이그레이션을 함께 추가한다.
- 프롬프트와 키워드·문서 데이터의 역할을 분리하고 사용자 데이터가 시스템 지시를 덮어쓰지 못하게 한다.
- 배치 성공 결과를 실패 재시도 대상과 분리한다.
- 불필요한 추상화, 전역 상태와 구현 범위를 벗어난 기능을 추가하지 않는다.
- 주석은 무엇보다 왜 그런 장애조치·보안·한계를 선택했는지를 설명할 때 사용한다.

## 6. UI 및 UX 원칙

- `product-design.md`의 네 단계 흐름과 상태 설계를 따른다.
- 주요 내비게이션에는 기능 1·2·3만 두고 설정 탭을 만들지 않는다.
- 공통 작성 옵션은 각 기능의 접이식 패널, 데이터 삭제·내보내기는 헤더 메뉴에 둔다.
- 학생 이름 입력란, 관찰 기록 UI, API 키 입력, 모델 선택과 자동 붙여넣기를 추가하지 않는다.
- 기능 1에는 상·중·하 선택, 수준 매트릭스, 일괄 수준 설정과 개별 수준 변경 UI를 만들지 않는다. 서버가 모든 생성에 ‘상’ 기준을 고정 적용한다.
- 데스크톱 대형 표와 모바일 카드 흐름을 모두 지원한다.
- 로딩, 빈 상태, 부분 실패, 결과 불명확, 저장 실패와 클립보드 거부 상태를 처리한다.
- 버튼·입력에 명확한 한국어 이름과 접근 가능한 라벨을 제공한다.
- 키보드 탐색, Focus Blue, 44px 조작 영역, 200% 확대와 모션 감소를 고려한다.
- 사용자가 생성 근거·검수·확정 상태를 항상 확인할 수 있게 한다.

## 7. 브랜드 규칙

- `design.md`를 canonical 문서로 유지하고 앱별 디자인으로 교체하지 않는다.
- `assets/signature/final/manifest.json`의 자산과 해시를 보존한다.
- 워드마크, D. 심볼, Creator credit, 앱 아이콘과 favicon을 텍스트·CSS·Canvas·새 SVG로 재현하지 않는다.
- 밝은/어두운 표면에 맞는 승인 자산을 그대로 사용한다.
- 자산 비율·색·획·내부 여백을 바꾸거나 필터·그림자·마스크·애니메이션을 적용하지 않는다.
- 제품명은 접근 가능한 실제 텍스트로 유지하고 제작자 서명보다 시각적으로 우선한다.
- Signature Brass는 브랜드 Point에만 제한하고 CTA·성공·경고·오류색으로 사용하지 않는다.
- favicon은 승인된 `dyk-favicon.svg`와 PNG 파생 파일을 사용한다.

## 8. 데이터 및 보안

- 학생 이름·학번·반·연락처 필드를 데이터 모델에 만들지 않는다.
- API 키, Google 계정 이메일, 프로젝트 ID, 결제정보와 비밀값을 코드·문서·fixture·로그에 쓰지 않는다.
- `GEMINI_API_KEY_1`, `_2`, `_3`, `GEMINI_MODEL`은 서버 환경에서만 읽는다.
- Gemini 키·모델명·키 슬롯·외부 URL·시스템 프롬프트를 클라이언트 요청이나 응답에 넣지 않는다.
- 장애조치는 인증·권한·429에만 1→2→3 순으로 수행하고 정의되지 않은 오류로 확대하지 않는다.
- 400·404·콘텐츠 거부는 키 전환하지 않는다. 5xx/503은 제한된 백오프만 하고 불명확한 타임아웃은 즉시 재호출하지 않는다.
- 키 값·해시·접두사를 로그에 쓰지 않고 슬롯 번호와 정규화 오류만 기록한다.
- 생성 API는 `Cache-Control: no-store`, 접근 제어, Origin·CSRF, 입력·파일 크기와 사용량 제한을 적용한다.
- 업로드 파일은 확장자만 신뢰하지 않고 MIME·magic bytes·크기·손상을 검증한다.
- 사용자·모델 문자열은 일반 텍스트로 렌더링하고 `dangerouslySetInnerHTML`을 사용하지 않는다.
- localStorage에는 비식별 입력·결과만 저장하며 업로드 원본·Base64·모델 원문·비밀값을 저장하지 않는다.
- 원격 데이터베이스나 공유 KV를 요구사항 변경 없이 추가하지 않는다.
- 삭제·초기화·스키마 변경은 기존 사용자 데이터를 고려하고 파괴적 명령을 임의로 실행하지 않는다.

## 9. 테스트 원칙

- 실제 학생정보 대신 고정된 비식별 fixture만 사용한다.
- 모든 `FR-*`는 테스트 또는 명시적 수동 검증에 연결한다.
- Gemini 호출은 기본적으로 mock하고 실제 키로 부하 테스트하지 않는다.
- 기능 1 요청·localStorage에 수준 필드가 없고 서버가 ‘상’ 기준을 고정 적용하는지 테스트한다.
- 키 장애조치의 성공 중단, 최대 세 슬롯, 비전환 오류와 일반화 실패를 테스트한다.
- localStorage 복원 완료 전 덮어쓰기, 스키마 마이그레이션, 용량 초과와 손상 데이터를 테스트한다.
- XLSX의 시트·열·순번·근거와 클립보드 실패 대체 경로를 검증한다.
- 클라이언트 번들과 소스맵의 비밀값·서버 코드 포함 여부를 검사한다.
- 브랜드 배포본과 canonical manifest의 SHA-256을 비교한다.

## 10. 작업 방식

작업을 시작할 때:

1. 관련 `PRD.md` 요구사항 ID와 `product-design.md` 화면을 확인한다.
2. 영향받는 서버·클라이언트·저장 스키마와 기존 테스트를 파악한다.
3. 현재 작업이 제외 범위를 되돌리지 않는지 확인한다.
4. 기존 모듈·컴포넌트 재사용 가능성을 확인한다.
5. `gh auth status`와 `origin`이 기존 `evaluator` 저장소를 가리키는지 확인한다.
6. `main`에서 기능 브랜치를 만들고 필요한 최소 범위만 수정한다.

작업을 마칠 때:

1. 관련 단위·통합·E2E 테스트를 실행한다.
2. 타입 검사와 린트를 실행한다.
3. 브랜드 자산 검증과 프로덕션 빌드를 실행한다.
4. 클라이언트 비밀 노출 여부를 검사한다.
5. 변경 파일, 요구사항 ID와 검증 결과를 요약한다.
6. 기능 브랜치를 push하고 GitHub CLI로 Pull Request를 만든 뒤 Vercel Preview를 검증한다.
7. 확인하지 못한 외부 모델·배포 동작을 명시한다.

GitHub/Vercel 운영 규칙:

- `evaluator` 저장소는 이미 존재하므로 `gh repo create`로 다시 만들지 않는다.
- 현재 폴더에 Git 메타데이터가 없을 때만 초기화하고, 기존 원격 이력이 있으면 fetch 후 통합한다.
- GitHub 인증·저장소·Pull Request 작업은 GitHub CLI로, Vercel 로그인·링크·환경변수·Git 연결·배포 확인은 Vercel CLI로 수행한다.
- CLI가 여는 브라우저 로그인이나 GitHub App 권한 동의는 허용하지만 대시보드 수동 연결을 기본 작업 흐름으로 사용하지 않는다.
- 기능 브랜치와 Pull Request는 Preview, `main` 병합은 Production을 자동 생성한다.
- Pull Request checks와 Preview smoke test가 성공한 뒤에만 `main`에 병합한다.
- `vercel deploy`와 `vercel deploy --prod`는 정상 릴리스 경로가 아니며, Git 연동 복구가 필요하고 사용자가 명시적으로 승인한 경우에만 사용한다.

## 11. 금지 사항

- 기존 기능이나 `PRD.md` 요구사항을 요청 없이 삭제하지 않는다.
- 학생 명단, 관찰 기록, 자동 붙여넣기, API 키 UI와 설정 탭을 되살리지 않는다.
- 패키지 관리자와 배포 대상을 임의로 변경하지 않는다.
- 기존 `evaluator` 저장소를 재생성하거나 원격 URL을 확인 없이 바꾸지 않는다.
- 원격에 강제 push하거나 기존 Git 이력을 재작성하지 않는다.
- 일반 변경을 `main`에 직접 push하거나 직접 Vercel Production 배포로 PR 검증을 우회하지 않는다.
- Firebase, Supabase, Cloudflare D1, Neon 또는 별도 KV를 동시에·임의로 추가하지 않는다.
- 클라이언트에서 Gemini를 직접 호출하지 않는다.
- 장애조치를 할당량·지출 정책 회피 수단으로 확장하지 않는다.
- 테스트를 통과시키기 위해 검사 기준·중복 임계치·재생성 상한을 약화하거나 테스트를 삭제하지 않는다.
- 승인 브랜드 자산을 재작성·재색상·재생성하지 않는다.
- 비밀정보·개인정보·업로드 원문·생성 결과를 로그에 출력하지 않는다.
- 요청과 무관한 대규모 리팩터링이나 파괴적 명령을 실행하지 않는다.

## 12. 완료 조건

다음 조건을 충족해야 구현 작업을 완료로 본다.

- 연결된 `PRD.md` 인수 조건이 충족된다.
- 타입·린트·관련 테스트·브랜드 검증·프로덕션 빌드가 성공한다.
- 부분 실패·로딩·빈 상태·오류·복구가 처리된다.
- 기존 기능과 저장 마이그레이션이 유지된다.
- 클라이언트와 로그에 비밀값이 없다.
- 변경 내용, 검증 결과와 남은 외부 확인이 명확히 보고된다.

## 13. 응답 방식

작업 완료 후 다음 형식으로 보고한다.

### 변경 내용

- 수정한 파일과 연결된 요구사항 ID

### 검증 결과

- 실행한 타입·린트·테스트·빌드·브랜드·보안 검사와 성공/실패

### 남은 사항

- 확인하지 못한 외부 모델·브라우저·Vercel 동작
- 사용자가 추가로 제공하거나 결정해야 하는 비밀값·운영 선택
