/**
 * weighingToLogistics.ts
 * 계량현황 → 일일기록(유통) 변환 유틸
 */

import type { WeighingTransaction } from "../../../pages/home/excel/weighing/weighingTypes";
import type { LogisticsRecord, LogisticsLine, Direction, Kind, Item } from "../../../../domain/schema/daily/logistics";
import { newId, nowIso } from "../../../../domain/schema/daily/_common";

/**
 * 계량현황 방향 → 유통기록 방향
 */
function mapDirection(direction: string): Direction {
  if (direction === "BUY") return "매입";
  if (direction === "SELL") return "출고";
  return "매입"; // 기본값
}

/**
 * 품목명에서 kind/item 추출 (부분 매칭)
 */
function extractItemInfo(itemName: string): { kind: Kind | ""; item: Item | "" } {
  const name = itemName.toUpperCase();
  
  let kind: Kind | "" = "";
  if (name.includes("압축")) kind = "압축품";
  else if (name.includes("분쇄")) kind = "분쇄품";
  else if (name.includes("펠렛")) kind = "펠렛";
  
  let item: Item | "" = "";
  if (name.includes("PP")) item = "PP";
  else if (name.includes("PE")) item = "PE";
  
  return { kind, item };
}

/**
 * 계량현황 1건 → 유통 라인 1건
 */
function toLogisticsLine(tx: WeighingTransaction): LogisticsLine {
  const { kind, item } = extractItemInfo(tx.itemName);
  
  return {
    direction: mapDirection(tx.direction),
    kind: kind || "압축품", // 기본값 (사용자가 수정 가능)
    item: item || "PP", // 기본값 (사용자가 수정 가능)
    kg: tx.net,
    unitPricePerKg: tx.unitPrice,
    partner: {
      id: tx.partnerCode || tx.partnerId || "",
      label: tx.partnerName,
    },
    vehicle: tx.vehicleNo ? {
      id: tx.vehicleNo,
      label: tx.vehicleNo,
    } : undefined,
  };
}

/**
 * 일자별 그룹핑
 */
export function groupByDate(transactions: WeighingTransaction[]): Map<string, WeighingTransaction[]> {
  const map = new Map<string, WeighingTransaction[]>();
  
  for (const tx of transactions) {
    if (!tx.date) continue; // 날짜 없으면 스킵
    
    const existing = map.get(tx.date) || [];
    existing.push(tx);
    map.set(tx.date, existing);
  }
  
  return map;
}

/**
 * 계량현황 배열 → 유통기록 1건
 */
export function convertToLogisticsRecord(
  date: string,
  transactions: WeighingTransaction[]
): LogisticsRecord {
  const lines = transactions.map(toLogisticsLine);
  const now = nowIso();
  
  return {
    id: newId("LOG"),
    kind: "logistics",
    recordDate: date,
    createdAt: now,
    updatedAt: now,
    title: `${date} 유통기록 (${lines.length}건)`,
    details: "계량현황에서 자동 생성됨. 필요 시 수정하세요.",
    tags: ["계량현황"],
    lines,
  };
}

/**
 * 전체 변환: 계량현황 전체 → 일자별 유통기록 배열
 */
export function convertAllWeighingToLogistics(
  transactions: WeighingTransaction[]
): LogisticsRecord[] {
  const grouped = groupByDate(transactions);
  const records: LogisticsRecord[] = [];
  
  // 날짜 오름차순 정렬
  const sortedDates = Array.from(grouped.keys()).sort();
  
  for (const date of sortedDates) {
    const txs = grouped.get(date)!;
    records.push(convertToLogisticsRecord(date, txs));
  }
  
  return records;
}
