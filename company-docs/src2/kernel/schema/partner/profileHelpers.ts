import type { TradeProfileItem } from "./partnerTypes";

export const TRADE_PROFILE_DIRECTION_OPTIONS = ["매입", "매출"] as const;
export const TRADE_PROFILE_ITEM_OPTIONS = ["PP", "PE"] as const;
export const TRADE_PROFILE_KIND_OPTIONS = ["압축", "분쇄", "펠렛"] as const;

export type TradeProfileMode = "append" | "overwrite";

export function createDefaultTradeProfile(): TradeProfileItem {
  return {
    direction: "매입",
    item: "PP",
    kind: "압축",
    memo: "",
  };
}

export function tradeProfileKey(profile: TradeProfileItem): string {
  return `${profile.direction}|${profile.item}|${profile.kind}`;
}

export function dedupeTradeProfiles(profiles: TradeProfileItem[]): TradeProfileItem[] {
  const seen = new Set<string>();
  const result: TradeProfileItem[] = [];
  profiles.forEach((profile) => {
    const key = tradeProfileKey(profile);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(profile);
  });
  return result;
}

export function mergeTradeProfiles(
  current: TradeProfileItem[],
  incoming: TradeProfileItem[],
  mode: TradeProfileMode = "append"
): TradeProfileItem[] {
  if (mode === "overwrite") {
    return dedupeTradeProfiles(incoming);
  }
  return dedupeTradeProfiles([...current, ...incoming]);
}
