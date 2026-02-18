# 2026-02-18-online-minimum-line-phase6-rule-realignment-qa

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 작업 범위 고정(오피스 훅 분리 + 문구 통일 + 회귀 정렬)
- [x] 파일 비대 기준 재점검(오피스 훅 343 LOC)
- [x] L0: `npm.cmd run build`
- [x] L2: `npm.cmd run check:qa:reuse-build`
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화

## 배치 요약
- `useRegisterOfficePage`를 상태/wiring 중심으로 축소하고 매핑/연계컨텍스트를 분리했다.
- 하단 세부 수정 중 전체 저장 차단을 추가해 저장 경계를 분명히 했다.
- 문구를 존댓말로 통일하고, `p0-consistency`와 `titleTemplates`를 현재 정책에 맞게 정렬했다.
