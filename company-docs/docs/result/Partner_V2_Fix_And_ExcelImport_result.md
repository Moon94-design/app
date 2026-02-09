# Partner V2 — 흰페이지 수정 + 엑셀 업로드 + Manage 구조 변경

**2025-02-06** | Phase: Partner V2 Fix + Excel Import + Manage Structure

---

## TL;DR

**흰페이지 해결**: localStorage draft의 구 버전(tradeProfiles 없음) → undefined.map() 에러 → 마이그레이션 추가로 해결. **엑셀 업로드 MVP-1**: 거래처 엑셀(.xlsx) → 파싱/검증 → 미리보기 → 적용(일괄 등록) 구현. Policy A(All-or-Nothing), Error(충돌 거부) 적용. **Manage 구조**: ManageMaster → 하위 메뉴(거래처관리/차량관리 등) 분리, PartnerManage에서 리스트+필터+엑셀 관리. 빌드 PASS (552ms, 780.97 kB).

---

## 📋 Summary

### Changed

**A) 흰페이지 수정** ([RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx)):
- **원인**: localStorage의 구 버전 draft에 `tradeProfiles` 필드 없음 → `draft.extra.tradeProfiles.map()` 실행 시 `undefined.map()` 에러
- **수정**: useState 초기화 시 마이그레이션 추가
  - `tradeProfiles` 없으면 빈 배열로 초기화
  - `importance`, `relationshipStatus` 없으면 "중"으로 초기화
- **결과**: 신규 등록(mode="create"), 관리 수정(mode="edit") 모두 정상 렌더링

**B) 엑셀 업로드 (MVP-1)** — 4개 파일 추가:

1. **partnerExcelTypes.ts** (신규): 타입 정의
   - `PartnerExcelRow`: 엑셀 원본 행 (한국어 헤더)
   - `PartnerParsedRow`: 파싱 결과 (rowIndex, status, errors, data)
   - `PartnerParseResult`: 전체 결과 (total, ok, fail, duplicates, dbConflicts)

2. **partnerExcelParser.ts** (신규, 143 lines): 파싱/검증 로직
   - xlsx 라이브러리 사용
   - **컬럼 헤더 alias 매핑**: 거래처코드, 거래처명, 대표자명, 전화, 우편번호, 주소, 상세주소, 담당자, 핸드폰, 사업자번호
   - **필수 검증**: partnerCode, partnerName 필수
   - **중복 검증**: 엑셀 내부 중복, DB 충돌 (existingCodes)
   - **정책**: Policy A (All-or-Nothing) — FAIL 1건이라도 있으면 전체 저장 거부

3. **PartnerExcelUploadPanel.tsx** (신규, 200 lines): 업로드 UI
   - 파일 선택(.xlsx)
   - 파싱 & 검증 버튼
   - 결과 미리보기: 총/OK/FAIL 카운트, 중복/충돌 목록, FAIL 행 상세
   - 적용 버튼: FAIL 있으면 비활성, OK만 있으면 활성화
   - **적용 시**: partners_v2에 일괄 저장, extra는 기본값 (빈 note, 중요도=중, relationshipStatus=중, tradeProfiles=[])

4. **PartnerManage.tsx** (신규, 150 lines): 거래처 관리 페이지
   - 엑셀 업로드 패널 (상단)
   - 필터: 전체/미입력/완료 (기존 ManageMaster 부분 이동)
   - 리스트: 거래처명 + 완료 배지 + 주소 + 수정 버튼
   - row 클릭 → RegisterPartnerV2 수정 모드(mode="edit")
   - **엑셀 적용 후**: 자동 갱신 + 미입력 필터 ON

**C) Manage 구조 변경** ([ManageMaster.tsx](../src/app/pages/manage/ManageMaster.tsx)):
- **이전**: partners_v2 목록/필터 직접 표시
- **이후**: 하위 메뉴 선택 → PartnerManage 표시
- **메뉴 구조**:
  - 거래처 관리 (활성화, PartnerManage로 이동)
  - 차량 관리 (placeholder, 추후 구현)
  - 직원 관리 (placeholder, 추후 구현)
  - 설비 관리 (placeholder, 추후 구현)

### Not Changed

- 기존 RegisterPartner (레거시): 동작 변경 0
- partners 키, repo.partners() 메서드: 유지
- keys.ts, localRepo.ts: 변경 없음
- 완료 기준 (note 기준): 변경 없음

---

## 📄 Files Changed

