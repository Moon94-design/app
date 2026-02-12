import { DAILY_BRANCH_OPTIONS, type ProductionDraft, type ProductionItem, type ProductionLine, type ProductionProduct, type ProductionShift, type ProductionSite } from "@kernel/schema/daily";
import { createLocalId, todayYmd } from "@kernel/utils";

export const SHIFT_OPTIONS: ProductionShift[] = ["주간", "오후", "야간"];
export const PRODUCT_OPTIONS: ProductionProduct[] = ["분쇄품", "원료"];
export const ITEM_OPTIONS: ProductionItem[] = ["PP", "PE"];
export const SITE_OPTIONS: readonly ProductionSite[] = DAILY_BRANCH_OPTIONS;

export function makeProductionDocId(recordDate: string, site: ProductionSite, writerName: string): string {
  const safeWriter = writerName.trim().replace(/[^a-zA-Z0-9가-힣]/g, "_").slice(0, 32);
  return `PROD_${recordDate}_${site}_${safeWriter}`;
}

export function buildDefaultDraft(): ProductionDraft {
  return {
    recordDate: todayYmd(),
    writerName: "",
    writerRole: "",
    site: SITE_OPTIONS[0],
    title: "",
    details: "",
    tagsText: "",
    lines: [],
  };
}

export function buildDefaultLine(): ProductionLine {
  return {
    id: createLocalId("PL"),
    shift: "주간",
    product: "분쇄품",
    item: "PP",
    bags: 0,
    kg: 0,
    memo: "",
  };
}
