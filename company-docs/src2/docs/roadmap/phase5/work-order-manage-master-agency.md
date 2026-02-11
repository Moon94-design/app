# 공장 방식 작업 순서표 - /manage/master agency 신규 구현

작성일: 2026-02-10
목적: `ManageMasterPage`에 agency 관리를 신규 연결하고 src2 + @kernel 구조로 구현한다.

================================================================================
대상 페이지
- 라우트: `/manage/master`
- 하위 기능: `agency`
- 목표 상태: SHADOW 유지 (기준정보 관리 노출 메뉴 확장)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage master > agency 신규 구현
- [x] 0.1) 선조치 체크 수행(roadmap.md 선조치 4항목)
- [x] 0.2) manage 안내 규칙 확인(엑셀 일괄등록 신규 구현 금지)
- [x] 1) `ManageAgencyPage` 생성
- [x] 2) hooks/sections 분리
  - [x] `hooks/useManageAgencyPage.ts`
  - [x] `sections/ManageAgencyListSection.tsx`
  - [x] `sections/ManageAgencyEditFormSection.tsx`
- [x] 3) kernel 연결
  - [x] `createAgencyRepo` 사용
  - [x] `@kernel/schema/agency` 타입/헬퍼 사용
  - [x] `@kernel/utils` 전화번호 정규화 사용
- [x] 4) master 메뉴 활성화
  - [x] `ManageMasterPage`에서 agency 카드 클릭 연결
- [x] 5) 공통 뼈대 적용(신규 페이지부터)
  - [x] `ManageInfoNotice` 적용
  - [x] `manage-page-layout.css` 클래스 적용
- [x] 6) 게이트
  - [x] `npm run build`
- [x] 7) 문서
  - [x] MIGRATION_STATUS 업데이트
  - [x] result 기록
  - [x] 역할 스위칭 점검 기록

================================================================================
후속 범위
- `/manage/master` consumable 신규 구현
- `/manage/daily` 생산/이슈·조치 상세 이관
