# 2026-02-18-online-minimum-line-phase5-issue-command-unification

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 작업 범위 고정(이슈 저장 구조를 commands 분리로 동일화)
- [x] 훅 단일책임 정리(state/wiring 중심으로 축소)
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 속도 우선 운영
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화

## 배치 요약
- `useRegisterIssuePage` 내부 저장/삭제 로직을 `issue/commands.ts`로 분리
- `IssueRegisterDraft/IssueSubmitOptions`를 `issue/types.ts`로 분리
- 훅은 상태/초기화/권한 주입/wiring 역할만 담당하도록 정리
