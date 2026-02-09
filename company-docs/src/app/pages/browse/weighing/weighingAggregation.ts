/**
 * weighingAggregation.ts
 * 계량현황 집계 유틸 (조회 MVP용)
 */

import type { WeighingTransaction } from "../../home/excel/weighing/weighingTypes";

/**
 * 일별 집계 결과
 */
export type DailyAggregation = {
  date: string; // YYYY-MM-DD
  netWeight: number; // 실중량 합계 (kg)
  amountSell: number; // 매출 금액 합계
  amountBuy: number; // 매입 금액 합계
  netCashFlow: number; // 순현금흐름 (매출 - 매입)
  count: number; // 포함된 트랜잭션 수
};

/**
 * 월별 집계 결과 (추세 확인용)
 */
export type MonthlyAggregation = {
  month: string; // YYYY-MM
  netWeight: number; // 실중량 합계 (kg)
  amountSell: number; // 매출 금액 합계
  amountBuy: number; // 매입 금액 합계
  netCashFlow: number; // 순현금흐름 (매출 - 매입)
  count: number; // 포함된 트랜잭션 수
};

/**
 * 전체 통계
 */
export type OverallStats = {
  totalNetWeight: number;
  totalAmountSell: number;
  totalAmountBuy: number;
  netCashFlow: number;
  includedCount: number; // 포함된 건수
  excludedCount: number; // 제외된 건수 (미완료/0원)
  totalCount: number; // 전체 건수
};

/**
 * 집계 정책: 포함 조건
 * - isIncomplete !== true (총중량/공차중량 둘 다 있어야 함)
 * - isPriceIncomplete !== true
 * - unitPrice > 0
 * - amount > 0
 */
function isValidForStats(tx: WeighingTransaction): boolean {
  if (tx.isIncomplete === true) return false; // 미완료 제외
  if (tx.isPriceIncomplete === true) return false;
  if ((tx.unitPrice || 0) <= 0) return false;
  if ((tx.amount || 0) <= 0) return false;
  return true;
}

/**
 * 방향 판정: 매입/매출 (direction 우선, inOut으로 fallback)
 * @returns "매입" | "매출" | "UNKNOWN"
 */
function getDirection(tx: WeighingTransaction): "매입" | "매출" | "UNKNOWN" {
  // direction이 BUY/SELL로 저장됨 → 매입/매출로 변환
  if (tx.direction === "BUY") return "매입";
  if (tx.direction === "SELL") return "매출";
  
  // direction이 비어 있으면 inOut으로 fallback
  if (tx.inOut === "입고") return "매입";
  if (tx.inOut === "출고") return "매출";
  
  return "UNKNOWN";
}

/**
 * ticketNo에서 날짜 추출 (fallback)
 * 예: CW2601050002 → 2026-01-05
 * 규칙: "CW" + YYMMDD + ...
 */
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

/**
 * 트랜잭션의 유효 날짜 가져오기 (dateISO 우선, ticketNo fallback)
 */
function getValidDate(tx: WeighingTransaction): string {
  if (tx.date && tx.date.length >= 10) return tx.date;
  return extractDateFromTicketNo(tx.ticketNo) || "";
}

/**
 * 날짜 문자열을 YYYY-MM-DD로 변환
 */
function toDateKey(isoDate: string): string {
  return isoDate.slice(0, 10);
}

/**
 * 최근 N일 필터링
 */
function isWithinDays(isoDate: string, days: number): boolean {
  if (!isoDate) return false;
  const t = new Date(isoDate).getTime();
  if (isNaN(t)) return false;
  const now = Date.now();
  return now - t <= days * 24 * 60 * 60 * 1000;
}

/**
 * 계량현황 데이터를 일별로 집계
 * @param transactions 전체 트랜잭션
 * @param days 최근 N일 (기본 30일)
 * @param partnerCode 거래처 필터 (선택)
 * @returns 일별 집계 배열 (날짜 오름차순)
 */
