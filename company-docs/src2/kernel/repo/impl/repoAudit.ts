import { STORAGE_KEYS } from "../keys";
import { createJsonStorage } from "../storage/jsonStorage";
import { readMyInfoProfile } from "../../user/myInfo";

type RepoAuditAction = "create" | "update" | "delete";

export type RepoAuditEvent = {
  id: string;
  at: number;
  repoKey: string;
  entityId: string;
  action: RepoAuditAction;
  actorId: string;
  actorName: string;
  actorRole: string;
  actorSite: string;
  snapshot?: {
    kind?: string;
    recordDate?: string;
    title?: string;
    writerName?: string;
    writerRole?: string;
    site?: string;
    lineCount?: number;
    itemCount?: number;
  };
};

const storage = createJsonStorage();
const MAX_AUDIT_EVENTS = 5000;

function makeEventId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `AUDIT_${uuid}`;
  return `AUDIT_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function toText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function toCount(value: unknown): number | undefined {
  return Array.isArray(value) ? value.length : undefined;
}

function toSnapshot(entity: unknown): RepoAuditEvent["snapshot"] | undefined {
  if (!entity || typeof entity !== "object") return undefined;
  const row = entity as Record<string, unknown>;
  const snapshot = {
    kind: toText(row.kind),
    recordDate: toText(row.recordDate),
    title: toText(row.title),
    writerName: toText(row.writerName),
    writerRole: toText(row.writerRole),
    site: toText(row.site),
    lineCount: toCount(row.lines),
    itemCount: toCount(row.items),
  };

  const hasAny = Object.values(snapshot).some((value) => value !== undefined);
  return hasAny ? snapshot : undefined;
}

function readAllEvents(): RepoAuditEvent[] {
  return storage.getItem<RepoAuditEvent[]>(STORAGE_KEYS.repoAuditEventLogV1) ?? [];
}

export function appendRepoAuditEvent(
  action: RepoAuditAction,
  repoKey: string,
  entityId: string,
  snapshotSource?: unknown
) {
  const actor = readMyInfoProfile();

  const event: RepoAuditEvent = {
    id: makeEventId(),
    at: Date.now(),
    repoKey,
    entityId,
    action,
    actorId: actor?.id || "anonymous",
    actorName: actor?.writerName || "(미설정)",
    actorRole: actor?.writerRole || "(미설정)",
    actorSite: actor?.site || "(미설정)",
    snapshot: toSnapshot(snapshotSource),
  };

  const current = readAllEvents();
  current.push(event);

  if (current.length > MAX_AUDIT_EVENTS) {
    storage.setItem(STORAGE_KEYS.repoAuditEventLogV1, current.slice(-MAX_AUDIT_EVENTS));
    return;
  }
  storage.setItem(STORAGE_KEYS.repoAuditEventLogV1, current);
}

export function listRepoAuditEvents(): RepoAuditEvent[] {
  return readAllEvents();
}
