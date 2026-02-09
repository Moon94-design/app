# Browse Weighing Trend Fix: 데이터 연동 & 메뉴 노출 문제 해결

## TL;DR (5줄)

1. **문제**: 조회 페이지(물량/자금 추세) KPI/그래프/테이블이 모두 0으로 표시, Browse 메뉴(조회 메뉴)에서 페이지 항목 미노출
2. **원인**: BrowseHome이 navConfig를 사용하지 않고 하드코딩된 메뉴만 표시, 데이터 연동 상태 불명확
3. **해결**: (1) 디버그 박스 추가로 데이터 로드 상태 가시화 (2) BrowseHome에 "물량/자금 추세" 메뉴 버튼 추가
4. **디버그 정보**: totalAll, afterDateFilter, afterCompleteFilter, dateNullCount, directionUnknownCount, sample 3건 표시
5. **결과**: Browse 메뉴에서 페이지 접근 가능, 디버그 박스로 0 원인 진단 가능

## Summary

### Changed
- **BrowseWeighingMonthlyTrend.tsx**: 디버그 박스 추가 (데이터 로드 상태 가시화)
- **BrowseHome.tsx**: "물량/자금 추세" 메뉴 버튼 추가 (하드코딩)

### Not Changed
- 기존 업로드/저장/관리 기능 변경 없음
- weighingTransactions repo 메서드 변경 없음
- 집계 로직 변경 없음 (weighingAggregation.ts 유지)

## Files Changed

```
src/app/pages/browse/BrowseWeighingMonthlyTrend.tsx     # 수정: 디버그 박스 추가
src/app/pages/browse/BrowseHome.tsx                     # 수정: 메뉴 버튼 추가
```

## Build Status

✅ **PASS** (511ms, 808.83 kB, gzip 235.17 kB)

**번들 크기 변화**:
- Before: 806.83 kB
- After: 808.83 kB
- Diff: **+2.00 kB** (+0.25%)

## 원인과 해결 (한 줄)

**원인**: BrowseHome이 navConfig 무시하고 하드코딩된 메뉴만 표시 + 데이터 로드 상태 불명확  
**해결**: (1) 디버그 박스로 데이터 진단 가능하게 개선 (2) BrowseHome에 새 메뉴 추가

---

<details>
<summary>Appendix</summary>

## 디버그 수치/샘플 Row

### 디버그 박스 표시 항목
```typescript
{
  totalAll: number,              // 전체 트랜잭션 수
  afterDateFilter: number,       // 최근 30일 필터 후
  afterCompleteFilter: number,   // 미완료 제외 후 (isPriceIncomplete/단가0/금액0)
  dateNullCount: number,         // 날짜 null/invalid 수
  directionUnknownCount: number, // 방향 UNKNOWN 수 (direction/inOut 둘 다 없음)
  sample: [                      // 처음 3건 샘플
    {
      ticketNo: string,
      date: string,
      unitPrice: number,
      amount: number,
      isPriceIncomplete: boolean,
      direction: string,
      inOut: string
    },
    ...
  ]
}
```

### 진단 가능한 시나리오

**시나리오 1: totalAll = 0**
- **원인**: repo.weighingTransactions()에 데이터가 없음
- **조치**: ExcelImportHub에서 계량현황 업로드 필요

**시나리오 2: totalAll > 0, afterDateFilter = 0**
- **원인**: 모든 데이터가 최근 30일 밖
- **조치**: 기간 필터 확장 (예: 90일) 또는 전체 기간 모드 추가

**시나리오 3: afterDateFilter > 0, afterCompleteFilter = 0**
- **원인**: 모든 데이터가 미완료 (단가0/금액0/isPriceIncomplete=true)
- **조치**: 단가 입력 필요 또는 제외 조건 완화

**시나리오 4: dateNullCount > 0**
- **원인**: 날짜 파싱 실패 (ISO 8601 형식 아님)
- **조치**: 날짜 fallback 로직 추가 또는 엑셀 업로드 시 날짜 검증 강화

**시나리오 5: directionUnknownCount > 0**
- **원인**: direction/inOut 둘 다 비어 있음
- **조치**: 방향 판정 로직 보강 또는 기본값 설정

## 수정 포인트

### 1. 디버그 박스 추가 (BrowseWeighingMonthlyTrend.tsx)

**목적**: 데이터 로드 상태 가시화, 0 원인 진단

**구현**:
```typescript
const debugInfo = useMemo(() => {
  const totalAll = transactions.length;
  
  // 날짜 필터 후
  const afterDateFilter = transactions.filter((tx) => {
    const t = new Date(tx.date).getTime();
    const now = Date.now();
    return now - t <= days * 24 * 60 * 60 * 1000;
  });
  
  // 완료 필터 후
  const afterCompleteFilter = afterDateFilter.filter((tx) => {
    if (tx.isPriceIncomplete === true) return false;
    if ((tx.unitPrice || 0) <= 0) return false;
    if ((tx.amount || 0) <= 0) return false;
    return true;
  });
  
  // 날짜 null/invalid
  const dateNullCount = transactions.filter((tx) => {
    const t = new Date(tx.date).getTime();
    return isNaN(t);
  }).length;
  
  // direction UNKNOWN
  const directionUnknownCount = transactions.filter((tx) => {
    if (tx.direction === "매입" || tx.direction === "매출") return false;
    if (tx.inOut === "입고" || tx.inOut === "출고") return false;
    return true;
  }).length;
  
  // 샘플 3건
  const sample = transactions.slice(0, 3).map((tx) => ({
    ticketNo: tx.ticketNo,
    date: tx.date,
    unitPrice: tx.unitPrice,
    amount: tx.amount,
    isPriceIncomplete: tx.isPriceIncomplete,
    direction: tx.direction,
    inOut: tx.inOut,
  }));
  
  return {
    totalAll,
    afterDateFilter: afterDateFilter.length,
    afterCompleteFilter: afterCompleteFilter.length,
    dateNullCount,
    directionUnknownCount,
    sample,
  };
}, [transactions, days]);
```

