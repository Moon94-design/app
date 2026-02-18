# Register Daily 기능 파일 맵 (최신)
작성일: 2026-02-18
목적: register daily 도메인의 파일 경로/역할/리팩터링 우선순위를 최신 기준으로 관리한다.

---

## 1) 페이지 조립 파일
- `src2/app/pages/register/RegisterLogisticsDailyPage.tsx` (362 LOC)
  - 유통 등록 화면 조립, 반품/이슈모달/quick-add 연결
- `src2/app/pages/register/RegisterProductionDailyPage.tsx` (331 LOC)
  - 생산 등록 조립, 생산 이슈/조치 모달 연결
- `src2/app/pages/register/RegisterOfficeDailyPage.tsx` (84 LOC)
  - 사무 등록 조립(상단 입력 + 즉시저장 + 통합 하단 목록)
- `src2/app/pages/register/RegisterIssuePage.tsx` (108 LOC)
  - 이슈 등록 조립(기준정보 연계 + 추천 포함)
- `src2/app/pages/register/RegisterActionPage.tsx` (84 LOC)
  - 조치 등록 조립

---

## 2) 훅(Orchestration) 파일
- `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts` (381 LOC)
- `src2/app/pages/register/hooks/useRegisterProductionPage.ts` (159 LOC)
- `src2/app/pages/register/hooks/useRegisterOfficePage.ts` (348 LOC)
- `src2/app/pages/register/hooks/useRegisterIssuePage.ts` (218 LOC)
- `src2/app/pages/register/hooks/useRegisterActionPage.ts` (189 LOC)

주의:
- `useRegisterLogisticsPage.ts`는 350 LOC 초과 상태(다음 분리 우선 대상).
- `useRegisterOfficePage.ts`는 350 아래로 정리 완료(348 LOC).

---

## 3) 공통 훅/선택/추천
- `src2/app/pages/register/hooks/common/useActorProfileDraftSync.ts`
  - 일일 공통 메타(지부/작성자/직책) 자동 주입/잠금 동기화
- `src2/app/pages/register/hooks/common/selection.ts`
  - 선택 id -> 표시값 해석 공용
- `src2/app/pages/register/hooks/common/linkedReferences.ts`
  - 내용 기반 기준정보 추천(토큰화 + 점수 정렬) 공용

---

## 4) 도메인별 세부 기능 파일

### 4-1) Logistics (`hooks/logistics/*`)
- `constants.ts`, `types.ts`
- `mappers.ts`, `selectors.ts`, `formatters.ts`
- `draftUpdater.ts`, `merge.ts`, `lineEdit.ts`, `submitCommand.ts`
- `partnerCommands.ts`, `vehicleCommands.ts`
- `returnSource.ts`, `useReturnSourceController.ts`
- `permissions.ts`, `commands.ts`(barrel)

### 4-2) Production (`hooks/production/*`)
- `constants.ts`, `types.ts`, `selectors.ts`, `formatters.ts`, `commands.ts`

### 4-3) Office (`hooks/office/*`)
- `constants.ts`, `types.ts`, `selectors.ts`
- `mappers.ts`, `useOfficeLinkContext.ts`
- `permissions.ts`, `commands.ts`

### 4-4) Issue (`hooks/issue/*`)
- `types.ts`, `permissions.ts`, `commands.ts`

### 4-5) Action (`hooks/action/*`)
- `constants.ts`, `types.ts`, `selectors.ts`, `permissions.ts`, `commands.ts`

---

## 5) register daily UI 조각

### 5-1) 공용 섹션 (`sections/common/*`)
- `FilterableSelect.tsx`
- `LayerModal.tsx`
- `dailyRecordView.ts`
  - 하단 기록 카드/버튼/대제목 공용 스타일 SSOT

### 5-2) logistics 섹션 (`sections/logistics/*`)
- 입력폼: `LogisticsFormSection.tsx`, `LogisticsIdentityFields.tsx`, `LogisticsTypeFields.tsx`, `LogisticsWeightFields.tsx`
- 액션/목록: `LogisticsFormActions.tsx`, `SelectedDateLogisticsList.tsx`, `LogisticsToast.tsx`
- 모달/패널: `IssueActionModal.tsx`, `PartnerQuickModal.tsx`, `VehicleQuickModal.tsx`, `ReturnSourcePanel.tsx`

### 5-3) office 섹션 (`sections/office/*`)
- `OfficeLineDraftPanel.tsx`
- `OfficeUnifiedHistoryPanel.tsx`

### 5-4) production 섹션 (`sections/production/*`)
- `ProductionIssueModal.tsx` (호환성 유지용)

---

## 6) register daily가 의존하는 kernel SSOT
- 일일 상단 공통 4항목: `src2/kernel/components/record/DailyMetaFields.tsx`
- 제목 템플릿: `src2/kernel/schema/daily/titleTemplates.ts`
- 지부 옵션 SSOT: `src2/kernel/schema/daily/siteOptions.ts`
- 반품 상태/금액 계산:
  - `src2/kernel/schema/daily/logisticsReturnStatus.ts`
  - `src2/kernel/schema/daily/logisticsAmountView.ts`
- 저장소/계약:
  - `src2/kernel/repo/domain/*`
  - `src2/kernel/repo/types.ts`
  - `src2/kernel/repo/keys.ts`

---

## 7) 최근 반영 요약 (2026-02-18)
- 사무 세부 등록을 즉시 저장 방식으로 전환(임시 세부목록 제거).
- 사무 문서를 `recordDate + site + writer` 축 단일 문서로 정규화.
- 이슈에 기준정보 연계 선택 + 내용 기반 추천을 공통 적용.
- 이슈 저장/정규화 경계에 `linkedReferences` 필드 반영.
- 하단 카드/버튼 표시형식을 `dailyRecordView.ts` 공통 스타일로 정렬(유통 반품/금액 로직 유지).

---

## 8) 다음 우선순위
1. `useRegisterLogisticsPage.ts` 분리(350 LOC 이하 목표)
2. logistics/production 폼 조립 레이어 공통화 범위 검토
3. issue/action 하단 항목 `수정` 기능 통일 여부 결정

진행 기준:
- 신규 파일 생성 전 `feature-files-map-unified.md` 중복 점검 필수
- 구조 변경 시 이 문서 + unified map + 체크리스트 결과를 같은 배치에서 동기화
