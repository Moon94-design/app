# Draft P0 가드레일 보강

> 작성일: 2026-02-09
> 주제: DraftKey 강제 + key prefix 검증 추가

---

## 작업 요약
- useDraft 옵션에서 key 타입을 DraftKey로 강제
- DraftRepo API에 DraftKey 적용
- draftRepo에 prefix 검증 가드레일 추가(기본 "draft:")

## 변경 파일
- src2/kernel/draft/types.ts
- src2/kernel/draft/useDraft.ts
- src2/kernel/draft/draftRepo.ts
- .github/copilot-instructions.md

## 의견
- DraftKey 강제는 실수 방지 효과가 크고 비용이 낮아, 지금 적용하는 게 가장 안전했어.

## 다음 진행 질문
- 다음으로 draft 연결을 어떤 화면에 이어서 붙일까? (예: 일일기록 등록, 물류 등록)
