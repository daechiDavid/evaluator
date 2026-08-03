# D.Y. Kim Signature Design System

> **Status:** Active standard  
> **Version:** 1.3  
> **Core idea:** **Quiet Precision — 절제된 정밀함**

이 문서는 앞으로 D.Y. Kim이 만드는 모든 프로그램에 공통으로 적용할 시그니처 디자인의 기준이다.  
목표는 모든 제품을 똑같이 보이게 만드는 것이 아니라, 서로 다른 제품에서도 **같은 사람이 세심하게 만들었다는 인상**이 남게 하는 것이다.

---

## 1. 개정 판단

이번 개정 시점의 작업공간에는 이전 `design.md`가 남아 있지 않아 문장, 색상, 구성 요소를 직접 비교할 수 없었다. 따라서 기존 방향을 임의로 계승하지 않고, 새 이름인 **D.Y. Kim**을 장기간 사용할 수 있는지를 기준으로 시스템을 다시 설계했다.

기존 디자인을 다시 검토할 때는 다음 질문으로 적합성을 판단한다.

1. `D.Y. Kim`이라는 이름이 제품명보다 앞서거나 제품을 방해하지 않는가?
2. 유행하는 효과보다 정밀함, 신뢰감, 절제가 먼저 느껴지는가?
3. 웹, 모바일, 데스크톱, CLI, 문서에 같은 원리로 적용할 수 있는가?
4. 밝은 화면과 어두운 화면, 작은 아이콘과 큰 소개 화면에서 모두 유지되는가?
5. 색을 제거해도 타이포그래피와 간격만으로 정체성이 남는가?

하나라도 충족하지 못하면 시그니처 시스템에 그대로 포함하지 않는다.

---

## 2. 브랜드 정의

### 2.1 공식 표기

- **Canonical name:** `D.Y. Kim`
- 대소문자, 마침표, 공백을 포함해 위 표기를 기본으로 한다.
- `DY Kim`, `D.Y.Kim`, `dykim`, `D Y Kim`은 공식 워드마크로 사용하지 않는다.
- 계정명이나 파일명처럼 문장부호를 쓸 수 없는 환경에서만 `dykim`을 허용한다.
- 소유격이나 서명 문구를 만들 때도 이름 자체의 철자는 바꾸지 않는다.

### 2.2 브랜드 문장

> **D.Y. Kim makes focused software with clarity, restraint, and a human point of view.**

한국어로는 다음과 같은 태도를 뜻한다.

> **분명한 목적, 절제된 표현, 사람을 배려하는 디테일로 소프트웨어를 만든다.**

이 문장은 외부에 매번 노출하는 슬로건이 아니라 디자인 결정을 위한 내부 기준이다.

### 2.3 브랜드 성격

| 지향하는 인상 | 피해야 할 인상 |
|---|---|
| 조용하지만 분명함 | 존재감이 없거나 무기력함 |
| 정밀하고 신뢰할 수 있음 | 차갑고 관료적임 |
| 현대적이지만 오래감 | 유행을 과하게 따름 |
| 개인적이지만 전문적임 | 사적인 취향을 강요함 |
| 단순하지만 세심함 | 비어 보이거나 미완성처럼 보임 |

---

## 3. 핵심 콘셉트: Quiet Precision

`D.Y. Kim`의 시그니처는 화려한 장식보다 **정확한 선택이 쌓여 생기는 인상**이어야 한다.

### 3.1 세 가지 원칙

#### Clear

정보의 우선순위가 한눈에 보인다. 사용자가 다음 행동을 추측하게 만들지 않는다.

#### Measured

색, 여백, 모션, 모서리를 필요 이상으로 사용하지 않는다. 모든 강조에는 이유가 있어야 한다.

#### Human

기계적으로 완벽한 화면보다 읽기 편하고, 실수에서 회복하기 쉽고, 작은 배려가 느껴지는 화면을 만든다.

### 3.2 시그니처 모티프: The Point

