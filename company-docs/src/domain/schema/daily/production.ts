import type { BaseRecord, ValidationResult } from "./_common";
import { requireText, ensureString, ensureArray, ensureNumber, parseTags, newId, nowIso, todayYMD } from "./_common";

export type Shift = "주간" | "오후" | "야간";
export type Product = "분쇄품" | "펠렛";
export type Item = "PP" | "PE";
export type Site = "대구" | "성주";

export type ProductionLine = {
  id: string;
  shift: Shift;
  product: Product;
  item: Item;
  bags: number;
  kg: number;
  memo: string;
};

export type ProductionRecord = BaseRecord & {
  kind: "production";
  site: Site;
  writerRole?: string;
  lines: ProductionLine[];
};

export type ProductionDraft = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  site: Site;

  title: string;
  details: string;
  tagsText: string;

  lines: ProductionLine[];
};

export function defaultProductionDraft(): ProductionDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    writerRole: "",
    site: "대구",
    title: "",
    details: "",
    tagsText: "",
    lines: [],
  };
}

export function newLine(): ProductionLine {
  return {
    id: newId("PL"),
    shift: "주간",
    product: "분쇄품",
    item: "PP",
    bags: 0,
    kg: 0,
    memo: "",
  };
}

export function normalizeProductionDraft(raw: any): ProductionDraft {
  const b = defaultProductionDraft();
  const site: Site = raw?.site === "성주" ? "성주" : "대구";

  const lines: ProductionLine[] = ensureArray(raw?.lines, []).map((x: any) => {
    const shift: Shift = (x?.shift === "주간" || x?.shift === "오후" || x?.shift === "야간") ? x.shift : "주간";
    const product: Product = x?.product === "펠렛" ? "펠렛" : "분쇄품";
    const item: Item = x?.item === "PE" ? "PE" : "PP";
    return {
      id: ensureString(x?.id, newId("PL")),
      shift,
      product,
      item,
      bags: ensureNumber(x?.bags, 0),
      kg: ensureNumber(x?.kg, 0),
      memo: ensureString(x?.memo, ""),
    };
  });

  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    writerRole: ensureString(raw?.writerRole, ""),
    site,
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    lines,
  };
}

export function validateProductionDraft(d: ProductionDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  if (!d.lines.length) errors.push({ field: "lines", message: "생산 항목을 1개 이상 추가하세요." });
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function makeProductionDocId(recordDate: string, site: Site, writerName: string) {
  const w = (writerName || "").trim() || "user";
  const safeW = w.replace(/[^a-zA-Z0-9가-힣_-]/g, "_").slice(0, 32);
  return `PROD_${recordDate}_${site}_${safeW}`;
}

export function toProductionRecord(d: ProductionDraft, stableId?: string): ProductionRecord {
  const now = nowIso();
  return {
    id: stableId || newId("PROD"),
    kind: "production",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    writerRole: d.writerRole.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    site: d.site,
    lines: d.lines || [],
  };
}
