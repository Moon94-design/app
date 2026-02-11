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
  const baseMissingFields: string[] = [];
  if (!tx.date) baseMissingFields.push("날짜");
  if (!tx.partnerName) baseMissingFields.push("거래처명");
  if (Number(tx.net) <= 0) baseMissingFields.push("실중량");
  if (Number(tx.unitPrice) <= 0) baseMissingFields.push("단가");
  if (!tx.direction) baseMissingFields.push("매입/매출 구분");
  if (Boolean(tx.isIncomplete)) baseMissingFields.push("계량기초값(총/공차/실중량)");
  if (Boolean(tx.isPriceIncomplete)) baseMissingFields.push("가격기초값");

  const extraMissingFields: string[] = [];
  if (!tx.vehicleNo) extraMissingFields.push("차량번호");
  if (!tx.partnerCode && !tx.partnerId) extraMissingFields.push("거래처 식별코드");

  const baseMissing = baseMissingFields.length > 0;
  const extraMissing = extraMissingFields.length > 0;
  return {
    direction: mapDirection(tx.direction),
    kind,
    item,
    site: tx.site ?? "",
    kg: Number(tx.net) || 0,
    unitPricePerKg: Number(tx.unitPrice) || 0,
    baseMissing,
    extraMissing,
    baseMissingFields,
    extraMissingFields,
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

export function recomputeLineMissing(line: LogisticsLine): LogisticsLine {
  const baseMissingFields: string[] = [];
  if (!line.partner?.label?.trim()) baseMissingFields.push("거래처명");
  if (Number(line.kg) <= 0) baseMissingFields.push("실중량");
  if (Number(line.unitPricePerKg) <= 0) baseMissingFields.push("단가");
  if (!line.direction) baseMissingFields.push("매입/매출 구분");

  const extraMissingFields: string[] = [];
  if (!line.vehicle?.label?.trim()) extraMissingFields.push("차량번호");
  if (!line.partner?.id?.trim()) extraMissingFields.push("거래처 식별코드");

  return {
    ...line,
    baseMissing: baseMissingFields.length > 0,
    extraMissing: extraMissingFields.length > 0,
    baseMissingFields,
    extraMissingFields,
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
    tags: ["엑셀추가", "계량현황"],
    lines,
  };
}

export function convertAllWeighingToLogistics(
  transactions: WeighingTransaction[]
): LogisticsRecord[] {
  const grouped = new Map<string, WeighingTransaction[]>();

  for (const tx of transactions) {
    const dateKey = tx.date || "1900-01-01";
    const list = grouped.get(dateKey) ?? [];
    list.push(tx);
    grouped.set(dateKey, list);
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
    lines: Array.isArray(record.lines)
      ? record.lines.map((line) =>
          recomputeLineMissing({
            ...line,
            site: line.site || "",
            baseMissingFields: Array.isArray(line.baseMissingFields) ? line.baseMissingFields : [],
            extraMissingFields: Array.isArray(line.extraMissingFields) ? line.extraMissingFields : [],
          })
        )
      : [],
  };
}

export function applyTagText(record: LogisticsRecord, tagsText: string): LogisticsRecord {
  return {
    ...record,
    tags: parseTags(tagsText),
    updatedAt: Date.now(),
  };
}
