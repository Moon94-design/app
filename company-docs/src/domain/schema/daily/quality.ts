import type { BaseRecord, ValidationResult, Ref } from "./_common";
import { requireText, ensureString, ensureArray, parseTags, newId, nowIso, todayYMD } from "./_common";

export type QualityType = "불량" | "클레임" | "검사" | "기타";
export type Severity = "낮음" | "보통" | "높음";

export type TicketRef = { id: string; label: string };

export type QualityRecord = BaseRecord & {
  kind: "quality";
  qType: QualityType;
  severity: Severity;
  related: Ref[];
  tickets: TicketRef[];
};

export type QualityDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;

  qType: QualityType;
  severity: Severity;
  related: Ref[];
  tickets: TicketRef[];
};

export function defaultQualityDraft(): QualityDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    qType: "불량",
    severity: "보통",
    related: [],
    tickets: [],
  };
}

export function normalizeQualityDraft(raw: any): QualityDraft {
  const b = defaultQualityDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    qType: (raw?.qType === "불량" || raw?.qType === "클레임" || raw?.qType === "검사" || raw?.qType === "기타") ? raw.qType : "불량",
    severity: (raw?.severity === "낮음" || raw?.severity === "보통" || raw?.severity === "높음") ? raw.severity : "보통",
    related: ensureArray(raw?.related, []),
    tickets: ensureArray(raw?.tickets, []),
  };
}

export function validateQualityDraft(d: QualityDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  requireText("details", d.details, "내용을 입력하세요.", errors);
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toQualityRecord(d: QualityDraft): QualityRecord {
  const now = nowIso();
  return {
    id: newId("QC"),
    kind: "quality",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    qType: d.qType,
    severity: d.severity,
    related: d.related || [],
    tickets: d.tickets || [],
  };
}
