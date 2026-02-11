# Excel 규칙/이관 선후 전략 로드맵

작성일: 2026-02-11
범위: `/excel` 기능 이관 + 분류 규칙 고도화의 실행 순서 결정
상태: 진행 중

================================================================================
핵심 질문
- 규칙을 먼저 완성하고 이관할지?
- 이관을 먼저 완료하고 규칙을 넣을지?

================================================================================
결론 (권장 전략)
- 완전 선행도, 완전 후행도 아닌 `하이브리드`가 최적.
- 순서:
  1) 최소 규칙 기준선 고정
  2) 엑셀 기능 이관 완료
  3) 실제 업로드 검증
  4) 규칙 고도화(예외/학습/가격밴드)

이유:
- 규칙을 끝까지 먼저 만들면, 실제 UI/파서 흐름과 어긋날 위험이 큼.
- 이관을 먼저 끝내면, 규칙 실험을 실제 데이터/동선 위에서 빠르게 반복 가능.
- 현재 프로젝트는 SHADOW -> MIGRATED 공정이므로, “작동 경로 확정”이 선행되어야 전체 비용이 줄어든다.

================================================================================
실행 원칙
1) 기준선 우선
- `excel-expression-normalization-matrix-v1.md` + `excel-rule-dictionary-v1.md`를 기준선으로 고정.
- 이 단계에서는 규칙을 “완성”하지 않고, 파서/저장/검토 흐름이 타는 최소 수준만 확정.

2) 기능 경로 우선
- `/excel`에서 legacy 패널/파서를 제거해 src2 native 경로로 먼저 통일.
- 도메인 repo 저장 경로(partner/vehicle/weighing) 정상화가 규칙 고도화보다 우선.

3) 예외를 자산화
- 누락/중복/분류불가를 숨기지 않고 queue로 노출.
- queue 처리 결과를 learned rule 후보로 누적.

4) 완전 자동확정 금지
- level3(스크랩/압축품/분쇄품/미세척분쇄품/압출펠렛)는 반자동 확인을 기본.
- date+price band는 보조 기준이며, 확정 전 사용자 검토를 거친다.

================================================================================
단계 로드맵
Phase A) 최소 규칙 기준선 (완료)
- rule dictionary 타입/seed 추가
- 표현 정규화 유틸(date/number/bizNo) 추가
- DoD: build 통과 + 문서/코드 기준 일치

Phase B) 엑셀 이관 완료 (현재 최우선)
- legacy 업로드 패널 3종 제거
  - partner/weighing/vehicle
- legacy parser bridge 제거
- parse result type을 src2 native로 교체
- DoD:
  - `/excel` 내부 @legacy import 0
  - build 통과
  - 샘플 업로드 3종 수동 검증 통과
  - MIGRATION_STATUS `/excel` -> MIGRATED 상향 가능 상태

Phase C) 운영 안정화
- `partnerDuplicateQueue`, `weighingExceptionQueue` 최소 구현
- 예외 처리(수동 입력/삭제/재시도) 흐름 연결
- DoD:
  - 누락 15건 처리 가능한 UI/저장 경로 확보
  - 중복 거래처 후보 검토/병합 흐름 확보

Phase D) 규칙 고도화
- learned rule 저장/재사용
- date+price band 일괄분류
- 분류불가 축소(예외큐 감소)
- DoD:
  - 분류 정확도 개선 지표 확보
  - 오분류 롤백/비활성화 가능

================================================================================
선후 비교 (의사결정 테이블)
- 규칙 먼저 100%:
  - 장점: 문서적으로 깔끔
  - 단점: 실제 업로드 동선과 불일치 가능성 큼
  - 판단: 비권장

- 이관 먼저 100%:
  - 장점: 빠른 동작 확보
  - 단점: 규칙 부채가 한 번에 몰림
  - 판단: 비권장

- 하이브리드(권장):
  - 장점: 동작 경로 + 규칙 일치도를 같이 높임
  - 단점: 단계 관리 문서가 필요
  - 판단: 권장

================================================================================
이번 스프린트 우선순위
1. `/excel` @legacy 제거 완료 (MIGRATED 조건 충족)
2. duplicate/exception queue 최소 구현
3. learned/price-band는 후속(동작 안정화 이후)

================================================================================
연계 문서
- `company-docs/src2/docs/roadmap/phase5/excel-migration-roadmap.md`
- `company-docs/src2/docs/roadmap/phase5/work-order-excel-import-hub-migration.md`
- `company-docs/src2/docs/reference/excel-expression-normalization-matrix-v1.md`
- `company-docs/src2/docs/reference/excel-rule-dictionary-v1.md`

