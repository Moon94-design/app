# docs 기반 웹앱 방향성 점검 보고서 (2026-02-11)

> 작성일: 2026-02-11
> 주제: docs SSOT 전체 분석으로 현재 방향성 적합성, 리스크, 다음 로드맵을 정리
> 이슈 상태: Resolved

---

## 1) 결론 요약
- 방향성은 맞다. `src -> src2` SSOT 전환, `kernel` 중심 공통화, `Phase 6 read-first` 전략은 일관적이다.
- 현재 상태는 “전략 성공 + 운영 문서 동기화 지연” 구간이다.
- 실제 이관은 진행됐지만, 일부 핵심 문서의 시점/체크 표시가 뒤처져 의사결정 신뢰도가 떨어질 위험이 있다.

## 2) 근거 기반 현황
- 이관 분포: `MIGRATED 15 / SHADOW 11` (`MIGRATION_STATUS.md` 기준 집계)
- 라우팅 SSOT(`navConfig.ts`) 기준으로도 SHADOW 잔량이 동일하게 확인됨
  - 남은 SHADOW 핵심: `register/daily`의 `logistics/office/production/action`, `browse/*` 다수
- `Phase 5` 작업 결과 문서가 다수 누적되어 있어 실제 실행 단계는 Phase 1이 아니라 Phase 5 후반에 가까움

## 3) 문제점(우선순위)
1. 문서 시점 불일치
- `roadmap/roadmap.md`는 아직 “지금 실행할 Phase 1(0~1단계)” 중심으로 서술됨.
- 반면 `result/phase5*`, `result/phase6*`는 이미 훨씬 앞선 상태를 기록.
- 영향: 신규 작업자가 현재 단계를 오판할 수 있음.

2. 게이트 문서와 상태 문서의 동기화 부족
- `MIGRATION_STATUS.md`의 repo/draft는 DONE인데, `GATES_CHECKLIST.md`의 G2/G3는 미체크.
- 영향: “완료 기준 충족 여부”를 문서만 보고 판단하기 어려움.

3. 보안/QA 체크리스트 운영 흔적 부족
- `SECURITY_CHECKLIST.md` S0~S4가 대부분 미체크 상태.
- 영향: 실제로는 안전해도 증빙이 약해져, Phase 6 진입 판단 근거가 약해짐.

4. result 운영 규칙 일부 드리프트
- 최신 문서들 중 일부는 하단 학습 블록 누락 사례가 존재.
- 파일명 번호 규칙이 섞여 있는 구간(`src2-migration-plan` 하위 일부)도 존재.
- 영향: 기록 검색성/일관성 저하.

5. 날짜 품질 이슈
- `phase5-excel/013-theme-toggle-dark-light-ocean.md` 작성일이 2026-02-12로 표기(오늘 2026-02-11 기준 미래 날짜).
- 영향: 타임라인 추적 혼선.

## 4) 방향성 검증 (맞는 점)
- 아키텍처 원칙: `app`(프레임워크) vs `kernel`(정본 로직) 분리는 유지보수성 측면에서 적절.
- 데이터 접근 원칙: `domain repo only`, `storage key SSOT`, `no direct localStorage`는 서버 전환 대비에 매우 유리.
- 전환 방식: `loader 교체` 중심의 점진 이관은 URL 안정성과 리스크 통제에 유리.
- Phase 6 방침: REST 고정 + read-first(읽기->쓰기->fallback 제거) 순서는 안전한 전환 전략.

## 5) 앞으로 해야 할 일 (실행 로드맵)

### R1. 문서 정합성 복구 (즉시)
- `roadmap/roadmap.md`의 “현재 실행 단계”를 실제 상태(Phase 5 진행 + Phase 6 보류 준비)로 업데이트.
- `MIGRATION_STATUS.md`의 스프린트 목표(D 섹션)를 현재 기준으로 갱신.
- `GATES_CHECKLIST.md`에서 G2/G3 완료 여부를 증빙 기반으로 체크하거나, 미완이면 TODO를 명시.

### R2. SHADOW 11개 소거 집중 (단기)
- 우선순위 1: `register/daily` 4개(`logistics/office/production/action`)
- 우선순위 2: `browse` 계열 5개(`master/daily/price/weighing-trend/weighing-price`)
- 우선순위 3: 남은 쉘/중간 페이지 정합성 마무리
- 각 페이지마다 동일 공정 유지: 얇은 페이지 -> kernel 규칙/레포 연결 -> loader 교체 -> G4-lite 증빙

### R3. QA/보안 운영을 문서-실행 일치로 전환 (단기)
- 작업 단위 기본 검증을 `npm run check:qa`로 고정하고 결과를 result에 짧게 남김.
- `SECURITY_CHECKLIST.md`의 S0 항목은 최소 주 1회라도 실제 체크 표시를 진행.

### R4. Phase 6 착수 전 선행 산출물 완성 (중기)
- Partner 기준 DTO 매핑표(타입-DTO-DB 1:1) 확정
- 권한 매트릭스(admin/editor/viewer) 확정
- 업로드 idempotency/부분실패 정책 확정
- 위 3개가 문서화되기 전에는 구현 착수 금지 원칙 유지

