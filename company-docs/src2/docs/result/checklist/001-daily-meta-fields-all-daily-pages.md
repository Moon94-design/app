# 001-daily-meta-fields-all-daily-pages

> 작성일: 2026-02-12
> 작업: 일일 페이지 공통 상단 4항목(기록일/지부/작성자/직책) 공용화 + 전 페이지 적용
> 참조: `src2/docs/reference/page-renewal-common-spec.md`, `src2/docs/reference/feature-files-map-unified.md`, `src2/docs/reference/register-daily-files.md`, `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`

---

## A) 선참조 체크
- [x] `src2/docs/reference/page-renewal-common-spec.md` 확인
- [x] `src2/docs/reference/feature-files-map-unified.md` 확인
- [x] `src2/docs/reference/register-daily-files.md` 확인
- [x] `src2/docs/rule/main_rule.md` 확인
- [x] 신규 파일 생성 근거 기록 (`DailyMetaFields`, `siteOptions` 공용화)

## B) 리뉴얼 체크

### B-1) 범위/분석
- [x] 대상 고정: register daily 5페이지 + 유통 모달 폼
- [x] 유지/삭제/추가 요구사항 명시
- [x] 파일 구조/LOC 점검
- [x] `rg`로 기존 중복 로직 탐색
- [x] 영향 범위(등록/문서) 기록

### B-2) 설계/구조
- [x] 페이지 조립 책임 유지, 훅 orchestration 유지
- [x] 공통 4항목을 `@kernel` 컴포넌트로 분리
- [x] `지부` 옵션을 schema 공용 상수로 분리
- [x] 과분해 없이 필요한 범위만 수정

### B-3) 구현
- [x] `DailyMetaFields` 공통 컴포넌트 추가
- [x] `siteOptions` 공통 상수 추가 및 타입 통합
- [x] production/office/issue/action/logistics 적용 완료
- [x] issue/action/logistics 저장 경로에 `site` 반영
- [x] `사업장` 사용자 문구를 `지부`로 통일

### B-4) 검증
- [x] `npm.cmd run build` 통과
- [x] `npm.cmd run lint:src2` 통과
- [ ] 수동 시나리오(저장/수정/삭제/중복/초기화/연계) 전체 점검

## C) 변경 파일 핵심
- `src2/kernel/components/record/DailyMetaFields.tsx`
- `src2/kernel/schema/daily/siteOptions.ts`
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

## D) 잔여 확인 필요
- [ ] 기존 저장 데이터(구버전 office/issue/action doc)의 `site` 미존재 데이터 렌더링 수동 확인
- [ ] 유통 모달에서 `이슈 완료 -> 조치` 연계 저장 시 제목/지부 값 점검
