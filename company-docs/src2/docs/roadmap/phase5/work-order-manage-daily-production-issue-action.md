# 공장 방식 작업 순서표 - /manage/daily 생산/이슈/조치

작성일: 2026-02-10
목적: `ManageDailyPage`의 production/issue/action 상세를 src2로 이관하고 legacy 문서를 1회 마이그레이션한다.

================================================================================
대상 페이지
- 라우트: `/manage/daily/production`, `/manage/daily/issue`, `/manage/daily/action`
- 도메인: `daily`, `issue`, `action`
- 목표 상태: MIGRATED (src2 페이지, @legacy 0, @kernel repo 경유)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage/daily 3개 상세만 처리
- [x] 1) 페이지 생성
  - [x] `ManageProductionPage.tsx`
  - [x] `ManageIssuePage.tsx`
  - [x] `ManageActionPage.tsx`
- [x] 2) hooks/state 분리
  - [x] `useManageProductionPage.ts`
  - [x] `useManageIssuePage.ts`
  - [x] `useManageActionPage.ts`
- [x] 3) kernel 연결
  - [x] `issueRepo`, `actionRepo` 도메인 repo 추가
  - [x] legacy key -> repo key 1회 마이그레이션(meta key) 적용
  - [x] `daily production` 1회 마이그레이션(meta key) 적용
- [x] 4) nav loader 교체
  - [x] `/manage/daily` children에 production/issue/action loader 추가
- [x] 5) 게이트
  - [x] `npm run lint:src2`
  - [x] `npm run build`
- [x] 6) 문서
  - [x] `MIGRATION_STATUS` 업데이트
  - [x] result 기록

================================================================================
중요 메모
- browse 영역은 이번 턴에서 변경하지 않고 참조용 유지.
- 이관 목적은 “관리 경로 src2 고정 + 데이터 유실 없는 1회 이전”이며, 상세 UX 고도화는 후속.
