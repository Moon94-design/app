# Phase 6 REST 고정 + 실행 체크리스트 추가

> 작성일: 2026-02-09
> 주제: Phase 6 API 스타일 고정(REST) 및 read-first 체크리스트 신설

---

## 변경 사항
- `company-docs/src2/docs/roadmap/phase6/roadmap.md`
  - API 계약을 `REST 고정`으로 명시.
  - 실행 체크리스트 문서 경로 추가.

- `company-docs/src2/docs/roadmap/phase6/execution-checklist.md` (신규)
  - Partner 기준 read-first 순서(Read -> Write -> local fallback 제거) 체크리스트 작성.
  - DTO-스키마 정합성, 업로드 idempotency/부분실패 정책을 필수 점검 항목으로 고정.
  - 단계별 build/수동검증 항목 포함.

## 메모
- 이번 작업은 문서 보강 작업이며 코드 변경은 없음.

다음 질문: 체크리스트 1단계로 `GET /api/v1/partners`, `GET /api/v1/partners/{id}` 응답 DTO 초안을 바로 만들까?