## 6) 추천 운영 지표(KPI)
- 구조 KPI: SHADOW 라우트 수(현재 11)
- 품질 KPI: `check:qa` 통과율
- 문서 KPI: MIGRATION_STATUS/GATES/SECURITY 최근 갱신일 편차(목표: 3일 이내)
- 이관 KPI: 페이지별 @legacy import 0 달성률

## 7) 간단 의견
- 현재 프로젝트는 “기술 방향”보다 “운영 동기화”가 더 큰 리스크다.
- 코드보다 문서 게이트/상태판을 같은 속도로 맞추면, Phase 6에서 재작업 확률을 크게 줄일 수 있다.

## 8) 다음 진행 질문
- 다음 턴에서 바로 `문서 정합성 복구 3종(roadmap/STATUS/GATES)`부터 내가 실제로 업데이트할까?

## 9) 2026-02-11 갱신 반영
- `roadmap/roadmap.md`를 현재 실행 기준으로 갱신했다.
  - Phase 1은 완료로 명시.
  - 현재 작업 초점을 Phase 5(잔여 SHADOW 이관)로 전환.
- `rule/MIGRATION_STATUS.md`의 스프린트 목표를 현재 상태로 갱신했다.
  - 수치 스냅샷: MIGRATED 15 / SHADOW 11.
  - "리뉴얼보다 이관 완료 우선" 원칙 반영.
- `rule/GATES_CHECKLIST.md`에서 G2/G3를 상태판과 일치하게 완료 체크로 갱신했다.
- `rule/DECISIONS_LOG.md`에 SHADOW 처리 순서 결정을 추가했다.
  - 결정: 이관(기능 parity) -> @legacy 제거 -> 리뉴얼 순서 고정.

## 10) SHADOW 11개 실행표(요청 반영)
- 우선순위 배치:
  1) Batch A: register/daily 4개
  2) Batch B: browse 기본 2개(master/daily)
  3) Batch C: browse 집계 3개(price/weighing-trend/weighing-price)
  4) Batch D: manage 중간 2개(/manage, /manage/master)
- 각 페이지 완료 조건:
  - navConfig loader `@app2` 전환
  - 페이지 내 `@legacy` import 0
  - G4-lite 통과(build + URL/F5 + 핵심 flow)
  - MIGRATION_STATUS 체크 + result 기록

## 11) 매 작업 체크리스트 신설(요청 반영)
- 신규 문서: `company-docs/src2/docs/rule/TASK_EXECUTION_CHECKLIST.md`
- 목적: 작업마다 같은 기준(시작 전/구현 중/검증/문서동기화)을 빠르게 체크
- 적용: `main_rule.md`에 체크리스트 참조 규칙을 추가해 기본 공정으로 고정

## 12) 체크리스트 보강(이번 요청 반영)
- `TASK_EXECUTION_CHECKLIST.md`에 `(선택) npm run lint` 검증 항목을 추가했다.
- `TASK_EXECUTION_CHECKLIST.md`에 result 이슈 상태 기록 규칙(`Resolved | Open`)을 추가했다.
- `DOCS_GUIDE.md` 결과 파일 포맷에도 `이슈 상태` 메타/하단 블록을 추가했다.

## 핵심 로직 3줄
- 1) docs SSOT를 기준으로 상태/로드맵/게이트/결과 기록을 교차 점검해 불일치 지점을 추출했다.
- 2) 이관 진행률을 `MIGRATED 15 / SHADOW 11`로 수치화해 병목을 남은 라우트 단위로 특정했다.
- 3) 리스크를 문서 운영/게이트 증빙/Phase 6 선행조건으로 나눠 실행 가능한 순서(R1~R4)로 재배치했다.

## 입문자 설명 3줄
- 1) 큰 방향은 맞는데, 문서들이 서로 같은 현재 상태를 말하지 않아 헷갈릴 수 있는 상태다.
- 2) 아직 레거시 화면 11개가 남아 있어서, 이걸 먼저 줄여야 다음 단계가 안전하다.
- 3) 서버 단계로 가기 전에 보안/검증 체크를 문서에 실제로 남겨야 팀이 같은 기준으로 움직일 수 있다.

## 주의 사항
- 이번 분석은 문서 중심이라, 런타임 체감 이슈(실제 UI 동작/성능)는 별도 실행 검증이 더 필요할 수 있다.
- 상태 집계는 `MIGRATION_STATUS` 표기 기준이므로, 문서 미갱신이 있으면 실제 코드 상태와 차이가 날 수 있다.

## 향후 과정
- `company-docs/src2/docs/roadmap/roadmap.md`, `company-docs/src2/docs/rule/MIGRATION_STATUS.md`, `company-docs/src2/docs/rule/GATES_CHECKLIST.md` 동시 갱신은 이번 턴에 반영 완료했다.
- 이후 `company-docs/src2/app/nav/navConfig.ts` 기준 SHADOW 라우트 11개를 순차 이관하면서 각 턴 result에 QA/보안 체크 결과를 짧게 고정 기록하는 방식이 안전하다.