`D.Y.`에 포함된 마침표를 **생각을 정확히 끝맺는 점**으로 해석한다. 이 점은 장식용 패턴이 아니라 다음 세 곳에서만 제한적으로 사용한다.

1. 워드마크의 마침표
2. 현재 상태나 선택 위치를 나타내는 작은 표시
3. 로딩 또는 완료 순간의 마지막 프레임

The Point의 기본 형태는 완전한 원이며 브랜드 맥락의 기본 색은 `Signature Brass`다. 황동은 정밀 기구와 오래 쓰는 도구의 물성을 연상시키며, AI 제품에서 흔한 블루·퍼플 계열과 시각적으로 구분된다. 상태 표시처럼 기능적 맥락에서 같은 원형을 사용할 때는 황동색이 아니라 해당 기능 토큰을 적용한다. 한 화면에서 독립적인 브랜드 포인트는 원칙적으로 하나만 둔다. 점을 배경 패턴으로 반복하거나 모든 제목 뒤에 붙이지 않는다.

---

## 4. 시그니처 체계

하나의 로고를 모든 크기에 억지로 줄이지 않고 세 단계로 운용한다.

### 4.1 Wordmark

공식 표기는 언제나 `D.Y. Kim`이다.

- 소개 화면, About, 웹사이트 푸터, 문서 표지처럼 이름을 읽어야 하는 곳에 사용한다.
- 기본은 `Signature Ink` 단색이며 마침표에만 `Signature Brass`를 적용할 수 있다.
- 글자를 기울여 손글씨처럼 만들거나 서명체 폰트로 대체하지 않는다.
- 자간을 과도하게 벌리지 않는다. 이름은 로고이기 전에 사람의 이름으로 읽혀야 한다.

### 4.2 Compact symbol

공간이 부족한 환경에서는 이니셜을 겹치지 않고 단순한 `D.` 심볼을 사용한다.

- `D`는 `Signature Ink`, 마침표는 `Signature Brass`를 사용한다.
- `16–71px`에서는 승인된 Compact symbol을 사용하고 `72px` 이상에서는 Wordmark를 우선한다.
- 앱 아이콘과 파비콘은 같은 `D.` 형태를 Ink 필드 위에 배치한 자산을 사용한다.
- `DYK` 결합형, 중첩형 모노그램은 의미를 알아보기 어려우므로 폐기한다.
- 프로그램별로 `D.`의 글꼴, 비율, 마침표 위치를 다시 만들지 않는다.

### 4.3 Product lockup

제품명은 항상 주인공이고 D.Y. Kim은 제작자의 서명으로 배치한다.

```text
PRODUCT NAME
by D.Y. Kim
```

- 제품명과 이름의 시각적 비중은 약 `100 : 55`로 둔다.
- `by D.Y. Kim`은 제품명과 경쟁하지 않도록 한 단계 낮은 색과 크기를 사용한다.
- 기본 문구는 `by D.Y. Kim`이다.
- 포트폴리오나 제작 정보를 강조하는 맥락에서는 `Designed & built by D.Y. Kim`을 사용할 수 있다.
- 제품명과 워드마크를 한 단어처럼 붙여 새 로고를 만들지 않는다.

### 4.4 고정 이미지 자산

다음 요소는 프로그램마다 글자나 CSS로 다시 만들지 않는다. 형태가 달라지지 않도록 승인된 이미지 파일을 그대로 삽입한다.

