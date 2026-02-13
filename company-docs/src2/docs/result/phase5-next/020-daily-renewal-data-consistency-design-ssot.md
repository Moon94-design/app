# 일일기록 리뉴얼 설계 SSOT 문서화 (정합성 리스크 기준)

> 작성일: 2026-02-13
> 주제: 일일기록 도메인 정합성 리스크를 기준으로 P0/P1 설계 결정을 문서로 고정
> 이슈 상태: Resolved

---

## 배경
- 현재 전환 프레임워크(엔트리/라우팅/규칙 강제)는 안정권이지만, 데이터 계층에서 정합성 리스크가 남아 있다.
- 특히 `issue/action legacy sync`, `logistics 병합/문서 모델`, `일일 ID 정책`, `draft reset`, `security-check 커버리지`가 우선 대상이다.
- 사용자 요청에 따라 `019` 결과 문서는 읽지 않고, 코드 기준선만 다시 확인해 설계를 재정리했다.

## 이번 턴 변경
- 신규 설계 SSOT 문서 생성:
  - `company-docs/src2/docs/roadmap/phase5/daily-renewal-data-consistency-design.md`
  - 포함 내용:
    - P0: legacy sync 1회화, legacy id 결정론화, action normalize 보존 필드 확장, logistics fingerprint(site 포함)
    - P1: logistics 문서 단위 재정의(`date+site+writer`), daily ID 정책 통일, useDraft reset 모드 분리, security-check 동적 import 보강
    - 실행 계획(근거리 상세/원거리 큰 항목) + DoD/회귀 시나리오
- 연계 문서 링크 반영:
  - `company-docs/src2/docs/roadmap/phase5/roadmap.md`
- 상태판 실행 큐/참조 문서 동기화:
  - `company-docs/src2/docs/rule/MIGRATION_STATUS.md`
  - D0(정합성 설계 SSOT 확정) 완료 항목 추가

## 검증
- `npm run build` PASS

## 간단한 의견 + 다음 진행 질문
- 의견: 지금 단계에서 가장 효과가 큰 다음 액션은 코드 변경 P0 묶음(`issue/action sync + logistics merge`)을 먼저 닫는 것이다.
- 다음 진행 질문: 다음 턴에서 P0를 바로 코드로 들어갈지, 아니면 P1의 `logistics 문서 단위(date+site+writer)`를 먼저 확정 회의용 문서로 더 세분화할지 선택해줘.

## 핵심 로직 3줄
- 1) 리뉴얼 우선순위(D->M->X)는 유지하고, 데이터 정합성 리스크를 별도 설계 트랙(P0/P1)으로 고정했다.
- 2) legacy sync/ID/merge/reset/security를 "문서 규칙"이 아니라 "구현 지침 + 검증 시나리오" 수준으로 구체화했다.
- 3) 로드맵과 상태판에 설계 문서를 연결해 후속 구현 순서가 문서 단위로 끊기지 않게 맞췄다.

## 입문자 설명 3줄
- 1) 큰 틀은 안정적이라, 이제는 데이터가 꼬이거나 사라질 수 있는 지점을 먼저 막는 단계야.
- 2) 그래서 어떤 걸 먼저 고칠지(P0)와 나중에 구조를 어떻게 바꿀지(P1)를 분리해서 문서로 정했다.
- 3) 다음 구현자는 이 설계 문서만 보면 왜/어디/어떻게 고칠지 바로 따라갈 수 있게 만들었다.

## 주의 사항
- 이번 턴은 설계 문서화만 했고 실제 repo/hook 코드는 아직 바꾸지 않았다. 따라서 문서 기준과 코드 실제 상태 사이의 간극이 다음 턴에서 오래 유지되지 않게 P0 착수를 바로 이어야 한다.

## 향후 과정
- 다음 구현 배치에서 우선 `issueRepo/actionRepo` 1회 이관화 + `logistics merge site fingerprint`를 먼저 적용하고, 이후 `logistics 모델 v2`와 `useDraft reset 모드`를 순차 반영한다.

## 이슈 상태
- `Resolved`: 정합성 리스크 기반 리뉴얼 설계 SSOT를 신규 문서로 고정하고, 로드맵/상태판 연계를 완료.
