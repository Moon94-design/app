# 메뉴 UI SSOT 분리 + 상단바 고정형 정리

> 작성일: 2026-02-10
> 주제: 메뉴 페이지 공통 UI 분리(MenuPage) 및 상단바 레이아웃 안정화

---

## 변경 요약
- 메뉴 페이지 UI를 공통 컴포넌트(`MenuPage`)로 분리해 SSOT화.
- 홈/등록/관리/조회 메뉴 페이지를 모두 동일한 틀(제목 + 고정 카드 위치/크기)로 통일.
- 상단바는 페이지별 확장/축소가 없도록 고정형 레이아웃으로 조정.
  - 브랜드(상호명) 아래에 breadcrumb + quick tab 유지
  - quick tab 영역은 탭이 없어도 높이 유지
  - 홈 버튼은 우측 슬롯 고정

## 코드 변경
- 공통 UI
  - `src2/app/components/MenuPage.tsx` (신규)
  - `src2/app/components/menu-page.css` (신규)

- 메뉴 페이지 공통화 적용
  - `src2/app/pages/home/HomeMainPage.tsx`
  - `src2/app/pages/register/RegisterHomePage.tsx`
  - `src2/app/pages/register/RegisterMasterPage.tsx`
  - `src2/app/pages/register/RegisterDailyPage.tsx`
  - `src2/app/pages/manage/ManageHomePage.tsx`
  - `src2/app/pages/manage/ManageMasterPage.tsx`
  - `src2/app/pages/manage/ManageDailyPage.tsx`
  - `src2/app/pages/browse/BrowseHomePage.tsx`

- 상단바 고정형 레이아웃
  - `src2/app/shell/Shell.tsx`
    - 홈 버튼 우측 슬롯 고정
    - quick tab 영역 항상 렌더(placeholder 포함)
  - `src2/app/shell/shell.css`
    - 상단 높이/간격 고정
    - tabRow 최소 높이 고정
    - navline 내 버튼/crumb 위치 안정화

## 게이트 확인
- `npm run build` 성공

---

## 추가 보정(테스트 자동화 + 보안 체크리스트 부착)
- 자동화 스크립트 추가:
  - `scripts/smoke-routes.mjs` (build 후 preview 라우트 22개 HTTP 200 smoke)
  - `scripts/security-check.mjs` (`@legacy` in kernel, repo impl direct import, localStorage direct, eval/new Function 탐지)
- npm 스크립트 추가:
  - `npm run test:smoke`
  - `npm run check:security`
  - `npm run check:qa` (smoke + security)
  - `npm run check:qa:full` (lint:src2 + check:qa)
- 문서/게이트 SSOT 반영:
  - `docs/rule/SECURITY_CHECKLIST.md` 신규
  - `docs/rule/GATES_CHECKLIST.md`에 G5(자동화 QA/보안) 추가
  - `docs/rule/main_rule.md`, `docs/DOCS_GUIDE.md`, `AGENTS.md`, `docs/rule/DECISIONS_LOG.md` 갱신

## 게이트 확인(자동화)
- `npm run test:smoke` 성공 (22개 라우트 HTTP 200)
- `npm run check:security` 성공
- `npm run check:qa` 성공
- `npm run check:qa:full`은 `lint:src2` 기존 누적 이슈로 현재 실패(백로그 관리)

## 핵심 로직 3줄
- 1) `smoke-routes.mjs`가 preview 서버를 자동 기동하고 핵심 라우트를 순회해 새로고침(HTTP 200) 회귀를 자동 차단한다.
- 2) `security-check.mjs`가 금지 패턴(`kernel @legacy`, `repo/impl 직접 import`, `localStorage 직접 접근`, `eval`)을 정적 검사한다.
- 3) `check:qa`를 CI/로컬 기본 게이트로 고정해 기능 이관 속도와 최소 보안 검증을 동시에 유지한다.

## 입문자 설명 3줄
- 1) 이제 사람이 일일이 URL 눌러보지 않아도, 스크립트가 자동으로 주요 페이지가 열리는지 확인한다.
- 2) 위험한 코드 패턴을 컴퓨터가 먼저 잡아줘서, 실수로 보안 구멍이 들어가는 걸 줄인다.
- 3) `check:qa` 한 번으로 “기본 동작 + 기본 보안”을 함께 검사할 수 있어 작업 마감 기준이 분명해진다.

