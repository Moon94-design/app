# Phase 5 로드맵

작성일: 2026-02-09
범위: 기능군 순차 이관 + 프론트 구조 완성(신규 페이지 포함)
전제: Phase 4 G4 통과(파일럿 완료)

================================================================================
목표
- 기능군 단위로 src -> src2 이관을 반복 가능한 패턴으로 고정
- kernel 의존을 기능군 요구사항에 맞게 확장(P1 쿼리, DocRepoContract 등)
- 레거시 의존을 단계적으로 제거하고 신규 페이지를 병행

================================================================================
진입 조건
- G4 체크리스트 통과(파일럿 페이지 DoD 충족)
- MIGRATION_STATUS에 파일럿 G4 통과 표기 완료

================================================================================
작업 순서(권장)
1) 마스터(등록/관리/조회)
   - 대상: /register/master/*, /manage/master, /browse/master
   - 요구: RepoContract + masterRepo(P0), draft P0 유지
   - 산출: 등록/관리/조회 각각 src2 페이지로 교체

2) 일일기록(등록/관리/조회)
   - 대상: /register/daily/*, /manage/daily, /browse/daily
   - 요구: dailyRepo, draft P1(autosave) 필요 시 확장
   - 산출: 일일기록 등록군 우선 이관, 관리/조회 순차

3) 계량/단가 조회
   - 대상: /browse/price, /browse/weighing-trend, /browse/weighing-price
   - 요구: query/filter 확장(P1) 필요 여부 판단
   - 산출: 조회 UI + 집계 유틸을 kernel로 정본화

4) 이슈/조치
   - 대상: /register/daily/issue, /register/daily/action
   - 요구: DocRepoContract + issueRepo/actionRepo
   - 산출: 문서-아이템 구조 정착(등록/조회 연동)

5) 홈/대시보드/신규 페이지
   - 대상: /, /excel, 신규 리포트/검색
   - 요구: 통합 조회/집계 유틸, 권한/필터 구조 고려
   - 산출: 운영용 대시보드 최소 1개

================================================================================
기능군별 DoD(모든 이관 공통)
- src2/app/pages/...에 존재
- navConfig loader가 src2 페이지를 가리킴(path 유지)
- 해당 페이지 @legacy import 0
- @kernel만 사용(repo는 domain repo, draft는 useDraft)
- npm run build 성공
- npm run dev에서 해당 경로 정상 렌더
- URL 직접 입력/새로고침 OK

================================================================================
문서/검증 흐름
- 기능군 완료마다 MIGRATION_STATUS 갱신
- 게이트 통과 시 GATES_CHECKLIST 체크
- 매 작업 턴 result/{topic}/NNN-*.md 기록

================================================================================
리스크/주의
- 라우터 중복 생성 금지(레거시 내부 Router 확인)
- draft P1 도입 시 저장 빈도/성능 체크
- query 확장 시 RepoContract와 충돌 없는지 선검증
