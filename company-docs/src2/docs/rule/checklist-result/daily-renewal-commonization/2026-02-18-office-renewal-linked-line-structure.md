# 2026-02-18-office-renewal-linked-line-structure

## daily-renewal-commonization 체크 결과
- [x] 사무 입력을 항목 추가(세부제목/내용) 라인 구조로 전환
- [x] 전체제목은 자동 생성 템플릿(일일/사무)으로 통일
- [x] 연계정보 선택은 기준정보 ID 기반으로 통일
- [x] 연계정보 입력 UX: 1차 유형 드롭다운 + 2차 검색선택(포함검색)
- [x] 태그는 보조 메타데이터로 라인 단위 유지(연계 키로 사용하지 않음)
- [x] L0/smoke 검증 수행(`build`, `test:smoke:routes`)

## 추가 업데이트 (요구사항 확장)
- [x] 연계정보 2차 선택 시 즉시 항목 추가
- [x] 태그 입력 제거, 내용 기반 연계 추천으로 대체
- [x] 추천 기능 공통화(`linkedReferences`)로 이슈 재사용 기반 확보
