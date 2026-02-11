# Excel Hybrid B단계 native 이관 완료 (/excel @legacy 0)

> 작성일: 2026-02-11
> 주제: `/excel` 허브의 legacy parser/panel 의존 제거 및 src2 native 파서/섹션 전환

---

## 변경 요약
- `/excel` 경로에서 `@legacy` import를 제거했다.
- partner/weighing/vehicle 업로드 UI를 src2 native 섹션으로 교체했다.
- bridge parser를 legacy 호출 방식에서 `xlsx` 직접 파싱 방식으로 전환했다.
- parse result 타입을 src2 native 타입으로 통일했다.

## 코드 변경
- page/hook
  - `src2/app/pages/excel/ExcelImportHubPage.tsx`
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts`
- sections
  - `src2/app/pages/excel/sections/ExcelPartnerUploadSection.tsx`
  - `src2/app/pages/excel/sections/ExcelWeighingUploadSection.tsx`
  - `src2/app/pages/excel/sections/ExcelVehicleUploadSection.tsx`
  - `src2/app/pages/excel/sections/ExcelHubLayoutSection.tsx`
  - `src2/app/pages/excel/sections/ExcelHubBridgeSection.tsx` (삭제)
- adapters
  - `src2/app/pages/excel/adapters/partnerExcelBridge.ts`
  - `src2/app/pages/excel/adapters/weighingExcelBridge.ts`
  - `src2/app/pages/excel/adapters/vehicleExcelBridge.ts`
- components/types
  - `src2/app/pages/excel/components/ExcelParseResultView.tsx` (신규)
  - `src2/app/pages/excel/types/excelUploadTypes.ts` (신규)

## 문서 변경
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/excel` 상태를 `MIGRATED`로 갱신하고 후속 확장 범위를 메모로 분리.
- `src2/docs/roadmap/phase5/work-order-excel-hybrid-phase-b.md`
  - B단계 구현 완료 항목 체크 반영.

## 게이트
- `npm.cmd run build` 성공.
- `rg -n "@legacy" company-docs/src2/app/pages/excel` 결과 0건.
- 수동 게이트(직접 URL/새로고침, 샘플 3종 업로드, manage/browse 반영 확인)는 다음 턴에서 수행.

다음 질문: 수동 게이트 3종(partner/weighing/vehicle 업로드)까지 지금 바로 이어서 확인할까?

## 핵심 로직 3줄
- 1) `/excel`의 파싱 진입점을 legacy parser 호출에서 `src2 + xlsx` native 파서로 바꿨다.
- 2) parse 결과 타입을 `excelUploadTypes.ts`로 통일해 hook/section 계약을 고정했다.
- 3) 적용 저장은 `createPartnerRepo/createWeighingRepo/createVehicleRepo` 경유만 허용했다.

## 입문자 설명 3줄
- 1) 이제 엑셀 업로드 화면이 옛 코드에 의존하지 않고 새 구조에서 직접 읽고 저장한다.
- 2) 데이터 결과 모양(타입)을 하나로 맞춰서, 화면-훅-저장 로직이 같은 규칙으로 동작한다.
- 3) 저장은 항상 repo를 통해서만 하게 해서 나중에 서버 저장으로 바꿀 때도 경로가 유지된다.

## 주의 사항
- AI가 파서를 빠르게 치환하는 과정에서 헤더 변형/예외 행(합계, 공란)의 누락 조건을 덜 잡았을 가능성이 있다.
- 현재는 3개 포맷 중심으로 native 전환을 닫았고, kora/hometax/extra 고도화 규칙은 아직 구현 전이다.

## 향후 과정
- 다음 작업에서 샘플 업로드 3종을 실제 파일로 검증해 parser 누락/오탐 패턴을 수집해야 한다.
- 이후 C단계에서 reviewQueue/반자동 분류를 붙일 때 현재 parse 타입 계약을 깨지 않도록 확장 필드를 추가 방식으로만 진행한다.
