# 2026-02-18-online-minimum-line-phase1-production-actorid

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 작업 범위 고정(생산 저장 경로 actorId 문서키 전환 + legacy fallback 이관)
- [x] 아키텍처 하드룰 준수 확인(`@legacy in kernel 0`, `repo/impl 직접 import 0`, `localStorage 직접 접근 0`)
- [x] 파일 비대화 방지(생산 저장 경계 3파일만 수정)
- [x] `DECISIONS_LOG/MIGRATION_STATUS/result` 동기화 반영
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 오래 걸리는 QA는 생략하고 빠른 smoke만 수행
- [x] 롤아웃 검증 관점 반영(구키 문서 fallback 탐색 + 신키 저장 후 구키 삭제)
