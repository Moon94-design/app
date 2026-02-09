# 차량 엑셀 등록 + 관리 + 신규등록 MVP 결과 보고서

## TL;DR (5줄)
1. **차량 엑셀 업로드 기능** 추가 완료: 홈 > 엑셀등록 > 차량 업로드에서 일괄 등록 가능
2. **파싱 규칙**: 톤수 0.5→1t 정규화, 형태는 "카고" 포함 시만 확정, 나머지 미완성으로 저장
3. **관리 페이지** 완성: 관리 > 기준정보 > 차량 관리에서 리스트/필터/수정/삭제 가능
4. **신규 등록 페이지** 정리: 기준정보 등록 > 차량 등록에서 수동 입력 가능, 톤수/형태 필드 추가
5. **적용 정책**: FAIL(중복/빈번호) 제외, OK+INCOMPLETE만 등록 → 관리에서 미완성 건 보완 가능

---

## Summary

### ✅ Changed (구현 완료)
- **ExcelImportHub**: 차량 업로드 탭 추가, VehicleUploadPanel 연동
- **vehicleParser**: 엑셀 파싱 규칙 구현 (0.5→1t, 카고만 확정, 미완성 허용)
- **VehicleManage**: 리스트/필터(전체/미완성/완료)/수정/삭제 페이지 생성
- **RegisterVehicle**: 톤수/형태 필드 추가, Vehicle 타입 통합
- **ManageMaster**: 차량 관리 메뉴 활성화

### ⚙️ Not Changed (유지)
- 기존 거래처/계량현황 업로드 기능 유지
- PartnerManage 등 기존 관리 페이지 유지
- 기존 폴더 구조 유지

---

## Files Changed

### 📦 신규 생성 (8개)
1. `src/app/pages/home/excel/vehicle/vehicleTypes.ts` - Vehicle 타입 정의
2. `src/app/pages/home/excel/vehicle/vehicleExcelTypes.ts` - 파싱 결과 타입
3. `src/app/pages/home/excel/vehicle/vehicleExcelParser.ts` - 엑셀 파싱 로직
4. `src/app/pages/home/excel/vehicle/VehicleUploadPanel.tsx` - 업로드 패널 UI
5. `src/app/pages/manage/master/VehicleManage.tsx` - 차량 관리 페이지
6. `tools/read_vehicle_excel.mjs` - 엑셀 구조 분석 스크립트 (개발용)
7. `docs/result/Vehicle_ExcelImport_And_Manage_MVP_result.md` - 이 문서

### ✏️ 수정 (4개)
1. `src/app/pages/home/ExcelImportHub.tsx` - 차량 업로드 섹션 추가
2. `src/app/pages/manage/ManageMaster.tsx` - 차량 관리 메뉴 활성화
3. `src/app/pages/register/RegisterVehicle.tsx` - tonClass/bodyType 필드 추가
4. `src/data/localRepo.ts` - vehicles() 메서드 (이미 존재, 재사용)

### 🗑️ 제거 (1개)
1. `src/data/vehicleRepo.ts` - 불필요한 파일 삭제 (LocalRepo.vehicles()로 대체)

---

## Build Status
✅ **PASS** (576ms, 844.12 kB)

```bash
$ npm run build
rolldown-vite v7.2.5 building client environment for production...
✓ 112 modules transformed.
dist/index.html                 0.45 kB │ gzip:   0.29 kB
dist/assets/index-CpLyONRT.css  5.08 kB │ gzip:   1.59 kB
dist/assets/index-SxHwrHxn.js   844.12 kB │ gzip: 241.41 kB
✓ built in 576ms
```

---

## 파싱 규칙 요약

### 입력 파일
- **경로**: `company-docs/1/차량관리.xls.xlsx`
- **시트명**: "차량관리" (또는 첫 시트)
- **헤더 행**: 2번째 행(index 1) - "차량번호", "차량규격", "차량종류"

### 정규화 규칙

