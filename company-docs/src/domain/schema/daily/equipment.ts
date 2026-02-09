import type { BaseRecord, ValidationResult, Ref } from "./_common";
import { requireText, ensureString, parseTags, newId, nowIso, todayYMD } from "./_common";

export type EquipEventType = "점검" | "고장" | "수리" | "교체" | "기타";
export type EquipStatus = "진행중" | "완료";

export type EquipmentRecord = BaseRecord & {
  kind: "equipment";
  equipment: Ref;
  eventType: EquipEventType;
  status: EquipStatus;
  actions: string;
  prevent: string;
  parts: string;
};

export type EquipmentDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;

  equipment: Ref;
  eventType: EquipEventType;
  status: EquipStatus;
  actions: string;
  prevent: string;
  parts: string;
};

export function defaultEquipmentDraft(): EquipmentDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    equipment: { id: "", label: "" },
    eventType: "점검",
    status: "진행중",
    actions: "",
    prevent: "",
    parts: "",
  };
}

export function normalizeEquipmentDraft(raw: any): EquipmentDraft {
  const b = defaultEquipmentDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    equipment: raw?.equipment || b.equipment,
    eventType: (raw?.eventType === "점검" || raw?.eventType === "고장" || raw?.eventType === "수리" || raw?.eventType === "교체" || raw?.eventType === "기타")
      ? raw.eventType
      : "점검",
    status: raw?.status === "완료" ? "완료" : "진행중",
    actions: ensureString(raw?.actions, ""),
    prevent: ensureString(raw?.prevent, ""),
    parts: ensureString(raw?.parts, ""),
  };
}

export function validateEquipmentDraft(d: EquipmentDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  if (!d.equipment?.id) errors.push({ field: "equipment", message: "설비를 선택하세요." });
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toEquipmentRecord(d: EquipmentDraft): EquipmentRecord {
  const now = nowIso();
  return {
    id: newId("EQ"),
    kind: "equipment",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    equipment: d.equipment,
    eventType: d.eventType,
    status: d.status,
    actions: d.actions.trim(),
    prevent: d.prevent.trim(),
    parts: d.parts.trim(),
  };
}
