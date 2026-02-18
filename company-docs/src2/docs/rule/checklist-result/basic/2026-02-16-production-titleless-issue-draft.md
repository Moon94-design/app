# 2026-02-16-production-titleless-issue-draft

## BASIC_EXECUTION_CHECKLIST 체크 결과
- [x] DOCS_GUIDE / main_rule / MIGRATION_STATUS / GATES 확인
- [x] 작업 범위를 생산 페이지 제목 제거 + 유통 기준 공통화 + 이슈등록 초안으로 고정
- [x] 하드룰 위반 없음(`@legacy` in kernel 0, repo impl 직접 import 0, localStorage 직접 접근 0)
- [x] 공용화 가능한 항목(공용 옵션 상수/공용 모달)을 원본 구조에 반영
- [x] 사용자 노출 문구를 존댓말로 유지하고 반말 표현을 사용하지 않음
- [x] L0: `npm.cmd run build` PASS
- [x] L2 최적화 검증: `npm.cmd run check:qa:reuse-build` PASS
- [x] DECISIONS/MIGRATION_STATUS/result/checklist-result 동기화 완료
- [x] 지부는 내정보 기반 우선 선택(초기 보강) + 수동 선택 허용 유지
- [x] 생산 `종류/품목` 선택을 타이핑 없는 전체 드롭다운으로 변경
- [x] 보정 검증: `npm.cmd run build` PASS
- [x] draft 지연 로딩 이후에도 지부가 내정보 기반으로 우선 적용되도록 생산 훅(site 우선 적용 + 수동 변경 보호) 보정
- [x] 유통/사무/이슈/조치 훅에도 동일한 지부 우선 적용 + 수동 변경 보호 로직 확장
- [x] 사무/이슈/조치 페이지의 지부 선택 잠금을 해제해 직접 선택 가능하도록 정렬
- [x] 유통 `유통 항목 추가` UI를 메타(작성자/직책) 아래 카드형 섹션으로 재배치
