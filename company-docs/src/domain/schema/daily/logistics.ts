import type { BaseRecord, ValidationResult, Ref } from "./_common";
import { requireText, ensureString, ensureArray, ensureNumber, parseTags, newId, nowIso, todayYMD } from "./_common";

export type Direction = "매입" | "출고";
export type Kind = "압축품" | "분쇄품" | "펠렛";
export type Item = "PP" | "PE";

export type LogisticsLine = {
  direction: Direction;
  kind: Kind;
  item: Item;
  kg: number;
  unitPricePerKg: number;
  partner: Ref;
  vehicle?: Ref;
};

export type LogisticsRecord = BaseRecord & {
  kind: "logistics";
  lines: LogisticsLine[];
};

export type LogisticsDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;
  lines: LogisticsLine[];
};

export function defaultLogisticsDraft(): LogisticsDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    lines: [],
  };
}

export function normalizeLogisticsDraft(raw: any): LogisticsDraft {
  const b = defaultLogisticsDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    lines: ensureArray(raw?.lines, []).map((x: any) => ({
      direction: x?.direction === "출고" ? "출고" : "매입",
      kind: (x?.kind === "펠렛" ? "펠렛" : x?.kind === "분쇄품" ? "분쇄품" : "압축품"),
      item: x?.item === "PE" ? "PE" : "PP",
      kg: ensureNumber(x?.kg, 0),
      unitPricePerKg: ensureNumber(x?.unitPricePerKg, 0),
      partner: x?.partner || { id: "", label: "" },
      vehicle: x?.vehicle,
    })),
  };
}

export function validateLogisticsDraft(d: LogisticsDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  if (!d.lines.length) errors.push({ field: "lines", message: "라인을 1개 이상 입력하세요." });
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toLogisticsRecord(d: LogisticsDraft): LogisticsRecord {
  const now = nowIso();
  return {
    id: newId("LOG"),
    kind: "logistics",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    lines: d.lines || [],
  };
}