| File | Lines | Status | Description |
|------|-------|--------|-------------|
| [RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx) | +13 | ✅ Modified | draft 마이그레이션 추가 (tradeProfiles, importance, relationshipStatus) |
| [partnerExcelTypes.ts](../src/app/pages/manage/master/excel/partnerExcelTypes.ts) | 40 | ✅ New | 엑셀 타입 정의 |
| [partnerExcelParser.ts](../src/app/pages/manage/master/excel/partnerExcelParser.ts) | 143 | ✅ New | 파싱/검증 로직 (Policy A, Error) |
| [PartnerExcelUploadPanel.tsx](../src/app/pages/manage/master/excel/PartnerExcelUploadPanel.tsx) | 200 | ✅ New | 엑셀 업로드 UI |
| [PartnerManage.tsx](../src/app/pages/manage/master/PartnerManage.tsx) | 150 | ✅ New | 거래처 관리 페이지 (리스트+필터+엑셀) |
| [ManageMaster.tsx](../src/app/pages/manage/ManageMaster.tsx) | ~80 | ✅ Rewritten | 하위 메뉴 구조로 변경 |

**Total**: 6 files (+533 lines)

---

## 🧪 Build Gate

### 최종 빌드 결과

```bash
$ npm run build
> company-docs@0.0.0 build
> tsc -b && vite build

rolldown-vite v7.2.5 building client environment for production...
✓ 101 modules transformed.
dist/index.html                 0.45 kB │ gzip:   0.29 kB
dist/assets/index-CpLyONRT.css  5.08 kB │ gzip:   1.59 kB
dist/assets/index-vaESSZlY.js   780.97 kB │ gzip: 229.56 kB
✓ built in 552ms
```

**상태**: ✅ **PASS** (552ms, 780.97 kB)

**TypeScript**: 0 errors  
**Vite**: 0 errors

---

## ✅ 확인 체크리스트

- ✅ **흰페이지 해결**: RegisterPartnerV2 진입 시 정상 렌더링 (신규/수정 모드 모두)
- ✅ **엑셀 업로드**: 파싱 → 검증 → 미리보기 → 적용 (일괄 등록) 동작
- ✅ **실제 등록 확인**: 엑셀 3건 업로드 → partners_v2 저장 → 리스트에서 확인 가능 (미입력 배지)
- ✅ **Manage 구조**: ManageMaster → 거래처 관리 → PartnerManage (리스트+필터+엑셀)
- ✅ **완료 배지/필터**: note 기준 (미입력=빨강, 완료=파랑) 동작

---

## 📝 Next Steps

**단기**: 엑셀 템플릿 다운로드 기능 추가 (사용자 편의)

**중기**: 
- 업로드 로그 기록 (감사/추적)
- 충돌 정책 옵션 (Update/Skip/Rename)
- 차량/직원/설비 엑셀 업로드

---

<details>
<summary>📂 Appendix (세부 사항)</summary>

## A) 흰페이지 원인 및 수정

### 원인

**에러 메시지** (콘솔):
```
TypeError: Cannot read properties of undefined (reading 'map')
```

**발생 위치**: [RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx) L260
```typescript
{draft.extra.tradeProfiles.map((profile, idx) => (
  // ...
))}
```

**근본 원인**:
- Phase2+3에서 `tradeProfile` (단수, 체크박스 배열) → `tradeProfiles` (복수, 조합 리스트)로 변경
- localStorage에 저장된 기존 draft는 구 버전 구조 (`tradeProfile` 존재, `tradeProfiles` 없음)
- `loadJson(KEY_DRAFT, defaultPartnerV2Draft())`는 파싱 성공하지만, `tradeProfiles` 필드가 없어서 `undefined`
- `draft.extra.tradeProfiles.map()` 실행 시 `undefined.map()` 에러 → 흰 화면

### 수정

**Before**:
```typescript
const [draft, setDraft] = useState<PartnerV2Draft>(() => {
  if (mode === "edit" && partnerId) {
    // ...
  }
  return loadJson(KEY_DRAFT, defaultPartnerV2Draft());
});
```

**After**:
```typescript
const [draft, setDraft] = useState<PartnerV2Draft>(() => {
  if (mode === "edit" && partnerId) {
    // ...
  }
  const loaded = loadJson(KEY_DRAFT, defaultPartnerV2Draft());
  
  // 마이그레이션: 구 버전 draft 호환
  if (!loaded.extra.tradeProfiles) {
    loaded.extra.tradeProfiles = [];
  }
  if (!loaded.extra.importance) {
    loaded.extra.importance = "중";
  }
  if (!loaded.extra.relationshipStatus) {
    loaded.extra.relationshipStatus = "중";
  }
  
  return loaded;
});
```

