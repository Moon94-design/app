// ORIGIN: copied from src/app/pages/register/RegisterVendor.tsx (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

import { createLocalId } from "@kernel/utils";

export type VendorStatus = "거래중" | "보류" | "중단";
export type VendorScope = "기계" | "전기" | "통신" | "소모품" | "정비" | "기타";

export type VendorContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  note: string;
};

export type Vendor = {
  id: string;
  name: string;
  status: VendorStatus;
  region: string;
  scopes: VendorScope[];
  otherScopeText: string;
  contacts: VendorContact[];
  notes: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

export type VendorDraft = {
  name: string;
  status: VendorStatus;
  region: string;
  scopes: VendorScope[];
  otherScopeText: string;
  tagsText: string;
  notes: string;
  contacts: VendorContact[];
};

const SCOPE_OPTIONS: VendorScope[] = ["기계", "전기", "통신", "소모품", "정비", "기타"];

function newId() {
  return createLocalId("V");
}

export function createVendorContact(): VendorContact {
  return { id: newId(), name: "", role: "담당", phone: "", note: "" };
}

export function defaultVendorDraft(): VendorDraft {
  return {
    name: "",
    status: "거래중",
    region: "",
    scopes: ["정비"],
    otherScopeText: "",
    tagsText: "",
    notes: "",
    contacts: [createVendorContact()],
  };
}

export function parseVendorTags(tagsText: string): string[] {
  return (tagsText || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getVendorScopeOptions(): VendorScope[] {
  return SCOPE_OPTIONS;
}


