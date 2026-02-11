# 계량현황 site+ticketNo 중복키 전환 (대구/성주 분리)

> 작성일: 2026-02-11
> 주제: CW/CP 번호의 대구·성주 교차 중복 오탐 제거

---

## 변경 요약
- 계량현황 중복 판정 키를 `ticketNo` 단독에서 `site+ticketNo`로 전환했다.
- 계량 업로드 UI에 지점 선택(대구/성주)을 추가했다.
- 로드맵/작업순서표에 site 분리 중복정책을 반영했다.

## 코드 변경
- `src2/app/pages/excel/types/excelUploadTypes.ts`
  - `ExcelSite` 타입 추가
  - `WeighingTransaction.site` 필드 추가
- `src2/app/pages/excel/adapters/weighingExcelBridge.ts`
  - `parseWeighingExcelNative(file, existingTicketKeys, site)` 시그니처로 변경
  - DB/엑셀 중복 검증 키를 `site:ticketNo`로 전환
- `src2/app/pages/excel/sections/ExcelWeighingUploadSection.tsx`
  - 지점 선택 UI(대구/성주) 추가
  - 파서 호출 시 site 전달
- `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
  - 기존 티켓 목록을 `ticketKeys(site:ticketNo)`로 구성
  - 계량 저장 시 site 필드 반영
- `src2/app/pages/excel/ExcelImportHubPage.tsx`
  - weighing 섹션 prop을 `existingTicketKeys`로 변경

## 문서 변경
- `src2/docs/roadmap/phase5/excel-migration-roadmap.md`
  - 4단계에 `site+ticketNo` 중복키 전환 항목 추가
- `src2/docs/roadmap/phase5/work-order-excel-hybrid-phase-b.md`
  - 저장/적용 체크에 site 분리 중복정책 반영

## 게이트
- `npm.cmd run build` 성공

다음 질문: 지금 바로 수동 검증으로 `대구 파일 업로드 1회 + 성주 파일 업로드 1회`를 같은 ticketNo로 확인해볼까?

## 핵심 로직 3줄
- 1) 중복키를 `ticketNo`에서 `site+ticketNo`로 바꿔 교차 지점 오탐을 차단했다.
- 2) 업로드 시 사용자가 지점을 먼저 선택하게 해서 키 생성 기준을 고정했다.
- 3) 기존 저장값 조회도 `site:ticketNo` 형태로 맞춰 파서와 저장 검증 기준을 일치시켰다.

## 입문자 설명 3줄
- 1) 같은 번호라도 대구 데이터와 성주 데이터는 서로 다른 거래로 봐야 한다.
- 2) 그래서 번호만 비교하지 않고, "지점+번호"를 같이 비교해야 정확하다.
- 3) 화면에서 지점을 고르면 시스템이 그 지점 기준으로 중복을 판단한다.

## 주의 사항
- AI가 `site` 없는 기존 데이터를 빠르게 처리하면서 `unknown:*` 키로 분류했기 때문에, 과거 데이터 정리 전에는 일부 케이스가 느슨하게 통과될 수 있다.
- 지점 선택을 잘못하면 중복 판정이 어긋날 수 있으므로 업로드 가이드 문구를 추가 점검해야 한다.

## 향후 과정
- 다음 단계에서 기존 계량 데이터 중 `site` 미기입 레코드를 대구/성주로 정리하는 마이그레이션 보정 스크립트를 준비한다.
- reviewQueue 도입 시에도 같은 키(`site+ticketNo`)를 공통 키로 재사용해서 정책 일관성을 유지한다.
