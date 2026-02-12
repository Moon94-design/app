// ORIGIN: copied from src/app/pages/register/partner/partnerV2Types.ts (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

export type PartnerBase = {
  partnerCode: string;
  partnerName: string;
  partnerDetailTag?: string;
  ceoName: string;
  phone: string;
  zip: string;
  addr1: string;
  addr2: string;
  contactName: string;
  contactPhone: string;
  businessNo: string;
  email: string;
  fax: string;
  businessType: string;
  businessItem: string;
  corporateNo: string;
};

export type TradeProfileItem = {
  direction: "매입" | "매출";
  item: "PP" | "PE";
  kind: "압축품" | "분쇄품" | "펠렛" | "스크랩";
  memo?: string;
};

export type PartnerStatus = "incomplete" | "pending" | "complete";

export type PartnerExtra = {
  status: PartnerStatus;
  note: string;
  contactMemo: string;
  bankAccount: string;
  importance: "상" | "중" | "하";
  relationshipStatus: "상" | "중" | "하";
  tradeProfiles: TradeProfileItem[];
  custom?: Record<string, unknown>;
};

export type PartnerV2 = {
  id: string;
  base: PartnerBase;
  extra: PartnerExtra;
  createdAt: number;
  updatedAt: number;
};

export type PartnerV2Draft = {
  base: PartnerBase;
  extra: PartnerExtra;
};

export function isCompleted(extra: PartnerExtra): boolean {
  return extra.status === "complete";
}

export function isPending(extra: PartnerExtra): boolean {
  return extra.status === "pending";
}

export function isIncomplete(extra: PartnerExtra): boolean {
  return extra.status === "incomplete";
}

export function isPartnerComplete(base: PartnerBase, extra: PartnerExtra): boolean {
  const baseFields = [
    base.partnerName,
    base.ceoName,
    base.phone,
    base.zip,
    base.addr1,
    base.addr2,
    base.businessNo,
    base.contactName,
    base.contactPhone,
  ];
  const extraFields = [
    extra.note,
    extra.contactMemo,
    extra.bankAccount,
    extra.importance,
    extra.relationshipStatus,
  ];
  const baseOk = baseFields.every((value) => value.trim().length > 0);
  const extraOk = extraFields.every((value) => value.trim().length > 0);
  const profilesOk = (extra.tradeProfiles?.length ?? 0) > 0;

  return baseOk && extraOk && profilesOk;
}

export function resolvePartnerStatus(base: PartnerBase, extra: PartnerExtra): PartnerStatus {
  if (extra.status === "pending") return "pending";
  return isPartnerComplete(base, extra) ? "complete" : "incomplete";
}

export function defaultPartnerV2Draft(): PartnerV2Draft {
  return {
    base: {
      partnerCode: "",
      partnerName: "",
      partnerDetailTag: "",
      ceoName: "",
      phone: "",
      zip: "",
      addr1: "",
      addr2: "",
      contactName: "",
      contactPhone: "",
      businessNo: "",
      email: "",
      fax: "",
      businessType: "",
      businessItem: "",
      corporateNo: "",
    },
    extra: {
      status: "incomplete",
      note: "",
      contactMemo: "",
      bankAccount: "",
      importance: "중",
      relationshipStatus: "중",
      tradeProfiles: [],
      custom: {},
    },
  };
}

export function displayPartnerName(partnerName: string, partnerDetailTag?: string): string {
  const base = (partnerName || "").trim();
  const detail = (partnerDetailTag || "").trim();
  return detail ? `${base} · ${detail}` : base;
}
