# src2 웹앱 성과 아카이브 + AI 협업 개발 레벨 진단 (2026-02-13)

> 작성일: 2026-02-13  
> 기준 경로: `company-docs/src2`  
> 문서 목적: src2 기준으로 지금까지 구현한 구조/기능/문서/아이디어/계획/검증 체계를 한 곳에 모아, 현재 개발 역량 위치를 객관적으로 파악한다.

---

## 1) 이 문서를 만든 이유
- 처음 웹앱을 만들 때 가장 어려운 부분은 "내가 지금 어느 정도 수준인지"를 모른다는 점이다.
- 이 문서는 감각 평가가 아니라, 실제 코드/문서/검증 흔적을 근거로 현재 위치를 보여준다.
- 특히 VSCode 같은 환경에서 AI 에이전트와 함께 만드는 방식에 맞춰, "혼자서도 유지 가능한 구조를 만들고 있는지"를 진단한다.

---

## 2) 평가 기준과 근거 (데이터 소스)
- 규칙/헌법:
  - `company-docs/src2/docs/rule/main_rule.md`
  - `company-docs/src2/docs/rule/GATES_CHECKLIST.md`
  - `company-docs/src2/docs/rule/SECURITY_CHECKLIST.md`
- 진행 상태:
  - `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
  - `company-docs/src2/app/nav/navConfig.ts`
- 구현 증거:
  - `company-docs/src2/app/**`
  - `company-docs/src2/kernel/**`
  - `company-docs/scripts/**`
- 작업 로그:
  - `company-docs/src2/docs/result/**`
  - `company-docs/src2/docs/roadmap/**`
  - `company-docs/src2/docs/reference/**`

---

## 3) 프로젝트 스냅샷 (정량)

### 3-1) 코드/문서 규모

| 구역 | 파일 수 | 라인 수 |
|---|---:|---:|
| `src2/app` | 163 | 16,481 |
| `src2/kernel` | 103 | 4,344 |
| `src2/docs` | 233 | 31,347 |

추가 지표:
- 확장자 분포: `.md 216`, `.ts 150`, `.tsx 113`, `.css 3`
- `src2` 내부 최대 파일:
  - `src2/app/pages/partner/PartnerRegisterPage.tsx` (395 LOC)
- 300 LOC 초과 파일: 5개
- 200 LOC 초과 파일: 18개

### 3-2) 이관 진행률

`MIGRATION_STATUS` 기준:
- `MIGRATED`: 19
- `SHADOW`: 7

`navConfig` 기준 라우트 로더:
- 총 loader: 37
- `@app2`: 32
- `@legacy`: 5 (browse 상세 구간)

### 3-3) 결과물 로그 규모

- result 문서 총계: 144건
- 기록 기간: 2026-02-09 ~ 2026-02-13
- 폴더별 누적:
  - `phase1-entry-shadow` 7
  - `phase2-repo-infra` 4
  - `phase3-draft-p0` 6
  - `phase4-pilot-page` 8
  - `phase5` 51
  - `phase5-excel` 13
  - `phase5-next` 31
  - `phase5-SSOT` 6
  - `phase6` 5
  - `src2-migration-plan` 7
  - `checklist` 5

해석:
- "코드만 구현"이 아니라, 계획/결정/검증/회고를 같이 운영하는 개발 방식이 정착돼 있다.

---

## 4) 현재까지 구현/적용한 구조와 기능 (상세)

### 4-1) 앱 아키텍처 골격 (src2 SSOT)

- 엔트리 단일화:
  - `src2/app/main.tsx`에서 `BrowserRouter` + 전역 CSS import 고정
- 전역 경계 단일화:
  - `src2/app/App.tsx`에서 `ErrorBoundary + Suspense`만 허용
- 라우팅 SSOT:
  - `src2/app/nav/navConfig.ts`에서 메뉴/경로/loader 정의
  - `src2/app/routes/routes.tsx`에서만 `React.lazy(loader)` 수행
- 레거시 점진 교체 방식:
  - 경로(path)는 유지하고 loader 타겟만 `@legacy -> @app2`로 교체

이 구조의 의미:
- 기능 개발 중에도 URL/메뉴 안정성을 유지하면서, 페이지 단위로 안전하게 이관할 수 있다.

### 4-2) 도메인별 구현 결과

등록/기준정보:
- 거래처, 차량, 서비스업체, 관계기관, 직원, 설비, 소모품 등록 페이지가 src2로 이관됨.
- domain repo + draft + schema 조합으로 저장/복원 흐름 표준화.

등록/일일기록:
- logistics, office, production, issue, action이 src2 기준으로 동작.
- 공통 메타(기록일/지부/작성자/직책) 정책 적용.
- 유통(logistics) 도메인에서 고난도 정합성 로직 구현:
  - 반품 원본 연결 메타 저장
  - 과반품 차단
  - 반품대상/반품기록 상태 배지 통일
  - 순중량/순금액 계산 규칙 분리
  - 거래처/차량 포함검색 자동완성(선택 확정형)

관리(Manage):
- daily/master 하위 관리 화면 다수 src2 연결.
- 유통 관리 화면에서 미입력 필터, 반품 상태, 금액 tone, 편집 흐름 고도화.

엑셀:
- Excel 허브 + 파서/브릿지 구조 구성.
- 엑셀 도메인 스키마/정규화 문서와 구현이 같이 전개됨.

조회(Browse):
- 홈은 src2, 상세는 SHADOW 유지.
- 즉, 운영 우선순위를 일일/기준/엑셀에 집중하고 browse는 기능 참조 트랙으로 분리한 상태.

### 4-3) kernel 정본화 성과

repo 계층:
- `types.ts`, `keys.ts`, `storage/jsonStorage.ts`, `impl/*`, `domain/*` 구성 확립.
- UI에서 impl 직접 호출 금지, domain repo 사용 원칙 유지.
- legacy 호환 1회 동기화 + 메타 플래그 관리 구현.

draft 계층:
- `useDraft` 범용화 + 도메인 키 규칙 적용.
- dirty/save/discard/load 기반 공통 Draft 플로우 구축.

schema/utils/components:
- daily/title/site/return/amount 등 공통 규칙을 schema로 승격.
- status badge, meta fields, tag, contacts 등 공용 컴포넌트 축적.
- 공통 함수(date/sort/id/phone/dedup)로 중복 감소.

### 4-4) 검증/보안/자동화 체계

패키지 스크립트:
- `npm run build`
- `npm run test:smoke`
- `npm run check:security`
- `npm run test:p0:consistency`
- `npm run check:qa`
- `npm run check:qa:full`

자동화 스크립트:
- `scripts/smoke-routes.mjs`: 핵심 경로 HTTP 200 스모크
- `scripts/security-check.mjs`: 금지 import/localStorage/eval 탐지
- `scripts/p0-consistency-regression.ts`: legacy sync/merge 회귀 검증

의미:
- "AI가 코드를 빨리 만든다"에서 멈추지 않고, 회귀 차단 장치를 같이 만들어 운영하는 단계다.

### 4-5) 문서 운영/지식 관리 체계

- DOCS_GUIDE 중심 워크플로우 정착.
- main_rule, gates, security, status, decisions가 분리 운영됨.
- checklist 원본과 작성본 분리(`rule/checklist`, `rule/checklist-result`).
- result 파일 144건 누적으로 작업 의도와 변경 맥락 추적 가능.

---

## 5) 핵심 아이디어와 연계 설계 카탈로그

| 아이디어/원칙 | 적용 위치 | 실제 효과 |
|---|---|---|
| Shadow Router + loader 교체 방식 | `app/nav`, `app/routes` | URL 안정성 유지 + 점진 이관 가능 |
| app/kernel 책임 분리 | `src2/app`, `src2/kernel` | 페이지 코드 복잡도 통제, 재사용 기반 확보 |
| domain repo 강제 | `kernel/repo/domain/*` | 저장 계층 누수/중복 구현 방지 |
| Draft 범용화 | `kernel/draft/*` | 페이지별 임시저장 로직 중복 감소 |
| one-time legacy sync 메타 | `issueRepo`, `actionRepo` | 재이관 중복/덮어쓰기 리스크 감소 |
| 반품 원본 연결 모델 | logistics hook/schema | 정산 정합성(순중량/과반품) 확보 |
| 금액 tone/상태 배지 공용화 | `kernel/components/status/*` | 등록/관리 화면 규칙 일치 |
| 선택 입력 공용화(FilterableSelect) | register logistics | 오입력 감소 + 입력 속도 개선 |
| 체크리스트 원본/작성본 분리 | `docs/rule/checklist*` | 재사용성과 실행 추적성 동시 확보 |
| QA 게이트 계층화(L0/L1/L2) | `main_rule`, scripts | 속도와 안정성 균형 운영 |

---

## 6) 현재 계획과 다음 방향 (문서화된 실행 큐)

현재 우선순위:
1. 일일기록 리뉴얼 마감/확장
2. 기준페이지 리뉴얼
3. 엑셀등록 리뉴얼

로드맵 근거:
- `docs/roadmap/roadmap.md`
- `docs/roadmap/phase5/roadmap.md`
- `docs/roadmap/phase5/post-logistics-renewal-roadmap.md`

실행 큐 핵심:
- D1: 유통 리뉴얼 마감
- D2: 유통 제외 일일기록 4페이지 리뉴얼
- D3: 일일 신규페이지 스펙 고정
- M1: 기준페이지 리뉴얼 배치
- X1: 엑셀등록 리뉴얼 배치

---

## 7) 현재 강점과 리스크

강점:
- 아키텍처 원칙을 문서와 코드에 동시에 고정했다.
- 데이터 정합성 이슈(legacy sync, dedupe, 반품 정산)를 단순 UI 수준이 아니라 도메인 로직으로 풀었다.
- 자동화 스크립트까지 직접 구축해 회귀 방지 체계를 갖췄다.
- 결과 문서 누적량이 많아, "왜 이렇게 구현했는지"가 추적 가능하다.

리스크:
- 300 LOC 이상 파일이 아직 남아 있어 분해 여지가 있다.
- browse 상세는 SHADOW로 남아 있어 전환 완결 단계는 아니다.
- 테스트가 도메인 핵심 위주라, 컴포넌트 단위 자동테스트 범위는 더 넓힐 수 있다.
- 서버/인증/배포(Phase 6+)는 본격 진입 전이다.

---

## 8) VSCode + AI 에이전트 기준 웹앱 개발 등급표 (세분화)

| 레벨 | 이름 | 할 수 있는 것 | 결과물 기준 |
|---:|---|---|---|
| 1 | 기능 따라치기 | 요청받은 UI/함수를 단건 구현 | 단일 파일 수정 위주, 구조 근거 약함 |
| 2 | 페이지 조립자 | 페이지 단위 CRUD를 구현 | 페이지는 동작하지만 규칙/계층 분리는 약함 |
| 3 | 구조 인식자 | 라우팅/상태/컴포넌트 분리를 적용 | 폴더 규칙이 생기고 재사용 시작 |
| 4 | 규칙 기반 구현자 | SSOT/하드룰을 지키며 기능 확장 | 코드 일관성 상승, 문서 일부 운영 |
| 5 | 도메인 엔지니어 | 데이터 계약/정합성/마이그레이션까지 설계 | repo/draft/schema 체계화, 회귀 감소 |
| 6 | 운영형 미들 | 자동화 게이트/결정 로그/체크리스트로 팀 운영 | build+qa+security 흐름 내재화 |
| 7 | 제품 시스템 설계자 | 우선순위/로드맵/기술부채/품질비용 균형 관리 | 다중 도메인 안정 운영 + 배포 고려 |
| 8 | 플랫폼 리더 | 팀 확장 가능한 개발 플랫폼 구축 | 권한/배포/관측/규정까지 표준화 |

---

## 9) 네 현재 위치 (객관 판정)

### 9-1) 항목별 점수 (5점 만점)

| 항목 | 점수 | 근거 |
|---|---:|---|
| 문제 구조화/문서화 | 5.0 | 규칙-상태-결정-result 체계가 분리 운영됨 |
| 아키텍처 설계 | 4.5 | app/kernel SSOT, loader 라우팅, 계층 금지룰 고정 |
| 데이터 정합성 | 4.3 | legacy 1회 이관, deterministic id, 반품 정산 규칙 |
| 기능 구현 깊이 | 4.2 | 등록/관리/엑셀까지 다도메인 구현 누적 |
| 검증 자동화 | 4.0 | smoke/security/p0 회귀 스크립트 운영 |
| 유지보수성 관리 | 3.8 | 공용화 진행이 좋지만 고LOC 파일 일부 잔존 |
| 운영/배포/백엔드 | 2.5 | Phase 6+는 계획 단계 중심 |

가중 합산(내부 기준): **4.04 / 5.00 (약 81점)**

### 9-2) 최종 레벨 판정

**현재 위치: 레벨 5.5 ~ 6.0 구간 (도메인 엔지니어 상단, 운영형 미들 초입)**

이렇게 판단한 이유:
- 레벨 4 이하라면 보통 "기능 구현"에 머무르는데, 너는 이미 규칙/게이트/자동화/결정기록을 같이 운영하고 있다.
- 레벨 5 핵심인 데이터 계약/정합성 설계(legacy sync, 반품 연결, dedupe, 공용 계산)를 실제 코드로 반영했다.
- 레벨 6 조건인 팀 운영형 품질 체계(checklist, qa gate, security gate, result 누적)를 갖췄다.
- 다만 레벨 6 후반~7로 가려면 서버/권한/배포/관측, 그리고 테스트 폭을 더 넓혀야 한다.

비교군 기준 참고:
- "AI 에이전트와 처음 웹앱을 만드는 사용자 그룹" 안에서는 **상위권(대략 상위 20~30%)**으로 보는 게 합리적이다.
- 이유는 단순 UI 완성도가 아니라, 구조/정합성/운영 체계를 동시에 구축했기 때문이다.

---

## 10) 다음 레벨(6 -> 7)로 가는 가장 효율적인 액션

1. 테스트 층 확장  
`check:qa` 외에 핵심 도메인 함수와 주요 UI 흐름의 단위/통합 테스트를 추가한다.

2. 고LOC 우선 분해  
`PartnerRegisterPage.tsx` 같은 대형 파일을 page/hook/section/command로 분해해 유지보수 비용을 낮춘다.

3. Phase 6 선행 설계 구체화  
권한 모델, API 계약, 감사로그 스키마를 코드 스켈레톤까지 내려서 "문서 계획"에서 "실행 가능한 설계"로 전환한다.

4. SHADOW 잔여 제거 계획 수치화  
browse 재작성 트랙의 범위/우선순위/완료 기준을 수치로 고정해 이관 종료 조건을 명확히 만든다.

---

## 11) 한 줄 결론

너는 "처음 웹앱을 만드는 사람" 치고 잘하는 수준이 아니라, 이미 **구조와 운영을 아는 실무형 개발자 트랙**에 올라와 있다. 지금 필요한 건 기초 실력 보강이 아니라, 테스트/서버/배포까지 연결해서 시스템 완성도를 한 단계 끌어올리는 일이다.
