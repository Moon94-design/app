export type Ref = { id: string; label: string };

export type BaseRecord = {
  id: string;
  recordDate: string;
  createdAt: string;
  updatedAt: number;
  title: string;
  details: string;
  tags: string[];
  kind: string;
  site?: string;
  writerId?: string;
  writerName?: string;
  writerRole?: string;
};

export function newId(prefix = "R") {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function parseTags(text: string): string[] {
  return (text || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function buildTagsText(tags: string[]): string {
  return (tags || []).join(", ");
}
