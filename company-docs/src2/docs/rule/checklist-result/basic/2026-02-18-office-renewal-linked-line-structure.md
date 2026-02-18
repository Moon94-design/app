# 2026-02-18-office-renewal-linked-line-structure

## BASIC 실행 결과
- [x] `DOCS_GUIDE/main_rule/MIGRATION_STATUS` 확인
- [x] 사무 페이지 구조를 관공기관/기타 블록에서 라인형 입력 구조로 전환
- [x] 연계정보 2단 선택(유형 드롭다운 + 검색선택 드롭다운) 적용
- [x] 전체제목 자동 생성(일일/사무)
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - 이유: 사용자 요청으로 속도 우선 운영
- [x] DECISIONS/MIGRATION/result/checklist-result 동기화

## 추가 업데이트 (요구사항 확장)
- [x] 2차 검색선택 시 하단 항목 즉시 추가(자동 append)
- [x] 연계정보 다중 등록/삭제 유지
- [x] 태그 입력창 제거
- [x] 내용 기반 기준정보 추천 추가(추천 클릭 시 즉시 항목 추가)
- [x] 추천 로직 공통 모듈 분리(`hooks/common/linkedReferences.ts`)