#### 1. 톤수 (차량규격 → tonClass)
| 입력 값 | 출력 값 |
|---------|---------|
| 0.5     | 1t      |
| 1, 1.0  | 1t      |
| 5, 5.0  | 5t      |
| 25, 25.0 | 25t     |
| 그 외   | "" (미완성) |

#### 2. 형태 (차량종류 → bodyType)
| 입력 값 | 출력 값 |
|---------|---------|
| "카고" 포함 (예: "01:카고") | 카고 |
| "윙" 포함   | 윙   |
| "방통" 포함 | 방통 |
| 그 외 (예: "06:기타") | "" (미완성) |

#### 3. 차량번호 (필수)
- 공백 제거
- 빈값이면 FAIL

### 검증/상태 분류

| 상태 | 조건 | 등록 여부 |
|------|------|----------|
| **OK** | vehicleNo 존재 + 중복 없음 + tonClass/bodyType 모두 존재 | ✅ 등록 |
| **INCOMPLETE** | vehicleNo OK + (tonClass="" OR bodyType="") | ✅ 등록 (수동 보완) |
| **FAIL** | vehicleNo 없음 OR 중복 충돌 | ❌ 제외 |

### 적용 정책
- ✅ **OK + INCOMPLETE 건만 등록** (FAIL 제외)
- 🔸 **INCOMPLETE 건은 "미완성" 배지** 표시, 관리 페이지에서 수동 보완 가능
- ❌ **FAIL 건은 콘솔에 로그만** 출력, DB 저장 안 함

---

## 관리 기능 체크

### ✅ 리스트
- 전체 차량 조회
- 컬럼: 차량번호 / 톤수 / 형태 / 운송사 / 기사 / 연락처 / 상태 / 출처 / 작업

### ✅ 필터
- **전체**: 모든 차량
- **미완성**: tonClass="" OR bodyType=""
- **완료**: tonClass AND bodyType 존재

### ✅ 수정
- row 클릭 → 간편 수정 폼 (tonClass/bodyType 드롭다운 포함)
- 저장 후 리스트 즉시 갱신

### ✅ 삭제
- 각 row에 "삭제" 버튼
- confirm 확인 후 삭제
- localStorage에서 즉시 제거

### ✅ 배지
- **완료** (파랑): tonClass + bodyType 둘 다 존재
- **미완성** (빨강): 둘 중 하나라도 비어있음

---

## Next Step (1개)
**차량-물류 연계 기능 추가 (LinkPicker 활용)**
- 일일기록 > 물류 등록 시 차량 선택 가능하도록 연계
- 조회 화면에서 차량별 물류 이력 추적 가능

---

<details>
<summary>Appendix (상세 정보)</summary>

## A. 헤더 Alias 표

| 엑셀 헤더 | 내부 필드명 | 설명 |
|-----------|-------------|------|
| 차량번호   | vehicleNo   | 필수, 고유키 |
| 차량규격   | tonClass    | 톤수 (정규화 후) |
| 차량종류   | bodyType    | 형태 (정규화 후) |
| 운전자     | (미사용)    | 엑셀에서 파싱 안 함 |
| 거래처     | (미사용)    | 엑셀에서 파싱 안 함 |

**Note**: 운송사/기사명/연락처는 엑셀에 없으므로 관리 페이지에서 수동 입력

---

## B. 미완성/FAIL/OK 분류 기준

### 🟢 OK (완전 성공)
```typescript
vehicleNo: "12가3456"
tonClass: "1t"
bodyType: "카고"
errors: []
warnings: []
→ 상태: OK → DB 저장 즉시 가능
```

### 🟡 INCOMPLETE (부분 성공, 미완성)
```typescript
vehicleNo: "37나0104"
tonClass: "1t"
bodyType: "" // 미완성
errors: []
warnings: ["형태 미완성 (수동 입력 필요)"]
→ 상태: INCOMPLETE → DB 저장 → 관리에서 보완
```

