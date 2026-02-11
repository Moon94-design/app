# 공장 방식 작업 순서표 - /manage/master vehicle 상세 이관

작성일: 2026-02-10
목적: `ManageMasterPage`의 vehicle 관리를 legacy에서 src2 + @kernel(repo/schema)로 전환한다.

================================================================================
대상 페이지
- 라우트: `/manage/master`
- 하위 기능: `vehicle`
- 목표 상태: SHADOW 유지 (partner/vehicle 완료, 나머지 후속)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage master > vehicle 상세만 이관
- [x] 1) `ManageVehiclePage` 생성
- [x] 2) hooks/sections 분리
  - [x] `hooks/useManageVehiclePage.ts`
  - [x] `sections/ManageVehicleToolbar.tsx`
  - [x] `sections/ManageVehicleListSection.tsx`
  - [x] `sections/ManageVehicleEditFormSection.tsx`
- [x] 3) kernel 연결
  - [x] `createVehicleRepo` 사용
  - [x] vehicle status helper 추가(`is/resolve`)
- [x] 4) legacy 브리지 제거
  - [x] `ManageMasterPage`에서 `@legacy/app/pages/manage/master/VehicleManage` 제거
- [x] 5) 게이트
  - [x] `npm run build`
- [x] 6) 문서
  - [x] `MIGRATION_STATUS` 메모 갱신
  - [x] result 기록

================================================================================
후속 범위
- `/manage/master` employee/equipment 관리 상세 이관
- `/manage/daily` 생산/이슈·조치 상세 이관
