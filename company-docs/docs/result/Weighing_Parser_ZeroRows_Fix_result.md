# Weighing Parser ZeroRows Fix Result

## TL;DR (5줄)
1. **문제**: 계량현황 업로드 시 totalRows=0 (날짜 파싱 실패 시 모든 행 걸러짐)
2. **근본 원인**: `isDataRow()`에서 `if (!mapped.date) return false;` 조건이 과도하게 엄격함
3. **해결**: 행 판정 기준을 "날짜 파싱 성공"에서 "ticketNo 존재" 중심으로 변경
4. **디버그 강화**: 헤더 탐지/행 필터/매핑 필드 등 단계별 정보를 UI에 표시
5. **빌드 PASS**: 458ms, 800.12 kB (104 modules)

---

## Summary

### Changed
- **weighingTypes.ts**: 
  - `DebugInfo` 타입 추가 (헤더 인덱스, 시트명, 행 수, 매핑 필드, 상단 미리보기 등)
  - `WeighingParseResult`에 `debug?: DebugInfo` 추가
  
- **weighingParser.ts**:
  - **헤더 정규화**: `normalizeHeader()` 함수 추가 (공백/특수문자 제거, 소문자 변환)
  - **헤더 탐지 보강**: "번호/계량일자/단가/거래처/품명" 중 최소 2개 키워드 매칭하면 헤더로 인정
  - **행 판정 변경** (중요): `isDataRow()`에서 날짜 조건 제거 → ticketNo 존재 여부로 판정
    - 날짜 파싱 실패는 FAIL이 아니라 WARN (저장은 됨)
  - **날짜 파싱 강화**: 여러 포맷 지원 (YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYYMMDD)
  - **디버그 출력**: 콘솔 로그 + DebugInfo 반환 (단계별 카운트, 매핑 필드, 상단 5행 미리보기)
  
- **WeighingUploadPanel.tsx**:
  - 디버그 정보 표시 섹션 추가 (접기/펼치기)
  - 헤더 인덱스, 시트명, 행 수, 매핑 필드, 상단 미리보기 표시

### Not Changed
- **저장 모델**: WeighingTransaction 타입 유지
- **검증 정책**: FAIL 있으면 적용 불가 (Policy A) 유지
- **UI 레이아웃**: 기존 필터/미리보기 구조 유지

---

## Files Changed

### Modified Files
```
src/app/pages/home/excel/weighing/weighingTypes.ts    # DebugInfo 타입 추가
src/app/pages/home/excel/weighing/weighingParser.ts   # 헤더 탐지/행 판정/날짜 파싱/디버그 수정
src/app/pages/home/excel/weighing/WeighingUploadPanel.tsx  # 디버그 UI 추가
```

---

## Build Status

✅ **PASS** (458ms, 800.12 kB, 104 modules)

---

## Checklist

- ✅ **헤더 정규화**: 공백/특수문자 제거하여 매칭률 향상
- ✅ **헤더 탐지 보강**: 최소 2개 키워드 매칭으로 유연한 탐지
- ✅ **행 판정 변경**: ticketNo 중심 (날짜 파싱 실패해도 데이터로 취급)
- ✅ **날짜 파싱 강화**: 여러 포맷 지원 (/, ., -, 8자리 숫자)
- ✅ **디버그 UI**: 단계별 정보 (헤더/행 수/매핑 필드/미리보기) 표시
- ✅ **콘솔 로그**: 파싱 단계별 진행 상황 출력

---

## Next Step (1개)

**실제 엑셀 파일로 테스트**
- 디버그 정보 확인 (헤더 인덱스, 매핑 필드, 행 수)
- 0건 → N건 (데이터 정상 파싱 확인)
- 날짜 파싱 실패 행도 저장 확인 (WARN)

---

<details>
<summary>Appendix</summary>

## 문제 분석

### 기존 코드 (문제 있음)
```typescript
function isDataRow(mapped: Partial<WeighingTransaction>): boolean {
  // ❌ 날짜 파싱 실패 시 모든 행 걸러짐
  if (!mapped.date) return false;

  const ticketNo = String(mapped.ticketNo || "").trim();
  if (!ticketNo) return false;
  // ...
}
```

**문제점**:
- 계량일자가 엑셀 시리얼 날짜가 아니거나 특수 포맷이면 파싱 실패 → `mapped.date = null`
- `if (!mapped.date) return false;` → 모든 행이 요약행으로 간주되어 건너뛰기
- 결과: `totalRows = 0`

