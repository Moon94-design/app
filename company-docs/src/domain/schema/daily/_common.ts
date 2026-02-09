export type Ref = { id: string; label: string };

export type BaseRecord = {
  id: string;
  recordDate: string; // 사용자가 선택한 “그날의 기록”
  createdAt: string;  // 작성 시각(저장 시각)
  updatedAt: string;

  writerId?: string;  // 서버 붙이면 핵심
  writerName?: string;

  title: string;
  details: string;
  tags: string[];
};

export type ValidationError = { field: string; message: string };
export type ValidationResult = { ok: true } | { ok: false; errors: ValidationError[] };

export function newId(prefix = "R") {
  // @ts-ignore
  const uuid = (globalThis.crypto?.randomUUID?.() as string | undefined) || "";
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function parseTags(text: string): string[] {
  return (text || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ensureString(v: any, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function ensureArray<T>(v: any, fallback: T[] = []): T[] {
  return Array.isArray(v) ? v : fallback;
}

export function ensureNumber(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function ensureBool(v: any, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function requireText(field: string, value: string, msg: string, errors: ValidationError[]) {
  if (!value.trim()) errors.push({ field, message: msg });
}