## 주의 사항
- smoke 라우트 목록은 수동 유지라서, 신규 라우트를 추가하고 목록을 갱신하지 않으면 누락 검사가 발생할 수 있다.
- `check:qa:full`의 lint 실패는 기존 누적 부채 영향이므로, 실제 신규 변경 검증과 부채 정리를 분리해 관리해야 한다.

## 향후 과정
- 라우트 신규 추가/경로 변경 시 `scripts/smoke-routes.mjs` 목록을 즉시 갱신해 검사 커버리지를 유지한다.
- Phase 6 서버 이관 전에 `SECURITY_CHECKLIST`의 S3(권한/감사/업로드 정책) 항목을 문서화하고 API 계약과 연결한다.

---

## 추가 보정(Manage 편집폼 인라인 스타일 3차 공통화)
- 관리 편집폼(`*EditFormSection`)에 남아 있던 반복 인라인 스타일을 공통 CSS 클래스로 치환했다.
  - SSOT 위치: `src2/app/pages/manage/manage-page-layout.css`
  - 신규 공통 클래스:
    - `.manage-edit-field`, `.manage-edit-choice-row`
    - `.manage-edit-actions`, `.manage-edit-actions--wide`
    - `.manage-edit-divider-title`
    - `.manage-edit-lines`, `.manage-edit-line-card`, `.manage-edit-line-grid`
    - `.manage-edit-line-label`, `.manage-edit-line-input`, `.manage-edit-line-meta`
    - `.manage-edit-warn-box`, `.manage-edit-warn-text`, `.manage-action-btn--warn`
- 적용 파일:
  - `src2/app/pages/manage/sections/ManageAgencyEditFormSection.tsx`
  - `src2/app/pages/manage/sections/ManageVendorEditFormSection.tsx`
  - `src2/app/pages/manage/sections/ManageConsumableEditFormSection.tsx`
  - `src2/app/pages/manage/sections/ManageEmployeeEditFormSection.tsx`
  - `src2/app/pages/manage/sections/ManageEquipmentEditFormSection.tsx`
  - `src2/app/pages/manage/sections/ManageVehicleEditFormSection.tsx`
  - `src2/app/pages/manage/sections/ManageLogisticsEditFormSection.tsx`
- 효과:
  - 편집폼 하단 액션 버튼(저장/취소/초기화) 배치 규칙이 통일됨
  - 필드 간격/선택 버튼 행 간격/경고 박스 표현이 공통 규칙으로 정착됨
  - 추후 UI 간격 수정 시 페이지별 JSX 수정 없이 CSS 단일 수정으로 반영 가능

## 게이트 확인(3차)
- `npm run build` 성공

---

## 핵심 로직 3줄
- 1) `ManagePageCard`를 도입해 manage 상세 페이지의 공통 헤더/카드 구조를 단일 컴포넌트로 고정했다.
- 2) manage 리스트/편집폼의 인라인 스타일을 `manage-page-layout.css` 공통 클래스(`manage-list-*`, `manage-edit-*`)로 치환했다.
- 3) 상단바/메뉴/등록 상세 레이아웃을 SSOT 컴포넌트(`MenuPage`, `MasterFormHeader`) 중심으로 통일해 페이지별 흔들림을 제거했다.

## 입문자 설명 3줄
- 1) 같은 모양을 여러 파일에 복사하지 말고, 공통 껍데기를 한 번 만들어서 같이 쓰게 바꿨다.
- 2) JSX 안에 직접 넣던 스타일을 CSS 클래스 이름으로 옮겨서, 다음엔 CSS 한 군데만 고치면 전체가 같이 바뀌게 했다.
- 3) 화면의 머리부분과 메뉴 기준을 통일해서, 페이지를 이동해도 위치/간격/버튼 동작이 일관되게 보이도록 정리했다.

