# 공장 방식 작업 순서표 - /manage/master equipment 신규 구현

작성일: 2026-02-10
목적: `ManageMasterPage`에 equipment 관리를 신규 연결하고 src2 + @kernel 구조로 구현한다.

================================================================================
대상 페이지
- 라우트: `/manage/master`
- 하위 기능: `equipment`
- 목표 상태: SHADOW 유지 (기준정보 관리 노출 메뉴 4개 src2 완료)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage master > equipment 신규 구현
- [x] 1) `ManageEquipmentPage` 생성
- [x] 2) hooks/sections 분리
  - [x] `hooks/useManageEquipmentPage.ts`
  - [x] `sections/ManageEquipmentListSection.tsx`
  - [x] `sections/ManageEquipmentEditFormSection.tsx`
- [x] 3) kernel 연결
  - [x] `createEquipmentRepo` 사용
  - [x] `@kernel/schema/equipment` 타입 사용
- [x] 4) master 메뉴 활성화
  - [x] `ManageMasterPage`에서 equipment 카드 클릭 연결
- [x] 5) 공통 뼈대 적용(신규 페이지부터)
  - [x] `ManageInfoNotice` 적용
  - [x] `manage-page-layout.css` 클래스 적용
- [x] 6) 게이트
  - [x] `npm run build`
- [x] 7) 문서
  - [x] `MIGRATION_STATUS` 메모 갱신
  - [x] result 기록

================================================================================
후속 범위
- `/manage/daily` 생산/이슈·조치 상세 이관
- 기존 manage 페이지 공통 안내/레이아웃 일괄 적용 턴
