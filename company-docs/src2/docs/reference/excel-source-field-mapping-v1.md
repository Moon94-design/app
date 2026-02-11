# Excel Source Field Mapping v1

작성일: 2026-02-11  
목적: `KORA/Hometax/Extra` 소스 필드를 공통 저장 필드로 매핑해 이관/파서 구현 기준을 고정한다.

---

## 1) 공통 저장 필드(요약)
- 식별: `source`, `sourceDocId`, `sourceRowId`, `importedAt`
- 시간/위치: `date`, `site`
- 거래: `amountTotal`, `supplyAmount`, `taxAmount`, `unitPrice`, `qty`
- 주체: `counterpartyName`, `counterpartyBizNo`, `partnerCode`, `vehicleNo`
- 원문: `itemNameRaw`, `remarkRaw`, `normalizedText`
- 분류: `level1`, `level2`, `level3`, `categoryFinal`, `reviewState`
- 매칭: `matchState`, `matchedDocRef`

---

## 2) KORA 매핑

### 2.1 계량현황
- `계량일자` -> `date`
- `순번` -> `seqNo` (일자 내 순서 추적용, 보조키)
- `거래처ID` -> `partnerCode`
- `거래처` -> `counterpartyName`
- `차량번호` -> `vehicleNo`
- `품명` -> `itemNameRaw`
- `입출여부` -> `inOutType` (`입고/출고`)
- `실중량` -> `netWeight`
- `인계량` -> `handoverWeight` (있는 경우)
- `총중량` -> `grossWeight`
- `공차중량` -> `tareWeight`
- `단가` -> `unitPrice`
- `금액` -> `amountTotal`
- `비고` -> `remarkRaw`
- `번호(CW/CP...)` -> `sourceDocId` (site와 조합)
- `순번` 또는 행번호 -> `sourceRowId`
- `구분/입출여부` -> `level1` 판정 보조

계량 예외 규칙:
- `grossWeight` 또는 `tareWeight` 누락 행은 `weighingExceptionQueue`로 이동
- 예외 행은 수동 입력/삭제 가능
- 수동 보정 후에도 매칭 규칙(`site+date+amount`) 대상에 포함

### 2.2 거래처관리
- `거래처코드` -> `partnerCode`
- `거래처명` -> `counterpartyName`
- `사업자번호` -> `counterpartyBizNo`
- `이메일` -> `emailRaw` (보조)
- `담당자`/`담당전화` -> `contactRaw` (보조)
- `주소`/`상세주소` -> `addressRaw` (보조)

거래처 중복 규칙:
- 대구/성주 간 `partnerCode` 중복은 자동 병합하지 않음
- `partnerDuplicateQueue`로 이동해 사용자 확인 병합
- 병합 시:
  - `partnerCode` 기준 단일 master 유지
  - 공란 보완(빈 필드를 채움) 우선 병합
  - 출처(site/sourceRowId) 이력 보존

### 2.3 차량관리
- `차량번호` -> `vehicleNo`
- `거래처` -> `counterpartyName`
- `차량규격`/`차량종류` -> `vehicleSpecRaw`
- `운전자` -> `driverRaw`

차량 정규화 규칙(초안):
- 규격:
  - `0.5`, `1` -> `1t`
  - `5` -> `5t`
  - `25` -> `25t`
  - 그 외 -> `otherTonClass` + 예외 검토
- 종류:
  - `윙`, `카고`, `방통` 우선 매핑
  - 기타 코드(예: `06:기타`)는 예외/수동 태깅

---

## 3) Hometax 매핑

### 3.1 세금계산서 시트
- `작성일자` -> `date`
- `승인번호` -> `sourceDocId`
- `상호(공급자)` -> `counterpartyName`
- `공급자사업자등록번호` -> `counterpartyBizNo`
- `합계금액` -> `amountTotal`
- `공급가액` -> `supplyAmount`
- `세액` -> `taxAmount`
- `품목명` -> `itemNameRaw`
- `품목단가` -> `unitPrice`
- `비고` + `품목비고` -> `remarkRaw`
- `행번호` -> `sourceRowId`

### 3.2 품목 시트
- `승인번호` -> `sourceDocId`
- `품목순번` -> `sourceRowId` (승인번호와 조합)
- `일자` -> `date`
- `품목명` -> `itemNameRaw`
- `단가` -> `unitPrice`
- `공급가액` -> `supplyAmount`
- `세액` -> `taxAmount`
- `비고` -> `remarkRaw`

### 3.3 거래처목록/메일현황
- 거래처목록:
  - `거래처상호` -> `counterpartyName`
  - `거래처등록번호` -> `counterpartyBizNo`
  - `비고` -> `remarkRaw`
- 메일현황:
  - `승인번호` -> `sourceDocId`
  - `발송구분/발송결과/도착일시/확인일시` -> `mailTraceRaw`

---

## 4) Extra 매핑
- `일자` -> `date`
- `거래처` -> `counterpartyName`
- `단가` -> `unitPrice`
- `입고량` -> `qty`
- `금액` -> `amountTotal`
- `부가세합` -> `taxAmount`(또는 `taxIncludedAmountRaw`)
- `송금일자` -> `transferDate`
- `송금액` -> `transferAmount`
- 행번호 -> `sourceRowId`

---

## 5) 정규화/전처리 규칙
- 금액/단가/수량은 쉼표 제거 후 숫자형 변환
- 날짜 포맷은 `YYYY-MM-DD`로 통일
  - KORA에서 다수 확인된 `M/D/YY` 형식(예: `2/11/25`)도 변환
- 공란/None/Unnamed 컬럼은 저장하지 않음
- `remarkRaw = 비고 + 품목비고` 결합 가능(원본 필드는 별도 보존)
- `normalizedText`는 `itemNameRaw + remarkRaw` 기반으로 생성

---

## 6) 누락/예외 처리
- 필수 최소(1차/2차 분류) 불가 시 `reviewQueue` 유지
- `sourceDocId` 누락(예: KORA 번호 공란) 시 자동 중복확정 금지
- 매칭 실패 항목은 `matchState=unmatched`로 저장
