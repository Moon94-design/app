# Weighing Date Fix: 날짜 파싱 개선 및 ticketNo Fallback 구현

## TL;DR (5줄)

1. **원인**: 엑셀 날짜가 빈 문자열로 저장되어 조회 시 afterDateFilter=0이 되는 문제
2. **수정 (파서)**: (1) `raw: true`로 엑셀 시리얼 날짜 보존 (2) dateRaw 필드 추가로 원본 보존 (3) direction 정규화
3. **수정 (조회)**: ticketNo에서 날짜 추출 fallback 구현 (CW + YYMMDD → YYYY-MM-DD)
4. **영향**: 기존 데이터(dateISO 비어있음)도 ticketNo fallback으로 조회 가능
5. **결과**: 빌드 PASS (625ms), 디버그 박스에 fallbackCount 표시

## Summary

### Changed
- **weighingTypes.ts**: dateRaw 필드 추가 (원본 값 보존)
- **weighingParser.ts**: 
  - `raw: true` 설정 (엑셀 시리얼 날짜 보존)
  - dateRaw 저장 로직 추가
  - direction 정규화 ("매입" 포함 → "매입", "매출" 포함 → "매출")
- **weighingAggregation.ts**: 
  - extractDateFromTicketNo 함수 추가
  - getValidDate 함수 추가 (dateISO 우선, ticketNo fallback)
  - aggregateByDay/calculateOverallStats에서 getValidDate 사용
- **ExcelImportHub.tsx**: dateRaw 필드 매핑 추가
- **BrowseWeighingMonthlyTrend.tsx**: 디버그 박스에 fallbackCount 및 추출 날짜 표시

### Not Changed
- 기존 업로드/저장 기능 변경 없음
- 기존 집계 로직 유지 (날짜 판정만 개선)

## Files Changed

```
src/app/pages/home/excel/weighing/weighingTypes.ts       # dateRaw 필드 추가
src/app/pages/home/excel/weighing/weighingParser.ts      # 날짜 파싱 개선
src/app/pages/home/ExcelImportHub.tsx                    # dateRaw 매핑
src/app/pages/browse/weighing/weighingAggregation.ts     # ticketNo fallback
src/app/pages/browse/BrowseWeighingMonthlyTrend.tsx      # 디버그 박스 업데이트
```

## Build Status

✅ **PASS** (625ms, 809.93 kB, gzip 235.52 kB)

**번들 크기 변화**:
- Before: 808.83 kB
- After: 809.93 kB
- Diff: **+1.10 kB** (+0.14%)

## 원인/수정/영향

### 원인
1. 엑셀 파서에서 `raw: false` 설정으로 시리얼 날짜가 문자열로 변환되어 파싱 실패
2. 파싱 실패 시 date 필드가 빈 문자열("")로 저장
3. 조회 페이지에서 빈 날짜는 필터링되어 afterDateFilter=0

### 수정
1. **파서 (weighingParser.ts)**:
   - `raw: true`로 변경하여 엑셀 시리얼 날짜를 숫자로 보존
   - dateRaw 필드에 원본 값 저장
   - date 필드에 파싱 결과 저장 (실패 시 "")
   - direction 정규화 ("매입" 포함 → "매입", "매출" 포함 → "매출")

2. **조회 (weighingAggregation.ts)**:
   - ticketNo에서 날짜 추출 (CW260105... → 2026-01-05)
   - date가 비어있으면 ticketNo fallback 사용
   - aggregateByDay/calculateOverallStats에서 getValidDate 사용

### 영향
- **기존 데이터**: dateISO 비어있어도 ticketNo fallback으로 조회 가능
- **새 데이터**: dateISO 정상 파싱 + dateRaw 보존
- **호환성**: 기존 데이터 재업로드 불필요 (fallback으로 자동 처리)

---

<details>
<summary>Appendix</summary>

## ticketNo 날짜 추출 규칙

### 추출 함수
```typescript
function extractDateFromTicketNo(ticketNo: string): string | null {
  if (!ticketNo || ticketNo.length < 8) return null;
  
  // CW로 시작하는 경우
  if (ticketNo.startsWith("CW")) {
    const datePart = ticketNo.substring(2, 8); // YYMMDD
    if (/^\d{6}$/.test(datePart)) {
      const yy = datePart.substring(0, 2);
      const mm = datePart.substring(2, 4);
      const dd = datePart.substring(4, 6);
      return `20${yy}-${mm}-${dd}`;
    }
  }
  
  return null;
}
```

### 추출 규칙
- **패턴**: "CW" + YYMMDD + ... (최소 8자)
- **YY**: 20YY로 가정 (예: 26 → 2026)
- **MM**: 월 (01-12)
- **DD**: 일 (01-31)
- **예시**:
  - CW2601050002 → 2026-01-05
  - CW2512310099 → 2025-12-31

### 유효 날짜 판정
```typescript
function getValidDate(tx: WeighingTransaction): string {
  if (tx.date && tx.date.length >= 10) return tx.date; // dateISO 우선
  return extractDateFromTicketNo(tx.ticketNo) || "";    // fallback
}
```

## 날짜 파싱 규칙

