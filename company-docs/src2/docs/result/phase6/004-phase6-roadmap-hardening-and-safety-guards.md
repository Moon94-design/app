# Phase 6 로드맵 보강 + 전체 액세스 안전장치 고정

> 작성일: 2026-02-09
> 주제: 분석 피드백 3개를 로드맵에 반영하고 AGENTS에 안전장치 5개를 우선 적용

---

## 반영 1) Phase 6 로드맵 실전 보강
- `company-docs/src2/docs/roadmap/phase6/roadmap.md` 보완.
- 추가된 핵심:
  - 읽기 우선 전환 고정(Partner 기준: read -> write -> local fallback 제거)
  - API DTO와 `kernel/schema` 정합성 규칙 고정(단일 매핑 SSOT)
  - 업로드 정책 필수 2종 명시(idempotency, 부분 실패 전략)
- DoD에도 위 3개를 검증 항목으로 추가.

## 반영 2) 전체 액세스 안전장치 5개 우선 적용
- `AGENTS.md`에 `0.5) 전체 액세스 안전장치` 섹션 추가.
- 적용 규칙:
  1) 범위 제한(`company-docs/` 중심, 민감 파일 접근 금지)
  2) 명령어 제한(허용/금지 기본 목록)
  3) 커밋/푸시 제한(명시 요청 전 금지)
  4) 게이트 강제(변경 후 build 검증)
  5) 산출물 강제(변경 파일 목록 + diff 요약 선공유)

## 메모
- 이번 요청은 이전 작업과 구분되는 새 작업으로 판단해 result 번호를 `004`로 증가.

다음 질문: 다음 Phase 6 작업에서 API 스타일을 REST로 고정하고, Partner read-only 서버 전환 체크리스트부터 만들까?
