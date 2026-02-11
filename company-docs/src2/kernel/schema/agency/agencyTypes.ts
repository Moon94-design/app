// ORIGIN: copied from src/app/pages/register/RegisterAgency.tsx (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

import { createLocalId } from "@kernel/utils";

export type AgencyScope = "관계기관" | "지원사업" | "보조금" | "기타";
export type AgencyStatus = "거래중" | "보류" | "중단";

export type AgencyContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  note: string;
};

export type Agency = {
  id: string;
  name: string;
  baseName: string;
  detailTag: string;
  status: AgencyStatus;
  scopes: AgencyScope[];
  scopeNotes: Record<string, string>;
  contacts: AgencyContact[];
  region: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

export type AgencyDraft = {
  baseName: string;
  detailTag: string;
  status: AgencyStatus;
  region: string;
  scopes: AgencyScope[];
  scopeNotes: Record<string, string>;
  contacts: AgencyContact[];
  notes: string;
};

const AGENCY_SCOPE_OPTIONS: AgencyScope[] = ["관계기관", "지원사업", "보조금", "기타"];

function newId() {
  return createLocalId("A");
}

export function createAgencyContact(): AgencyContact {
  return { id: newId(), name: "", role: "담당", phone: "", email: "", note: "" };
}

export function getAgencyScopeOptions(): AgencyScope[] {
  return AGENCY_SCOPE_OPTIONS;
}

export function defaultAgencyDraft(): AgencyDraft {
  return {
    baseName: "",
    detailTag: "",
    status: "거래중",
    region: "",
    scopes: ["관계기관"],
    scopeNotes: { 관계기관: "" },
    contacts: [createAgencyContact()],
    notes: "",
  };
}

export function displayAgencyName(baseName: string, detailTag: string): string {
  const base = (baseName || "").trim();
  const tag = (detailTag || "").trim();
  return tag ? `${base} · ${tag}` : base;
}