### 수정 후 코드
```typescript
function isDataRow(mapped: Partial<WeighingTransaction>): boolean {
  // ✅ ticketNo가 있으면 데이터로 취급
  const ticketNo = String(mapped.ticketNo || "").trim();
  if (!ticketNo) return false;
  
  // 요약행 제외
  if (ticketNo.includes("운행수")) return false;
  if (ticketNo.includes("소 계") || ticketNo.includes("소계")) return false;
  if (ticketNo.includes("[")) return false;
  if (ticketNo.includes("합계")) return false;

  return true;
}
```

**개선점**:
- ticketNo(번호) 존재 여부로 판정 → 날짜와 무관하게 데이터 행 인식
- 날짜 파싱 실패는 WARN으로 표시 (저장은 됨)

---

## 헤더 탐지 보강

### 기존 코드 (엄격)
```typescript
function findHeaderRow(sheet: XLSX.WorkSheet): number {
  // ❌ "번호"와 "계량일자" 정확히 매칭해야 함
  if (row.includes("번호") && row.includes("계량일자")) {
    return r;
  }
  return 0;
}
```

**문제점**:
- 공백이나 특수문자가 있으면 매칭 실패 (예: "번 호", "계량일자 ")
- 실제 엑셀에는 다양한 헤더 변형 존재

### 수정 후 코드
```typescript
function normalizeHeader(header: string): string {
  return header.trim().replace(/[\s\-_:]/g, "").toLowerCase();
}

function findHeaderRow(sheet: XLSX.WorkSheet): { rowIndex: number; headers: string[] } {
  const keyHeaders = ["번호", "계량일자", "단가", "거래처", "품명", "품목"];
  const normalizedKeys = keyHeaders.map(h => normalizeHeader(h));

  for (let r = 0; r <= range.e.r; r++) {
    // ...
    let matchCount = 0;
    for (const header of row) {
      const normalized = normalizeHeader(header);
      if (normalizedKeys.some(key => normalized.includes(key))) {
        matchCount++;
      }
    }
    
    // ✅ 최소 2개 키워드 매칭하면 헤더로 인정
    if (matchCount >= 2) {
      return { rowIndex: r, headers: row };
    }
  }
}
```

**개선점**:
- 정규화로 공백/특수문자 무시
- 여러 키워드 중 2개 이상 매칭하면 헤더로 인정
- 헤더 컬럼 목록 반환 (디버그용)

---

## 날짜 파싱 강화

### 기존 코드 (제한적)
```typescript
function parseDate(value: any): string | null {
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    // ...
  }
  
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/\//g, "-");
    // ❌ YYYY-MM-DD 포맷만 지원
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return cleaned;
    }
  }
  
  return null;
}
```

### 수정 후 코드
```typescript
function parseDate(value: any): string | null {
  // 숫자 (엑셀 시리얼 날짜)
  if (typeof value === "number") {
    try {
      const date = XLSX.SSF.parse_date_code(value);
      if (date && date.y && date.m && date.d) {
        // ...
      }
    } catch (e) {
      // 파싱 실패 시 null 반환
    }
  }

  // 문자열
  if (typeof value === "string") {
    // ✅ YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    let cleaned = trimmed.replace(/[\/\.]/g, "-");
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleaned)) {
      // 월/일 패딩
      const parts = cleaned.split("-");
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    
    // ✅ YYYYMMDD
    if (/^\d{8}$/.test(trimmed)) {
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}
```

**개선점**:
- 여러 구분자 지원 (/, ., -)
- 월/일 1자리도 허용 (자동 패딩)
- 8자리 숫자 포맷 지원
- 파싱 실패 시 에러 무시 (null 반환)

---

## 디버그 정보 구조

```typescript
type DebugInfo = {
  headerRowIndex: number;        // 탐지된 헤더 행 번호
  sheetName: string;              // 사용된 시트 이름
  totalSheetRows: number;         // 시트 전체 행 수
  rawRowsCount: number;           // JSON 변환 후 raw 행 수
  afterFilterCount: number;       // 데이터 행 필터 후 행 수
  headerColumns: string[];        // 탐지된 헤더 컬럼들
  mappedFields: string[];         // 매핑된 필드들
  sampleRawRows: any[][];         // 상단 5행 미리보기 (2D array)
};
```

