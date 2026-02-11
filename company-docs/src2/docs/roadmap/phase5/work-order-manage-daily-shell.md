# 공장 방식 작업 순서표 - /manage + /manage/daily (Shell 이관)

작성일: 2026-02-10
목적: 관리 홈/일일기록 관리 라우트의 loader를 src2 셸로 전환하고, 상세 도메인 이관은 후속으로 분리한다.

================================================================================
대상 페이지
- 라우트: `/manage`, `/manage/daily`
- 도메인: `manage`
- 목표 상태: SHADOW 유지 (src2 셸 연결 완료, 상세 도메인 단계적 이관)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: manage 셸 라우트만 전환
- [x] 1) `src2/app/pages/manage/ManageHomePage.tsx` 생성
- [x] 2) `src2/app/pages/manage/ManageDailyPage.tsx` 생성
- [x] 3) navConfig loader 교체
  - [x] `/manage` -> `@app2/pages/manage/ManageHomePage`
  - [x] `/manage/daily` -> `@app2/pages/manage/ManageDailyPage`
- [x] 4) 동작 보존
  - [x] `ManageDailyPage`의 logistics 상세는 legacy bridge로 유지
- [x] 5) 게이트
  - [x] `npm run build`
- [x] 6) 문서
  - [x] `MIGRATION_STATUS` 관리 섹션 경로/메모 갱신
  - [x] result 기록

================================================================================
후속 이관 범위(다음 작업)
- `/manage/master`: vehicle legacy 제거, employee/equipment/manage 편집 흐름 정리
- `/manage/daily`: logistics 상세를 src2 + @kernel(repo/schema) 기반으로 재작성
