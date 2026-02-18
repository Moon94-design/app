# 2026-02-18-online-minimum-line-phase5-issue-command-unification

## online-minimum-line 체크 결과
- [x] issue 저장 로직을 hook 내부에서 `issue/commands.ts`로 분리
- [x] issue 타입 정의를 `issue/types.ts`로 분리
- [x] 충돌가드/권한포인트 로직을 command 경계로 이동
- [x] useRegisterIssuePage는 상태/입력 업데이트/wiring 중심 구조로 동일화
- [x] L0/smoke 검증 수행(`build`, `test:smoke:routes`)
- [ ] L2 `check:qa:reuse-build`
  - reason: skipped by user request for speed

## notes
- 유통/생산/조치/이슈가 같은 command 경계 패턴으로 정렬됨.
- 후속 정책(실권한/세분화 충돌)은 commands 레이어에서 일괄 확장 가능.
