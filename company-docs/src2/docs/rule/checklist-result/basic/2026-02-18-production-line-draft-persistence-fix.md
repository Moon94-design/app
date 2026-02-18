# 2026-02-18-production-line-draft-persistence-fix

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 원인 확정: 생산 항목 추가 입력폼(`lineDraft`)이 draft가 아닌 로컬 state여서 페이지 이탈 시 초기화
- [x] 수정: `lineDraft`를 `ProductionDraft`에 포함하여 동일 draft 키로 저장
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 속도 우선 운영
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화
