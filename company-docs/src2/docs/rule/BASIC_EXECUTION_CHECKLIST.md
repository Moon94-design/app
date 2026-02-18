# BASIC_EXECUTION_CHECKLIST.md
작성일: 2026-02-13
목적: 모든 작업에서 공통으로 지켜야 하는 최소 실행 절차를 한 문서로 고정한다.

---

## 0) 추가 작업 체크리스트 목차 (BASIC 다음 단계)
- 사용 규칙
  - BASIC 체크 완료 후, 현재 작업 유형에 맞는 추가 체크리스트를 반드시 함께 작성한다.
  - 추가 체크리스트가 새로 생기면 이 목차에 경로를 즉시 추가한다.
  - 좌표(라인번호) 대신 파일 경로를 기준으로 관리한다. 라인 이동에 영향받지 않도록 하기 위함.
- 목차
  - 페이지 리뉴얼: `src2/docs/rule/PAGE_RENEWAL_CHECKLIST.md`
  - 배치 실행/검증: `src2/docs/rule/TASK_EXECUTION_CHECKLIST.md`
  - 게이트 기준: `src2/docs/rule/GATES_CHECKLIST.md`
  - 일일 페이지 리뉴얼 공용화: `src2/docs/rule/checklist/daily-renewal-commonization-checklist.md`
  - 온라인 최소선(식별자/충돌/권한): `src2/docs/rule/checklist/online-minimum-line-checklist.md`

---

## 1) 체크리스트 결과 문서 규칙 (필수)
- 결과 저장 위치
  - 기본 체크리스트 작성본: `src2/docs/rule/checklist-result/basic/`
  - 작업별 체크리스트 작성본: `src2/docs/rule/checklist-result/{작업명}/`
- 작성 형식
  - 체크리스트 항목 + 체크박스만 작성한다.
  - 체크하지 못한 항목은 바로 아래에 이유 1줄만 작성한다.
  - 불필요한 배경설명/장문 회고는 넣지 않는다.
- 파일명 권장
  - `YYYY-MM-DD-{batch-or-topic}.md`

---

## 2) 시작 전 로딩
- [ ] `src2/docs/DOCS_GUIDE.md` 확인
- [ ] `src2/docs/rule/main_rule.md` 확인
- [ ] `src2/docs/rule/MIGRATION_STATUS.md` 현재 상태 확인
- [ ] `src2/docs/rule/GATES_CHECKLIST.md` 적용 게이트 확인
- [ ] `src2/docs/reference/feature-files-map-unified.md` 확인
- [ ] 작업 도메인 기능 파일맵 확인(예: `src2/docs/reference/register-daily-files.md`)
- [ ] 작업 유형별 추가 체크리스트 1개 이상 선택

---

## 3) 범위 고정
- [ ] 이번 배치 대상 경로를 1개 문제군으로 고정
- [ ] URL path 변경 금지 원칙 확인(필요 시 loader target만 교체)
- [ ] SHADOW 작업이면 "이관 우선, 리뉴얼 후행" 원칙 확인

---

## 4) 아키텍처 하드룰
- [ ] `src2/kernel/**`에서 `@legacy` import 금지
- [ ] UI/페이지에서 `repo/impl/*` 직접 import 금지(domain repo만 사용)
- [ ] `localStorage` 직접 접근 금지(storage adapter + repo 사용)
- [ ] storage key 하드코딩 금지(`src2/kernel/repo/keys.ts` SSOT)
- [ ] `React.lazy(loader)`는 `src2/app/routes/routes.tsx`에서만 사용

---

## 5) 파일 비대화 방지
- [ ] 단일 파일 증가량이 큰 경우(+60 LOC 내외) 먼저 분리 가능성 검토
- [ ] 파일이 350 LOC를 넘으면 분리 또는 예외 사유 명시
- [ ] 공통 재사용 가능 로직은 `hooks/common` 또는 `@kernel`로 분리
- [ ] 신규 기능 파일 생성 전 `src2/docs/reference/feature-files-map-unified.md` 중복 확인

---

## 6) 구현 중 점검
- [ ] 페이지는 조립 책임, 훅은 orchestration 책임 유지
- [ ] 저장/검증/파생계산은 command/selector/helper 분리 여부 점검
- [ ] 문자열/템플릿/상수 중복 방지(공용 함수/상수 우선)
- [ ] 동일 기능의 타 페이지 재사용 가능성 1회 점검
- [ ] 사용자 노출 문구(안내/오류/토스트/placeholder/confirm)는 반말 금지, 존댓말로 통일

---

## 7) 미래 대비 설계(조회/서버/보안/권한)
- [ ] 조회 대비: key/value/id/recordDate/site/actor(작성/수정/삭제 주체) 필드가 추후 browse·통계에서 재구성 가능하게 정규화돼 있는지 점검
- [ ] 조회 대비: 파생값(합계/순중량/순금액 등)은 원본값 + 계산규칙으로 재현 가능하게 저장/문서화
- [ ] 서버이관 대비: UI/훅이 local 구현 세부(`impl/*`)에 결합되지 않고 domain repo 계약만 사용
- [ ] 서버이관 대비: 비동기 계약/에러 처리/재시도 지점을 페이지가 아니라 command/repo 경계에 두었는지 점검
- [ ] 보안 대비: 회사 데이터 전량을 민감으로 취급하고, 허용된 저장/전송 경로만 사용(임의 반출 금지, 최소 노출)
- [ ] 계정/권한 대비: actor(누가 생성/수정/삭제했는지) 추적 필드와 권한 분기 포인트(읽기/쓰기/삭제)를 코드 구조상 분리
- [ ] 문서화: 위 항목의 현재 상태(준수/미준수/유예 사유)를 result 또는 checklist-result에 남김

---

## 8) 검증 게이트
- [ ] L0 필수: `npm run build`
- [ ] L1 조건: 보안/규칙 영향 시 `npm run check:security`
- [ ] L2 조건: 라우팅/데이터 로직 영향 시 `npm run check:qa`
- [ ] L2 최적화: 같은 배치에서 이미 `build`를 실행했다면 `npm run check:qa` 대신 `npm run check:qa:reuse-build` 사용
- [ ] smoke 단독 재검증이 필요하면 `npm run test:smoke:routes` 사용(불필요한 재빌드 금지)
- [ ] 대규모 리팩터링 배치 시 `npm run check:qa:full` 또는 `npm run lint`

---

## 9) 문서 동기화
- [ ] 상태 변경 사항 `src2/docs/rule/MIGRATION_STATUS.md` 반영
- [ ] 신규 결정/예외를 `src2/docs/rule/DECISIONS_LOG.md` 반영
- [ ] 코드/문서 변경이 있으면 result 문서 작성
- [ ] result 또는 checklist-result에 이번 배치가 참조한 기능 파일맵 경로를 명시
- [ ] 작업 중 새 반복 리스크를 발견하면 체크리스트 항목 추가 + 채팅에 추가 사실 명시
- [ ] 고정 문구 준수: "이번 작업 수정사항 중 공용화 가능한 항목은 원본 체크리스트에 즉시 반영하고, 반영 사실과 참조 경로를 채팅/결과 문서에 명시한다."

---

## 10) 종료 산출물
- [ ] 변경 파일 목록 공유
- [ ] 핵심 diff 요약 공유
- [ ] 미해결 리스크/다음 액션 공유
