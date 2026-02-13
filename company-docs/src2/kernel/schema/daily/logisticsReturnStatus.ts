import type { LogisticsLine, LogisticsRecord } from "./logisticsTypes";

export type ReturnStatusLabel = "전량 반품" | "부분 반품";
export type ReturnStatusRole = "return-record" | "return-target";

export type ReturnStatusInfo = {
  label: ReturnStatusLabel;
  role: ReturnStatusRole;
  sourceKg: number;
  returnedKg: number;
};

function toSourceKey(recordId: string, lineId: string): string {
  return `${recordId}:${lineId}`;
}

function toSafeNumber(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return num;
}

function toStatusLabel(sourceKg: number, returnedKg: number): ReturnStatusLabel {
  return sourceKg > 0 && returnedKg < sourceKg ? "부분 반품" : "전량 반품";
}

export function buildReturnedKgBySourceFromLines(
  recordId: string,
  lines: LogisticsLine[]
): Map<string, number> {
  const returnedKgBySource = new Map<string, number>();
  const normalizedRecordId = (recordId || "").trim();
  if (!normalizedRecordId) return returnedKgBySource;

  for (const line of lines || []) {
    if (!line.isReturn) continue;
    const sourceRecordId = (line.returnSourceRecordId || "").trim();
    const sourceLineId = (line.returnSourceLineId || "").trim();
    if (!sourceRecordId || !sourceLineId) continue;
    if (sourceRecordId !== normalizedRecordId) continue;

    const returnedKg = toSafeNumber(line.returnedKg ?? line.kg ?? 0);
    if (returnedKg <= 0) continue;

    const key = toSourceKey(sourceRecordId, sourceLineId);
    returnedKgBySource.set(key, (returnedKgBySource.get(key) || 0) + returnedKg);
  }

  return returnedKgBySource;
}

export function buildReturnedKgBySource(records: LogisticsRecord[]): Map<string, number> {
  const returnedKgBySource = new Map<string, number>();
  for (const record of records) {
    const fromRecord = buildReturnedKgBySourceFromLines(record.id, record.lines || []);
    for (const [key, value] of fromRecord.entries()) {
      if (value <= 0) continue;
      returnedKgBySource.set(key, (returnedKgBySource.get(key) || 0) + value);
    }
  }
  return returnedKgBySource;
}

export function getLineReturnStatus(args: {
  recordId: string;
  line: LogisticsLine;
  returnedKgBySource: Map<string, number>;
}): ReturnStatusInfo | null {
  const { recordId, line, returnedKgBySource } = args;

  if (line.isReturn) {
    const sourceKg = toSafeNumber(line.sourceKg ?? 0);
    const returnedKg = toSafeNumber(line.returnedKg ?? line.kg ?? 0);
    if (returnedKg <= 0) return null;
    return {
      role: "return-record",
      label: toStatusLabel(sourceKg, returnedKg),
      sourceKg,
      returnedKg,
    };
  }

  const lineId = (line.lineId || "").trim();
  if (!lineId) return null;

  const sourceKg = toSafeNumber(line.kg ?? 0);
  const returnedKg = toSafeNumber(returnedKgBySource.get(toSourceKey(recordId, lineId)) || 0);
  if (sourceKg <= 0 || returnedKg <= 0) return null;

  return {
    role: "return-target",
    label: toStatusLabel(sourceKg, returnedKg),
    sourceKg,
    returnedKg,
  };
}

export function formatReturnWeightText(status: ReturnStatusInfo): string {
  const sourceKg = Math.max(0, status.sourceKg);
  const returnedKg = Math.max(0, Math.min(status.returnedKg, sourceKg || status.returnedKg));

  if (status.role === "return-record") {
    return `${returnedKg.toLocaleString()}(${sourceKg.toLocaleString()})`;
  }

  return `${sourceKg.toLocaleString()}(${returnedKg.toLocaleString()})`;
}