## 주의 사항
- 이번 변경은 manage 상세 페이지에 동일 패턴이 많아, 일부 화면에서 도메인별 예외 로직(문구/버튼 조건)이 빠졌을 가능성이 있다.
- 공통 클래스 치환 과정에서 특정 섹션의 미세한 간격/폰트 차이가 의도치 않게 동일화되었을 수 있어, 런타임 화면 비교 확인이 필요하다.

## 향후 과정
- 다음 작업에서 `manage-page-layout.css` 또는 `ManagePageCard`를 수정하면 연결된 manage 상세 페이지 전반이 동시에 영향을 받으니, 변경 전 영향 목록을 먼저 확인한다.
- 서버 이관 단계에서 폼 필드/버튼 상태 규칙이 API 응답 상태와 맞물리므로, 공통 UI 수정 시 `useManage*Page` 훅의 상태 플로우를 같이 점검한다.

---

## 추가 보정(Manage 리스트 섹션 인라인 스타일 2차 공통화)
- 관리 리스트 섹션(기관/서비스 업체/직원/설비/소모품)의 반복 인라인 스타일을 CSS 클래스로 통합했다.
  - SSOT 위치: `src2/app/pages/manage/manage-page-layout.css`
  - 추가 공통 클래스:
    - `.manage-list-card`, `.manage-list-row`, `.manage-list-title`, `.manage-list-title-row`
    - `.manage-list-meta`, `.manage-inline-gap`, `.manage-inline-muted`
    - `.manage-action-group`, `.manage-action-btn`, `.manage-action-btn--danger`
- 적용 파일:
  - `src2/app/pages/manage/sections/ManageAgencyListSection.tsx`
  - `src2/app/pages/manage/sections/ManageVendorListSection.tsx`
  - `src2/app/pages/manage/sections/ManageEmployeeListSection.tsx`
  - `src2/app/pages/manage/sections/ManageEquipmentListSection.tsx`
  - `src2/app/pages/manage/sections/ManageConsumableListSection.tsx`
- 효과:
  - 수정/삭제 버튼 크기/간격/위험 버튼 컬러 규칙이 목록 전반에서 동일해짐
  - 카드 내부 타이포(제목/메타) 간격 리듬이 통일되어 향후 UI 변경 시 단일 CSS 수정으로 반영 가능

## 게이트 확인(2차)
- `npm run build` 성공

## 역할 스위칭 점검
- 주의할 점:
  - quick tab 고정 높이로 인해 일부 모바일 화면에서 버튼 줄바꿈이 생길 수 있어 탭 개수 많은 구간은 추후 2열 규칙 검토 필요.
  - 기존 `subMenu*` CSS는 현재 신규 메뉴 페이지에서 미사용이므로, 후속 정리 타이밍에 제거 가능.
- 선조치 체크:
  - [x] 메뉴 UI 공통 컴포넌트 분리
  - [x] 페이지별 메뉴 카드 위치/크기 일관화
  - [x] 상단바 확장/축소 흔들림 제거
  - [ ] 모바일 탭 과밀 시 대체 UI(가로 스크롤/드롭다운) 검토

## 다음 단계
- `/manage/daily/production` 상세 이관
- `subMenu*` 레거시 스타일 정리(미사용 CSS 제거)

다음 질문: 바로 `/manage/daily/production`으로 이어갈까?

---

## 추가 보정(상단바 고정 요청 반영)
- 상단바 내부 버튼 유무에 따라 높이가 변하지 않도록 헤더 높이를 고정했다.
  - `--topbarH`, `--navlineH` 고정
  - tab 영역 줄바꿈 금지 + 가로 스크롤로 전환
- 홈 버튼은 상단바 우측 상단 영역으로 복귀시켰다.
  - 홈 버튼이 없는 페이지에서도 placeholder로 슬롯 높이를 유지한다.
- 본문 시작 간격은 모든 페이지에서 동일하게 유지되도록 `contentTopActions` 최소 높이를 고정했다.

## 추가 파일
- `src2/app/shell/Shell.tsx`
  - 홈 버튼 위치를 우측 상단 슬롯으로 조정
  - `뒤로` 영역은 모든 페이지에서 동일 공간 확보