| 고정 자산 | 사용 조건 | SVG 원본 |
|---|---|---|
| Wordmark · Light | 밝은 배경, 최소 너비 `72px` | `assets/signature/final/dyk-wordmark-on-light.svg` |
| Wordmark · Dark | 어두운 배경, 최소 너비 `72px` | `assets/signature/final/dyk-wordmark-on-dark.svg` |
| Wordmark · Mono | 단색 인쇄와 색상 제한 환경 | `assets/signature/final/dyk-wordmark-mono.svg` |
| Compact symbol · Light | 밝은 배경, `16–71px` | `assets/signature/final/dyk-symbol-on-light.svg` |
| Compact symbol · Dark | 어두운 배경, `16–71px` | `assets/signature/final/dyk-symbol-on-dark.svg` |
| Creator credit · Light | 밝은 배경의 About, 푸터, 문서 | `assets/signature/final/dyk-credit-on-light.svg` |
| Creator credit · Dark | 어두운 배경의 About, 푸터, 문서 | `assets/signature/final/dyk-credit-on-dark.svg` |
| App icon master | 런처 아이콘과 프로필 아바타 | `assets/signature/final/dyk-app-icon-master.svg` |
| Favicon master | 브라우저 탭과 북마크 | `assets/signature/final/dyk-favicon.svg` |

웹 프로그램은 앱 아이콘과 동일한 형태의 파비콘을 다음과 같이 연결한다.

```html
<link rel="icon" href="/assets/signature/final/dyk-favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/signature/final/dyk-favicon-32.png" type="image/png" sizes="32x32">
```

고정하지 않는 요소:

- 제품명과 제품 설명
- 버튼, 입력창, 카드, 내비게이션 같은 UI 컴포넌트
- 레이아웃, 간격, 모션
- 기능 상태에 사용되는 Point
- 포커스 링과 성공·경고·오류 표시
- 제품별 색상과 아이콘

제품명은 접근 가능한 실제 텍스트로 유지하고, 그 아래나 옆에 고정된 Creator credit 이미지를 결합한다. 제품명까지 포함한 전체 Product lockup을 하나의 이미지로 만들지 않는다.

고정 자산 운용 규칙:

1. 가능한 모든 환경에서 SVG를 우선한다.
2. SVG를 지원하지 않는 환경에서만 같은 이름의 PNG 파생 파일을 사용한다.
3. 가로세로 비율, 내부 여백, 획 굵기, 색상을 변경하지 않는다.
4. CSS 필터, 그라디언트, 그림자, 마스크, 애니메이션을 자산에 적용하지 않는다.
5. 밝은 배경과 어두운 배경에 맞는 파일을 교차 사용하지 않는다.
6. 앱에서 이미지를 표시할 때 접근 가능한 이름 `D.Y. Kim`을 제공한다.
7. 자산을 복사할 때 `assets/signature/final/manifest.json`의 버전과 해시를 함께 보존한다.

---

## 5. 비주얼 언어

### 5.1 색상

시그니처의 중심은 **Ink + Brass Point**다. 화면의 대부분은 중립색으로 구성하고, 황동색은 제작자의 흔적을 남기는 작은 점에만 사용한다. 접근성용 파란색은 브랜드 색이 아니라 기능 색으로 분리한다.

| Token | Light | Dark | 역할 |
|---|---:|---:|---|
| `canvas` | `#F7F8F6` | `#0D0F12` | 기본 배경 |
| `surface` | `#FFFFFF` | `#15181D` | 카드와 패널 |
| `text-primary` | `#17191D` | `#F3F5F7` | 본문과 주요 정보 |
| `signature-ink` | `#17191D` | `#F3F5F7` | 워드마크와 D. 심볼의 기본색 |
| `text-secondary` | `#626872` | `#A9B0BB` | 보조 정보 |
| `border` | `#DDE1E5` | `#2B3038` | 구분선과 경계 |
| `signature-brass` | `#715A12` | `#E6C45B` | 워드마크 마침표와 The Point |
| `focus` | `#3156D3` | `#7694FF` | 키보드 포커스 전용 기능색 |
| `success` | `#1E7A4D` | `#56C58A` | 성공 |
| `warning` | `#9A3F00` | `#FF9B61` | 주의 |
| `danger` | `#B4232C` | `#FF7B83` | 오류와 위험 |

운용 규칙:

