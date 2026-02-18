# 2026-02-18-online-minimum-line-phase6-rule-realignment-qa

## online-minimum-line check result
- [x] office hook 분리(`mappers`, `useOfficeLinkContext`)로 책임 축소
- [x] 세부항목 편집 중 전체 저장 차단 가드 추가
- [x] office/issue/action 사용자 노출 문구 존댓말 통일
- [x] p0 회귀 스크립트 정책 정렬(site+actor merge)
- [x] title template 한글 깨짐 복구
- [x] L0: `npm.cmd run build`
- [x] L2: `npm.cmd run check:qa:reuse-build`
- [x] docs sync: MIGRATION_STATUS / result / checklist-result

## notes
- 이번 배치는 "기능 추가"보다 "룰 정렬 + 안정화" 목적의 정리 배치다.
- 오피스 기준으로 분리 패턴을 맞췄고, 다음 대상은 유통 훅 비대 해소다.