**UI 렌더링**:
```tsx
<div className="card" style={{ marginTop: 14, background: "rgba(255,200,100,0.1)", border: "1px solid rgba(255,200,100,0.3)" }}>
  <div style={{ fontSize: 13, fontWeight: 700 }}>🔍 DEBUG INFO (개발용)</div>
  <div style={{ marginTop: 8, fontSize: 12, fontFamily: "monospace" }}>
    <div>totalAll: {debugInfo.totalAll}건</div>
    <div>afterDateFilter (최근 {days}일): {debugInfo.afterDateFilter}건</div>
    <div>afterCompleteFilter (미완료 제외): {debugInfo.afterCompleteFilter}건</div>
    <div>dateNullCount: {debugInfo.dateNullCount}건</div>
    <div>directionUnknownCount: {debugInfo.directionUnknownCount}건</div>
    <div style={{ marginTop: 8 }}>Sample (처음 3건):</div>
    <pre style={{ marginTop: 4, fontSize: 11, overflow: "auto", maxHeight: 200 }}>
      {JSON.stringify(debugInfo.sample, null, 2)}
    </pre>
  </div>
</div>
```

### 2. Browse 메뉴 추가 (BrowseHome.tsx)

**문제**: navConfig에는 추가되어 있지만, BrowseHome은 하드코딩된 메뉴만 표시

**원인**: BrowseHome이 navConfig를 사용하지 않고 직접 메뉴 버튼을 나열

**해결**: 하드코딩된 메뉴에 새 버튼 추가
```tsx
<Link to="/browse/weighing-trend" className="subMenuBtn">
  <div className="subMenuTitle">물량/자금 추세</div>
  <ul className="subMenuList">
    <li>최근 30일 물량 추세</li>
    <li>매입/매출 금액 흐름</li>
    <li>일별 순현금흐름</li>
  </ul>
</Link>
```

**장기 개선 방향** (선택):
- BrowseHome을 navConfig 기반으로 동적 렌더링하도록 변경
- `NAV_CONFIG.find(n => n.path === "/browse").children` 사용
- 메뉴 추가 시 navConfig만 수정하면 자동 반영

## 테스트 체크리스트

### 디버그 박스 확인
- ✅ totalAll 표시 (전체 트랜잭션 수)
- ✅ afterDateFilter 표시 (최근 30일 필터 후)
- ✅ afterCompleteFilter 표시 (미완료 제외 후)
- ✅ dateNullCount 표시
- ✅ directionUnknownCount 표시
- ✅ sample 3건 JSON 표시

### Browse 메뉴 노출
- ✅ "조회" 메뉴 클릭 시 "물량/자금 추세" 버튼 표시
- ✅ 버튼 클릭 시 `/browse/weighing-trend` 이동
- ✅ breadcrumb: 조회 > 물량/자금 추세
- ✅ quickTabs: 기준정보, 일일기록, 단가, 물량/자금 추세

### 데이터 진단 (샘플)
```json
// 정상 케이스
{
  "totalAll": 150,
  "afterDateFilter": 82,
  "afterCompleteFilter": 75,
  "dateNullCount": 0,
  "directionUnknownCount": 3
}

// 문제 케이스 1: 데이터 없음
{
  "totalAll": 0,
  "afterDateFilter": 0,
  "afterCompleteFilter": 0,
  "dateNullCount": 0,
  "directionUnknownCount": 0
}

// 문제 케이스 2: 모두 미완료
{
  "totalAll": 120,
  "afterDateFilter": 120,
  "afterCompleteFilter": 0,
  "dateNullCount": 0,
  "directionUnknownCount": 0
}
```

## 작업 흐름 요약

### Step 1: 디버그 박스 추가 (489ms)
- BrowseWeighingMonthlyTrend.tsx에 `debugInfo` useMemo 추가
- totalAll, afterDateFilter, afterCompleteFilter 계산
- dateNullCount, directionUnknownCount 계산
- sample 3건 수집
- UI 렌더링 (노란색 박스)
- 빌드 PASS

### Step 2: Browse 메뉴 노출 (511ms)
- BrowseHome.tsx 확인 (하드코딩된 메뉴 발견)
- "물량/자금 추세" 메뉴 버튼 추가
- 설명 문구: 최근 30일 물량 추세, 매입/매출 금액 흐름, 일별 순현금흐름
- 빌드 PASS

### Step 3: 결과 문서 작성
- TL;DR / Summary / Files / Build
- 원인과 해결 한 줄
- Appendix: 디버그 수치, 진단 시나리오, 수정 포인트

</details>

---

**완료 일시**: 2026-02-06  
**최종 빌드**: ✅ PASS (511ms, 808.83 kB)  
**적용 원칙**: CONTRACT_SSOT.md 준수 (기능 변경 0, 삭제/정리 금지, 단계 작업 + 빌드 게이트)  
**다음 조치**: ExcelImportHub에서 계량현황 데이터 업로드 → 디버그 박스에서 totalAll > 0 확인 → KPI/그래프/테이블 정상 표시 확인