- `Signature Ink`는 브랜드의 기본색이며 밝은 화면에서는 전체 워드마크, 제목, 주요 버튼에 사용할 수 있다.
- `Signature Brass`는 브랜드 식별색이지만 넓은 면을 채우는 주조색이 아니다. 한 화면의 시각적 면적 중 약 `3%` 이하를 권장한다.
- 황동색은 `D.Y.`와 `D.`의 마침표, 제작자 크레딧처럼 서명과 직접 연결된 요소에만 사용한다.
- 주요 CTA는 `Signature Ink`를 기본으로 한다. 제품에 고유한 기능색이 있다면 인터랙션에는 해당 제품 토큰을 사용한다.
- `Focus Blue`는 키보드 접근성을 위한 기능색이며 워드마크, D. 심볼, 제품 크레딧에는 사용하지 않는다.
- 본문, 긴 제목, 넓은 배경에는 기본적으로 중립색을 사용한다.
- 그라디언트는 제품의 기능적 이유가 있을 때만 사용하며 시그니처 자체에는 사용하지 않는다.
- `Signature Brass`로 성공, 경고, 오류 상태를 표현하지 않는다. 상태에는 전용 기능색과 텍스트 또는 아이콘을 함께 사용한다.
- 황동색과 경고색을 함께 사용할 때는 색만으로 의미를 구분하지 않는다.
- 새로운 제품은 고유한 보조색을 가질 수 있지만 D.Y. Kim 시그니처 자산의 `Signature Brass`를 대체하지 않는다.

### 5.2 타이포그래피

폰트보다 **크기, 굵기, 행간의 일관성**을 우선한다.

