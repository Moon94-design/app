# 012-daily-meta-fields-commonization-all-daily-pages

> 작성일: 2026-02-12
> 주제: register daily 전체 상단 4항목(기록일/지부/작성자/직책) 공용화 + 지부 명칭 통일
> 이슈 상태: Resolved

---

## 요약
- `DailyMetaFields` 공통 컴포넌트를 추가하고 production/office/issue/action/logistics에 적용했다.
- `사업장` 사용자 문구를 `지부`로 통일하고, 지부 옵션 SSOT를 `siteOptions.ts`로 분리했다.
- issue/action/office/logistics 저장 모델에도 `site`를 반영해 데이터 정합성을 맞췄다.

## 코드 변경
- 공통 컴포넌트
  - `src2/kernel/components/record/DailyMetaFields.tsx` 추가
  - `src2/kernel/components/record/index.ts` export 추가
- 공통 상수/타입
  - `src2/kernel/schema/daily/siteOptions.ts` 추가
  - `src2/kernel/schema/daily/index.ts` export 추가
  - `src2/kernel/schema/daily/productionTypes.ts`에서 `ProductionSite`를 공용 `DailyBranch`로 연결
- register daily 페이지/폼 적용
  - `src2/app/pages/register/RegisterProductionDailyPage.tsx`
  - `src2/app/pages/register/RegisterOfficeDailyPage.tsx`
  - `src2/app/pages/register/RegisterIssuePage.tsx`
  - `src2/app/pages/register/RegisterActionPage.tsx`
  - `src2/app/pages/register/RegisterLogisticsDailyPage.tsx`
  - `src2/app/pages/register/components/IssueRegisterForm.tsx`
  - `src2/app/pages/register/components/ActionRegisterForm.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsIdentityFields.tsx`
  - `src2/app/pages/register/sections/logistics/LogisticsFormSection.tsx`
  - `src2/app/pages/register/sections/logistics/IssueActionModal.tsx`
- 훅/저장 반영
  - `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
  - `src2/app/pages/register/hooks/useRegisterActionPage.ts`
  - `src2/app/pages/register/hooks/useRegisterOfficePage.ts`
  - `src2/app/pages/register/hooks/logistics/constants.ts`
  - `src2/app/pages/register/hooks/logistics/submitCommand.ts`
  - `src2/app/pages/register/hooks/logistics/types.ts`
  - `src2/app/pages/register/hooks/office/constants.ts`
  - `src2/app/pages/register/hooks/office/commands.ts`
  - `src2/app/pages/register/hooks/office/types.ts`
  - `src2/app/pages/register/hooks/action/constants.ts`
  - `src2/app/pages/register/hooks/action/commands.ts`
  - `src2/app/pages/register/hooks/action/types.ts`
  - `src2/kernel/repo/domain/issueRepo.ts`

## 검증
- `npm.cmd run build` 통과
- `npm.cmd run lint:src2` 통과

## 체크리스트 결과
- `src2/docs/result/checklist/001-daily-meta-fields-all-daily-pages.md`

## 문서 최신화
- `src2/docs/reference/page-renewal-common-spec.md`
- `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
- `src2/docs/reference/feature-files-map-unified.md`
- `src2/docs/reference/register-daily-files.md`
- `src2/docs/rule/MIGRATION_STATUS.md`

## 핵심 로직 3줄
- 1) 상단 메타 입력 UI를 `DailyMetaFields` 하나로 통일해서 페이지별 중복 구현을 제거했다.
- 2) 지부 옵션을 `DAILY_BRANCH_OPTIONS`로 통합해 production/issue/action/office/logistics가 같은 소스를 보게 했다.
- 3) issue/action/logistics/office 저장 시 `site`를 함께 저장해 화면 표시와 데이터 구조를 일치시켰다.

## 입문자 설명 3줄
- 1) 예전에는 페이지마다 날짜/작성자/직책/지부 입력칸을 따로 만들었는데, 이제 한 부품으로 공통 사용한다.
- 2) 지부 목록도 각 페이지에 따로 적지 않고 공용 상수 파일에서 가져오도록 바꿨다.
- 3) 화면에만 지부가 보이는 게 아니라 저장 데이터에도 지부가 같이 들어가서 나중 조회/연계가 안정적이다.

## 주의 사항
- 기존 저장 데이터 중 `site`가 비어 있는 구버전 문서는 목록에서 `-`로 보이도록 처리했지만, 관리/조회 쪽 수동 점검이 추가로 필요하다.
- issue/action 문서 ID 규칙이 `site` 포함 형태로 바뀌었기 때문에 동일 날짜/작성자라도 지부가 다르면 별도 문서로 저장된다.
- 유통 모달의 이슈 완료 분기에서 조치 프리셋으로 넘기는 값(`site`, `issueId`)은 이후 이슈/조치 페이지 리뉴얼 시에도 동일 규칙을 유지해야 한다.

## 향후 과정
- 다음 리뉴얼 페이지에서도 상단 메타는 `DailyMetaFields`를 직접 재사용하고 신규 구현을 만들지 않는다.
- 계정 연동으로 작성자 고정 전환 시 `DailyMetaFields`의 `lockWriterName`을 공통 정책으로 활성화한다.
- browse/manage 이관 시 `site` 필드가 없는 legacy 데이터에 대한 fallback 렌더 정책을 문서화하고 일괄 적용한다.

## 이슈 상태
- `Resolved`: 이번 작업 목표(공용화 + 전 일일 페이지 적용 + 지부 명칭 통일 + 체크리스트 기록) 완료.
