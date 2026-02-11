# SSOT 공통섹션 공정 문서화

> 작성일: 2026-02-10
> 주제: 기준등록/관리 재사용을 위한 SSOT 공통섹션 공장 공정 문서 세트 추가

---

## 변경 요약
- "기준등록 폼 완성"이 아니라 "한 번만 수정되는 구조"를 목표로 공통섹션 SSOT 공정을 문서화.
- Phase 5 로드맵에 SSOT 공정 문서를 연결해 다음 작업 시작점 고정.

## 신규 문서
- `src2/docs/roadmap/phase5/ssot-factory-roadmap.md`
  - 범위/목표/우선순위(Header -> Profiles -> Contacts -> Status -> Recent)
  - 공통 컴포넌트 위치 규칙(kernel/components)과 도메인 규칙 위치(kernel/schema) 고정
  - 적용 순서/DoD/리스크 명시

- `src2/docs/roadmap/phase5/ssot-factory-checklist.md`
  - 공통섹션 1개 단위 반복 체크리스트
  - 사전 고정/커널 생성/도메인 helper 분리/2도메인 적용/게이트/문서 단계 정의

- `src2/docs/roadmap/phase5/ssot-factory-work-order-template.md`
  - 섹션별 실행 템플릿(복사 후 바로 사용)

## 수정 문서
- `src2/docs/roadmap/phase5/roadmap.md`
  - Factory 연동 문서 목록에 SSOT 3종 링크 추가
- `src2/docs/roadmap/phase5/ssot-factory-roadmap.md`
  - 경계 고정 문장 추가: Phase 5.5는 공통섹션만 다루고 nav loader/신규 이관은 별도 작업으로 분리
  - `kernel/components`의 domain helper 직접 import 지양 규칙 추가(props/adapter 결합)
  - DoD에 재사용 2회 검증 방식(`grep`) 명시
- `src2/docs/roadmap/phase5/ssot-factory-checklist.md`
  - 컴포넌트-도메인 결합 규칙(직접 import 지양) 체크 항목 추가
  - key 추가 시 keys.ts/DECISIONS_LOG(`repo:*` 통일 트리거) 확인 항목 추가
- `src2/docs/roadmap/phase5/ssot-factory-work-order-template.md`
  - 공정 경계 문장(공통섹션 전용) 추가
  - 완료판정에 `grep` 기반 2도메인 재사용 확인 항목 추가

## 기대 효과
- Register/Manage에서 같은 섹션을 재사용하도록 경계가 명확해짐
- 공통화 작업을 "섹션 1개 단위"로 쪼개 빠르게 반복 가능
- 이후 폼 변경 시 수정 지점을 kernel SSOT로 집중 가능

다음 질문: SSOT 1순위인 `MasterFormHeader`부터 `Partner + Vendor`에 먼저 적용할까?
