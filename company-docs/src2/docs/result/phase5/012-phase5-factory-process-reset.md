# Phase 5 Factory 공정 재정의

> 작성일: 2026-02-09
> 주제: Phase 5 미완료 전제 반영 + 페이지 이관 공정 문서화 + Phase 6 보류 명시

---

## 변경 배경
- 기존 흐름에서 Phase 5가 사실상 미완료 상태임을 반영.
- 목적을 “빠른 이관 + 나중에 수정 쉬운 구조”로 고정하기 위해 Factory 방식 문서 세트를 추가.

## 추가/수정 문서
- `company-docs/src2/docs/roadmap/phase5/roadmap.md`
  - 상태를 `진행 중(미완료)`로 명시.
  - Phase 5 핵심 선언(페이지 단위 반복 공정, Phase 6 구현 보류) 추가.
  - Factory 연동 문서 링크 추가.

- `company-docs/src2/docs/roadmap/phase5/factory-phase-definition.md` (신규)
  - Phase 5 재정의, 공통 페이지 DoD, Phase 6 보류 해제 기준 문서화.

- `company-docs/src2/docs/roadmap/phase5/factory-process-checklist.md` (신규)
  - 0~7 단계 고정 공정 + 시간 박스(90~120분, 30분 분리 실패 시 즉시 쪼개기) 체크리스트.

- `company-docs/src2/docs/roadmap/phase5/first-target-work-order-template.md` (신규)
  - 첫 대상 페이지 실행용 체크박스 템플릿.

- `company-docs/src2/docs/roadmap/phase6/roadmap.md`
  - 상태를 `보류`로 명시.
  - Phase 5 안정화 전에는 문서 보강만 허용, 구현 시작 금지 규칙 추가.

## 기대 효과
- 1페이지 단위로 예측 가능한 이관 속도 확보.
- 페이지 얇게/기능 분리/재사용 정본화 원칙을 고정해 후속 수정 비용 감소.
- Phase 5/6 경계가 명확해져 병렬 착수로 인한 재작업 위험 감소.

다음 질문: 첫 공정 대상으로 `/browse/master`와 `/manage/daily` 중 어느 쪽부터 고정할까?
