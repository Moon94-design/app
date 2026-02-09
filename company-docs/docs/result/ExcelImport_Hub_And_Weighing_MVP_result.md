# ExcelImport Hub And Weighing MVP Result

## TL;DR (5줄)
1. **Excel Import Hub 신설**: 홈 메뉴에 "엑셀등록" 추가 (거래처/계량현황/차량/기타 기준정보 통합 허브)
2. **거래처 업로드 이동**: PartnerManage에서 업로드 UI 제거, Hub로 이동 완료 (기능 동일 유지)
3. **계량현황 업로드 MVP 완료**: 파싱/검증/미리보기/적용 동작, 단가=0 "미완료" 큐 분리
4. **Policy A 유지**: FAIL 있으면 적용 불가 (올-오어-낫싱), INCOMPLETE는 저장 허용 (통계 제외 플래그)
5. **빌드 PASS**: 509ms, 796.44 kB (102 modules)

---

## Summary

### Changed
- **홈 메뉴**: "엑셀등록" 버튼 추가 (4개 서브메뉴: 거래처/계량현황/차량/기타)
- **라우트**: `/excel` 경로 추가 (ExcelImportHub)
- **거래처 업로드**: PartnerManage에서 제거 → ExcelImportHub로 이동 (로직 재사용)
- **계량현황 업로드**: 신규 구현 (파서/타입/UI)
  - 파싱: 헤더 자동 탐지, 요약행 제외, 날짜/숫자 자동 변환
  - 검증: ticketNo 중복 체크, 단가=0 "INCOMPLETE" 분리
  - 적용: OK + INCOMPLETE 저장 (FAIL 있으면 차단)
- **데이터 저장**: weighingTransactions 추가 (localStorage)

### Not Changed
- **기존 거래처 관리**: 리스트/필터/수정 기능 유지 (PartnerManage)
- **기존 데이터**: partners_v2 등 기존 저장소 영향 없음
- **Policy A**: 거래처 업로드는 중복 제외 정책(Skip), 계량현황은 올-오어-낫싱 유지

---

## Files Changed

### New Files
```
src/app/pages/home/ExcelImportHub.tsx
src/app/pages/home/excel/weighing/weighingTypes.ts
src/app/pages/home/excel/weighing/weighingParser.ts
src/app/pages/home/excel/weighing/WeighingUploadPanel.tsx
```

### Modified Files
```
src/app/routes.tsx                              # ExcelImportHub 라우트 추가
src/app/pages/home/HomeMain.tsx                 # 엑셀등록 메뉴 추가
src/app/nav/navModel.ts                         # breadcrumb 추가
src/app/pages/manage/master/PartnerManage.tsx  # 업로드 UI 제거, 안내 메시지 추가
src/data/keys.ts                                # weighingTransactions 키 추가
src/data/localRepo.ts                           # weighingTransactions 메서드 추가
```

---

## Build Status

✅ **PASS** (509ms, 796.44 kB, 102 modules)

---

## Checklist

- ✅ **거래처 업로드가 Hub에서 동작**: ExcelImportHub > 거래처 탭에서 정상 동작
- ✅ **PartnerManage에서 업로드 UI 제거**: 안내 메시지로 대체 ("홈 > 엑셀등록 > 거래처 업로드에서 하세요")
- ✅ **계량현황 업로드 동작**: 파싱/검증/미리보기/적용 정상 동작
  - 헤더 자동 탐지 (번호, 계량일자)
  - 요약행 제외 (운행수, 소계, [플라스틱 : PP] 등)
  - 날짜/숫자 자동 변환
  - ticketNo 중복 검증 (엑셀 내부 + DB 충돌)
- ✅ **단가=0 "미완료" 큐 분리**: INCOMPLETE 상태로 필터링 가능, 저장 시 isPriceIncomplete=true 플래그
- ✅ **통계 제외 준비**: isPriceIncomplete 필드로 추후 평균 단가 계산 시 제외 가능

---

## Next Step (1개)

**계량현황 조회/통계 화면 구현** (Browse/Report)
- 필터: 전체/OK/미완료(단가=0)
- 평균 단가 계산: isPriceIncomplete=true 행 제외
- 거래처별/품목별/기간별 집계

---

<details>
<summary>Appendix</summary>

## 라우트/메뉴 변경 내용

### 라우트 추가
```tsx
<Route path="/excel" element={<ExcelImportHub />} />
```

### HomeMain 메뉴
```tsx
<Link to="/excel" className="subMenuBtn">
  <div className="subMenuTitle">엑셀등록</div>
  <ul className="subMenuList">
    <li>거래처 일괄 등록</li>
    <li>계량현황 일괄 등록</li>
    <li>기타 기준정보 일괄 등록</li>
  </ul>
</Link>
```

### Breadcrumb
```
홈 > 엑셀등록
```

---

## 계량현황 매핑표 (엑셀 헤더 → 필드)

