# Register Daily 기능 파일 맵 (최신)
작성일: 2026-02-12
목적: register daily 도메인의 파일 경로/역할/위험도/공용화 상태를 최신 기준으로 관리한다.

---

## 1) 페이지 조립 파일
- `src2/app/pages/register/RegisterLogisticsDailyPage.tsx` (268 LOC)
  - 유통 등록 화면 조립, 섹션/모달 연결, 저장 토스트 표시
- `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - 생산 등록 조립
- `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - 사무 등록 조립
- `src2/app/pages/register/RegisterIssuePage.tsx`
  - 이슈 등록 조립
- `src2/app/pages/register/RegisterActionPage.tsx`
  - 조치 등록 조립

---

## 2) 훅(Orchestration) 파일
- `src2/app/pages/register/hooks/useRegisterLogisticsPage.ts` (296 LOC)
  - 유통 draft 상태, 옵션 계산, quick-add/submit 호출 조립
- `src2/app/pages/register/hooks/useRegisterProductionPage.ts` (185 LOC)
- `src2/app/pages/register/hooks/useRegisterOfficePage.ts` (175 LOC)
- `src2/app/pages/register/hooks/useRegisterIssuePage.ts` (184 LOC)
- `src2/app/pages/register/hooks/useRegisterActionPage.ts` (139 LOC)

주의:
- `useRegisterLogisticsPage.ts`만 250+ 구간이며, 다음 리뉴얼에서 상태 계산 세분화 우선 후보.

---

## 3) 유통 세부 기능 파일 (hooks/logistics)
- `constants.ts`: 초기 draft/고정 옵션
- `mappers.ts`: row/마스터 데이터 정규화
- `selectors.ts`: 추천 차량/최근 라인/옵션 계산
- `merge.ts`: 날짜별 병합/중복 라인 정리
- `formatters.ts`: 제목 포맷
- `commands.ts` (3 LOC): barrel export
- `partnerCommands.ts` (147 LOC): 거래처 quick-add/중복수정
- `vehicleCommands.ts` (57 LOC): 차량 quick-add
- `submitCommand.ts` (169 LOC): 저장/프로필 동기화/draft reset
- `types.ts`: command 입력 타입

---

## 4) 유통 UI 섹션 파일 (sections/logistics)
- `LogisticsFormSection.tsx` (76 LOC): 입력폼 조립
- `LogisticsIdentityFields.tsx`: 거래처/차량/작성자
- `LogisticsTypeFields.tsx`: 방향/종류/품목
- `LogisticsWeightFields.tsx`: 총중량/공차중량/실중량
- `LogisticsFormActions.tsx`: 저장/이슈등록/추가 액션
- `SelectedDateLogisticsList.tsx`: 선택 날짜 기록 목록
- `PartnerQuickModal.tsx`, `VehicleQuickModal.tsx`, `IssueActionModal.tsx`
- `LayerModal.tsx`, `LogisticsToast.tsx`

---

## 5) 조치 세부 기능 파일 (hooks/action)
- `constants.ts` (23 LOC): 조치 draft 기본값/docId 생성
- `selectors.ts` (32 LOC): pending issue, vendor option 파생
- `commands.ts` (172 LOC): submit/remove/issue 완료 연계
- `types.ts`: 조치 도메인 타입/submit 옵션

---

## 6) 생산 세부 기능 파일 (hooks/production)
- `constants.ts` (44 LOC): 생산 옵션/기본 draft/기본 line/docId
- `selectors.ts` (53 LOC): 마스터 태그 수집 + 시스템/개인 태그 후보 합성
- `commands.ts` (70 LOC): 생산 저장 검증 + upsert + reset
- `types.ts`: 생산 도메인 보조 타입

---

## 7) 사무 세부 기능 파일 (hooks/office)
- `constants.ts` (21 LOC): 사무 기본 draft + 태그 파서
- `selectors.ts` (24 LOC): 기관 매핑 + deterministic fallback id
- `commands.ts` (141 LOC): 기관/기타 추가 항목 조립 + 저장 검증/저장
- `types.ts`: 사무 도메인 타입 정의

---

## 8) register daily가 의존하는 공용(kernel) 기능
- 제목 자동입력: `src2/kernel/components/record/AutoTitleField.tsx`
- 일일 상단 공통 4항목: `src2/kernel/components/record/DailyMetaFields.tsx`
- 제목 템플릿: `src2/kernel/schema/daily/titleTemplates.ts`
- 지부 옵션 SSOT: `src2/kernel/schema/daily/siteOptions.ts`
- 태그 입력/추천: `src2/kernel/components/tag/*`
- 태그 인덱스: `src2/kernel/utils/tagIndex.ts`
- 중복방지 유틸: `src2/kernel/utils/masterDedup.ts`
- 공용 날짜/정렬 유틸:
  - `src2/kernel/utils/date.ts` (`todayYmd`)
  - `src2/kernel/utils/recordSort.ts` (`sortByRecordDateUpdated`)

---

## 9) 최근 공용화 반영
- 일일 페이지 상단 필드(기록일/지부/작성자/직책)를 공용 컴포넌트로 통일.
- issue/action/office/logistics 저장 데이터에 `site(지부)` 반영.
- 유통 단가는 거래처/품목 변경 시 자동추천하되, 사용자가 직접 수정 가능한 정책으로 보정.
- 지부 표준값을 `대구/성주`로 고정하고 legacy `경주`는 정규화 처리.
- 유통 타입 섹션에서 처리 방향일 때 `품목` 라벨을 숨기고 `종류` 라벨에 폐기물/폐수를 배치.
- 유통 제목 템플릿을 `[일일][유통] 작성자/직책/작성일` 형식으로 통일.
- 이슈/조치 유통 연계 제목도 `[이슈][일일][유통]`, `[조치][일일][유통]` 패턴으로 통일.
- register 훅들(`production/office/issue/action/logistics`)의 날짜 기본값 로직을 `todayYmd`로 통일.
- register + manage 일부 훅의 최근순 정렬을 `sortByRecordDateUpdated`로 통일.
- 유통 저장 명령을 파트너/차량/submit 단위로 분리해 책임 분리 완료.
- 조치 저장 명령을 `hooks/action/commands.ts`로 분리하고 `useRegisterActionPage.ts`를 orchestration 전용으로 축소.
- 유통/이슈/조치 제목 규칙을 `titleTemplates.ts`로 공용화.
- 생산 훅을 `hooks/production/*`로 분해하고 `useRegisterProductionPage.ts`를 orchestration 중심으로 축소.
- 사무 훅을 `hooks/office/*`로 분해하고 `useRegisterOfficePage.ts`를 orchestration 중심으로 축소.

---

## 10) 다음 우선순위 (분해 중단)
1. `register/daily/logistics` 기능 회귀 점검(저장/추천/이슈-조치 연계/프로필 동기화)
2. `register/daily/office` 문구/입력 UX 정리(인코딩 깨짐 포함)
3. `register/daily/production` 검증/토스트/알림 흐름 표준화

진행 기준:
- 새 분해보다 기능 안정화/회귀 방지 우선
- 구조 변경이 아닌 동작/문구/검증 정합성 우선
