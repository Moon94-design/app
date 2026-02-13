import type { Direction, Item, Kind, LogisticsLine, LogisticsRecord } from "@kernel/schema/daily";
import type { TradeProfileItem } from "@kernel/schema/partner";
import { sortByRecordDateUpdated } from "@kernel/utils";
import type { ProductCategory, ReturnSourceCandidate } from "./types";

export function sortByRecent(records: LogisticsRecord[]): LogisticsRecord[] {
  return sortByRecordDateUpdated(records);
}

export function getSuggestedVehicleNos(records: LogisticsRecord[], partnerId: string, partnerLabel: string): string[] {
  if (!partnerId && !partnerLabel) return [];

  const sorted = sortByRecent(records);
  const uniqueNos = new Set<string>();

  for (const record of sorted) {
    for (const line of record.lines || []) {
      const samePartner =
        Boolean(partnerId) && line.partner?.id === partnerId
          ? true
          : Boolean(partnerLabel) && line.partner?.label === partnerLabel;

      if (!samePartner) continue;

      const vehicleNo = (line.vehicle?.label || "").trim();
      if (!vehicleNo || uniqueNos.has(vehicleNo)) continue;

      uniqueNos.add(vehicleNo);
      if (uniqueNos.size >= 5) return Array.from(uniqueNos);
    }
  }

  return Array.from(uniqueNos);
}

export function getLatestPartnerLine(
  records: LogisticsRecord[],
  partnerId: string,
  partnerLabel: string
): LogisticsLine | null {
  if (!partnerId && !partnerLabel) return null;

  for (const record of sortByRecent(records)) {
    for (const line of record.lines || []) {
      if (line.isReturn) continue;
      const samePartner =
        Boolean(partnerId) && line.partner?.id === partnerId
          ? true
          : Boolean(partnerLabel) && line.partner?.label === partnerLabel;
      if (samePartner) return line;
    }
  }

  return null;
}

type LatestPartnerUnitPriceArgs = {
  partnerId: string;
  partnerLabel: string;
  direction: Direction;
  kind: Kind;
  item: Item;
};

function isSamePartner(line: LogisticsLine, partnerId: string, partnerLabel: string): boolean {
  return Boolean(partnerId) && line.partner?.id === partnerId
    ? true
    : Boolean(partnerLabel) && line.partner?.label === partnerLabel;
}

function toSourceKey(recordId: string, lineId: string): string {
  return `${recordId}:${lineId}`;
}

function buildReturnedKgBySource(records: LogisticsRecord[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const record of records) {
    for (const line of record.lines || []) {
      if (!line.isReturn) continue;
      const sourceRecordId = getText(line.returnSourceRecordId);
      const sourceLineId = getText(line.returnSourceLineId);
      if (!sourceRecordId || !sourceLineId) continue;
      const key = toSourceKey(sourceRecordId, sourceLineId);
      const qty = Number(line.returnedKg ?? line.kg ?? 0) || 0;
      out.set(key, (out.get(key) || 0) + qty);
    }
  }
  return out;
}

export function getLatestPartnerUnitPrice(
  records: LogisticsRecord[],
  { partnerId, partnerLabel, direction, kind, item }: LatestPartnerUnitPriceArgs
): number {
  if (!partnerId && !partnerLabel) return 0;

  for (const record of sortByRecent(records)) {
    for (const line of record.lines || []) {
      if (line.isReturn) continue;
      if (!isSamePartner(line, partnerId, partnerLabel)) continue;
      if (line.direction !== direction) continue;
      if (line.kind !== kind) continue;
      if ((line.item || "") !== item) continue;
      return Number(line.unitPricePerKg) || 0;
    }
  }

  return 0;
}

type ReturnSourceCandidatesArgs = {
  records: LogisticsRecord[];
  partnerId: string;
  partnerLabel: string;
  dateFilter?: string;
  limit?: number;
};

export function getPartnerReturnSourceCandidates({
  records,
  partnerId,
  partnerLabel,
  dateFilter,
  limit,
}: ReturnSourceCandidatesArgs): ReturnSourceCandidate[] {
  if (!partnerId && !partnerLabel) return [];
  const cleanDateFilter = getText(dateFilter);
  const returnedKgBySource = buildReturnedKgBySource(records);
  const candidates: ReturnSourceCandidate[] = [];
  const cap = Number.isFinite(Number(limit)) ? Math.max(0, Number(limit)) : 0;

  for (const record of sortByRecent(records)) {
    if (cleanDateFilter && record.recordDate !== cleanDateFilter) continue;

    for (let index = 0; index < (record.lines || []).length; index += 1) {
      const line = record.lines[index];
      if (line.isReturn) continue;
      if (line.direction === "처리") continue;
      if (!isSamePartner(line, partnerId, partnerLabel)) continue;

      const lineId = getText(line.lineId);
      if (!lineId) continue;

      const sourceKey = toSourceKey(record.id, lineId);
      const sourceKg = Number(line.kg) || 0;
      if (sourceKg <= 0) continue;

      const returnedKg = returnedKgBySource.get(sourceKey) || 0;
      const remainingKg = Math.max(0, sourceKg - returnedKg);
      if (remainingKg <= 0) continue;

      candidates.push({
        sourceRecordId: record.id,
        sourceLineId: lineId,
        sourceRecordDate: record.recordDate,
        sourceDirection: line.direction,
        partnerLabel: line.partner?.label || "",
        vehicleNo: line.vehicle?.label || "",
        kind: line.kind,
        item: line.item,
        detailItem: line.detailItem || "",
        sourceKg,
        remainingKg,
        unitPricePerKg: Number(line.unitPricePerKg) || 0,
      });

      if (cap > 0 && candidates.length >= cap) return candidates;
    }
  }

  return candidates;
}

export function findReturnSourceCandidate(
  candidates: ReturnSourceCandidate[],
  sourceRecordId: string,
  sourceLineId: string
): ReturnSourceCandidate | null {
  const cleanRecordId = getText(sourceRecordId);
  const cleanLineId = getText(sourceLineId);
  if (!cleanRecordId || !cleanLineId) return null;
  return (
    candidates.find(
      (candidate) =>
        candidate.sourceRecordId === cleanRecordId && candidate.sourceLineId === cleanLineId
    ) || null
  );
}

export function normalizeProfileKind(kind: Kind): TradeProfileItem["kind"] {
  if (kind === "폐기물" || kind === "폐수") return "스크랩";
  if (kind === "압축품" || kind === "분쇄품" || kind === "펠렛" || kind === "스크랩") return kind;
  return "분쇄품";
}

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function collectCustomScrapDetails(
  records: LogisticsRecord[],
  item: ProductCategory,
  normalizeKind: (value: string) => Kind
): string[] {
  const out = new Set<string>();
  for (const record of sortByRecent(records)) {
    for (const line of record.lines || []) {
      if (line.isReturn) continue;
      if (line.direction !== "매입") continue;
      if (normalizeKind(String(line.kind || "")) !== "스크랩") continue;
      if (line.item !== item) continue;
      const detail = getText(line.detailItem);
      if (!detail) continue;
      out.add(detail);
    }
  }
  return Array.from(out);
}
