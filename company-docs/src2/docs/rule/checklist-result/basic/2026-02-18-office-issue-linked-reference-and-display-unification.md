# 2026-02-18-office-issue-linked-reference-and-display-unification

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS/GATES` 확인
- [x] 작업 범위 고정(사무 즉시저장 + 이슈 연계공통 + 하단 표시형식 통일)
- [x] 아키텍처 하드룰 점검(@legacy/kernel/repo-impl/localStorage 규칙)
- [x] 공통 재사용 우선 적용(`useOfficeLinkContext`, `dailyRecordView`)
- [x] 사용자 노출 문구 존댓말 유지
- [x] L0: `npm.cmd run build`
- [x] L2: `npm.cmd run check:qa:reuse-build`
- [x] 상태/결정/result/checklist 문서 동기화

## 배치 요약
- 사무 세부 등록은 즉시 저장 방식으로 전환(임시 세부리스트 제거).
- 이슈 페이지에도 기준정보 연계 선택 + 내용 기반 추천을 동일 적용.
- 하단 카드/버튼 표시형식은 공통 스타일로 통일하고 유통 반품/금액 로직은 유지.
