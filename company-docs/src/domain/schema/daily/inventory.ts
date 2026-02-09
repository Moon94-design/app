import type { BaseRecord, ValidationResult } from "./_common";
import { requireText, ensureString, ensureNumber, ensureArray, parseTags, newId, nowIso, todayYMD } from "./_common";

export type StockItem = "압축품" | "분쇄품" | "펠렛";
export type Unit = "kg" | "자루";

export type InventoryLine = { item: StockItem; unit: Unit; qty: number; memo: string };

export type InventoryRecord = BaseRecord & {
  kind: "inventory";
  lines: InventoryLine[];
};

export type InventoryDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;
  lines: InventoryLine[];
};

export function defaultInventoryDraft(): InventoryDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    lines: [{ item: "분쇄품", unit: "자루", qty: 0, memo: "" }],
  };
}

export function normalizeInventoryDraft(raw: any): InventoryDraft {
  const b = defaultInventoryDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    lines: ensureArray(raw?.lines, b.lines).map((x: any) => ({
      item: x?.item === "펠렛" ? "펠렛" : x?.item === "압축품" ? "압축품" : "분쇄품",
      unit: x?.unit === "kg" ? "kg" : "자루",
      qty: ensureNumber(x?.qty, 0),
      memo: ensureString(x?.memo, ""),
    })),
  };
}

export function validateInventoryDraft(d: InventoryDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  if (!d.lines.length) errors.push({ field: "lines", message: "재고 라인을 1개 이상 입력하세요." });
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toInventoryRecord(d: InventoryDraft): InventoryRecord {
  const now = nowIso();
  return {
    id: newId("INV"),
    kind: "inventory",
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
