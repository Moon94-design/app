# PAGE_RENEWAL_CHECKLIST.md
작성일: 2026-02-12
목적: 리뉴얼 및 신규 페이지 작성 시 공통 기준 누락, 중복 구현, 회귀를 사전에 차단한다.

---

## 사용 규칙
- 작업 시작 전 `BASIC_EXECUTION_CHECKLIST.md`를 먼저 체크한다.
- 작업 시작 전 반드시 이 체크리스트를 먼저 연다.
- 미체크 항목이 있으면 구현을 시작하지 않는다.
- 체크리스트는 `page-renewal-common-spec.md` 참조 후에만 진행한다.
- 구현 중에도 `feature-files-map-unified.md`와 도메인 기능맵을 열린 상태로 유지하고, 파일 추가/이동 전마다 재대조한다.
- 작업마다 체크 결과를 `src2/docs/rule/checklist-result/{task-name}/YYYY-MM-DD-*.md`로 저장한다.

---

## A) 선참조 체크 (필수)
- [ ] `src2/docs/reference/page-renewal-common-spec.md` 확인
- [ ] `src2/docs/reference/feature-files-map-unified.md` 확인
- [ ] 작업 도메인 기능맵 확인
- [ ] `src2/docs/rule/main_rule.md` 확인
- [ ] 신규 파일 생성/분리 필요성 근거를 기록

도메인 기능맵 예시:
- register 계열: `src2/docs/reference/register-daily-files.md`
- partner/manage 계열: `src2/docs/reference/partner-manage-files.md`

---

## B) 리뉴얼 체크리스트

### B-1) 범위/분석
- [ ] 대상 페이지/도메인을 1개로 고정
- [ ] 유지/삭제/추가 요구사항을 명시
- [ ] 현재 LOC(페이지/훅/섹션) 측정
- [ ] `rg`로 유사 helper/로직 중복 검색
- [ ] 영향 범위(등록/관리/조회/엑셀/문서) 기록

### B-2) 설계/구조
- [ ] 페이지는 조립 책임, 훅은 orchestration 책임 유지
- [ ] 저장/검증/파생 계산은 command/selector/helper 분리 여부 판단
- [ ] 과분해 금지 기준 확인(안정화 단계에서 불필요 분해 금지)
- [ ] 공용 후보(today/sort/title/tag/dedup) `@kernel` 재사용 우선

### B-3) 구현 중
- [ ] `localStorage` 직접 접근 없이 repo/domain contract 사용
- [ ] `@legacy` import 범위 규칙 준수
- [ ] 제목 템플릿/문구 하드코딩 중복 방지
- [ ] 제목 접두사 규칙(`[일일]`, `[이슈]`, `[조치]`)을 템플릿 함수에서만 관리
- [ ] dedup 정책을 공통 규칙과 일치시킴
- [ ] 빠른추가(인라인 모달 + 중복수정 유도) 패턴 일치
- [ ] 자동추천 값(단가/기본 선택값 등)의 수동 수정 가능 여부를 요구사항 기준으로 점검

### B-4) 검증
- [ ] `npm.cmd run build` 통과
- [ ] `npm.cmd run lint:src2` 통과(가능한 경우)
- [ ] 저장/수정/삭제/중복/초기화/연계 시나리오 수동 점검
- [ ] 회귀 위험 항목(키/제목/연계/중복) 재검증

---

## C) 신규 페이지 작성 체크리스트

### C-1) 생성 전
- [ ] 동일 책임 기존 페이지/훅 존재 여부를 파일맵에서 확인
- [ ] 신규 페이지 필요성(재사용 불가 사유) 기록
- [ ] URL path 변경 없이 nav loader 전략을 먼저 결정

### C-2) 생성 규칙
- [ ] 페이지 파일은 조립 중심으로 시작
- [ ] 훅 파일은 상태 조합 + command 호출 중심으로 작성
- [ ] 공통 컴포넌트(`AutoTitleField`, `TagBlock`, `IssueRegisterForm`, `ActionRegisterForm`) 우선 사용
- [ ] dedup/title/tag/sort/date 공통 유틸 우선 사용

### C-3) 완료 점검
- [ ] 신규 파일 경로/역할을 파일맵에 반영
- [ ] 도메인 기능맵에 신규 구조 반영
- [ ] result 문서를 신규 번호로 생성

---

## D) 문서 최신화 의무 (항상)
- [ ] 공통 규칙 변경 시 `page-renewal-common-spec.md` 갱신
- [ ] 파일 추가/이동/역할 변경 시 `feature-files-map-unified.md` 갱신
- [ ] 도메인 구조 변경 시 해당 기능맵(`register-daily-files.md` 등) 갱신
- [ ] result/checklist-result에 이번 배치 참조 맵(`feature-files-map-unified + 도메인 맵`) 경로를 명시
- [ ] 체크리스트 결과 문서를 `src2/docs/rule/checklist-result/{task-name}/`에 작성
- [ ] 파일명은 날짜 기반(`YYYY-MM-DD-{topic}.md`)으로 작성
- [ ] 한 result 파일에 무한 누적하지 않음

---

## 빠른 실패 신호 (즉시 중단/재검토)
- 한 파일이 상태/렌더/검증/저장을 동시에 다루며 충돌이 반복된다.
- 동일 helper/템플릿이 3곳 이상 중복된다.
- 리뉴얼 한 페이지 수정이 다른 도메인까지 연쇄 수정된다.
- 문서(공통 스펙/파일맵/도메인맵)와 실제 코드가 불일치한다.
