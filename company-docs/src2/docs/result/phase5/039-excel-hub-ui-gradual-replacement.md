# 엑셀 허브 UI 점진 치환 (legacy 허브 직접 렌더 제거)

> 작성일: 2026-02-10
> 주제: `/excel`을 src2 탭/섹션 구조로 치환하고 저장 경로를 domain repo로 연결

---

## 변경 요약
- `ExcelImportHubPage`를 src2 탭/섹션 조립형 화면으로 전환했다.
- legacy 허브 컴포넌트 직접 렌더(`ExcelHubBridgeSection`)를 제거했다.
- 거래처/계량/차량 업로드 적용 시 저장이 `@kernel` domain repo를 경유하도록 연결했다.

## 코드 변경
- page/hooks:
  - `src2/app/pages/excel/ExcelImportHubPage.tsx` (탭/섹션 렌더 전환)
  - `src2/app/pages/excel/hooks/useExcelImportHubPage.ts` (activeTab + existing key 조회 + apply 핸들러)
- sections:
  - `src2/app/pages/excel/sections/ExcelHubLayoutSection.tsx` (KORA 1열 / 기타 2열 레이아웃)
  - `src2/app/pages/excel/sections/ExcelPartnerUploadSection.tsx`
  - `src2/app/pages/excel/sections/ExcelWeighingUploadSection.tsx`
  - `src2/app/pages/excel/sections/ExcelVehicleUploadSection.tsx`
  - 삭제: `src2/app/pages/excel/sections/ExcelHubBridgeSection.tsx`
- 기존 legacy 업로드 패널은 섹션에서 재사용:
  - partner/weighing/vehicle upload panel

## 문서 변경
- `src2/docs/roadmap/phase5/excel-migration-roadmap.md`
  - 3단계(소스별 래핑 치환) 완료로 상향
  - 4단계(저장 경로 정리) 진행 중으로 갱신
- `src2/docs/roadmap/phase5/work-order-excel-import-hub-migration.md`
  - UI 점진 치환(6.5) 체크 항목 추가 및 완료
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/excel` 메모를 "src2 허브+탭/섹션 치환 완료" 기준으로 갱신

## 게이트 확인
- `npm.cmd run build` 성공
- `http://localhost:5173/excel` 응답 200 확인

다음 질문: 다음 단계로 소스별 수동 업로드 검증(거래처/계량/차량 각 1회)하고, 그 결과를 기준으로 4단계 저장 경로 정리를 닫을까?

## 핵심 로직 3줄
- 1) `/excel` 화면 렌더를 legacy 허브 통째 사용에서 src2 탭/섹션 조립 구조로 바꿨다.
- 2) 업로드 적용 핸들러에서 partner/weighing/vehicle를 각각 domain repo(`create*Repo`)로 저장하도록 연결했다.
- 3) 기존 데이터와의 충돌 검증을 위해 existing key 목록(partnerCode/ticketNo/vehicleNo)을 repo에서 조회해 패널에 전달했다.

## 입문자 설명 3줄
- 1) 이제 엑셀 화면의 껍데기는 우리 src2 코드가 관리하고, 옛날 업로드 패널은 부품처럼 끼워 쓰는 상태다.
- 2) 업로드된 데이터를 저장할 때도 새 구조(repo)를 거치게 해서 나중 정리가 쉬워졌다.
- 3) 중복 검증에 쓰는 키 목록을 먼저 불러와서 파싱 단계에서 충돌을 잡도록 유지했다.

## 주의 사항
- 패턴 반복 적용 구간이라, 소스별 매핑 필드 누락(특히 vehicle의 선택 필드)이 남아 있을 수 있다.
- UI는 src2로 옮겼지만 업로드 패널 자체는 legacy 재사용이므로, 완전 MIGRATED로 올리기엔 아직 이르다.

## 향후 과정
- 다음 턴에서 소스별 수동 업로드 3종을 실행해 실제 저장/관리 반영까지 검증해야 4단계를 닫을 수 있다.
- vehicle 키 단일화(`local_vehicles_v1` -> `repo:vehicle`)는 별도 턴으로 분리해 manage 연계 회귀를 함께 점검한다.
