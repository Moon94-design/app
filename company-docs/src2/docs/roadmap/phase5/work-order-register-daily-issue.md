# 공장 방식 작업 순서표 - /register/daily/issue

작성일: 2026-02-10
목적: register/daily 이슈 페이지를 legacy에서 src2로 전환하고 repo 저장 경로를 고정한다.

================================================================================
대상 페이지
- 라우트: `/register/daily/issue`
- 도메인: `issue`
- 목표 상태: MIGRATED (src2 페이지, @legacy 0, @kernel repo/draft 사용)

================================================================================
작업 순서(체크박스)
- [x] 0) 범위 고정: issue 1개 페이지만 처리
- [x] 1) src2 페이지 생성
  - [x] `src2/app/pages/register/RegisterIssuePage.tsx`
- [x] 2) hooks/state 분리
  - [x] `src2/app/pages/register/hooks/useRegisterIssuePage.ts`
- [x] 3) kernel 연결
  - [x] `createIssueRepo` 저장/조회/삭제 경유
  - [x] draft key 추가(`DRAFT_KEYS.issueRegister`)
- [x] 4) nav loader 교체
  - [x] `/register/daily/issue` -> `@app2/pages/register/RegisterIssuePage`
- [x] 5) 게이트
  - [x] `npm run lint:src2`
  - [x] `npm run build`
- [x] 6) 문서
  - [x] `MIGRATION_STATUS` 상태 갱신
  - [x] result 기록

================================================================================
중요 메모
- 기존 legacy 이슈 저장소(`issue_docs_v1`)는 repo 동기화 브리지로 유지된다.
- 다음 단계는 `/register/daily/action` src2 이관으로 동일 저장소 일관성을 확대한다.
