# Phase 6 로드맵/계획 수립

> 작성일: 2026-02-09
> 주제: Partner Manage reference 정합성 수정 + Phase 6 계획 문서화

---

## 문서 정합성 수정
- `src2/docs/reference/partner-manage-files.md`에서 아래 4개 항목 상태를 `(PLANNED)` -> `(EXIST)`로 수정.
  - `src2/app/pages/partner/sections/PartnerManageToolbar.tsx`
  - `src2/app/pages/partner/sections/PartnerManageList.tsx`
  - `src2/app/pages/partner/bulk/PartnerBulkEditPanel.tsx`
  - `src2/app/pages/partner/bulk/usePartnerBulkEdit.ts`

## Phase 6 계획 문서 추가
- `src2/docs/roadmap/phase6/roadmap.md` 신규 작성.
- 참조 기준:
  - `roadmap/roadmap.md`의 Phase 6 정의(서버 도입 + 데이터 모델 확정)
  - `rule/main_rule.md`의 하드룰/SSOT 원칙
  - `DOCS_GUIDE.md`의 문서 운영 규칙

## 계획 핵심
- API 계약, 인증/인가, DB/마이그레이션, 업로드/엑셀 처리, 프론트 연동 전환을 5개 트랙으로 분리.
- 산출물/DoD/리스크를 문서에 명시해 실행 기준 고정.

다음 질문: Phase 6에서 API 스타일을 REST와 GraphQL 중 어떤 것으로 고정할까?
