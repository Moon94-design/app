# Partner V2 MVP 구현 결과

**2025-02-02** | Phase: Partner V2 (Base + Extra 분리)

---

## 📋 Summary

**목표**: 거래처 기준정보 V2 — Base(읽기 전용) + Extra(웹앱 편집) 분리, 관리 리스트에 완료표식/필터 추가

**결과**: ✅ **성공** — 기존 RegisterPartner 동작 유지, V2 화면 병렬 추가, 빌드 PASS

---

## 🎯 What Changed

### 신규 추가 파일 (4개)

1. **partnerV2Types.ts** (91 lines)
   - `PartnerBase`: 10개 필드 (partnerCode, partnerName, ceoName, phone, zip, addr1, addr2, contactName, contactPhone, businessNo)
   - `PartnerExtra`: 4개 필드 (note(필수), contactMemo, tradeProfile, custom)
   - `TradeProfile`: direction(매입/매출), item(PP/PE), kind(압축/분쇄/펠렛) 체크박스 배열
   - `isCompleted()`: note 비어있지 않으면 true (완료 기준)
   - `defaultPartnerV2Draft()`: 초기값

2. **RegisterPartnerV2.tsx** (418 lines)
   - Base 섹션: 읽기 전용 (3개 row: 코드/명/대표, 연락처/주소, 담당자/휴대폰/사업자)
   - Extra 섹션: 편집 가능
     - note (textarea 4 rows, 필수)
     - contactMemo (textarea 2 rows, 선택)
     - tradeProfile (체크박스 3그룹)
   - 완료 배지: 상단 (빨강=미입력, 파랑=완료)
   - 저장/초기화 버튼
   - 최근 등록 5개 (완료 배지 + 불러오기)
   - onClose prop 지원 (← 돌아가기 버튼)

### 기존 파일 수정 (4개, 최소 변경)

3. **keys.ts** (+1 line)
   - `partners_v2: "local_partners_v2_extended"` 추가 (기존 partners 키 유지)

4. **localRepo.ts** (+1 line)
   - `partners_v2<T>()` 메서드 추가 (기존 partners() 유지)

5. **RegisterPartner.tsx** (+7 lines)
   - import RegisterPartnerV2
   - useState showV2
   - if (showV2) return V2 화면
   - 타이틀 옆 "V2 (Base+Extra) 열기" 버튼 추가
   - **기존 동작 변경 0** (기능 변경 0 원칙 준수)

6. **ManageMaster.tsx** (전체 재작성, 기존 placeholder → 실제 구현)
   - partners_v2 목록 표시
   - 각 row에 완료 배지 (빨강=미입력, 파랑=완료)
   - 상단 필터: 전체 / 미입력만 / 완료만 (개수 표시)
   - row 클릭 시 RegisterPartnerV2 수정 모드 열기

---

## 🧪 Build Gate

### 최종 빌드 결과

```bash
$ npm run build
> company-docs@0.0.0 build
> tsc -b && vite build

rolldown-vite v7.2.5 building client environment for production...
✓ 98 modules transformed.
dist/index.html                 0.45 kB │ gzip:   0.29 kB
dist/assets/index-CpLyONRT.css  5.08 kB │ gzip:   1.59 kB
dist/assets/index-D9-cimjE.js   771.37 kB │ gzip: 227.46 kB
✓ built in 556ms
```

**상태**: ✅ **PASS** (556ms, 771.37 kB)

**TypeScript**: 0 errors  
**Vite**: 0 errors  
**Chunk Size**: 771.37 kB (Phase5-1 대비 +10 kB, xlsx 라이브러리 포함)

---

## 🔧 Technical Details

### 데이터 모델

**PartnerBase** (엑셀에서 들어오는 정보, 읽기 전용):
```typescript
{
  partnerCode: string;    // 거래처코드
  partnerName: string;    // 거래처명
  ceoName: string;        // 대표자명
  phone: string;          // 연락처
  zip: string;            // 우편번호
  addr1: string;          // 주소1
  addr2: string;          // 주소2
  contactName: string;    // 담당자명
  contactPhone: string;   // 담당자 휴대폰
  businessNo: string;     // 사업자번호
}
```