```css
--font-sans: "Pretendard Variable", "Inter", -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

- 한글과 라틴 문자가 함께 있는 제품은 `Pretendard Variable`을 기본으로 한다.
- 영문 중심 제품에서는 `Inter`를 우선할 수 있다.
- 워드마크 전용 서체가 확정되기 전에는 UI 기본 서체의 `600` 굵기를 사용한다.
- 제목은 짧고 단정하게 쓴다. 전부 대문자인 긴 문장을 사용하지 않는다.
- 본문 기본 행간은 `1.55–1.7`, UI 라벨은 `1.3–1.45` 범위로 둔다.
- 숫자 비교가 중요한 화면에서는 tabular numerals를 사용한다.

기본 타입 스케일:

| 역할 | 크기 / 행간 | 굵기 |
|---|---|---|
| Display | `48 / 56` | `650` |
| Heading 1 | `32 / 40` | `650` |
| Heading 2 | `24 / 32` | `600` |
| Heading 3 | `18 / 26` | `600` |
| Body | `16 / 26` | `400` |
| Small | `14 / 20` | `400` |
| Caption | `12 / 18` | `500` |

### 5.3 간격과 레이아웃

- 기본 단위는 `4px`, 주요 배치는 `8px` 배수로 설계한다.
- 화면 바깥 여백은 모바일 `20–24px`, 데스크톱 `32–64px`을 기본으로 한다.
- 콘텐츠 최대 너비는 읽기 화면 `720px`, 일반 앱 화면 `1200px`을 기준으로 조정한다.
- 요소를 중앙에 모으기보다 명확한 왼쪽 정렬과 일관된 기준선을 우선한다.
- 구분선보다 여백으로 그룹을 나눈다.
- 한 화면에는 하나의 주요 행동만 가장 강하게 보이게 한다.

### 5.4 형태

- 기본 모서리 반경: 컨트롤 `8px`, 카드 `12px`, 큰 패널 `16px`
- 테두리: 기본 `1px`
- 아이콘 선 굵기: `1.75–2px`
- 버튼과 입력창의 최소 높이: `44px`
- 알약 형태는 태그, 필터, 상태처럼 의미가 있는 경우에만 사용한다.
- 그림자는 레이어 관계를 설명할 때만 사용하고, 장식용으로 여러 겹 쌓지 않는다.

### 5.5 아이콘

- 단순한 선형 아이콘을 기본으로 한다.
- 같은 화면에서 채움형과 선형을 임의로 섞지 않는다.
- 활성 상태는 색만 바꾸지 말고 채움, 점, 라벨 중 하나를 함께 사용한다.
- 아이콘만 있는 버튼에는 접근 가능한 이름과 툴팁을 제공한다.
- The Point를 기능 아이콘 대신 사용하지 않는다.

### 5.6 모션

모션의 인상은 **빠르게 반응하고 조용히 정착하는 것**이다.

```css
--duration-instant: 100ms;
--duration-fast: 160ms;
--duration-base: 240ms;
--duration-reveal: 420ms;
--ease-signature: cubic-bezier(0.2, 0.8, 0.2, 1);
```

- 호버와 포커스: `100–160ms`
- 패널과 페이지 전환: `200–240ms`
- 첫 공개나 완료 장면: 최대 `420ms`
- 바운스, 과도한 스프링, 긴 패럴랙스는 기본 시그니처에서 제외한다.
- 로딩 모션은 진행 상태를 설명해야 하며 브랜드 감상을 강요하지 않는다.
- `prefers-reduced-motion` 환경에서는 이동을 제거하고 짧은 페이드로 대체한다.

---

## 6. 제품에 시그니처를 넣는 방법

시그니처는 제품 사용을 방해하지 않는 **제작자의 흔적**이어야 한다.

| 환경 | 기본 위치 | 권장 표현 |
|---|---|---|
| 웹 앱 | 푸터 또는 About | Creator credit 이미지 |
| 모바일 앱 | Settings → About | Creator credit 이미지 + 버전 정보 |
| 데스크톱 앱 | About 창 | 제품명 텍스트 + Creator credit 이미지 |
| CLI | `--version`, `about` | 일반 텍스트 `by D.Y. Kim` |
| 문서/리포트 | 표지 또는 마지막 페이지 | 승인된 Wordmark 이미지 |
| 오픈소스 저장소 | README 하단 또는 Credits | Creator credit 이미지 또는 텍스트 대체 |
| 시작 화면 | 로딩이 실제로 필요한 경우에만 | 제품명 텍스트 우선, 고정 크레딧은 보조 |

### 노출 강도

- **Level 1 — Utility:** 일반 사용 화면. 시그니처를 직접 노출하지 않고 색, 간격, 모션 원칙만 적용한다.
- **Level 2 — Credit:** About, 푸터, 설정, 문서. `by D.Y. Kim`을 작게 표시한다.
- **Level 3 — Identity:** 개인 홈페이지, 포트폴리오, 발표 표지. 워드마크와 The Point를 적극적으로 사용할 수 있다.

일반 제품 화면은 Level 1을 기본으로 한다. 모든 페이지에 로고를 고정하거나 완료할 때마다 이름을 보여주지 않는다.

---

## 7. 공통 컴포넌트 규격

모든 프로그램에서 아래 역할을 같은 이름과 원리로 구현한다. 특정 프레임워크에 종속되지는 않는다.

### `Signature`

```ts
type SignatureVariant = "wordmark" | "credit" | "symbol" | "app-icon";
type SignatureSurface = "light" | "dark" | "mono";
```

- `wordmark`: 승인된 `dyk-wordmark-*` 이미지
- `credit`: 승인된 `dyk-credit-*` 이미지
- `symbol`: 승인된 `dyk-symbol-*` 이미지
- `app-icon`: 승인된 `dyk-app-icon-master.svg` 또는 공식 PNG 파생 파일
- 문자열을 직접 렌더링해 워드마크나 크레딧을 재현하지 않는다.
- `mono`는 Wordmark에서만 사용한다.
- 최소 워드마크 너비: 디지털 화면 기준 `72px`
- 최소 여백: 워드마크 대문자 높이의 `0.75배`
- 접근성 이름: `D.Y. Kim`

### `FocusRing`

- 색상: `Focus Blue`
- 바깥 간격: `2px`
- 두께: `2px`
- 마우스 클릭뿐 아니라 키보드 탐색에서 명확히 보여야 한다.
- 포커스 색은 접근성 기능이며 D.Y. Kim의 시그니처 색으로 취급하지 않는다.

### `StatusPoint`

- 크기: 기본 `6px`, 작은 화면 `4px`
- `signature` 변형에서만 `Signature Brass`를 사용한다.
- 현재 상태를 나타내는 `active`, `success`, `warning`, `danger` 변형은 해당 기능 토큰을 사용한다.
- 점만으로 의미를 전달하지 않고 텍스트나 아이콘을 함께 제공한다.

### `ProductCredit`

웹, 모바일, 데스크톱, 문서에서의 기본 표현은 승인된 Creator credit 이미지를 사용한다.

```text
assets/signature/final/dyk-credit-on-light.svg
assets/signature/final/dyk-credit-on-dark.svg
```

CLI, 로그, 스크린리더 전용 텍스트처럼 이미지가 부적합한 환경에서는 다음 문자열을 사용한다.

```text
by D.Y. Kim
```

`Designed & built by D.Y. Kim`이 필요한 경우 `Designed & built`은 실제 텍스트로 두고, 그 뒤에 승인된 Wordmark 이미지를 결합한다. 링크가 있다면 이미지 전체를 하나의 클릭 영역으로 만들고, 마침표만 링크로 만들지 않는다.

---

## 8. 접근성과 품질 기준

시그니처보다 사용성이 우선한다.

- 일반 텍스트 명암비는 최소 `4.5:1`, 큰 텍스트는 최소 `3:1`을 지킨다.
- 키보드 포커스를 제거하지 않는다.
- 클릭 또는 터치 영역은 최소 `44 × 44px`로 한다.
- 색상만으로 상태를 구분하지 않는다.
- 본문 확대 200%에서도 정보와 기능이 사라지지 않아야 한다.
- 모션 감소 설정을 지원한다.
- 워드마크 SVG에는 읽을 수 있는 대체 텍스트를 제공한다.
- 다국어 화면에서도 이름은 `D.Y. Kim`으로 유지하되 주변 문구는 번역한다.

---

## 9. 금지 사항

- 제품보다 `D.Y. Kim` 로고를 더 크게 배치하지 않는다.
- 이름을 워터마크처럼 화면 전체에 반복하지 않는다.
- 마침표를 별, 반짝임, 그라디언트 구체로 변형하지 않는다.
- 서명체 폰트로 전문성을 흉내 내지 않는다.
- 네온, 글래스모피즘, 과도한 블러를 기본 정체성으로 삼지 않는다.
- 앱마다 워드마크의 철자, 색, 비율을 바꾸지 않는다.
- 모든 카드와 버튼을 둥글게 만들어 개성을 대신하지 않는다.
- 기능 상태 색상과 브랜드 색상을 혼동하지 않는다.
- 의미 없는 인트로 애니메이션으로 사용자의 시간을 쓰지 않는다.

---

## 10. 디자인 토큰 시작점

새 프로젝트는 아래 토큰에서 시작하고, 플랫폼 문법에 맞게 변환한다.

```css
:root {
  color-scheme: light dark;

  --dyk-canvas: #f7f8f6;
  --dyk-surface: #ffffff;
  --dyk-text-primary: #17191d;
  --dyk-signature-ink: var(--dyk-text-primary);
  --dyk-text-secondary: #626872;
  --dyk-border: #dde1e5;
  --dyk-signature-brass: #715a12;
  --dyk-focus: #3156d3;
  --dyk-success: #1e7a4d;
  --dyk-warning: #9a3f00;
  --dyk-danger: #b4232c;

  --dyk-space-1: 4px;
  --dyk-space-2: 8px;
  --dyk-space-3: 12px;
  --dyk-space-4: 16px;
  --dyk-space-6: 24px;
  --dyk-space-8: 32px;
  --dyk-space-12: 48px;
  --dyk-space-16: 64px;

  --dyk-radius-control: 8px;
  --dyk-radius-card: 12px;
  --dyk-radius-panel: 16px;

  --dyk-duration-fast: 160ms;
  --dyk-duration-base: 240ms;
  --dyk-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --dyk-canvas: #0d0f12;
    --dyk-surface: #15181d;
    --dyk-text-primary: #f3f5f7;
    --dyk-text-secondary: #a9b0bb;
    --dyk-border: #2b3038;
    --dyk-signature-brass: #e6c45b;
    --dyk-focus: #7694ff;
    --dyk-success: #56c58a;
    --dyk-warning: #ff9b61;
    --dyk-danger: #ff7b83;
  }
}
```

제품별 토큰은 `--product-*`로 분리한다. 시그니처 토큰을 제품의 임시 스타일 저장소처럼 사용하지 않는다.

---

## 11. 적용 체크리스트

새 프로그램을 공개하기 전에 아래 항목을 확인한다.

- [ ] 공식 이름이 정확히 `D.Y. Kim`으로 표기되어 있다.
- [ ] 제품명이 시그니처보다 시각적으로 우선한다.
- [ ] About 또는 Credits에서 제작자를 찾을 수 있다.
- [ ] 중립색만으로도 정보 구조가 분명하다.
- [ ] 워드마크와 D. 심볼의 기본색이 Signature Ink로 통일되어 있다.
- [ ] Signature Brass가 마침표, 마지막 Point, 제작자 크레딧에만 제한적으로 사용되었다.
- [ ] Signature Brass가 화면 면적의 약 3%를 넘거나 CTA·상태색으로 사용되지 않았다.
- [ ] Focus Blue가 접근성 기능 이외의 브랜드 자산에 사용되지 않았다.
- [ ] `assets/signature/final/`의 승인된 SVG 또는 PNG만 사용했다.
- [ ] 워드마크, D. 심볼, 크레딧을 폰트나 CSS로 다시 만들지 않았다.
- [ ] Compact, 앱 아이콘, 파비콘이 모두 같은 `D.` 형태를 사용한다.
- [ ] 폐기된 `DYK` 결합형 모노그램을 사용하지 않았다.
- [ ] 제품명은 이미지에 포함하지 않고 접근 가능한 실제 텍스트로 유지했다.
- [ ] 밝은 배경과 어두운 배경에 맞는 자산을 사용했다.
- [ ] 고정 이미지의 비율, 색, 획, 내부 여백을 변경하지 않았다.
- [ ] 4px/8px 간격 체계와 타입 스케일이 적용되었다.
- [ ] 포커스, 명암비, 터치 영역, 모션 감소를 확인했다.
- [ ] 작은 화면에서 워드마크가 뭉개지거나 잘리지 않는다.
- [ ] 불필요한 인트로, 장식, 반복 로고가 없다.
- [ ] 한 문장으로 제품의 목적을 설명할 수 있다.

---

## 12. 고정 자산 버전 관리

현재 승인된 배포본은 `signature-assets-v2`이며 모든 원본은 `assets/signature/final/`에 있다.

- SVG가 기준 원본이고 PNG는 SVG에서 생성한 파생 파일이다.
- 이 패키지에는 승인된 `assets/signature/final/` 자산만 포함한다. 제품 안에 대체 시안이나 재해석 자산을 추가하지 않는다.
- 폐기된 Tri-axis 모노그램은 이 배포 패키지에 포함하지 않으며 제품에 사용하지 않는다.
- 승인된 파일을 같은 이름으로 수정하지 않는다.
- 형태나 색을 변경할 때는 새 `asset_version`과 manifest를 만들고 이 문서의 버전을 함께 올린다.
- 각 프로그램은 사용한 자산 버전을 Credits 또는 빌드 메타데이터에 기록한다.
- 배포 전 `manifest.json`의 SHA-256 값으로 원본 변형 여부를 확인한다.

자산의 기준은 같다. **눈에 띄는 로고보다, 오래 사용할 수 있는 정확한 서명**을 유지한다.