**효과**:
- 구 버전 draft 로드 시 자동으로 새 필드 추가
- 신규/수정 모드 모두 정상 렌더링

## B) 엑셀 업로드 상세

### 컬럼 헤더 alias 매핑

| 엑셀 헤더 (한국어) | 필드명 (PartnerBase) | 필수 |
|-------------------|---------------------|------|
| 거래처코드 | partnerCode | ✅ |
| 거래처명 | partnerName | ✅ |
| 대표자명 | ceoName | |
| 전화 | phone | |
| 우편번호 | zip | |
| 주소 | addr1 | |
| 상세주소 | addr2 | |
| 담당자 | contactName | |
| 핸드폰 | contactPhone | |
| 사업자번호 | businessNo | |

### 정책

**Policy A (All-or-Nothing)**:
- FAIL 행이 1건이라도 있으면 전체 저장 거부
- "적용" 버튼: FAIL > 0이면 비활성화
- 사용자 안내: "FAIL 행이 있어 등록할 수 없습니다. 엑셀을 수정 후 다시 업로드하세요."

**충돌 정책 (Error)**:
- **엑셀 내부 중복**: 같은 파일 내에 동일 partnerCode 2개 이상 → FAIL
- **DB 충돌**: 기존 partners_v2에 이미 존재하는 partnerCode → FAIL
- 충돌 발생 시: 에러 미리보기에 표시, 저장 거부

### 검증 규칙

1. **필수 필드**: partnerCode, partnerName
2. **중복 검증**: 엑셀 내부 + DB (existingCodes)
3. **데이터 타입**: 모든 필드 String으로 변환 (trim 적용)

### 적용 후 동작

```typescript
// 적용 시 (PartnerManage.tsx)
const newPartners: PartnerV2[] = result.rows
  .filter((r) => r.status === "OK" && r.data)
  .map((r) => ({
    id: newId(),
    base: r.data!, // 엑셀에서 파싱한 Base 정보
    extra: {
      note: "", // 빈값 (미입력 상태)
      contactMemo: "",
      importance: "중",
      relationshipStatus: "중",
      tradeProfiles: [],
      custom: {},
    },
    createdAt: now,
    updatedAt: now,
  }));

// [신규 거래처, ...기존 거래처] 순서로 저장
repo.partners_v2<PartnerV2>().setAll([...newPartners, ...partners]);

// 미입력 필터 자동 ON
setFilter("incomplete");
```

**결과**:
- 업로드된 거래처는 모두 "미입력(빨강)" 배지
- 사용자는 거래처 관리 리스트에서 row 클릭 → RegisterPartnerV2 수정 모드로 Extra 정보 보완

## C) Manage 구조 변경

### 변경 전 (ManageMaster)

```
기준정보 관리
├── 필터 (전체/미입력/완료)
├── partners_v2 리스트
└── row 클릭 → RegisterPartnerV2 수정 모드
```

### 변경 후 (ManageMaster → PartnerManage)

```
기준정보 관리 (ManageMaster)
├── 거래처 관리 (클릭) → PartnerManage
│   ├── 엑셀 업로드 패널
│   ├── 필터 (전체/미입력/완료)
│   ├── partners_v2 리스트
│   └── row 클릭 → RegisterPartnerV2 수정 모드
├── 차량 관리 (placeholder)
├── 직원 관리 (placeholder)
└── 설비 관리 (placeholder)
```

**장점**:
- 기준정보 종류별로 확장 가능 (차량/직원/설비 등)
- 각 관리 페이지에 엑셀 업로드 기능 독립 적용 가능
- ManageMaster는 메뉴 선택만 담당 (단순화)

## 엑셀 템플릿 예시

| 거래처코드 | 거래처명 | 대표자명 | 전화 | 우편번호 | 주소 | 상세주소 | 담당자 | 핸드폰 | 사업자번호 |
|-----------|---------|---------|------|---------|------|---------|--------|--------|-----------|
| P001 | (주)테스트 | 홍길동 | 02-1234-5678 | 12345 | 서울시 강남구 | 테헤란로 123 | 김담당 | 010-1234-5678 | 123-45-67890 |
| P002 | 샘플업체 | 이대표 | 031-111-2222 | 54321 | 경기도 성남시 | 분당구 정자동 | 박담당 | 010-9876-5432 | 987-65-43210 |

**사용법**:
1. 엑셀에서 위 형식으로 작성
2. .xlsx 파일로 저장
3. 거래처 관리 → 엑셀 업로드 → 파일 선택
4. 파싱 & 검증 → 결과 확인
5. FAIL 없으면 "적용" 버튼 클릭

</details>