**PartnerExtra** (웹앱에서 추가 입력):
```typescript
{
  note: string;           // 필수 (완료 기준)
  contactMemo: string;    // 담당자 메모
  tradeProfile: {         // 거래 유형
    direction: ("매입" | "매출")[];
    item: ("PP" | "PE")[];
    kind: ("압축" | "분쇄" | "펠렛")[];
  };
  custom: Record<string, any>; // 확장용
}
```

**완료 기준**: `extra.note.trim().length > 0` → 파랑 배지, 아니면 빨강 배지

### 저장소

- **repo key**: `partners_v2` → `"local_partners_v2_extended"`
- **기존 partners 키**: 변경 없음 (병렬 추가)
- **draft key**: `"draft_partner_v2"` (localStorage 개인 임시저장)

### UI 흐름

1. **등록 화면** ([RegisterPartner.tsx](../src/app/pages/register/RegisterPartner.tsx))
   - 기존 화면 유지 (401 lines, 변경 0)
   - 타이틀 옆 "V2 (Base+Extra) 열기" 버튼
   - 클릭 시 RegisterPartnerV2 표시 (기존 화면 숨김)
   
2. **V2 화면** ([RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx))
   - Base 섹션: 읽기 전용 표시 (안내: "※ Base 정보는 엑셀에서 수정합니다")
   - Extra 섹션: 편집 가능 (note 필수)
   - 완료 배지: 상단 표시
   - 저장 → repo.partners_v2().setAll()
   - 최근 등록 5개 (완료 배지 + 불러오기)
   
3. **관리 리스트** ([ManageMaster.tsx](../src/app/pages/manage/ManageMaster.tsx))
   - 상단 필터: 전체(N) / 미입력(N) / 완료(N)
   - 각 row: 거래처명(코드) + 주소 + 완료 배지 + 수정 버튼
   - row 클릭 시 RegisterPartnerV2 수정 모드 열기

---

## ⚠️ Risks & Constraints

### 준수한 계약 사항

- ✅ **기능 변경 0**: RegisterPartner.tsx 동작 유지 (기존 401 lines 보존)
- ✅ **삭제/정리 금지**: 기존 partners 키, repo.partners() 메서드 유지
- ✅ **빌드 게이트**: 각 Step마다 npm run build 검증
- ✅ **단계 작업**: Step 1-3 순차 진행, 각 단계 완료 후 다음 단계 시작

### 알려진 제약

1. **Base 정보 입력**: 현재 UI에서 Base 입력 불가 (엑셀 전용)
   - 해결: 나중에 엑셀 업로드 MVP-1에서 Base 정보 입력 구현 예정
   
2. **repo.partners_v2()**: ListRepo<T> 인터페이스 사용 (get(), put() 메서드 없음)
   - 해결: getAll().find(), setAll(map()) 패턴으로 구현
   
3. **대용량 목록**: partners_v2가 많아지면 ManageMaster 성능 저하 가능
   - 해결: 나중에 페이지네이션 또는 가상 스크롤 추가 고려

---

## 📝 Next Steps

### 단기 (Phase5-2: 엑셀 업로드 MVP-1)

1. **Base 정보 입력**: 엑셀 파일 업로드 → partners_v2 생성
   - EXCEL_CONTRACT에 따라 Base 필드 10개 매핑
   - 중복 거래처코드 검증
   - 업로드 후 Base 정보 자동 채움 (Extra는 비어있음)
   
2. **완료 안내**: 업로드 후 "N개 거래처 등록 완료. 이제 Extra 정보를 입력하세요."
   - ManageMaster로 자동 이동 (미입력 필터 활성화)

### 중기

3. **Base 정보 수정**: 웹앱에서 Base 정보 수정 UI 추가 (읽기 전용 해제)
   - 권한 관리: 관리자만 Base 수정 가능
   
4. **V2 정식화**: RegisterPartner.tsx 제거, RegisterPartnerV2로 완전 교체
   - 기존 partners 데이터 마이그레이션 (Base + Extra 분리)

### 장기

5. **서버 이식**: LocalRepo → ServerRepo 전환
   - partners_v2 API: GET /partners_v2, POST /partners_v2/:id
   - Base 정보는 관리자만 수정, Extra는 일반 사용자 편집 가능

---

## 📊 File Changes Summary

