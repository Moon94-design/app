# BASIC_EXECUTION_CHECKLIST 작성본
작성일: 2026-02-13
작업: 보안 체크리스트 문구 정렬(전 데이터 민감 취급)

---

## 2) 시작 전 로딩
- [x] `src2/docs/DOCS_GUIDE.md` 확인
- [x] `src2/docs/rule/main_rule.md` 확인
- [x] `src2/docs/rule/MIGRATION_STATUS.md` 현재 상태 확인
- [x] `src2/docs/rule/GATES_CHECKLIST.md` 적용 게이트 확인
- [x] 작업 유형별 추가 체크리스트 1개 이상 선택

## 7) 미래 대비 설계(조회/서버/보안/권한)
- [x] 보안 항목을 "회사 데이터 전량 민감 취급" 원칙으로 정렬
- [x] 문서화: 준수 상태와 반영 문서를 result/STATUS/DECISIONS에 기록

## 9) 문서 동기화
- [x] 상태 변경 사항 `src2/docs/rule/MIGRATION_STATUS.md` 반영
- [x] 신규 결정/예외를 `src2/docs/rule/DECISIONS_LOG.md` 반영
- [x] 코드/문서 변경이 있으면 result 문서 작성

## 10) 종료 산출물
- [x] 변경 파일 목록 공유
- [x] 핵심 diff 요약 공유
- [x] 미해결 리스크/다음 액션 공유
