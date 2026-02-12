import type { Direction, Item, Kind, DailyBranch } from "@kernel/schema/daily";

export type PartnerPriceRow = {
  direction?: Direction;
  kind?: Kind;
  item?: Item;
  pricePerKg?: number;
};

export type PartnerOption = {
  id: string;
  label: string;
  prices: PartnerPriceRow[];
};

export type VehicleOption = {
  id: string;
  vehicleNo: string;
};

export type SubmitResult = {
  ok: boolean;
  message: string;
};

export type CreateResult = {
  ok: boolean;
  message: string;
  id?: string;
};

export type UpdatePartnerNameInput = {
  id: string;
  partnerName: string;
  partnerDetailTag: string;
};

export type UpdatePartnerNameResult = {
  ok: boolean;
  message: string;
};

export type ProductCategory = Exclude<Item, "">;

export type LogisticsDraft = {
  recordDate: string;
  site: DailyBranch;
  writerName: string;
  writerRole: string;
  partnerId: string;
  partnerLabel: string;
  vehicleId: string;
  vehicleNo: string;
  direction: Direction;
  kind: Kind;
  item: Item;
  detailItem: string;
  grossKg: number;
  tareKg: number;
  kg: number;
  unitPricePerKg: number;
};