export function aggregateByDay(
  transactions: WeighingTransaction[],
  days: number = 30,
  partnerCode?: string
): DailyAggregation[] {
  // 1) 유효 데이터 필터링 (미완료/0원 제외 + 거래처 필터)
  const valid = transactions.filter((tx) => {
    if (!isValidForStats(tx)) return false;
    const validDate = getValidDate(tx);
    if (!isWithinDays(validDate, days)) return false;
    if (partnerCode && tx.partnerCode !== partnerCode) return false;
    return true;
  });

  // 2) 날짜별 그룹핑
  const dailyMap = new Map<string, WeighingTransaction[]>();
  for (const tx of valid) {
    const validDate = getValidDate(tx);
    const dateKey = toDateKey(validDate);
    if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, []);
    dailyMap.get(dateKey)!.push(tx);
  }

  // 3) 날짜별 집계
  const result: DailyAggregation[] = [];
  for (const [dateKey, txs] of dailyMap.entries()) {
    let netWeight = 0;
    let amountSell = 0;
    let amountBuy = 0;

    for (const tx of txs) {
      netWeight += tx.net || 0;
      const dir = getDirection(tx);
      if (dir === "매출") {
        amountSell += tx.amount || 0;
      } else if (dir === "매입") {
        amountBuy += tx.amount || 0;
      }
    }

    result.push({
      date: dateKey,
      netWeight,
      amountSell,
      amountBuy,
      netCashFlow: amountSell - amountBuy,
      count: txs.length,
    });
  }

  // 4) 날짜 오름차순 정렬
  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

/**
 * 계량현황 데이터를 월별로 집계 (추세 확인용)
 * @param transactions 전체 트랜잭션
 * @param days 최근 N일 (기본 365일)
 * @param partnerCode 거래처 필터 (선택)
 * @returns 월별 집계 배열 (월 오름차순)
 */
export function aggregateByMonth(
  transactions: WeighingTransaction[],
  days: number = 365,
  partnerCode?: string
): MonthlyAggregation[] {
  // 1) 유효 데이터 필터링 (미완료/0원 제외 + 거래처 필터)
  const valid = transactions.filter((tx) => {
    if (!isValidForStats(tx)) return false;
    const validDate = getValidDate(tx);
    if (!isWithinDays(validDate, days)) return false;
    if (partnerCode && tx.partnerCode !== partnerCode) return false;
    return true;
  });

  // 2) 월별 그룹핑 (YYYY-MM)
  const monthlyMap = new Map<string, WeighingTransaction[]>();
  for (const tx of valid) {
    const validDate = getValidDate(tx);
    const monthKey = validDate.slice(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, []);
    monthlyMap.get(monthKey)!.push(tx);
  }

  // 3) 월별 집계
  const result: MonthlyAggregation[] = [];
  for (const [monthKey, txs] of monthlyMap.entries()) {
    let netWeight = 0;
    let amountSell = 0;
    let amountBuy = 0;

    for (const tx of txs) {
      netWeight += tx.net || 0;
      const dir = getDirection(tx);
      if (dir === "매출") {
        amountSell += tx.amount || 0;
      } else if (dir === "매입") {
        amountBuy += tx.amount || 0;
      }
    }

    result.push({
      month: monthKey,
      netWeight,
      amountSell,
      amountBuy,
      netCashFlow: amountSell - amountBuy,
      count: txs.length,
    });
  }

  // 4) 월 오름차순 정렬
  result.sort((a, b) => a.month.localeCompare(b.month));

  return result;
}

/**
 * 전체 통계 계산 (KPI용)
 * @param transactions 전체 트랜잭션
 * @param days 최근 N일 (기본 30일)
 * @param partnerCode 거래처 필터 (선택)
 * @returns 전체 통계
 */
export function calculateOverallStats(
  transactions: WeighingTransaction[],
  days: number = 30,
  partnerCode?: string
): OverallStats {
  const recentTxs = transactions.filter((tx) => {
    const validDate = getValidDate(tx);
    if (!isWithinDays(validDate, days)) return false;
    if (partnerCode && tx.partnerCode !== partnerCode) return false;
    return true;
  });
  const valid = recentTxs.filter(isValidForStats);
  const excluded = recentTxs.length - valid.length;

  let totalNetWeight = 0;
  let totalAmountSell = 0;
  let totalAmountBuy = 0;

  for (const tx of valid) {
    totalNetWeight += tx.net || 0;
    const dir = getDirection(tx);
    if (dir === "매출") {
      totalAmountSell += tx.amount || 0;
    } else if (dir === "매입") {
      totalAmountBuy += tx.amount || 0;
    }
  }

  return {
    totalNetWeight,
    totalAmountSell,
    totalAmountBuy,
    netCashFlow: totalAmountSell - totalAmountBuy,
    includedCount: valid.length,
    excludedCount: excluded,
    totalCount: recentTxs.length,
  };
}
