# Excel 필드 매핑 + 결과 문서 분류 시작

> 작성일: 2026-02-11
> 주제: 차량번호/메일 저장 기준 반영, 소스별 필드 매핑표 작성, result 분류 체계 시작

---

## 변경 요약
- 필드 인벤토리 문서에서 `vehicleNo`를 권장 저장 항목으로 상향했다.
- 메일 추적 값도 저장 대상으로 명시했다.
- KORA/Hometax/Extra -> 공통 저장필드 매핑표 문서를 신규 작성했다.
- result 문서 분류 인덱스를 추가하고, 신규 문서는 토픽 폴더(`phase5-excel`)로 기록 시작했다.

## 수정/추가 문서
- 수정:
  - `company-docs/src2/docs/reference/excel-field-inventory-and-normalization-plan.md`
- 신규:
  - `company-docs/src2/docs/reference/excel-source-field-mapping-v1.md`
  - `company-docs/src2/docs/result/README.md`
  - `company-docs/src2/docs/result/phase5-excel/001-field-mapping-and-result-classification-start.md`

## 게이트
- 문서 작업만 수행(빌드 미실행)

다음 질문: `phase5` 기존 excel 결과(`034~051`)도 `phase5-excel`로 단계 이동할까, 아니면 인덱스만 유지할까?

## 핵심 로직 3줄
- 1) 소스별 컬럼을 공통 저장 필드로 1:1 매핑해 구현 기준을 고정했다.
- 2) 차량번호를 조회/연계 정확도 강화를 위한 권장 저장 항목으로 올렸다.
- 3) 결과 문서를 토픽 폴더 단위로 분리하는 운영 체계를 시작했다.

## 입문자 설명 3줄
- 1) 엑셀마다 컬럼 이름이 달라도, 저장할 공통 칸을 먼저 정하면 코드가 단순해진다.
- 2) 차량번호는 항상 있는 값은 아니지만 있으면 추적과 조회가 훨씬 쉬워진다.
- 3) 문서를 주제별 폴더로 나누면 나중에 찾고 관리하기 편해진다.

## 주의 사항
- AI가 매핑표를 작성할 때 시트 헤더 행 위치를 잘못 잡으면 필드 대응이 틀릴 수 있다.
- 분류 폴더를 도입했지만 기존 파일을 한 번에 이동하면 링크/참조 깨짐 위험이 있어 단계적 정리가 필요하다.

## 향후 과정
- 다음 단계에서 parser/adapters 구현 시 이 매핑표를 그대로 코드 계약으로 연결해야 문서-구현이 일치한다.
- 기존 phase5 문서를 카테고리별로 점진 이동할 경우 리다이렉션/인덱스 갱신을 함께 수행해야 한다.