- `src2/app/shell/shell.css`
  - 헤더/네비 높이 고정
  - tab 줄바꿈 금지 및 스크롤 처리
  - 상단/본문 간격 고정

---

## 추가 보정(탭 표시/회사명/등록 페이지 일관성)
- `/register` 진입 시 quick tab이 비어 보이던 문제를 수정했다.
  - 규칙: 최상위 섹션(`/register`, `/manage`, `/browse`, `/excel`)에서는 상위 네비 탭을 노출.
  - `/register`에서는 `엑셀등록`, `관리`, `조회` 탭이 보이도록 반영.
- 상호명 타이포를 1.5배 수준으로 확대했다.
  - `brandTitle` 폰트 크기 `26px`로 상향.
- 기준정보 등록 상세 페이지 헤더를 공통화했다.
  - `MasterFormHeader`로 통일해 제목/초기화 버튼의 위치와 글자 크기를 동일하게 유지.
  - 적용: 차량, 관계 기관, 직원, 설비, 소모품 (거래처/서비스 업체는 기존 공통 헤더 유지)

---

## 추가 보정(작성 페이지 divider + 뒤로 스크롤 동작)
- 작성 페이지도 `제목 -> divider -> 본문` 흐름으로 통일했다.
  - `MasterFormHeader` 바로 아래 `div.divider`를 추가.
  - 적용: 거래처/차량/서비스 업체/관계 기관/직원/설비/소모품 등록 페이지
- `뒤로` 클릭 시 이전 스크롤 위치가 유지되지 않도록 라우트 전환마다 상단으로 초기화했다.
  - `Shell.tsx`에 `useEffect([loc.pathname])` 기반 `window.scrollTo(0,0)` 추가.

---

## 추가 보정(breadcrumb 홈 표시 + 입력칸 간격 SSOT)
- 경로 breadcrumb에서 항상 `홈`이 먼저 보이도록 보정했다.
  - `/register` 진입 시 `홈 > 등록` 형태로 표시.
  - 구현: `navModel.getBreadcrumb`에서 `/` prefix 강제.
- 입력칸 간격을 페이지별 인라인 스타일이 아니라 공통 CSS로 통일했다.
  - SSOT 위치: `src2/app/shell/shell.css`
  - 신규 공통 클래스: `.form-grid`, `.form-field`, `.form-label`, `.form-subgrid`, `.form-two-col`
  - 이 클래스를 등록 섹션에 적용해 거래처 포함 전체 등록 화면 간격을 동일하게 맞춤.

---

## 추가 보정(등록 상세 레이아웃 2중화 해소)
- 메뉴 페이지와 등록 상세 페이지가 서로 다른 폭/정렬 기준으로 보이던 문제를 통일했다.
  - 등록 상세 페이지 루트 카드도 `menu-page` 컨테이너를 공유하도록 변경.
  - 적용: 거래처/차량/서비스 업체/관계 기관/직원/설비/소모품 등록 페이지
- 결과적으로 `홈/등록/기준정보 등록` 계열과 상세 작성 계열의 제목 시작 위치가 동일 기준선에 맞춰진다.

---

## 추가 보정(거래처 등록 글자/간격 불일치 해소)
- 거래처 등록에서만 하위 항목 글자 크기/간격이 넓게 보이던 원인을 제거했다.
  - `PartnerCreateFlow`에 남아 있던 중첩 `form-grid` 구조를 단일 플로우로 평탄화.
  - 라벨은 모두 `form-label` 기준으로 통일.
- 결과적으로 거래처 등록도 차량/서비스 업체/관계 기관/직원/설비/소모품과 같은 입력칸 간격 리듬을 사용한다.

---

## 추가 보정(Manage 페이지 레이아웃 중복 리팩터링)
- 관리 상세 페이지의 반복되던 카드/헤더 구조를 공통 컴포넌트로 분리했다.
  - 신규: `src2/app/pages/manage/components/ManagePageCard.tsx`
  - 역할: `card + manage-page + 제목 + 우측 액션 버튼(뒤로/목록)` 공통 렌더
