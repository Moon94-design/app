import { DAILY_BRANCH_OPTIONS, type DailyBranch } from "@kernel/schema/daily";
import { createLocalId, todayYmd } from "@kernel/utils";
import type { OfficeDraft, OfficeLineDraft, OfficeLinkTypeOption } from "./types";

export const OFFICE_BRANCH_OPTIONS: readonly DailyBranch[] = DAILY_BRANCH_OPTIONS;

export const OFFICE_LINK_TYPE_OPTIONS: readonly OfficeLinkTypeOption[] = [
  { id: "partner", label: "거래처" },
  { id: "vehicle", label: "차량" },
  { id: "consumable", label: "소모품" },
  { id: "equipment", label: "설비" },
  { id: "agency", label: "관계기관" },
  { id: "employee", label: "직원" },
  { id: "vendor", label: "서비스업체" },
];

export function buildDefaultLineDraft(): OfficeLineDraft {
  return {
    subtitle: "",
    details: "",
    linkType: "partner",
    linkId: "",
    linkedReferences: [],
  };
}

export function buildDefaultDraft(): OfficeDraft {
  return {
    recordDate: todayYmd(),
    site: OFFICE_BRANCH_OPTIONS[0],
    writerName: "",
    writerRole: "",
    lineDraft: buildDefaultLineDraft(),
    lines: [],
  };
}

export function createOfficeLineId() {
  return createLocalId("OFFICE_LINE");
}
