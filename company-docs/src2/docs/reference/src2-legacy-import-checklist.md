# src2 레거시(@legacy) 의존 체크리스트

작성일: 2026-02-11  
목적: `src2`가 아직 `src(@legacy)`를 참조하는 항목을 한 번에 점검하고, 이관 우선순위를 명확히 관리한다.

---

## 점검 기준
- 대상: `company-docs/src2/app/**`
- 명령: `rg -n "@legacy/" company-docs/src2/app`
- 원칙:
  - `src2/kernel/**`의 `@legacy` import는 금지(현재 0 유지 필요)
  - `src2/app/**`의 `@legacy` import는 단계적 이관 중 임시 허용

---

## A. 라우트 로더 기준 미이관 페이지

### 등록 > 일일기록
- [ ] `/register/daily/logistics` -> `@legacy/app/pages/register/RegisterLogisticsDaily`
- [ ] `/register/daily/office` -> `@legacy/app/pages/register/RegisterOfficeDaily`
- [ ] `/register/daily/production` -> `@legacy/app/pages/register/RegisterProductionDaily`
- [ ] `/register/daily/action` -> `@legacy/app/pages/register/RegisterAction`

### 조회
- [ ] `/browse/master` -> `@legacy/app/pages/browse/BrowseMaster`
- [ ] `/browse/daily` -> `@legacy/app/pages/browse/BrowseDaily`
- [ ] `/browse/price` -> `@legacy/app/pages/browse/BrowsePrice`
- [ ] `/browse/weighing-trend` -> `@legacy/app/pages/browse/BrowseWeighingMonthlyTrend`
- [ ] `/browse/weighing-price` -> `@legacy/app/pages/browse/BrowseWeighingUnitPrice`

---

## B. 엑셀 허브의 레거시 브리지(아직 이관 안 됨)

### 업로드 패널 컴포넌트
- [ ] `ExcelPartnerUploadSection` -> `@legacy/.../PartnerExcelUploadPanel`
- [ ] `ExcelWeighingUploadSection` -> `@legacy/.../WeighingUploadPanel`
- [ ] `ExcelVehicleUploadSection` -> `@legacy/.../VehicleUploadPanel`

### 파싱/타입 브리지
- [ ] `src2/app/pages/excel/adapters/partnerExcelBridge.ts` -> legacy parser 사용
- [ ] `src2/app/pages/excel/adapters/weighingExcelBridge.ts` -> legacy parser 사용
- [ ] `src2/app/pages/excel/adapters/vehicleExcelBridge.ts` -> legacy parser 사용
- [ ] `src2/app/pages/excel/hooks/useExcelImportHubPage.ts` -> legacy parse result type 사용

---

## C. 전역 스타일(정책상 유지)
- [ ] `src2/app/main.tsx` -> `@legacy/index.css` import 유지
- 메모: 이 항목은 페이지 이관 완료 후에도 reset/기본 스타일 정책에 따라 유지될 수 있다.

---

## D. 우선순위 제안 (실행 순서)
1. 등록 일일기록 레거시 4개 이관
2. 조회(browse) 레거시 5개 이관
3. 엑셀 업로드 패널/파서를 src2 native로 교체
4. 마지막에 전역 스타일 의존 재검토

---

## E. 재점검 명령
```powershell
rg -n "@legacy/" company-docs/src2/app
rg -n "@legacy/" company-docs/src2/kernel
```

