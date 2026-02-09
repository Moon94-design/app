# Browse MVP-1: 한달 물량 추세 + 자금 흐름 조회 화면 완료

## TL;DR (5줄)

1. **목표**: 계량현황(weighingTransactions) 데이터 기반 "최근 30일" 물량 추세 + 자금 흐름(매입/매출) 조회 화면 구현
2. **핵심 정책**: 단가=0 또는 금액=0(미완료) 건은 통계에서 제외 (isPriceIncomplete/unitPrice/amount 필터)
3. **UI 구성**: KPI 카드 4개 (총 물량/매출/매입/순흐름) + SVG 라인 차트 2개 (물량 추세, 금액 추세) + 일별 상세 테이블
4. **차트**: 차트 라이브러리 추가 없이 SVG 기반 직접 구현 (y축 스케일 자동, 날짜 순서 정렬)
5. **라우트**: `/browse/weighing-trend` (조회 > 물량/자금 추세) 추가, navConfig.ts 자동 반영

## Summary

### Changed (New)
- **새 조회 화면**: `BrowseWeighingMonthlyTrend.tsx` (물량/자금 추세 조회)
- **집계 유틸**: `weighingAggregation.ts` (일별 집계, 전체 통계 계산)
- **SVG 차트 컴포넌트**: `SimpleLineChart` (단일 라인), `DualLineChart` (2개 라인)
- **네비 추가**: navConfig.ts에 "물량/자금 추세" 메뉴 추가

### Not Changed
- 기존 계량현황 업로드/등록 기능 변경 없음
- 기존 관리/조회 페이지 변경 없음
- weighingTransactions 타입 변경 없음

## Files Changed

```
src/app/pages/browse/weighing/weighingAggregation.ts    # 신규: 집계 유틸
src/app/pages/browse/BrowseWeighingMonthlyTrend.tsx     # 신규: 조회 화면
src/app/nav/navConfig.ts                                # 수정: Browse 메뉴 추가
```

## Build Status

✅ **PASS** (740ms, 806.83 kB, gzip 234.73 kB)

**번들 크기 변화**:
- Before: 797.76 kB
- After: 806.83 kB
- Diff: **+9.07 kB** (+1.1%)

## 제외 규칙 적용 확인

### 포함 조건 (weighingAggregation.ts)
```typescript
function isValidForStats(tx: WeighingTransaction): boolean {
  if (tx.isPriceIncomplete === true) return false;  // 미완료 플래그
  if ((tx.unitPrice || 0) <= 0) return false;       // 단가 0
  if ((tx.amount || 0) <= 0) return false;          // 금액 0
  return true;
}
```

### 제외 건수 표시 (UI)
```
포함: N건 / 제외: M건 (미완료/0원) / 전체: T건
```

### 방향 판정
- `direction` 필드 우선 ("매입" | "매출")
- `direction` 비어 있으면 `inOut`으로 fallback ("입고" → 매입, "출고" → 매출)

## Next Step

**다음 개선 사항** (선택):
1. 기간 선택 필터 추가 (7일/30일/90일 토글)
2. 실중량/인계량 선택 토글 추가
3. 거래처별/품목별 필터 추가
4. 차트 인터랙션 (호버 시 상세 정보 표시)

---

<details>
<summary>Appendix</summary>

## 집계 규칙 (수식/필터)

### 일별 집계 (aggregateByDay)
```typescript
1. 필터링: isValidForStats(tx) && isWithinDays(tx.date, days)
2. 그룹핑: Map<dateKey, WeighingTransaction[]>
3. 집계:
   - netWeight: sum(tx.net)
   - amountSell: sum(tx.amount) where direction="매출"
   - amountBuy: sum(tx.amount) where direction="매입"
   - netCashFlow: amountSell - amountBuy
4. 정렬: date 오름차순
```

