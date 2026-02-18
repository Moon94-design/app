# 2026-02-18-online-minimum-line-phase2-logistics-actorid

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 작업 범위 고정(유통 저장 경계 actorId 문서키 전환 + merge 축 보정)
- [x] 아키텍처 하드룰 준수 확인(`@legacy in kernel 0`, `repo/impl 직접 import 0`, `localStorage 직접 접근 0`)
- [x] 파일 비대화 방지(유통 저장 관련 파일만 수정)
- [x] 추가 리스크를 원본 체크리스트에 즉시 반영(merge key 단일축 금지)
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 오래 걸리는 QA는 생략하고 빠른 smoke만 수행
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화
