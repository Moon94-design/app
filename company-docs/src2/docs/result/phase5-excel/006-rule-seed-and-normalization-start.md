# 분류 룰 JSON Seed + 표현 정규화 코드화 시작

> 작성일: 2026-02-11
> 주제: `excel-expression-normalization-matrix-v1` + `excel-rule-dictionary-v1` 기준을 kernel 코드로 반영

---

## 변경 요약
- 판단 결과: `excel-expression-normalization-matrix-v1.md`는 필수 참조 문서가 맞음.
- 이유:
  - matrix = 소스 표현 차이 정규화 기준
  - rule dictionary = 분류 정책/우선순위 기준
  - 둘을 함께 써야 분류/정규화 일관성이 유지됨.
- 실행:
  - rule dictionary 타입 + seed 추가
  - 표현 정규화 함수(date/number/bizNo) 추가
  - excel schema export 연결

## 코드 변경
- `company-docs/src2/kernel/schema/excel/ruleDictionaryTypes.ts` (신규)
  - base/learned/price-band 규칙 타입 정의
- `company-docs/src2/kernel/schema/excel/ruleDictionarySeed.ts` (신규)
  - 문서 기준 seed(`EXCEL_RULE_DICTIONARY_V1`) 생성
  - 전 품목 공통 원칙에 맞게 3차는 candidate 성격(low confidence)로 구성
- `company-docs/src2/kernel/schema/excel/expressionNormalization.ts` (신규)
  - 날짜 정규화: `YYYY-MM-DD`, `YYYYMMDD`, `M/D/YY`, excel serial
  - 숫자 정규화, 사업자번호 정규화 유틸
- `company-docs/src2/kernel/schema/excel/index.ts`
  - 신규 타입/seed/정규화 유틸 export 추가

## 게이트
- `npm.cmd run build` 성공

## 변경 파일 목록 + diff 요약
- 추가: `src2/kernel/schema/excel/ruleDictionaryTypes.ts`
  - Excel 분류 엔진 계약 타입 추가
- 추가: `src2/kernel/schema/excel/ruleDictionarySeed.ts`
  - 문서 기반 기본 규칙 seed 추가
- 추가: `src2/kernel/schema/excel/expressionNormalization.ts`
  - 소스 형식 차이 정규화 함수 추가
- 수정: `src2/kernel/schema/excel/index.ts`
  - 신규 모듈 export 연결

다음 질문: 다음 단계로 `partnerDuplicateQueue` + `weighingExceptionQueue` 최소 스키마/저장 흐름까지 바로 붙일까?

## 핵심 로직 3줄
- 1) 분류 규칙을 문서가 아니라 코드 타입(`ExcelRuleDictionary`)으로 고정했다.
- 2) rule seed를 별도 모듈로 분리해 파서/허브가 공통 참조할 수 있게 했다.
- 3) 표현 정규화(date/number/bizNo)를 공용 함수로 분리해 소스별 차이를 한곳에서 처리하게 했다.

## 입문자 설명 3줄
- 1) 같은 규칙이라도 문서에만 있으면 실행되지 않아서 코드로 옮겨야 한다.
- 2) 타입을 먼저 만들면 나중에 규칙이 늘어나도 구조가 깨지지 않는다.
- 3) 날짜/숫자 정규화를 공통 함수로 빼두면 파일마다 중복 코드를 안 써도 된다.

## 주의 사항
- AI가 seed 규칙을 빠르게 만들면서 실제 운영 예외를 덜 담았을 가능성이 있다.
- 특히 3차 분류는 다의어가 많아서 candidate 중심으로만 제안하고 확정은 검토가 필요하다.

## 향후 과정
- 다음 단계에서 queue(중복/예외) 스키마를 붙일 때 rule seed 버전을 함께 저장해야 추적 가능하다.
- 업로드 허브에 이 seed를 연결할 때, 문서 정책대로 `완전 자동확정 금지` 플래그를 명시적으로 넣어야 한다.
