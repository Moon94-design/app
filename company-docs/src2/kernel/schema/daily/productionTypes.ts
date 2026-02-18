import type { DailyOutboundKind, DailyProductItem } from "./materialOptions";
import type { DailyBranch } from "./siteOptions";

export type ProductionShift = "주간" | "오후" | "야간";
export type ProductionProduct = DailyProductItem;
export type ProductionItem = DailyOutboundKind;
export type ProductionSite = DailyBranch;

export type ProductionLine = {
  id: string;
  shift: ProductionShift;
  product: ProductionProduct;
  item: ProductionItem;
  bags: number;
  kg: number;
  memo: string;
};

export type ProductionDraft = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  site: ProductionSite;
  details: string;
  tagsText: string;
  lineDraft: ProductionLine;
  lines: ProductionLine[];
};

export type ProductionRecord = {
  id: string;
  kind: "production";
  recordDate: string;
  createdAt: string;
  updatedAt: number;
  writerId?: string;
  writerName: string;
  writerRole: string;
  site: ProductionSite;
  title: string;
  details: string;
  tags: string[];
  lines: ProductionLine[];
};
