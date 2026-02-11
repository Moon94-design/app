import type { BaseRecord, Ref } from "./_common";

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

export type WeighingTransaction = {
  id: string;
  date: string;
  direction: "BUY" | "SELL" | "";
  partnerCode: string;
  partnerId?: string;
  partnerName: string;
  vehicleNo: string;
  itemName: string;
  net: number;
  unitPrice: number;
};