### 전체 통계 (calculateOverallStats)
```typescript
1. 필터링: isWithinDays(tx.date, days)
2. 유효/제외 분류: isValidForStats(tx)
3. 집계:
   - totalNetWeight: sum(valid.net)
   - totalAmountSell: sum(valid.amount) where direction="매출"
   - totalAmountBuy: sum(valid.amount) where direction="매입"
   - netCashFlow: totalAmountSell - totalAmountBuy
   - includedCount: valid.length
   - excludedCount: recentTxs.length - valid.length
```

## 차트 구현 방식 (SVG)

### SimpleLineChart (단일 라인)
- **크기**: 800×200 (width×height)
- **패딩**: top=20, right=40, bottom=40, left=60
- **y축 스케일**: maxValue 기준 5단계 그리드 (0, 0.25, 0.5, 0.75, 1.0)
- **x축**: 날짜별 균등 분포 (MM-DD 형식)
- **라인**: SVG path 요소 (stroke-width=2)
- **점**: circle 요소 (r=4)

### DualLineChart (2개 라인)
- SimpleLineChart 동일 구조
- **라인 1**: 매출 (color=#4caf50, 녹색)
- **라인 2**: 매입 (color=#f44336, 빨강)
- **범례**: SVG g 요소, 우측 상단 표시

### 데이터 매핑
```typescript
// 물량 차트
data: dailyData.map(d => ({ label: d.date.slice(5), value: d.netWeight }))

// 금액 차트
data: dailyData.map(d => ({
  label: d.date.slice(5),
  value1: d.amountSell,
  value2: d.amountBuy
}))
```

## 테스트 체크리스트

### 데이터가 적을 때도 표시되는지
- ✅ 0건: "최근 30일 이내 데이터가 없습니다." 메시지
- ✅ 1건: 단일 점 표시 (라인 없음 방지: `data.length - 1 || 1`)
- ✅ 제외 건수 표시: includedCount=0이어도 excludedCount 정상 표시

### 금액 표시
- ✅ 천 단위 쉼표: `toLocaleString()`
- ✅ 색상: 매출(녹색), 매입(빨강), 순흐름(녹색/빨강 조건)
- ✅ 부호: 순흐름에 "+" 접두사 표시

### 차트 렌더링
- ✅ y축 레이블: 천 단위 쉼표
- ✅ x축 레이블: MM-DD 형식 (날짜 슬라이스)
- ✅ 오버플로: `overflowX: auto` (모바일 대응)

## 구현 단계별 요약

### Step 1: 데이터 접근/집계 유틸 (546ms)
- `weighingAggregation.ts` 생성
- `aggregateByDay`, `calculateOverallStats` 함수
- `isValidForStats`, `getDirection` 헬퍼 함수
- 빌드 PASS

### Step 2: Browse 페이지 + KPI/테이블 (713ms)
- `BrowseWeighingMonthlyTrend.tsx` 생성
- KPI 카드 4개 (물량/매출/매입/순흐름)
- 제외 건수 표시
- 일별 상세 테이블
- 차트 영역 placeholder
- 빌드 PASS

### Step 3: SVG 차트 추가 (469ms)
- `SimpleLineChart` 컴포넌트 구현
- `DualLineChart` 컴포넌트 구현
- y축 그리드, x축 레이블, 범례
- 경로 오류 수정 (`../../home` → `../home`)
- 빌드 PASS

### Step 4: 라우트/네비 추가 (740ms)
- navConfig.ts에 `BrowseWeighingMonthlyTrend` import
- Browse children에 "물량/자금 추세" 메뉴 추가
- `/browse/weighing-trend` 경로 자동 생성
- breadcrumb/quickTabs 자동 반영
- 빌드 PASS

</details>

---

**완료 일시**: 2026-02-06  
**최종 빌드**: ✅ PASS (740ms, 806.83 kB)  
**적용 원칙**: CONTRACT_SSOT.md 준수 (기능 변경 0, 단계 작업 + 빌드 게이트, 차트 라이브러리 추가 금지)