| File | Lines | Status | Description |
|------|-------|--------|-------------|
| [partnerV2Types.ts](../src/app/pages/register/partner/partnerV2Types.ts) | 91 | ✅ New | 타입 정의 (Base, Extra, isCompleted) |
| [RegisterPartnerV2.tsx](../src/app/pages/register/partner/RegisterPartnerV2.tsx) | 418 | ✅ New | V2 등록/상세 화면 |
| [keys.ts](../src/data/keys.ts) | +1 | ✅ Modified | partners_v2 키 추가 |
| [localRepo.ts](../src/data/localRepo.ts) | +1 | ✅ Modified | partners_v2() 메서드 추가 |
| [RegisterPartner.tsx](../src/app/pages/register/RegisterPartner.tsx) | +7 | ✅ Modified | V2 버튼 추가 (기존 동작 유지) |
| [ManageMaster.tsx](../src/app/pages/manage/ManageMaster.tsx) | ~100 | ✅ Modified | 배지 + 필터 구현 |

**Total**: 6 files, +617 lines (net)

---

## 🎉 Conclusion

**Partner V2 MVP 완료**: Base(읽기) + Extra(편집) 분리, 관리 리스트 완료표식/필터

**기존 코드 보존**: RegisterPartner.tsx 동작 변경 0 (계약 준수)

**빌드 상태**: ✅ PASS (556ms, 771.37 kB)

**다음 작업**: Phase5-2 (엑셀 업로드 MVP-1) — Base 정보 자동 입력, 중복 검증, 완료 안내

---

<details>
<summary>📂 Phase5-0/5-1 참조 (접기)</summary>

- Phase5-0 완료: EXCEL_CONTRACT.md, TEMPLATE_PRODUCTION_LINES.xlsx
- Phase5-1 완료: 엑셀 업로드 MVP-0 (파싱/검증/미리보기)
  - xlsx 라이브러리 설치 (761.19 kB)
  - excelParser, validator, ExcelUploadPanel
  - RegisterProductionDaily 통합
  - 빌드 PASS (516ms)

</details>

<details>
<summary>🔍 PartnerV2 타입 상세 (접기)</summary>

```typescript
// partnerV2Types.ts (91 lines)

export type PartnerBase = {
  partnerCode: string;    // 거래처코드
  partnerName: string;    // 거래처명
  ceoName: string;        // 대표자명
  phone: string;          // 연락처
  zip: string;            // 우편번호
  addr1: string;          // 주소1
  addr2: string;          // 주소2
  contactName: string;    // 담당자명
  contactPhone: string;   // 담당자 휴대폰
  businessNo: string;     // 사업자번호
};

export type TradeProfile = {
  direction: ("매입" | "매출")[];
  item: ("PP" | "PE")[];
  kind: ("압축" | "분쇄" | "펠렛")[];
};

export type PartnerExtra = {
  note: string;           // 필수 (완료 기준)
  contactMemo: string;    // 담당자 메모
  tradeProfile: TradeProfile;
  custom: Record<string, any>;
};

export type PartnerV2 = {
  id: string;
  base: PartnerBase;
  extra: PartnerExtra;
  createdAt: string;
  updatedAt: string;
};

export type PartnerV2Draft = {
  base: PartnerBase;
  extra: PartnerExtra;
};

export function isCompleted(extra: PartnerExtra): boolean {
  return extra.note.trim().length > 0;
}

export function defaultPartnerV2Draft(): PartnerV2Draft {
  return {
    base: {
      partnerCode: "",
      partnerName: "",
      ceoName: "",
      phone: "",
      zip: "",
      addr1: "",
      addr2: "",
      contactName: "",
      contactPhone: "",
      businessNo: "",
    },
    extra: {
      note: "",
      contactMemo: "",
      tradeProfile: {
        direction: [],
        item: [],
        kind: [],
      },
      custom: {},
    },
  };
}
```

</details>

<details>
<summary>🖼️ UI 스크린샷 (접기, 실제 스크린샷 없음)</summary>

**RegisterPartnerV2 화면**:
- 타이틀: "거래처 V2 (Base + Extra)" + 완료 배지 + ← 돌아가기
- Base 섹션: 3개 row (읽기 전용)
- Extra 섹션: note (textarea 4 rows, 필수) + contactMemo + tradeProfile
- 저장/초기화 버튼
- 최근 등록 5개 (완료 배지 + 불러오기)

**ManageMaster 화면**:
- 타이틀: "기준정보 관리"
- 필터: 전체(N) / 미입력(N) / 완료(N)
- 각 row: 거래처명(코드) + 주소 + 완료 배지 + 수정 버튼

</details>
