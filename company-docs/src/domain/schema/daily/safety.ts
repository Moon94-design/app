import type { BaseRecord, ValidationResult, Ref } from "./_common";
import { requireText, ensureString, ensureArray, parseTags, newId, nowIso, todayYMD } from "./_common";

export type SafetyType = "사고" | "근접사고" | "교육" | "점검" | "기타";
export type Risk = "낮음" | "보통" | "높음";

export type TicketRef = { id: string; label: string };

export type SafetyRecord = BaseRecord & {
  kind: "safety";
  sType: SafetyType;
  risk: Risk;
  location: string;
  related: Ref[];
  tickets: TicketRef[];
};

export type SafetyDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;

  sType: SafetyType;
  risk: Risk;
  location: string;
  related: Ref[];
  tickets: TicketRef[];
};

export function defaultSafetyDraft(): SafetyDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    sType: "점검",
    risk: "보통",
    location: "",
    related: [],
    tickets: [],
  };
}

export function normalizeSafetyDraft(raw: any): SafetyDraft {
  const b = defaultSafetyDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    sType: (raw?.sType === "사고" || raw?.sType === "근접사고" || raw?.sType === "교육" || raw?.sType === "점검" || raw?.sType === "기타") ? raw.sType : "점검",
    risk: (raw?.risk === "낮음" || raw?.risk === "보통" || raw?.risk === "높음") ? raw.risk : "보통",
    location: ensureString(raw?.location, ""),
    related: ensureArray(raw?.related, []),
    tickets: ensureArray(raw?.tickets, []),
  };
}

export function validateSafetyDraft(d: SafetyDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  requireText("details", d.details, "내용을 입력하세요.", errors);
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toSafetyRecord(d: SafetyDraft): SafetyRecord {
  const now = nowIso();
  return {
    id: newId("SAFE"),
    kind: "safety",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    sType: d.sType,
    risk: d.risk,
    location: d.location.trim(),
    related: d.related || [],
    tickets: d.tickets || [],
  };
}