- 적용 페이지:
  - `src2/app/pages/manage/ManageAgencyPage.tsx`
  - `src2/app/pages/manage/ManageConsumablePage.tsx`
  - `src2/app/pages/manage/ManageEquipmentPage.tsx`
  - `src2/app/pages/manage/ManageVendorPage.tsx`
  - `src2/app/pages/manage/ManageEmployeePage.tsx`
  - `src2/app/pages/manage/ManageVehiclePage.tsx`
  - `src2/app/pages/manage/ManageLogisticsPage.tsx`
- `ManageEmployeePage`, `ManageVehiclePage`, `ManageLogisticsPage`에 남아 있던 상단 인라인 스타일/안내 박스를 `ManagePageCard + ManageInfoNotice` 조합으로 통일했다.

## 게이트 확인
- `npm run build` 성공

---

## 추가 보정(src2 린트 부채 정리)
- `src2` 범위에서 lint 오류 14건을 0건으로 정리했다.
- `@ts-ignore` 패턴을 제거하고 `createLocalId` 유틸(`src2/kernel/utils/id.ts`)로 ID 생성 로직을 공통화했다.
- React hook lint 위반(불변성/이펙트 setState/ref render 접근)을 안전한 형태로 수정했다.

### 변경 파일
- `src2/kernel/utils/id.ts` (신규)
- `src2/kernel/utils/index.ts`
- `src2/app/nav/navConfig.ts`
- `src2/kernel/schema/partner/partnerTypes.ts`
- `src2/kernel/draft/useDraft.ts`
- `src2/app/pages/partner/PartnerRegisterPage.tsx`
- `src2/app/pages/partner/bulk/usePartnerBulkEdit.ts`
- `src2/app/pages/agency/hooks/useAgencyRegisterPage.ts`
- `src2/app/pages/vendor/hooks/useVendorRegisterPage.ts`
- `src2/app/pages/employee/hooks/useEmployeeRegisterPage.ts`
- `src2/app/pages/vehicle/hooks/useVehicleRegisterPage.ts`
- `src2/app/pages/equipment/hooks/useEquipmentRegisterPage.ts`
- `src2/app/pages/consumable/hooks/useConsumableRegisterPage.ts`
- `src2/kernel/schema/agency/agencyTypes.ts`
- `src2/kernel/schema/vendor/vendorTypes.ts`

## 게이트 확인
- `npm run lint:src2` 성공
- `npm run build` 성공

## 핵심 로직 3줄
- ID 생성은 `createLocalId(prefix)` 공통 유틸로 통일해 페이지별 임시 구현/주석 예외를 제거했다.
- `PartnerRegisterPage.save()`에서 draft 직접 변형을 제거하고 `nextBase`를 생성해 불변성 규칙을 지켰다.
- `usePartnerBulkEdit` 초기 스냅샷 메타 로딩을 `useState` lazy initializer로 옮겨 이펙트 내 동기 setState를 제거했다.

## 입문자 설명 3줄
- 같은 기능을 여러 파일에 복붙하지 않고 공통 함수로 묶으면 버그가 줄고 수정이 쉬워진다.
- React에서는 상태 객체를 직접 바꾸지 말고, 새 객체를 만들어 저장해야 안전하다.
- 화면 시작 시 필요한 초기값은 `useEffect`보다 `useState(() => 초기값)`으로 넣으면 불필요한 재렌더를 줄일 수 있다.

## 주의 사항
- AI가 패턴 반복 수정을 수행했기 때문에, ID prefix(`V`, `A`, `E`, `EQ`, `CS`, `PV2`)가 도메인 규칙과 100% 일치하는지 추가 확인이 필요하다.
- `useDraft`의 초기 로딩은 타이머 기반으로 조정되었으므로, 페이지 진입 직후 draft 표시 타이밍이 민감한 화면은 수동 점검이 필요하다.

## 향후 과정
- 다음 작업에서 ID 정책이 바뀌면 `createLocalId` 한 곳 수정으로 전체 등록/관리 페이지에 반영된다.
- 서버 이관 전 `DRAFT_KEYS`/`STORAGE_KEYS`와 ID prefix 맵을 한 번 더 문서화하면 데이터 마이그레이션 리스크를 줄일 수 있다.
