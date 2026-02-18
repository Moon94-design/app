# 2026-02-18-draft-persistence-guardrail

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 증상 분석(드래프트 저장 호출 누락 경로 취약성 확인)
- [x] 공통 가드레일 적용(`useDraft` dirty autosave)
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 속도 우선 운영
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화

## 배치 요약
- `src2/kernel/draft/useDraft.ts`에 dirty 상태 자동 저장(120ms debounce) 가드 추가
- 개별 페이지 훅에서 `saveDraft` 호출이 일부 빠져도 이탈 시 유실 위험을 줄이는 방향으로 보강
