# evaluator

초등학교 교사용 평가 문장 생성 웹앱입니다. Next.js App Router와 Vercel 서버 함수를 사용하며, 브라우저가 Gemini API를 직접 호출하지 않습니다.

## 로컬 실행

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

`.env.local`에는 서버 전용 환경변수를 입력합니다. `GEMINI_API_KEY_1`과 `GEMINI_MODEL`은 필수이고, `_2`와 `_3`은 선택 장애조치 키입니다. 실제 키는 커밋하지 않습니다.

```env
GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_MODEL=gemini-3.5-flash-lite
```

## 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm verify:brand
pnpm build
```

## GitHub·Vercel 배포

- 소스 저장소: `daechiDavid/evaluator`
- Vercel 프로젝트: `evaluator`
- 기능 브랜치 push와 Pull Request: Preview 배포
- 검증된 Pull Request의 `main` 병합: Production 배포
- Gemini 키는 Vercel 환경변수로만 주입하며 `NEXT_PUBLIC_` 접두사를 사용하지 않습니다.

Production에는 `GEMINI_API_KEY_1`부터 `_3`까지, Preview에는 비식별 smoke test용 `_1`을 설정합니다. 로컬 개발 키는 버전 관리에서 제외된 `.env.local`에만 둡니다.
