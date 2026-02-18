export const DAILY_PRODUCT_ITEM_OPTIONS = ["PP", "PE"] as const;
export type DailyProductItem = (typeof DAILY_PRODUCT_ITEM_OPTIONS)[number];

export const DAILY_OUTBOUND_KIND_OPTIONS = ["분쇄품", "펠렛"] as const;
export type DailyOutboundKind = (typeof DAILY_OUTBOUND_KIND_OPTIONS)[number];
