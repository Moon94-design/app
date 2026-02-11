import { newId, nowIso, parseTags } from "./_common";
import type {
  Direction,
  Item,
  Kind,
  LogisticsLine,
  LogisticsRecord,
  WeighingTransaction,
} from "./logisticsTypes";

function mapDirection(direction: string): Direction {
  if (direction === "SELL") return "출고";
  return "매입";
}

function extractItemInfo(itemName: string): { kind: Kind; item: Item } {
  const name = (itemName || "").toUpperCase();

  let kind: Kind = "압축품";
  if (name.includes("분쇄")) kind = "분쇄품";
  if (name.includes("펠렛")) kind = "펠렛";

  let item: Item = "PP";
  if (name.includes("PE")) item = "PE";

  return { kind, item };
}

export function toLogisticsLine(tx: WeighingTransaction): LogisticsLine {
  const { kind, item } = extractItemInfo(tx.itemName);
  return {
    direction: mapDirection(tx.direction),
    kind,
    item,
    kg: Number(tx.net) || 0,
    unitPricePerKg: Number(tx.unitPrice) || 0,
    partner: {
      id: tx.partnerCode || tx.partnerId || "",
      label: tx.partnerName || "",
    },
    vehicle: tx.vehicleNo
      ? {
          id: tx.vehicleNo,
          label: tx.vehicleNo,
        }
      : undefined,
  };
}

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
    updatedAt: Date.now(),
    title: `${date} 유통기록 (${lines.length}건)`,
    details: "계량현황에서 자동 생성됨. 필요 시 수정하세요.",
    tags: ["계량현황"],
    lines,
  };
}

export function convertAllWeighingToLogistics(
  transactions: WeighingTransaction[]
): LogisticsRecord[] {
  const grouped = new Map<string, WeighingTransaction[]>();

  for (const tx of transactions) {
    if (!tx.date) continue;
    const list = grouped.get(tx.date) ?? [];
    list.push(tx);
    grouped.set(tx.date, list);
  }

  return Array.from(grouped.keys())
    .sort()
    .map((date) => convertToLogisticsRecord(date, grouped.get(date) ?? []));
}

export function withNormalizedLogisticsRecord(record: LogisticsRecord): LogisticsRecord {
  return {
    ...record,
    title: record.title || `${record.recordDate} 유통기록`,
    details: record.details || "",
    tags: Array.isArray(record.tags) ? record.tags : [],
    lines: Array.isArray(record.lines) ? record.lines : [],
  };
}

export function applyTagText(record: LogisticsRecord, tagsText: string): LogisticsRecord {
  return {
    ...record,
    tags: parseTags(tagsText),
    updatedAt: Date.now(),
  };
}
