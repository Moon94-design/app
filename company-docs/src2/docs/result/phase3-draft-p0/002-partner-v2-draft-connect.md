# 거래처 V2 draft 연결

> 작성일: 2026-02-09
> 주제: 거래처 등록 페이지에 draft P0 연결

---

## 작업 요약
- draftKeys/useDraft/draftRepo P0 구현
- 거래처 V2 등록 페이지에서 draft 저장/로드를 @kernel draft로 전환
- localStorage 직접 접근 제거

## 변경 파일
- src2/kernel/draft/draftKeys.ts
- src2/kernel/draft/draftRepo.ts
- src2/kernel/draft/useDraft.ts
- src2/kernel/draft/types.ts
- src2/kernel/draft/index.ts
- src/app/pages/register/partner/RegisterPartnerV2.tsx
- src2/docs/rule/MIGRATION_STATUS.md

## 의견
- create 모드에서만 draft 저장을 유지하고, edit 모드는 기존 데이터로 초기화해 안전하게 분리했다.

## 다음 진행 질문
- 다음 draft 연결 대상 화면은 어디로 할까? (예: 일일기록 등록, 물류 등록)
