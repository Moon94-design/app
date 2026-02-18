# 2026-02-16-logistics-scrap-etc-dropdown

## BASIC_EXECUTION_CHECKLIST 체크 결과
- [x] DOCS_GUIDE / main_rule / MIGRATION_STATUS / GATES 확인
- [x] 작업 범위를 유통 입고+스크랩 세부품목 선택 UX로 고정
- [x] 하드룰 위반 없음(`@legacy` in kernel 0, repo impl 직접 import 0, localStorage 직접 접근 0)
- [x] 공용화 가능한 항목을 원본 체크리스트에 즉시 반영
- [x] L0: `npm.cmd run build` PASS
- [x] L2: `npm.cmd run check:qa` PASS
- [x] DECISIONS/MIGRATION_STATUS/result/checklist-result 동기화 완료
- [x] 사용자 노출 문구 반말 금지 규칙 반영(존댓말 통일)
- [x] 검증 시간 최적화 경로 반영(`test:smoke:routes`, `check:qa:reuse-build`)
- [x] L2 최적화 검증: `npm.cmd run test:smoke:routes` PASS
- [x] L2 최적화 검증: `npm.cmd run check:qa:reuse-build` PASS
- [x] 생산 페이지 필드 정책 반영(`종류/품목` 정렬, `생산수량(자루)` 단일화, 내용/태그 제거)
- [x] 생산 이슈 `완료` -> 조치 연계 공용 모달 재사용 반영
- [x] 지부 자동주입은 초기값만 반영하고 수동 선택 가능하도록 보정
- [x] 유통 타입 선택 드롭다운 전환 + 최근 1회 자동선택/최근 단가 자동반영 유지
- [x] 유통 비고(`memo`) 필드 입력/저장/표시 반영
- [x] L0 재검증: `npm.cmd run build` PASS
- [x] L2 재검증(재사용): `npm.cmd run check:qa:reuse-build` PASS
- [x] 유통 `유통 항목 추가`를 작성자/직책 아래 카드형 섹션으로 재배치