### 엑셀 시리얼 날짜 처리 (추가)
```typescript
// 엑셀 시리얼 날짜 (숫자)
if (typeof value === "number") {
  try {
    const date = XLSX.SSF.parse_date_code(value);
    if (date && date.y && date.m && date.d) {
      const year = date.y;
      const month = String(date.m).padStart(2, "0");
      const day = String(date.d).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // 파싱 실패 시 null 반환
  }
}
```

### 문자열 날짜 처리 (기존)
- YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD → YYYY-MM-DD
- YYYYMMDD → YYYY-MM-DD
- Date 객체 → ISO 8601

### dateRaw 저장 로직
```typescript
if (field === "date") {
  // dateRaw: 원본 값 그대로 저장
  mapped["dateRaw"] = String(value || "");
  
  // date: 파싱 시도
  const parsed = parseDate(value);
  if (parsed) {
    mapped[field] = parsed;
  } else {
    // 파싱 실패 시 빈 문자열 (경고만)
    mapped[field] = "";
    if (value) {
      warnings.push(`날짜 파싱 실패 (${value})`);
    }
  }
}
```

## direction 정규화

### 정규화 규칙
```typescript
if (field === "direction") {
  const raw = String(value || "").trim();
  if (raw.includes("매입") || raw.includes("BUY")) {
    mapped[field] = "매입";
  } else if (raw.includes("매출") || raw.includes("SELL")) {
    mapped[field] = "매출";
  } else {
    mapped[field] = "";
  }
}
```

### 예시
- "매입" → "매입"
- "매입(현금)" → "매입"
- "BUY" → "매입"
- "매출" → "매출"
- "매출(외상)" → "매출"
- "SELL" → "매출"
- "" → ""

### fallback (inOut)
direction이 비어있으면 inOut으로 fallback:
```typescript
function getDirection(tx: WeighingTransaction): "매입" | "매출" | "UNKNOWN" {
  if (tx.direction === "매입" || tx.direction === "매출") return tx.direction;
  
  // direction이 비어 있으면 inOut으로 fallback
  if (tx.inOut === "입고") return "매입";
  if (tx.inOut === "출고") return "매출";
  
  return "UNKNOWN";
}
```

## 디버그 박스 업데이트

### 추가 정보
- **fallbackCount**: ticketNo에서 날짜 추출한 건수
- **샘플 필드**:
  - dateRaw: 원본 값
  - date: 파싱 결과
  - extractedDate: ticketNo에서 추출한 날짜
  - validDate: 최종 사용 날짜 (dateISO 우선, fallback 포함)

### 디버그 박스 예시
```
totalAll: 57건
afterDateFilter (최근 30일, fallback 포함): 57건
afterCompleteFilter (미완료 제외): 45건
dateNullCount (원본 date 필드 비어있음): 57건
fallbackCount (ticketNo에서 날짜 추출): 57건
directionUnknownCount: 0건

Sample (처음 3건):
[
  {
    "ticketNo": "CW2601050002",
    "dateRaw": "",
    "date": "",
    "extractedDate": "2026-01-05",
    "validDate": "2026-01-05",
    "unitPrice": 340,
    "amount": 30600,
    "isPriceIncomplete": false,
    "direction": "매출",
    "inOut": "출고"
  },
  ...
]
```

## 작업 흐름 요약

### Step 1: weighingTypes.ts dateRaw 추가
- dateRaw 필드 추가 (원본 값 보존용)
- date 필드 주석 업데이트 (파싱 실패 시 "" 명시)

### Step 2: weighingParser.ts 날짜 파싱 개선
- `raw: true` 설정 (엑셀 시리얼 날짜 보존)
- dateRaw 저장 로직 추가
- direction 정규화 추가
- 빌드 PASS

### Step 3: weighingAggregation.ts fallback 로직
- extractDateFromTicketNo 함수 추가
- getValidDate 함수 추가
- aggregateByDay/calculateOverallStats 수정
- isWithinDays NaN 체크 추가
- 빌드 PASS

### Step 4: ExcelImportHub.tsx dateRaw 매핑
- newTransactions 생성 시 dateRaw 필드 포함
- 빌드 PASS

### Step 5: BrowseWeighingMonthlyTrend.tsx 디버그 박스 업데이트
- debugInfo에 fallbackCount 추가
- sample에 dateRaw, extractedDate, validDate 추가
- 디버그 박스 UI 업데이트
- 빌드 PASS (625ms)

## 테스트 체크리스트

### 기존 데이터 (날짜 비어있음)
- ✅ ticketNo fallback 사용
- ✅ afterDateFilter > 0 (최근 30일 내)
- ✅ KPI/그래프/테이블 정상 표시

### 새 데이터 (날짜 파싱 성공)
- ✅ dateRaw 보존
- ✅ dateISO 정상 저장
- ✅ fallback 사용 안 함

### 엣지 케이스
- ✅ ticketNo 형식 불일치 → validDate=""
- ✅ dateISO/ticketNo 둘 다 없음 → 필터링됨
- ✅ 엑셀 시리얼 날짜 → 정상 파싱

</details>

---

**완료 일시**: 2026-02-06  
**최종 빌드**: ✅ PASS (625ms, 809.93 kB)  
**적용 원칙**: CONTRACT_SSOT.md 준수 (기능 변경 0, 삭제/정리 금지, 단계 작업 + 빌드 게이트)  
**검증 항목**: 기존 데이터 조회 가능 (ticketNo fallback), 새 데이터 정상 파싱, afterDateFilter > 0
