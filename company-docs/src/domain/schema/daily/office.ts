import type { BaseRecord, ValidationResult } from "./_common";
import { requireText, ensureString, ensureArray, parseTags, newId, nowIso, todayYMD } from "./_common";

export type OfficeExtraAgency = { id: string; agencyId: string; agencyLabel: string; title: string; details: string };
export type OfficeExtraEtc = { id: string; title: string; details: string };

export type OfficeRecord = BaseRecord & {
  kind: "office";
  extraAgencies: OfficeExtraAgency[];
  extraEtc: OfficeExtraEtc[];
};

export type OfficeDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;

  extraAgencies: OfficeExtraAgency[];
  extraEtc: OfficeExtraEtc[];
};

export function defaultOfficeDraft(): OfficeDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    extraAgencies: [],
    extraEtc: [],
  };
}

export function normalizeOfficeDraft(raw: any): OfficeDraft {
  const b = defaultOfficeDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    extraAgencies: ensureArray(raw?.extraAgencies, []),
    extraEtc: ensureArray(raw?.extraEtc, []),
  };
}

export function validateOfficeDraft(d: OfficeDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  requireText("details", d.details, "내용을 입력하세요.", errors);
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toOfficeRecord(d: OfficeDraft): OfficeRecord {
  const now = nowIso();
  return {
    id: newId("OFF"),
    kind: "office",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    extraAgencies: d.extraAgencies || [],
    extraEtc: d.extraEtc || [],
  };
}
