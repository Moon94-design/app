# 공장 방식 작업 순서표 - /manage/daily logistics 상세 이관

작성일: 2026-02-10
목적: `ManageDailyPage`의 logistics 상세를 legacy bridge에서 src2 + @kernel(repo/schema)로 전환한다.

================================================================================
대상 페이지
- 라우트: `/manage/daily`
- 하위 기능: `logistics`
- 목표 상태: SHADOW 유지 (상세 logistics src2 이관, 생산/이슈·조치는 후속)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage daily > logistics 상세만 이관
- [x] 1) `ManageLogisticsPage` 신규 생성 (src2)
- [x] 2) sections/hooks 분리
  - [x] `hooks/useManageLogisticsPage.ts`
  - [x] `sections/ManageLogisticsListSection.tsx`
  - [x] `sections/ManageLogisticsEditFormSection.tsx`
- [x] 3) kernel 연결
  - [x] `createDailyRepo` 기반 저장/조회 연결
  - [x] daily schema 최소 정본(`kernel/schema/daily/*`) 추가
  - [x] 계량 시드용 `createWeighingRepo` 추가
- [x] 4) legacy 브리지 제거
  - [x] `ManageDailyPage`에서 `@legacy/.../LogisticsManage` import 제거
  - [x] `ManageLogisticsPage`로 교체
- [x] 5) 게이트
  - [x] `npm run build`
- [x] 6) 문서
  - [x] `MIGRATION_STATUS` 메모 갱신
  - [x] result 기록

================================================================================
후속 범위
- `/manage/daily` 생산/이슈·조치 관리 상세 이관
- `/register/daily/*` 페이지군 src2 이관(공유 schema/repo 확장)
