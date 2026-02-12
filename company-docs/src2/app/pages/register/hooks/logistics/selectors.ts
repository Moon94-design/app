import type { Kind, LogisticsLine, LogisticsRecord } from "@kernel/schema/daily";
import type { TradeProfileItem } from "@kernel/schema/partner";
import { sortByRecordDateUpdated } from "@kernel/utils";
import type { ProductCategory } from "./types";

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
      const samePartner =
        Boolean(partnerId) && line.partner?.id === partnerId
          ? true
          : Boolean(partnerLabel) && line.partner?.label === partnerLabel;
      if (samePartner) return line;
    }
  }

  return null;
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