**활용**:
- **headerRowIndex = 5** → 6번째 행부터 데이터 시작
- **rawRowsCount = 150, afterFilterCount = 120** → 30건 요약행 제외됨
- **mappedFields = ["ticketNo", "date", "partnerName"]** → 이 필드들만 매핑됨
- **sampleRawRows** → 실제 엑셀 원본 데이터 확인 가능

---

## 단계별 로그 출력

### 콘솔 로그 예시
```
=== 계량현황 파싱 시작 ===
시트: 계량현황
헤더 행: 5, 헤더: 번호, 계량일자, 거래처, 차량번호, 품목, 단가, 금액
시트 전체 행 수: 200
상단 미리보기 (첫 5행):
  Row 0: Title | 계량현황 | ... 
  Row 1: (빈 행)
  Row 2: 작성일 | 2025-02-05 | ...
  Row 3: (빈 행)
  Row 4: (빈 행)
  Row 5: 번호 | 계량일자 | 거래처 | ...
JSON 변환 후 raw 행 수: 180
데이터 행 필터 후: 120건 (스킵: 60건)
OK: 100, FAIL: 5, INCOMPLETE: 15
매핑된 필드: ticketNo, date, partnerName, vehicleNo, itemName, unitPrice, amount
```

**해석**:
1. 헤더는 Row 5 (6번째 행)
2. JSON 변환 후 180건 (Row 6~185)
3. 요약행 60건 제외 → 120건 데이터
4. 중복 5건 FAIL, 단가=0이 15건 INCOMPLETE
5. 최종 OK: 100건

---

## UI 디버그 섹션

```tsx
{result.debug && (
  <details>
    <summary>🔍 디버그 정보</summary>
    <div>
      <div>시트: {result.debug.sheetName}</div>
      <div>헤더 행 인덱스: {result.debug.headerRowIndex}</div>
      <div>시트 전체 행 수: {result.debug.totalSheetRows}</div>
      <div>JSON 변환 후 행 수: {result.debug.rawRowsCount}</div>
      <div>데이터 행 필터 후 행 수: {result.debug.afterFilterCount}</div>
      <div>헤더 컬럼: {result.debug.headerColumns.join(", ")}</div>
      <div>매핑된 필드: {result.debug.mappedFields.join(", ")}</div>
      <div>
        상단 미리보기:
        {result.debug.sampleRawRows.map((row, idx) => (
          <div>Row {idx}: {row.slice(0, 10).join(" | ")}</div>
        ))}
      </div>
    </div>
  </details>
)}
```

**사용법**:
1. 파싱 후 "🔍 디버그 정보" 클릭
2. 헤더 인덱스/행 수 확인 → 어디서 잘못됐는지 파악
3. 매핑된 필드 확인 → 어떤 컬럼이 인식됐는지 확인
4. 상단 미리보기 확인 → 실제 엑셀 데이터 구조 파악

---

## 테스트 시나리오

### 시나리오 1: 정상 파일
```
헤더: Row 5
데이터: Row 6~200 (195건)
예상: OK 180, FAIL 0, INCOMPLETE 15
```

### 시나리오 2: 헤더가 늦게 나타남
```
헤더: Row 10 (상단에 제목/설명 있음)
데이터: Row 11~150 (140건)
예상: 헤더 탐지 성공 (키워드 2개 이상 매칭)
```

### 시나리오 3: 날짜 포맷 다양
```
날짜: 2025/02/05, 2025.2.5, 20250205
예상: 모두 "2025-02-05"로 파싱 성공
```

### 시나리오 4: 날짜 파싱 실패
```
날짜: "미정", "추후", null
예상: WARN 표시, 저장은 됨 (date=null)
```

---

## 예상 개선 효과

### Before
- 업로드 시 totalRows=0
- 디버그 정보 없음
- 문제 원인 파악 불가

### After
- totalRows=N (데이터 정상 인식)
- 단계별 디버그 정보 제공
- 헤더/행 필터/매핑 필드 확인 가능
- 문제 원인 즉시 파악 (예: 헤더 인덱스 잘못, 매핑 필드 0개)

---

## 주의사항

1. **날짜 파싱 실패 행도 저장됨**: date=null로 저장되므로, 추후 조회 시 필터링 필요
2. **WARN은 적용 차단 안 함**: "⚠️ 날짜 파싱 실패" 경고는 정보성이므로 적용 가능
3. **디버그 정보는 선택**: `debug?` 필드이므로 없어도 정상 동작

</details>
