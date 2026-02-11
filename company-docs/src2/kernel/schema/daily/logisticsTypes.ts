import type { BaseRecord, Ref } from "./_common";

export type Direction = "매입" | "출고";
export type Kind = "압축품" | "분쇄품" | "펠렛";
export type Item = "PP" | "PE";

export type LogisticsLine = {
  direction: Direction;
  kind: Kind;
  item: Item;
  site?: "daegu" | "seongju" | "";
  kg: number;
  unitPricePerKg: number;
  baseMissing?: boolean;
  extraMissing?: boolean;
  baseMissingFields?: string[];
  extraMissingFields?: string[];
  partner: Ref;
  vehicle?: Ref;
};

export type LogisticsRecord = BaseRecord & {
  kind: "logistics";
  lines: LogisticsLine[];
};

export type WeighingTransaction = {
  id: string;
  date: string;
  site?: "daegu" | "seongju" | "";
  direction: "BUY" | "SELL" | "";
  partnerCode: string;
  partnerId?: string;
  partnerName: string;
  vehicleNo: string;
  itemName: string;
  net: number;
  unitPrice: number;
  isIncomplete?: boolean;
  isPriceIncomplete?: boolean;
};
