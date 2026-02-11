import type { PartnerBase } from "@kernel/schema/partner";

export type ExcelSite = "daegu" | "seongju";

export type PartnerParsedRow = {
  rowIndex: number;
  status: "OK" | "FAIL";
  errors: string[];
  data: PartnerBase | null;
};

export type PartnerParseResult = {
  total: number;
  ok: number;
  fail: number;
  rows: PartnerParsedRow[];
  duplicates: string[];
  dbConflicts: string[];
};

export type WeighingTransaction = {
  site?: ExcelSite;
  ticketNo: string;
  dateRaw: string;
  date: string;
  seq: number;
  directionRaw: string;
  direction: "BUY" | "SELL" | "";
  inOut: "입고" | "출고" | "";
  partnerCode: string;
  partnerId?: string;
  partnerName: string;
  vehicleNo: string;
  itemCode: string;
  itemName: string;
  gross: number;
  tare: number;
  net: number;
  handover: number;
  unitPrice: number;
  amount: number;
  note: string;
  isIncomplete: boolean;
  isPriceIncomplete: boolean;
};

export type WeighingParsedRow = {
  rowIndex: number;
  status: "OK" | "FAIL" | "INCOMPLETE";
  data: Partial<WeighingTransaction> | null;
  errors: string[];
};

export type WeighingParseResult = {
  total: number;
  ok: number;
  fail: number;
  incomplete: number;
  rows: WeighingParsedRow[];
  duplicates: string[];
};

export type VehicleParsedRow = {
  rowIndex: number;
  status: "OK" | "INCOMPLETE" | "FAIL";
  errors: string[];
  warnings: string[];
  data: {
    vehicleNo: string;
    tonClass: "" | "1t" | "5t" | "25t";
    bodyType: "" | "카고" | "윙" | "방통";
    source: "excel";
  };
};

export type VehicleParseResult = {
  total: number;
  ok: number;
  incomplete: number;
  fail: number;
  rows: VehicleParsedRow[];
  duplicates: string[];
  dbConflicts: string[];
};
