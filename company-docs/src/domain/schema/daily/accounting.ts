import type { BaseRecord, ValidationResult, Ref } from "./_common";
import { requireText, ensureString, parseTags, newId, nowIso, todayYMD } from "./_common";

export type AccountingKind = "전표" | "정산" | "세금" | "기타";

export type AccountingRecord = BaseRecord & {
  kind: "accounting";
  accKind: AccountingKind;
  amount: number;
  counterparty?: Ref;
  docRef: string;
};

export type AccountingDraft = {
  recordDate: string;
  writerName: string;
  title: string;
  details: string;
  tagsText: string;

  accKind: AccountingKind;
  amountText: string;
  counterparty?: Ref;
  docRef: string;
};

export function defaultAccountingDraft(): AccountingDraft {
  return {
    recordDate: todayYMD(),
    writerName: "",
    title: "",
    details: "",
    tagsText: "",
    accKind: "전표",
    amountText: "0",
    counterparty: undefined,
    docRef: "",
  };
}

export function normalizeAccountingDraft(raw: any): AccountingDraft {
  const b = defaultAccountingDraft();
  return {
    recordDate: ensureString(raw?.recordDate, b.recordDate) || b.recordDate,
    writerName: ensureString(raw?.writerName, ""),
    title: ensureString(raw?.title, ""),
    details: ensureString(raw?.details, ""),
    tagsText: ensureString(raw?.tagsText, ""),
    accKind: (raw?.accKind === "전표" || raw?.accKind === "정산" || raw?.accKind === "세금" || raw?.accKind === "기타") ? raw.accKind : "전표",
    amountText: ensureString(raw?.amountText, "0"),
    counterparty: raw?.counterparty,
    docRef: ensureString(raw?.docRef, ""),
  };
}

export function validateAccountingDraft(d: AccountingDraft): ValidationResult {
  const errors: any[] = [];
  requireText("recordDate", d.recordDate, "기록 날짜를 선택하세요.", errors);
  requireText("title", d.title, "제목을 입력하세요.", errors);
  const amt = Number(d.amountText);
  if (!Number.isFinite(amt)) errors.push({ field: "amountText", message: "금액을 숫자로 입력하세요." });
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function toAccountingRecord(d: AccountingDraft): AccountingRecord {
  const now = nowIso();
  const amt = Number(d.amountText) || 0;
  return {
    id: newId("ACC"),
    kind: "accounting",
    recordDate: d.recordDate,
    createdAt: now,
    updatedAt: now,
    writerName: d.writerName.trim() || undefined,
    title: d.title.trim(),
    details: d.details.trim(),
    tags: parseTags(d.tagsText),
    accKind: d.accKind,
    amount: amt,
    counterparty: d.counterparty,
    docRef: d.docRef.trim(),
  };
}
