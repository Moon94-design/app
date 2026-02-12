import type { LogisticsLine, LogisticsRecord } from "@kernel/schema/daily";
import { sortByRecent } from "./selectors";

export type MergeResult = {
  records: LogisticsRecord[];
  staleIds: string[];
  upsertIds: Set<string>;
};

function lineFingerprint(line: LogisticsLine): string {
  return [
    line.partner?.id || "",
    line.partner?.label || "",
    line.vehicle?.label || "",
    line.direction,
    line.kind,
    line.item,
    line.detailItem || "",
    String(line.kg),
    String(line.unitPricePerKg),
  ].join("|");
}

export function mergeRecordsByDate(records: LogisticsRecord[]): MergeResult {
  const byDate = new Map<string, LogisticsRecord[]>();
  for (const record of records) {
    const date = record.recordDate || "1900-01-01";
    const list = byDate.get(date) ?? [];
    list.push(record);
    byDate.set(date, list);
  }

  const merged: LogisticsRecord[] = [];
  const staleIds: string[] = [];
  const upsertIds = new Set<string>();

  for (const [date, group] of byDate) {
    const ordered = group.slice().sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

    const base = ordered[0];
    const allLines = ordered.flatMap((record) => record.lines || []);
    const seen = new Set<string>();
    const dedupedLines = allLines.filter((line) => {
      const key = lineFingerprint(line);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const mergedTags = Array.from(new Set(ordered.flatMap((record) => record.tags || [])));
    const latestUpdatedAt = Math.max(...ordered.map((record) => Number(record.updatedAt || 0)));

    merged.push({
      ...base,
      recordDate: date,
      lines: dedupedLines,
      tags: mergedTags,
      updatedAt: latestUpdatedAt,
      title: (base.title || "").trim() || `${date} 유통기록`,
      details: (base.details || "").trim() || "등록 화면에서 저장됨",
    });

    if (ordered.length > 1 || dedupedLines.length !== allLines.length) {
      upsertIds.add(base.id);
    }
    if (ordered.length > 1) {
      staleIds.push(...ordered.slice(1).map((record) => record.id));
    }
  }

  return {
    records: sortByRecent(merged),
    staleIds,
    upsertIds,
  };
}
