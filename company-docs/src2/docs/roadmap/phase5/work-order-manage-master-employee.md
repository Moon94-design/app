# 공장 방식 작업 순서표 - /manage/master employee 신규 이관

작성일: 2026-02-10
목적: `ManageMasterPage`에 employee 관리를 신규 연결하고 src2 + @kernel 구조로 구현한다.

================================================================================
대상 페이지
- 라우트: `/manage/master`
- 하위 기능: `employee`
- 목표 상태: SHADOW 유지 (employee 신규 구현 완료, equipment 후속)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage master > employee 신규 구현
- [x] 1) `ManageEmployeePage` 생성
- [x] 2) hooks/sections 분리
  - [x] `hooks/useManageEmployeePage.ts`
  - [x] `sections/ManageEmployeeListSection.tsx`
  - [x] `sections/ManageEmployeeEditFormSection.tsx`
- [x] 3) kernel 연결
  - [x] `createEmployeeRepo` 사용
  - [x] `@kernel/schema/employee` 타입 사용
- [x] 4) master 메뉴 활성화
  - [x] `ManageMasterPage`에서 employee 카드 클릭 연결
- [x] 5) 게이트
  - [x] `npm run build`
- [x] 6) 문서
  - [x] `MIGRATION_STATUS` 메모 갱신
  - [x] result 기록

================================================================================
후속 범위
- `/manage/master` equipment 상세 이관
- `/manage/daily` 생산/이슈·조치 상세 이관
