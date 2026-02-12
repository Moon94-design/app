import type { Direction, Kind } from "@kernel/schema/daily";
import { DAILY_BRANCH_OPTIONS } from "@kernel/schema/daily";
import { todayYmd } from "@kernel/utils";
import type { LogisticsDraft, ProductCategory } from "./types";

export const SITE_OPTIONS = DAILY_BRANCH_OPTIONS;
export const DIRECTION_OPTIONS: Direction[] = ["매입", "출고", "처리"];
export const CATEGORY_OPTIONS: ProductCategory[] = ["PP", "PE"];
export const KIND_OPTIONS: Record<Direction, Kind[]> = {
  매입: ["압축품", "분쇄품", "스크랩"],
  출고: ["분쇄품", "펠렛"],
  처리: ["폐기물", "폐수"],
};
export const BASE_SCRAP_DETAIL_OPTIONS: Record<ProductCategory, string[]> = {
  PP: ["일반", "파렛트", "상자"],
  PE: ["일반", "파렛트", "상자", "말통"],
};

export function hasCategorySelection(direction: Direction): boolean {
  return direction !== "처리";
}

export function hasPriceSelection(direction: Direction): boolean {
  return direction !== "처리";
}

export function needsScrapDetail(direction: Direction, kind: Kind): boolean {
  return direction === "매입" && kind === "스크랩";
}

export function defaultDraft(): LogisticsDraft {
  return {
    recordDate: todayYmd(),
    site: SITE_OPTIONS[0],
    writerName: "",
    writerRole: "",
    partnerId: "",
    partnerLabel: "",
    vehicleId: "",
    vehicleNo: "",
    direction: "출고",
    kind: "분쇄품",
    item: "PP",
    detailItem: "",
    grossKg: 0,
    tareKg: 0,
    kg: 0,
    unitPricePerKg: 0,
  };
}

export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeKind(value: string): Kind {
  if (value === "압축") return "압축품";
  if (value === "분쇄") return "분쇄품";
  if (value === "압축품" || value === "분쇄품" || value === "펠렛" || value === "스크랩" || value === "폐기물" || value === "폐수") {
    return value;
  }
  return "분쇄품";
}