### 🔴 FAIL (실패)
```typescript
// Case 1: 차량번호 없음
vehicleNo: ""
errors: ["차량번호 필수"]
→ 상태: FAIL → DB 저장 안 함

// Case 2: 중복
vehicleNo: "12가3456" (엑셀 내부 2회 이상 OR DB에 이미 존재)
errors: ["엑셀 내부 중복 (12가3456)"]
→ 상태: FAIL → DB 저장 안 함
```

---

## C. 삭제 확인 UX

### 1. confirm 다이얼로그
```javascript
confirm(`차량 "${vehicleNo}"을(를) 삭제하시겠습니까?`)
```

### 2. 즉시 삭제
- OK 클릭 → localStorage에서 즉시 제거
- 리스트 즉시 갱신

### 3. 복구 불가
- **주의**: 삭제 후 복구 불가 (백업 기능 없음)
- 추후 "휴지통" 기능 추가 고려

---

## D. 테스트 케이스

### Case 1: 0.5톤 차량
```json
{
  "차량번호": "123",
  "차량규격": 0.5,
  "차량종류": "06:기타"
}
```
**결과**:
- vehicleNo: "123"
- tonClass: "1t" (0.5 → 1t 정규화)
- bodyType: "" (기타 → 미완성)
- status: INCOMPLETE
- ✅ 등록 가능 (미완성)

### Case 2: 카고 차량
```json
{
  "차량번호": "37나0104",
  "차량규격": 5,
  "차량종류": "01:카고"
}
```
**결과**:
- vehicleNo: "37나0104"
- tonClass: "5t"
- bodyType: "카고"
- status: OK
- ✅ 등록 가능 (완료)

### Case 3: 중복 번호
```json
// 엑셀 내부에 "12가3456"이 2회 이상 OR DB에 이미 존재
{
  "차량번호": "12가3456",
  "차량규격": 1,
  "차량종류": "01:카고"
}
```
**결과**:
- status: FAIL
- errors: ["엑셀 내부 중복 (12가3456)"] OR ["DB 충돌 (12가3456)"]
- ❌ 등록 불가

### Case 4: 빈 번호
```json
{
  "차량번호": "",
  "차량규격": 1,
  "차량종류": "01:카고"
}
```
**결과**:
- status: FAIL
- errors: ["차량번호 필수"]
- ❌ 등록 불가

---

## E. 파일 구조 (신규)

```
src/app/pages/home/excel/vehicle/
├── vehicleTypes.ts           # Vehicle 타입, TonClass, BodyType
├── vehicleExcelTypes.ts      # VehicleExcelRow, VehicleParsedRow, VehicleParseResult
├── vehicleExcelParser.ts     # parseVehicleExcel() 함수
└── VehicleUploadPanel.tsx    # 업로드 UI (파일 선택 → 파싱 → 미리보기 → 적용)

src/app/pages/manage/master/
└── VehicleManage.tsx          # 리스트/필터/수정/삭제 페이지

src/app/pages/register/
└── RegisterVehicle.tsx        # 신규 등록 페이지 (tonClass/bodyType 추가)
```

---

## F. 데이터 모델

```typescript
interface Vehicle {
  id: string;                      // uuid
  vehicleNo: string;               // 차량번호 (필수/고유)
  tonClass: "1t" | "5t" | "25t" | ""; // 톤수
  bodyType: "카고" | "윙" | "방통" | ""; // 형태
  carrierName?: string;            // 운송사
  driverName?: string;             // 기사명
  driverPhone?: string;            // 기사 연락처
  tagsText?: string;               // 태그 (UI 입력용)
  memo?: string;                   // 참고사항
  source?: "excel" | "manual";     // 등록 출처
  createdAt: string;               // ISO date
  updatedAt: string;               // ISO date
}
```

**저장소 키**: `local_vehicles_v1` (localStorage)

---

## G. 파싱 흐름 (순서도)

