# 2026-02-18-route-stale-view-guard

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 증상 대응: URL 변경 대비 화면 미전환 케이스 방지 가드 추가
- [x] 수정: `Routes`에 `location` + `key={location.pathname}` 적용
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 속도 우선 운영
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화
