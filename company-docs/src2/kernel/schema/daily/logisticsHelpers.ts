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
  if (name.includes("스크랩")) kind = "스크랩";

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
  if (!tx.direction) baseMissingFields.push("매입/출고 구분");
  if (tx.isIncomplete) baseMissingFields.push("계량 기초값이 부족해 실중량이 불완전합니다.");
  if (tx.isPriceIncomplete) baseMissingFields.push("가격 정보가 불완전합니다.");

  const extraMissingFields: string[] = [];
  if (!tx.vehicleNo) extraMissingFields.push("차량번호");
  if (!tx.partnerCode && !tx.partnerId) extraMissingFields.push("거래처 연계코드");

  return {
    lineId: newId("LOGLN"),
    direction: mapDirection(tx.direction),
    kind,
    item,
    site: tx.site ?? "",
    kg: Number(tx.net) || 0,
    unitPricePerKg: Number(tx.unitPrice) || 0,
    baseMissing: baseMissingFields.length > 0,
    extraMissing: extraMissingFields.length > 0,
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
  if (!line.direction) baseMissingFields.push("매입/출고 구분");

  const extraMissingFields: string[] = [];
  if (!line.vehicle?.label?.trim()) extraMissingFields.push("차량번호");
  if (!line.partner?.id?.trim()) extraMissingFields.push("거래처 연계코드");

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
    details: "계량 데이터에서 자동 변환된 유통 기록입니다.",
    tags: ["자동변환", "계량연동"],
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
            lineId: typeof line.lineId === "string" ? line.lineId : "",
            site: line.site || "",
            baseMissingFields: Array.isArray(line.baseMissingFields) ? line.baseMissingFields : [],
            extraMissingFields: Array.isArray(line.extraMissingFields) ? line.extraMissingFields : [],
            isReturn: Boolean(line.isReturn),
            returnSourceRecordId:
              typeof line.returnSourceRecordId === "string" ? line.returnSourceRecordId : "",
            returnSourceLineId:
              typeof line.returnSourceLineId === "string" ? line.returnSourceLineId : "",
            sourceDirection:
              line.sourceDirection === "매입" || line.sourceDirection === "출고" || line.sourceDirection === "처리"
                ? line.sourceDirection
                : undefined,
            sourceKg: Number.isFinite(Number(line.sourceKg)) ? Number(line.sourceKg) : undefined,
            returnedKg: Number.isFinite(Number(line.returnedKg)) ? Number(line.returnedKg) : undefined,
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
