# Excel 실데이터 분석 반영 + 규칙 업데이트

> 작성일: 2026-02-11
> 주제: 중복 거래처/계량 누락/날짜 포맷 분석 결과를 필드·규칙 문서에 반영

---

## 변경 요약
- 실엑셀 분석 결과를 기반으로 중복/예외 처리 정책을 강화했다.
- 거래처 중복은 큐로 이동, 계량 누락은 예외 큐 처리, 날짜 포맷 정규화 규칙을 고정했다.
- 차량규격/종류 정규화 초안을 매핑 문서에 반영했다.

## 수정/추가 문서
- 수정:
  - `company-docs/src2/docs/reference/excel-source-field-mapping-v1.md`
  - `company-docs/src2/docs/reference/excel-field-inventory-and-normalization-plan.md`
  - `company-docs/src2/docs/reference/excel-rule-dictionary-v1.md`
- 신규:
  - `company-docs/src2/docs/reference/excel-data-analysis-snapshot-2026-02-11.md`

## 주요 반영 사항
- 거래처 중복(`대구/성주` 교차) -> `partnerDuplicateQueue` 운영
- 계량 누락(총중량/공차중량) -> `weighingExceptionQueue` 운영 + 수동 보정 후 매칭 포함
- 계량 필드 강화: `seqNo`, `grossWeight`, `tareWeight`, `netWeight`, `inOutType`
- 날짜 정규화 규칙에 `M/D/YY` 지원 추가

## 게이트
- 문서 변경만 수행(빌드 미실행)

다음 질문: 바로 다음으로 `dictionary.json` 초안 파일을 만들어 규칙을 코드에서 읽게 할까?

## 핵심 로직 3줄
- 1) 실데이터 수치(중복/누락/포맷)를 근거로 예외 큐 규칙을 문서에 고정했다.
- 2) 계량 처리에 필요한 중량/입출/순번 필드를 명시해 후속 자동 계산 기반을 마련했다.
- 3) 날짜 포맷 변환 규칙을 확장해 KORA 형식(`M/D/YY`)을 안정적으로 수용하게 했다.

## 입문자 설명 3줄
- 1) 먼저 데이터에서 실제 문제(누락/중복)를 숫자로 확인하면 규칙을 정확히 만들 수 있다.
- 2) 예외 큐를 두면 자동화가 놓치는 건 사람이 안전하게 보정할 수 있다.
- 3) 날짜 형식을 통일해야 나중에 조회/매칭이 제대로 동작한다.

## 주의 사항
- AI가 샘플 분석을 기반으로 규칙을 고정할 때, 미래 파일 변형(새 헤더/새 형식)을 과소추정할 수 있다.
- 중복 큐/예외 큐 규칙이 문서만 있고 UI/저장 로직에 반영되지 않으면 실제 운영에서 효과가 없다.

## 향후 과정
- 다음 단계에서 parser/adapters에 필드 매핑과 날짜 정규화를 실제 코드로 연결해야 한다.
- 중복/예외 큐를 우선 구현하고, 그 다음 자동 병합/자동 매칭 강도를 높여야 재작업이 줄어든다.

