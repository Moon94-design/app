import {
  DAILY_BRANCH_OPTIONS,
  DAILY_OUTBOUND_KIND_OPTIONS,
  DAILY_PRODUCT_ITEM_OPTIONS,
  type ProductionDraft,
  type ProductionItem,
  type ProductionLine,
  type ProductionProduct,
  type ProductionShift,
  type ProductionSite,
} from "@kernel/schema/daily";
import { createLocalId, todayYmd } from "@kernel/utils";

export const SHIFT_OPTIONS: ProductionShift[] = ["주간", "오후", "야간"];
export const PRODUCT_OPTIONS: ProductionProduct[] = [...DAILY_PRODUCT_ITEM_OPTIONS];
export const ITEM_OPTIONS: ProductionItem[] = [...DAILY_OUTBOUND_KIND_OPTIONS];
export const SITE_OPTIONS: readonly ProductionSite[] = DAILY_BRANCH_OPTIONS;

function toSafeKeyPart(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "unknown";
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);
}

export function makeProductionDocId(recordDate: string, site: ProductionSite, actorKey: string): string {
  const safeActor = toSafeKeyPart(actorKey);
  return `PROD_${recordDate}_${site}_${safeActor}`;
}

export function makeProductionLegacyDocId(recordDate: string, site: ProductionSite, writerName: string): string {
  const safeWriter = toSafeKeyPart(writerName);
  return `PROD_${recordDate}_${site}_${safeWriter}`;
}

export function buildDefaultDraft(): ProductionDraft {
  return {
    recordDate: todayYmd(),
    writerName: "",
    writerRole: "",
    site: SITE_OPTIONS[0],
    details: "",
    tagsText: "",
    lineDraft: buildDefaultLine(),
    lines: [],
  };
}

export function buildDefaultLine(): ProductionLine {
  return {
    id: createLocalId("PL"),
    shift: "주간",
    product: PRODUCT_OPTIONS[0],
    item: ITEM_OPTIONS[0],
    bags: 0,
    kg: 0,
    memo: "",
  };
}
