// 조치기록 (Action Record) 스키마
import type { ValidationResult, ValidationError } from "./_common";
import { requireText, ensureString, newId, nowIso, todayYMD } from "./_common";

export type ActionItem = {
  id: string;
  recordDate: string;       // 기록일
  actualCreatedAt: string;  // 실제 작성 시점
  site?: "대구" | "성주";
  createdAt: string;
  updatedAt: string;

  writerName: string;
  writerRole: string;
  title: string;
  details: string;

  // 이슈 연계
  issueId?: string;
  issueLabel?: string;

  // 정비업체 연계
  vendorId?: string;
  vendorLabel?: string;
  vendorCost?: number;      // 정비 비용

  tags: string[];
  tagIds: string[];
};

export type ActionDoc = {
  id: string;               // stable id: ACTION_YYYY-MM-DD_writer
  recordDate: string;
  writerName: string;
  items: ActionItem[];
  updatedAt: string;
};

export type ActionDraft = {
  recordDate: string;
  writerName: string;
  writerRole: string;
  site?: "대구" | "성주";
  tagsText: string;

  title: string;
  details: string;

  issueId: string;
  issueLabel: string;

  vendorId: string;
  vendorLabel: string;
  vendorCost: number;
};

export function defaultActionDraft(): ActionDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    writerRole: "",
    site: undefined,
    tagsText: "",
    title: "",
    details: "",
    issueId: "",
    issueLabel: "",
    vendorId: "",
    vendorLabel: "",
    vendorCost: 0,
  };
}

export function normalizeActionDraft(d: Partial<ActionDraft>): ActionDraft {
  return {
    recordDate: ensureString(d.recordDate) || todayYMD(),
    writerName: ensureString(d.writerName),
    writerRole: ensureString(d.writerRole),
    site: d.site,
    tagsText: ensureString(d.tagsText),
    title: ensureString(d.title),
    details: ensureString(d.details),
    issueId: ensureString(d.issueId),
    issueLabel: ensureString(d.issueLabel),
    vendorId: ensureString(d.vendorId),
    vendorLabel: ensureString(d.vendorLabel),
    vendorCost: Number(d.vendorCost) || 0,
  };
}

export function validateActionDraft(d: ActionDraft): ValidationResult {
  const errors: ValidationError[] = [];

  requireText("recordDate", d.recordDate, "기록일을 입력하세요.", errors);
  requireText("writerName", d.writerName, "작성자를 입력하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export function toActionItem(d: ActionDraft): ActionItem {
  const tags = (d.tagsText || "")
    .split(",")
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .map((x) => (x.startsWith("#") ? x.slice(1).trim() : x));

  const now = nowIso();
  return {
    id: newId("ACT"),
    recordDate: d.recordDate,
    actualCreatedAt: now,
    site: d.site,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName,
    writerRole: d.writerRole,
    title: d.title,
    details: d.details,
    issueId: d.issueId || undefined,
    issueLabel: d.issueLabel || undefined,
    vendorId: d.vendorId || undefined,
    vendorLabel: d.vendorLabel || undefined,
    vendorCost: d.vendorCost || undefined,
    tags,
    tagIds: tags,
  };
}
