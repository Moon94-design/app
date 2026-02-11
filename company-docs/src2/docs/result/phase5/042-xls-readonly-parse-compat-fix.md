# 읽기전용 `.xls` 파싱 호환 보완

> 작성일: 2026-02-10
> 주제: 엑셀 업로드 파서의 파일 읽기 방식을 BinaryString -> ArrayBuffer로 전환

---

## 변경 요약
- 읽기전용 `.xls`에서 파싱 실패가 발생하던 경로를 보완하기 위해, 레거시 파서 3종의 읽기 방식을 변경했다.
- `FileReader.readAsBinaryString` 대신 `readAsArrayBuffer`를 사용하고, `XLSX.read` 옵션도 `type: "array"`로 맞췄다.

## 코드 변경
- `company-docs/src/app/pages/manage/master/excel/partnerExcelParser.ts`
- `company-docs/src/app/pages/home/excel/weighing/weighingParser.ts`
- `company-docs/src/app/pages/home/excel/vehicle/vehicleExcelParser.ts`

## 문서 변경
- `company-docs/src2/docs/rule/DECISIONS_LOG.md`
  - 읽기전용 `.xls` 호환성 보강 결정을 기록

## 게이트 확인
- `npm.cmd run build` 성공

다음 질문: 실제 홈택스 `.xls` 샘플로 `/excel`에서 파싱/적용까지 1회씩 확인해볼까?

## 핵심 로직 3줄
- 1) `readAsBinaryString(file)` -> `readAsArrayBuffer(file)`로 변경했다.
- 2) `XLSX.read(data, { type: "binary" })` -> `XLSX.read(data, { type: "array" })`로 변경했다.
- 3) 파서 시작부에서 `data instanceof ArrayBuffer`를 강제 체크했다.

## 입문자 설명 3줄
- 1) 옛날 `.xls` 파일은 문자열 방식보다 바이트 배열 방식으로 읽는 것이 더 안전하다.
- 2) 파일 읽기 방식과 파서 옵션을 같은 타입으로 맞추면 실패가 줄어든다.
- 3) 읽은 데이터 타입을 먼저 검사하면 디버깅이 쉬워진다.

## 주의 사항
- 읽기 호환성은 개선됐지만, 헤더 위치/형식이 예상과 다르면 여전히 파싱 실패가 날 수 있다.
- 읽기전용 문제와 포맷 불일치 문제는 다른 원인이므로 샘플 검증이 필요하다.

## 향후 과정
- 다음 단계에서 홈택스 `.xls` 실파일 1~2개를 업로드해 parse/apply까지 확인해야 실제 효과가 확정된다.
- 이후 parser wrapper 경유 경로에서도 동일 동작을 보장하도록 회귀 체크를 맞춰야 한다.

---

## 후속 보완 (KORA `.xls` 기준)
- `partner`에만 있던 파싱 fallback을 `weighing`, `vehicle` 파서에도 동일 적용했다.
- 파싱 시도 순서를 `array` -> `array + codepage(949)` -> `binary + codepage(949)`로 확장했다.
- 읽기전용/구형 `.xls`에서 실패하던 경로를 공통 전략으로 통일했다.

## 추가 코드 변경
- `company-docs/src/app/pages/home/excel/weighing/weighingParser.ts`
  - `readWorkbookWithFallback` 추가 및 workbook 로딩 교체
- `company-docs/src/app/pages/home/excel/vehicle/vehicleExcelParser.ts`
  - `readWorkbookWithFallback` 추가 및 workbook 로딩 교체

## 추가 게이트 확인
- `npm.cmd run build` 성공

## 핵심 로직 3줄
- 1) `.xls` 파싱을 1회 고정 시도에서 3단계 fallback 시도로 바꿨다.
- 2) KORA 계열 인코딩 이슈를 대비해 `codepage: 949` 분기 시도를 추가했다.
- 3) 파서별 개별 대응이 아니라 `partner/weighing/vehicle` 모두 동일 패턴으로 맞췄다.

## 입문자 설명 3줄
- 1) 엑셀 파일이 환경마다 다르게 저장되어 있으면 한 가지 방법으로만 읽을 때 실패한다.
- 2) 그래서 여러 방법을 순서대로 시도하면 실패 확률을 크게 줄일 수 있다.
- 3) 같은 규칙을 모든 파서에 적용하면 특정 파일만 실패하는 편차가 줄어든다.

## 주의 사항
- 여전히 암호 보호/손상 파일은 fallback으로도 실패할 수 있다.
- AI가 파싱 성공률에 집중하면서 도메인 컬럼 매핑 누락을 놓칠 수 있으니, 샘플 업로드 후 실제 레코드 필드 확인이 필요하다.

## 향후 과정
- KORA 실제 `.xls` 샘플로 partner/weighing/vehicle 각각 1회 업로드 검증해 파서 성공/실패 로그를 수집한다.
- 실패 샘플이 있으면 해당 파일 시그니처(시트명/헤더 라인/인코딩)를 기준으로 parser 옵션을 추가 분기한다.
