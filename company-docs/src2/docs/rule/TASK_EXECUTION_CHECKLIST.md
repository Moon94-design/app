# TASK_EXECUTION_CHECKLIST.md
작성일: 2026-02-13
목적: 매 작업 시작/진행/종료 시 같은 기준으로 체크해 누락과 회귀를 줄인다.

================================================================================
사용 규칙
- 작업 시작마다 이 문서를 복붙해 체크한다.
- 한 턴에 범위를 1작업 단위로 고정한다(범위 확장 금지).
- 체크 미통과 항목이 있으면 다음 단계로 넘어가지 않는다.

SHADOW 제거 권장 순서(고정)
- 1) `register/daily/*` 리뉴얼/안정화 우선
- 2) `manage`, `manage/master` 리뉴얼
- 3) `/excel` 리뉴얼/종류 확장
- 4) `browse/*`는 기능참조용 유지(신규 재작성은 후순위 별도 트랙)
- 원칙: 한 번에 1배치(1도메인/1문제군)만 처리하고, 배치 게이트 통과 후 다음 순서로 진행

배치 검증 모드(속도 최적화 기본)
- 작은 수정마다 전체 QA를 반복하지 않는다.
- 필수: 배치 종료 시 `npm run build` 1회.
- 조건부: kernel/repo/security/라우팅 수정 배치에서만 `check:security` 또는 `check:qa`를 1회 실행.
- 같은 배치에서 `build`를 이미 실행했다면 QA 재검증은 `check:qa:reuse-build`를 사용해 중복 build를 피한다.
- 문서 동기화(result/MIGRATION_STATUS)도 배치 마지막에 1회 반영한다.

================================================================================
작업 체크리스트 템플릿 (복붙용)

## 0) 작업 정보
- 작업명:
- 대상 경로/페이지:
- 작업 범위(한 줄):
- 완료 정의(DoD):

## 1) 시작 전(Read First)
- [ ] `DOCS_GUIDE.md` 확인
- [ ] `main_rule.md` 확인
- [ ] `MIGRATION_STATUS.md` 현재 상태 확인
- [ ] `GATES_CHECKLIST.md` 적용 게이트 확인
- [ ] 기존 결정 충돌 여부 확인(`DECISIONS_LOG.md`)
- [ ] 기능 파일 추가/분리 전 `reference/feature-files-map-unified.md` 참조

## 2) 범위/리스크 고정
- [ ] 이번 턴 수정 파일 범위를 명시했다
- [ ] SHADOW 작업이면 "이관 우선, 리뉴얼 후행" 원칙을 적용했다
- [ ] URL path 변경 없음(loader target만 교체)
- [ ] 레거시(src) 직접 수정 계획 없음(예외 시 결정 로그 기록)

## 3) 구현 중 하드룰 점검
- [ ] `src2/kernel/**`에서 `@legacy` import 0
- [ ] `src2/app/pages/**`에서 `repo/impl/*` 직접 import 0
- [ ] Storage key 하드코딩 0(`kernel/repo/keys.ts`만 사용)
- [ ] `localStorage` 직접 접근 0(예외: `kernel/repo/storage/*`)
- [ ] 라우터 중복 생성 0
- [ ] `React.lazy(loader)`는 `routes.tsx`에서만 사용
- [ ] 페이지 파일은 얇게 유지(조립 중심, 과도한 로직 분리)
- [ ] 기존 파일 LOC가 급증(대략 +60 이상 또는 250+ 진입)하면 기능 파일 분리 가능성부터 검토했다
- [ ] 공통으로 재사용 가능한 로직은 page 전용 파일에 두지 않고 공용 기능 파일(`kernel` 또는 `hooks/common`)로 분리했다
- [ ] 기능 파일 신설/분리 시 `reference/feature-files-map-unified.md`를 같은 배치에서 동기화했다
- [ ] 사용자 노출 문구(안내/오류/토스트/placeholder/confirm)는 존댓말로 통일하고 반말을 사용하지 않았다

## 4) 페이지 이관 작업(해당 시)
- [ ] src2 페이지/섹션/훅 구조 정리
- [ ] domain repo + draft + schema를 `@kernel` 기반으로 연결
- [ ] navConfig loader를 `@app2/pages/...`로 교체
- [ ] 해당 페이지 `@legacy` import 0 확인

## 5) 검증 게이트(배치 종료 시 1회)
- [ ] L0 필수: `npm run build` 성공
- [ ] L1 조건: kernel/security/import 규칙 수정 배치면 `npm run check:security` 성공
- [ ] L2 조건: 라우팅/저장/병합/동기화 수정 배치면 `npm run check:qa` 성공
- [ ] L2 최적화: L0를 같은 배치에서 이미 수행했다면 `npm run check:qa:reuse-build` 성공(중복 build 금지)
- [ ] smoke 단독 재확인은 `npm run test:smoke:routes`로 수행(재빌드 생략)
- [ ] L2 조건: issue/action legacy sync 또는 logistics merge 수정 배치면 `npm run test:p0:consistency` 성공
- [ ] URL 직접입력/F5 또는 핵심 플로우(조회/저장/수정/초기화) 확인
- [ ] (선택) 대규모 리팩터/구조 변경 시 `npm run check:qa:full` 또는 `npm run lint`

## 6) 문서/기록 동기화
- [ ] `MIGRATION_STATUS.md` 상태 갱신
- [ ] `GATES_CHECKLIST.md` 체크 갱신(해당 시)
- [ ] `DECISIONS_LOG.md` 기록(새 결정/예외 발생 시)
- [ ] result 문서 작성/덧붙이기 완료
- [ ] result에 이슈 상태 한 줄 기록(`이슈 상태: Resolved` 또는 `Open`)
- [ ] result 하단 학습 블록(핵심 로직/입문자 설명/주의 사항/향후 과정) 포함

## 7) 종료 전 최종 확인
- [ ] 변경 파일 목록을 공유했다
- [ ] diff 요약을 공유했다
- [ ] 남은 리스크/다음 액션을 명시했다

================================================================================
SHADOW 전용 빠른 확인표
- [ ] parity 기준 동작 확인(조회/저장/수정/삭제/F5 최소 5시나리오 체크)
- [ ] src2 전환 후에도 데이터 호환 유지
- [ ] 데이터 호환 수치 확인(이관 전/후 건수 비교, key/스키마 차이 메모)
- [ ] 회귀 원인 분리 가능(이관 변경과 리뉴얼 변경 분리)
- [ ] 롤백 기준 명시(치명 이슈 발생 시 loader 원복 조건/절차 기록)
- [ ] MIGRATED 판정 근거 기록(@legacy import 0 + F5 OK + 콘솔 에러 0 + 핵심 플로우 통과)
- [ ] 다음 배치로 넘기기 전에 현재 배치 상태 문서 반영 완료
