# Feature Files Map (Unified, All Domains)
작성일: 2026-02-12
목적: `src2` 전체 기능 파일의 경로/역할을 한 문서에서 관리하고, 신규 기능 파일 추가 전에 중복 생성 여부를 먼저 점검한다.

---

## 0) 사용 규칙 (필수)
- 기능 파일 추가/분리/이동 전에 이 문서를 먼저 확인한다.
- 신규 파일을 만들기 전에 `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`의 파일 신설 점검 항목을 먼저 체크한다.
- 같은 책임의 파일이 이미 있으면 신설하지 않고 기존 파일 확장 우선으로 처리한다.
- 변경 후에는 이 문서를 즉시 갱신한다.

---

## 1) App Layer 기능 맵

### 1-1) Home
- `src2/app/pages/home/HomeMainPage.tsx`: 홈 진입 페이지

### 1-2) Register (Daily)
- 조립 페이지
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`

- Orchestration Hook
  - `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts`
  - `src2/app/pages/register/hooks/useRegisterProductionPage.ts`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
  - `src2/app/pages/register/hooks/useRegisterActionPage.ts`
  - `src2/app/pages/register/hooks/common/useActorProfileDraftSync.ts` (일일 메타 초깃값/잠금 동기화 공용)
  - `src2/app/pages/register/hooks/common/selection.ts` (선택 id -> 표시값 해석 공용)

- Logistics 세부 기능 파일
  - `src2/app/pages/register/hooks/logistics/constants.ts`
  - `src2/app/pages/register/hooks/logistics/draftUpdater.ts`
  - `src2/app/pages/register/hooks/logistics/lineEdit.ts`
  - `src2/app/pages/register/hooks/logistics/mappers.ts`
  - `src2/app/pages/register/hooks/logistics/selectors.ts`
  - `src2/app/pages/register/hooks/logistics/returnSource.ts`
  - `src2/app/pages/register/hooks/logistics/useReturnSourceController.ts`
  - `src2/app/pages/register/hooks/logistics/merge.ts`
  - `src2/app/pages/register/hooks/logistics/formatters.ts`
  - `src2/app/pages/register/hooks/logistics/commands.ts` (barrel)
  - `src2/app/pages/register/hooks/logistics/partnerCommands.ts`
  - `src2/app/pages/register/hooks/logistics/vehicleCommands.ts`
  - `src2/app/pages/register/hooks/logistics/submitCommand.ts`
  - `src2/app/pages/register/hooks/logistics/types.ts`

- Action 세부 기능 파일
  - `src2/app/pages/register/hooks/action/constants.ts`
  - `src2/app/pages/register/hooks/action/selectors.ts`
  - `src2/app/pages/register/hooks/action/commands.ts`
  - `src2/app/pages/register/hooks/action/types.ts`

- Production 세부 기능 파일
  - `src2/app/pages/register/hooks/production/constants.ts`
  - `src2/app/pages/register/hooks/production/selectors.ts`
  - `src2/app/pages/register/hooks/production/commands.ts`
  - `src2/app/pages/register/hooks/production/types.ts`

- Office 세부 기능 파일
  - `src2/app/pages/register/hooks/office/constants.ts`
  - `src2/app/pages/register/hooks/office/selectors.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/hooks/office/types.ts`

- Register 공용 조각
  - `src2/app/pages/register/components/IssueRegisterForm.tsx`
  - `src2/app/pages/register/components/ActionRegisterForm.tsx`
  - `src2/app/pages/register/sections/common/FilterableSelect.tsx` (단일 자동완성 입력 + 하단 목록 선택 공용)
  - `src2/app/pages/register/sections/logistics/*`
    - `src2/app/pages/register/sections/logistics/ReturnSourcePanel.tsx` (반품 원본 선택 패널)

### 1-3) Register (Master)
- Partner: `src2/app/pages/partner/*`
- Vehicle: `src2/app/pages/vehicle/*`
- Vendor: `src2/app/pages/vendor/*`
- Agency: `src2/app/pages/agency/*`
- Employee: `src2/app/pages/employee/*`
- Equipment: `src2/app/pages/equipment/*`
- Consumable: `src2/app/pages/consumable/*`

### 1-4) Manage
- 허브/메인
  - `src2/app/pages/manage/ManageHomePage.tsx`
  - `src2/app/pages/manage/ManageMasterPage.tsx`
  - `src2/app/pages/manage/ManageDailyPage.tsx`
- 상세
  - `src2/app/pages/manage/ManageVehiclePage.tsx`
  - `src2/app/pages/manage/ManageVendorPage.tsx`
  - `src2/app/pages/manage/ManageAgencyPage.tsx`
  - `src2/app/pages/manage/ManageEmployeePage.tsx`
  - `src2/app/pages/manage/ManageEquipmentPage.tsx`
  - `src2/app/pages/manage/ManageConsumablePage.tsx`
  - `src2/app/pages/manage/ManageLogisticsPage.tsx`
  - `src2/app/pages/manage/ManageProductionPage.tsx`
  - `src2/app/pages/manage/ManageIssuePage.tsx`
  - `src2/app/pages/manage/ManageActionPage.tsx`
- 훅/섹션
  - `src2/app/pages/manage/hooks/*`
  - `src2/app/pages/manage/sections/*`

### 1-5) Browse
- `src2/app/pages/browse/BrowseHomePage.tsx`
- 상세 browse는 현재 SHADOW(`navConfig` loader 기준)

### 1-6) Excel
- `src2/app/pages/excel/ExcelImportHubPage.tsx`
- `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
- `src2/app/pages/excel/sections/*`
- `src2/app/pages/excel/components/*`
- `src2/app/pages/excel/adapters/*`
- `src2/app/pages/excel/types/*`

### 1-7) Shell
- `src2/app/shell/Shell.tsx`
- `src2/app/shell/MyInfoModal.tsx` (내 정보 설정 모달)

---

## 2) Kernel Layer 기능 맵

### 2-1) Components
- Master/Form: `src2/kernel/components/master/*`
- Record: `src2/kernel/components/record/*`
  - `AutoTitleField.tsx`: 제목 자동완성
  - `DailyMetaFields.tsx`: 일일 공통 상단 4항목(기록일/지부/작성자/직책)
- Tag: `src2/kernel/components/tag/*`
- Manage: `src2/kernel/components/manage/*`
- Contacts: `src2/kernel/components/contacts/*`
- Profiles: `src2/kernel/components/profiles/*`
- Recent/Status 등 공용 UI: `src2/kernel/components/*`
  - `src2/kernel/components/status/ReturnStatusBadge.tsx`: 반품 상태(전량/부분, 기록/대상) 배지 공용
  - `src2/kernel/components/status/LogisticsAmountTone.ts`: 유통 금액 tone 색상 공용(관리/등록 동기화)

### 2-2) Repo
- 도메인 repo(페이지에서 사용): `src2/kernel/repo/domain/*`
- 구현체(페이지 직접 import 금지): `src2/kernel/repo/impl/*`
  - `src2/kernel/repo/impl/repoAudit.ts` (repo 공통 create/update/delete 감사로그 기록)
- 계약 SSOT: `src2/kernel/repo/types.ts`
- Key SSOT: `src2/kernel/repo/keys.ts`

### 2-2-1) User Context
- `src2/kernel/user/myInfo.ts`
- `src2/kernel/user/index.ts`
- 목적: 로컬 사용자 정보(이름/직책/지부) SSOT + 구독 훅 제공

### 2-3) Draft
- `src2/kernel/draft/draftKeys.ts`
- `src2/kernel/draft/useDraft.ts`
- `src2/kernel/draft/draftRepo.ts`

### 2-4) Schema
- Daily: `src2/kernel/schema/daily/*`
- 지부 공통 상수: `src2/kernel/schema/daily/siteOptions.ts`
- 제목 템플릿 공용: `src2/kernel/schema/daily/titleTemplates.ts`
- 반품 상태 계산/표시 공용: `src2/kernel/schema/daily/logisticsReturnStatus.ts`
- 유통 금액 표시 계산 공용: `src2/kernel/schema/daily/logisticsAmountView.ts`
- Master 도메인: `src2/kernel/schema/{partner,vehicle,vendor,agency,employee,equipment,consumable}/*`
- Excel: `src2/kernel/schema/excel/*`

### 2-5) Utils
- 기본: `src2/kernel/utils/id.ts`, `src2/kernel/utils/phone.ts`
- 중복방지: `src2/kernel/utils/masterDedup.ts`
- 태그 인덱스: `src2/kernel/utils/tagIndex.ts`
- 날짜/정렬 공용: `src2/kernel/utils/date.ts`, `src2/kernel/utils/recordSort.ts`

---

## 3) 최근 공용화 반영 (2026-02-12)
- `todayYmd`를 `@kernel/utils/date.ts`로 통합.
- 일일/이슈/조치/생산/사무/유통 정렬 공통 규칙을 `@kernel/utils/recordSort.ts`로 통합.
- 유통 저장 명령을 `partnerCommands/vehicleCommands/submitCommand`로 분리.
- 조치 등록 훅을 `hooks/action/*`로 분리해 submit/remove/selector 책임을 분리.
- 생산 등록 훅을 `hooks/production/*`로 분리해 태그 수집/저장 명령/상수 책임을 분리.
- 사무 등록 훅을 `hooks/office/*`로 분리해 기관 매핑/추가 항목/저장 명령 책임을 분리.
- 유통/이슈/조치 제목 규칙을 `@kernel/schema/daily/titleTemplates.ts`로 통합.
- manage 액션/이슈/생산 정렬도 `sortByRecordDateUpdated`로 통일.
- 일일 상단 메타(기록일/지부/작성자/직책) 공통 컴포넌트 `DailyMetaFields` 적용.
- 지부 표준값을 `대구/성주`로 고정하고 legacy `경주`는 정규화 처리.
- 유통 단가는 자동추천 유지 + 사용자 수동 수정 허용 정책으로 정리.
- 유통 타입 UI는 `처리` 방향일 때 PP/PE 선택 숨김 + 종류(폐기물/폐수)만 노출하도록 정리.
- 유통/이슈/조치 제목은 `titleTemplates.ts`에서 태그 접두사 포맷으로 일괄 생성.

## 3-1) 최근 반영 (2026-02-13)
- `내 정보` 공통 모듈(`kernel/user`) 추가, Shell에서 설정/저장 가능.
- 일일등록 훅 공통 동기화(`useActorProfileDraftSync`) 추가.
- repo 공통층(`localRepo`)에서 감사로그 이벤트(`create/update/delete`) 자동 기록.
- 유통 등록 훅의 라인 수정/삭제 및 draft patch 로직을 기능 파일로 분리.
- 유통 반품 v1: `ReturnSourcePanel` + `selectors/submitCommand/merge` 확장으로 원본 연결 반품 저장 기반 추가.
- 반품 상태 계산(`logisticsReturnStatus.ts`)과 상태 배지(`ReturnStatusBadge.tsx`)를 공용화해 등록/관리 화면 공통 적용.
- 유통 훅에서 반품 후보 계산/선택 제어를 `useReturnSourceController.ts`로 분리.
- 관리 유통의 금액 표시 규칙(반품대상 순금액/반품기록 참고금액/방향별 tone)을 `logisticsAmountView.ts`로 공용 계산 분리.
- 유통 금액 tone 색상 상수를 `LogisticsAmountTone.ts`로 분리해 관리/등록 화면의 색 규칙을 단일화.
- 유통 등록의 거래처/차량 선택에 단일 자동완성(빈 입력 시 전체 목록, 포함검색, 목록 선택 확정) 패턴을 `FilterableSelect.tsx`로 공용화.
- 생산 등록의 생산품/품목 선택에도 `FilterableSelect.tsx` 패턴을 적용해 일일 페이지 공용 UX 기준으로 확장.

---

## 4) 신규 기능 파일 추가 전 체크 (요약)
1. 이 문서에서 기존 책임 파일 존재 여부 확인
2. 없으면 `PAGE_RENEWAL_CHECKLIST`의 신설 체크 항목 통과
3. 파일 생성 후 이 문서와 결과 문서(result) 동시 갱신

---

## 5) 연계 문서
- `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- `src2/docs/reference/page-renewal-common-spec.md`
- `src2/docs/reference/register-daily-files.md`
- `src2/docs/reference/partner-manage-files.md`
