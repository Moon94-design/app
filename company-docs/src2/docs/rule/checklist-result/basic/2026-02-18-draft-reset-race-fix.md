# 2026-02-18-draft-reset-race-fix

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 원인 확정: mount 직후 draft 로드 타이밍 레이스로 기존 값이 기본값에 덮일 수 있는 구조
- [x] 수정: useDraft 초기값을 저장소 동기 로드로 전환 + 비동기 타이머 로드 제거
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 속도 우선 운영
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화