```
1. 파일 선택 (.xlsx/.xls)
   ↓
2. FileReader.readAsBinaryString()
   ↓
3. XLSX.read() → workbook
   ↓
4. 시트 선택 ("차량관리" 우선 OR 첫 시트)
   ↓
5. 헤더 행 찾기 (findHeaderRow: "차량번호" 포함 행)
   ↓
6. XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex })
   ↓
7. 각 row마다 파싱/검증:
   - vehicleNo 정규화 (공백 제거)
   - tonClass 정규화 (0.5→1t, 5→5t, ...)
   - bodyType 정규화 ("카고" 포함 → "카고", ...)
   - 중복 검증 (엑셀 내부 + DB 충돌)
   - 상태 결정 (OK / INCOMPLETE / FAIL)
   ↓
8. VehicleParsedRow[] 생성
   ↓
9. VehicleParseResult 반환 (통계 포함)
   ↓
10. UI 미리보기 (최근 20건)
   ↓
11. 적용 버튼 클릭 → FAIL 제외, OK+INCOMPLETE만 repo.vehicles().setAll()
   ↓
12. 완료 (콘솔 로그 + alert)
```

---

## H. 주의사항 / Known Issues

### 1. 중복 정책
- **엑셀 내부 중복**: 같은 차량번호가 2번 이상 나오면 모두 FAIL
- **DB 충돌**: 기존 DB에 있는 차량번호는 FAIL (덮어쓰기 X)
- **추후 개선**: "덮어쓰기" 옵션 추가 고려 (사용자 선택)

### 2. 미완성 건 처리
- INCOMPLETE 건은 "미완성" 배지로 표시
- 관리 페이지에서 수동 보완 필요
- **권장**: 엑셀 업로드 전에 데이터 정제 (톤수/형태 명확히)

### 3. 기존 데이터 마이그레이션
- **기존 차량 데이터 있는 경우**: 수동으로 tonClass/bodyType 보완 필요
- 기존 `local_vehicles_v1` 키는 그대로 사용 → 호환성 유지

### 4. 삭제 복구 불가
- 삭제 시 localStorage에서 즉시 제거
- 백업 기능 없음 → 신중히 삭제

---

## I. 검증 체크리스트

- [x] 엑셀 업로드 → 파싱 → 미리보기 → 적용 흐름 완료
- [x] 0.5톤 → 1t 정규화 확인
- [x] "카고" 포함 → "카고" 정규화 확인
- [x] "06:기타" → 미완성("") 정규화 확인
- [x] 중복 차량번호 FAIL 처리 확인
- [x] 빈 차량번호 FAIL 처리 확인
- [x] OK + INCOMPLETE만 등록 확인
- [x] 관리 페이지 리스트 표시 확인
- [x] 미완성/완료 필터 동작 확인
- [x] 수정 기능 (간편 폼) 동작 확인
- [x] 삭제 기능 (confirm) 동작 확인
- [x] 신규 등록 페이지 tonClass/bodyType 필드 확인
- [x] 빌드 성공 확인 (576ms, 844.12 kB)

---

## J. 개발 시간 로그

| 단계 | 작업 내용 | 소요 시간 (추정) |
|------|-----------|-----------------|
| 1 | 엑셀 파일 구조 분석 | 10분 |
| 2 | Vehicle 타입 정의 | 5분 |
| 3 | vehicleParser 생성 (파싱 규칙) | 30분 |
| 4 | VehicleUploadPanel 생성 (UI) | 40분 |
| 5 | ExcelImportHub 통합 | 15분 |
| 6 | VehicleManage 페이지 생성 | 45분 |
| 7 | ManageMaster 연동 | 10분 |
| 8 | RegisterVehicle 수정 | 30분 |
| 9 | 빌드 검증 + 버그 수정 | 25분 |
| 10 | 결과 문서 작성 | 20분 |
| **총계** | | **3시간 50분** |

---

## K. 참고 파일 (원본)

- **엑셀 원본**: `company-docs/1/차량관리.xls.xlsx`
- **개발 스크립트**: `tools/read_vehicle_excel.mjs`
- **Contract SSOT**: `docs/CONTRACT_SSOT.md`

---

</details>

---

**문서 작성일**: 2026-02-06  
**작성자**: GitHub Copilot (AI)  
**빌드 상태**: ✅ PASS (576ms)
