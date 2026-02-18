# 2026-02-18-office-issue-linked-reference-and-display-unification

## PAGE_RENEWAL 실행 결과

### A) 선참조 체크
- [x] `src2/docs/reference/page-renewal-common-spec.md` 확인
- [x] `src2/docs/reference/feature-files-map-unified.md` 확인
- [x] 작업 도메인 기능맵(`register-daily-files.md`) 확인
- [x] `src2/docs/rule/main_rule.md` 확인
- [x] 신규 파일 생성/분리 필요성 근거 기록

### B-1) 범위/분석
- [x] 대상 도메인 고정(register daily: office+issue 표시 공통)
- [x] 유지/삭제/추가 요구사항 명시
- [x] LOC 측정(office hook 348, issue hook 218, logistics hook 381)
- [x] `rg` 중복 로직 검색 및 기존 공통 재사용 확인
- [x] 영향 범위 기록(등록 페이지, issue repo 스키마, 하단 표시)

### B-2) 설계/구조
- [x] 페이지 조립 책임/훅 orchestration 책임 유지
- [x] 저장/검증 경계 command/helper 분리 유지
- [x] 과분해 금지 기준 점검(기존 공통 재사용 우선)
- [x] 공용 후보 재사용(`dailyRecordView`, `useOfficeLinkContext`)

### B-3) 구현 중
- [x] direct localStorage 접근 없음
- [x] `@legacy` 규칙 준수
- [x] 템플릿/문구 중복 최소화
- [x] 제목 접두사 템플릿 규칙 유지
- [x] dedup/저장 정책 충돌 없음(office journal key 보정)
- [x] 타 페이지 재사용 가능성 반영(issue 연계 재사용)

### B-4) 검증
- [x] `npm.cmd run build`
- [ ] `npm.cmd run lint:src2`
  - 이유: 이번 배치 필수 게이트 범위(build + qa:reuse-build) 우선으로 진행, lint는 후속 배치에서 수행
- [x] 수동 시나리오 점검 포인트 코드 반영(등록/수정/삭제/추천/연계)
- [x] 회귀 위험 항목 재검증(`check:qa:reuse-build`)