| 엑셀 헤더 | 필드명 | 타입 | 비고 |
|---------|--------|------|------|
| 번호 | ticketNo | string | 고유키 (필수) |
| 계량일자 | date | string | ISO 8601 (YYYY-MM-DD) |
| 순번 | seq | number | |
| 구분 | direction | "매입" \| "매출" | |
| 입출여부 | inOut | "입고" \| "출고" | |
| 거래처/거래처명 | partnerName | string | |
| 차량번호 | vehicleNo | string | |
| 품목/품목명 | itemName | string | |
| 품목코드 | itemCode | string | |
| 총중량 | gross | number | |
| 공차중량 | tare | number | |
| 실중량 | net | number | |
| 인계중량 | handover | number | |
| 단가 | unitPrice | number | 0이면 INCOMPLETE |
| 금액 | amount | number | |
| 비고 | note | string | |

---

## 요약행 제외 규칙

다음 패턴이 포함된 행은 데이터로 취급하지 않음:
- 계량일자가 날짜로 파싱 불가
- 번호(ticketNo)가 비어있음
- 번호에 "운행수" 포함
- 번호에 "소 계" 포함
- 번호에 "[" 포함 (예: [플라스틱 : PP])

---

## 단가=0 처리 정책 근거

### 정책 (MVP)
- **단가=0 행**: `status="INCOMPLETE"` (FAIL과 구분)
- **저장**: OK + INCOMPLETE 모두 저장 허용
- **플래그**: `isPriceIncomplete: true` (통계 제외용)
- **적용 조건**: FAIL 0건이면 적용 가능 (INCOMPLETE 있어도 OK)

### 이유
1. **데이터 보존**: 단가=0 행도 거래 기록으로 저장 필요 (추후 단가 보완 가능)
2. **통계 정확성**: 평균 단가 계산 시 제외하여 왜곡 방지
3. **미완료 큐**: 별도 필터로 모아서 일괄 보완 가능

### 예시
```
150건 업로드:
- OK: 100건 (단가 정상)
- INCOMPLETE: 45건 (단가=0)
- FAIL: 5건 (중복 ticketNo)

결과:
- 적용 불가 (FAIL 5건)
- 수정 후 적용: 145건 저장 (OK 100 + INCOMPLETE 45)
- 통계: 100건만 사용 (INCOMPLETE 45건 제외)
```

---

## 파서 동작 상세

### 헤더 자동 탐지
```typescript
function findHeaderRow(sheet: XLSX.WorkSheet): number {
  // "번호"와 "계량일자" 모두 포함된 행을 찾음
  // 예: 5행부터 헤더 시작 → return 5
}
```

### 날짜 파싱
```typescript
function parseDate(value: any): string | null {
  // 엑셀 시리얼 날짜 (숫자) → YYYY-MM-DD
  // 문자열 날짜 (YYYY/MM/DD) → YYYY-MM-DD
  // Date 객체 → YYYY-MM-DD
}
```

### 숫자 파싱
```typescript
function parseNumber(value: any): number {
  // 쉼표 제거 (1,000 → 1000)
  // 문자열 → 숫자 변환
  // 실패 시 0 반환
}
```

### 검증 순서
1. 필수 필드 (ticketNo)
2. 중복 검증 (엑셀 내부)
3. DB 충돌 검증
4. 단가=0 검증 (INCOMPLETE)

---

## 저장 모델

```typescript
type WeighingTransaction = {
  id: string;
  ticketNo: string; // 고유키
  date: string; // ISO 8601
  seq: number;
  direction: "매입" | "매출" | "";
  inOut: "입고" | "출고" | "";
  partnerId?: string; // refs 연계 예정
  partnerName: string;
  vehicleNo: string;
  itemCode: string;
  itemName: string;
  gross: number;
  tare: number;
  net: number;
  handover: number;
  unitPrice: number;
  amount: number;
  note: string;
  isPriceIncomplete: boolean; // 통계 제외 플래그
  createdAt: string;
  updatedAt: string;
};
```

---

## UI 필터 (계량현황 업로드 패널)

```typescript
type Filter = "all" | "ok" | "fail" | "incomplete";

// 전체: 모든 행
// OK: 정상 행
// FAIL: 중복/에러 행
// 미완료: 단가=0 행
```

---

## 확장 계획

### 단기 (다음 작업)
- 계량현황 조회/통계 화면 (Browse)
- 평균 단가 계산 (isPriceIncomplete=true 제외)
- 거래처별/품목별/기간별 집계

### 중기
- 차량 업로드 (ExcelImportHub > 차량 탭)
- 기타 기준정보 업로드 (설비/소모품/직원 등)
- refs 연계 (partnerId, vehicleId 자동 매칭)

### 장기
- 단가 보완 UI (미완료 큐에서 일괄 수정)
- 엑셀 다운로드 (템플릿 제공)
- 배치 처리 (대용량 데이터 청크 분할)

</details>
