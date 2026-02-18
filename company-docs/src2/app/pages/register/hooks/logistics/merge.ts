import type { LogisticsLine, LogisticsRecord } from "@kernel/schema/daily";
import { createLocalId } from "@kernel/utils";
import { sortByRecent } from "./selectors";

export type MergeResult = {
  records: LogisticsRecord[];
  staleIds: string[];
  upsertIds: Set<string>;
};

function getRecordSiteCode(record: LogisticsRecord): string {
  if (record.site === "daegu" || record.site === "seongju") return record.site;
  const lineSite = record.lines?.[0]?.site;
  if (lineSite === "daegu" || lineSite === "seongju") return lineSite;
  return "";
}

function getRecordActorKey(record: LogisticsRecord): string {
  if (typeof record.writerId === "string" && record.writerId.trim()) return record.writerId.trim();
  return (record.writerName || "").trim();
}

function buildMergeGroupKey(record: LogisticsRecord): string {
  const date = record.recordDate || "1900-01-01";
  const site = getRecordSiteCode(record) || "none";
  const actor = getRecordActorKey(record) || "none";
  return `${date}|${site}|${actor}`;
}

function lineFingerprint(line: LogisticsLine): string {
  return [
    line.lineId || "",
    line.partner?.id || "",
    line.partner?.label || "",
    line.site || "",
    line.vehicle?.label || "",
    line.direction,
    line.kind,
    line.item,
    line.detailItem || "",
    String(line.kg),
    String(line.unitPricePerKg),
    line.memo || "",
    line.isReturn ? "return" : "",
    line.returnSourceRecordId || "",
    line.returnSourceLineId || "",
    line.sourceDirection || "",
    String(line.sourceKg || 0),
    String(line.returnedKg || 0),
  ].join("|");
}

export function mergeRecordsByDate(records: LogisticsRecord[]): MergeResult {
  const byDate = new Map<string, LogisticsRecord[]>();
  for (const record of records) {
    const key = buildMergeGroupKey(record);
    const list = byDate.get(key) ?? [];
    list.push(record);
    byDate.set(key, list);
  }

  const merged: LogisticsRecord[] = [];
  const staleIds: string[] = [];
  const upsertIds = new Set<string>();

  for (const [groupKey, group] of byDate) {
    const ordered = group.slice().sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

    const base = ordered[0];
    const [date] = groupKey.split("|");
    let hasPatchedLineId = false;
    const allLines = ordered.flatMap((record) =>
      (record.lines || []).map((line) => {
        if (line.lineId && String(line.lineId).trim()) return line;
        hasPatchedLineId = true;
        return { ...line, lineId: createLocalId("LOGLN") };
      })
    );

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

    if (ordered.length > 1 || dedupedLines.length !== allLines.length || hasPatchedLineId) {
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
