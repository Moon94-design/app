# 일일기록(유통) draft P0 연결

> 작성일: 2026-02-09
> 주제: 유통 기록 화면에 draft P0 연결 및 초기화 버튼 추가

---

## 작업 요약
- 유통 기록 화면에서 useDraft 기반 draft 저장/로드 전환
- draft 키 추가(draft:daily:logistics)
- 드래프트 초기화 버튼 추가

## 변경 파일
- src2/kernel/draft/draftKeys.ts
- src/app/pages/register/RegisterLogisticsDaily.tsx

## 의견
- 기존 로컬 드래프트를 커널 draft로 치환해 규칙 일관성이 좋아졌고, 초기화 버튼으로 테스트가 쉬워졌다.

## 다음 진행 질문
- 다음 draft 연결 대상 화면은 어디로 할까? (예: 사무 등록, 생산 등록)
