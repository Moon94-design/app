# 엑셀 소스별 래퍼 브리지 연결 (partner/weighing/vehicle)

> 작성일: 2026-02-10
> 주제: 레거시 파서를 src2 app 레이어에서 감싸서 kernel 공통 계약으로 변환

---

## 변경 요약
- `src2/app/pages/excel/adapters`에 소스별 브리지 래퍼를 추가했다.
- 레거시 파서 결과를 `@kernel/adapters`의 `ExcelParseResult` 형식으로 변환하는 규약을 맞췄다.
- `useExcelImportHubPage`에서 parser bridge 인터페이스를 노출해 이후 화면 치환 시 바로 사용 가능하게 했다.

## 코드 변경
- 신규:
  - `src2/app/pages/excel/adapters/partnerExcelBridge.ts`
  - `src2/app/pages/excel/adapters/weighingExcelBridge.ts`
  - `src2/app/pages/excel/adapters/vehicleExcelBridge.ts`
  - `src2/app/pages/excel/adapters/index.ts`
- 수정:
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
    - `parserBridge.partner/weighing/vehicle` 추가

## 설계 포인트
- kernel에서 `@legacy`를 직접 참조하지 않고, app 레이어 브리지에서만 legacy 파서를 호출했다.
- 소스 식별자는 `kora.partner`, `kora.weighing`, `kora.vehicle`로 고정했다.
- `FAIL` 행은 `errors`로 분리하고, `OK/INCOMPLETE` 행은 `records`로 변환했다.

## 게이트 확인
- `npm.cmd run build` 성공

다음 질문: 다음 단계로 `ExcelHubBridgeSection`에서 소스별 업로드를 점진 치환(legacy panel -> src2 section)하는 작업을 시작할까?

## 핵심 로직 3줄
- 1) 레거시 파서 결과를 `ExcelParseResult`로 변환하는 브리지 함수를 소스별로 만들었다.
- 2) 각 브리지에서 `sourceId`/`sourceRowId`/`matchKey`를 공통 규약으로 매핑했다.
- 3) 훅에서 `parserBridge`를 제공해 화면 구현과 파서 호출을 분리했다.

## 입문자 설명 3줄
- 1) 예전 코드가 주는 결과를 새 형식으로 바꿔주는 "통역 함수"를 만든 단계다.
- 2) 이 통역 함수 덕분에 나중에 화면을 바꿔도 파서 호출 방식은 그대로 재사용할 수 있다.
- 3) 실패한 행과 성공한 행을 나눠서 담아, 업로드 오류 표시를 일관되게 만들 준비를 했다.

## 주의 사항
- 패턴 반복으로 브리지 3개를 추가한 구간이라, 한 소스에서 매핑 필드 누락이 있을 수 있다.
- 아직 실제 `/excel` UI는 legacy 허브를 렌더하므로, 브리지 함수가 호출되지 않는 상태다.

## 향후 과정
- 다음 치환 단계에서 src2 섹션이 브리지를 실제로 호출하면 업로드 결과 표시 규약이 바뀌므로, partner/weighing/vehicle 3개를 같은 기준으로 검증해야 한다.
- 브리지가 활성화되면 vehicle 키 단일화 이슈(`local_vehicles_v1` vs `repo:vehicle`)를 같은 턴에서 건드리지 말고 분리 처리해야 회귀를 줄일 수 있다.
