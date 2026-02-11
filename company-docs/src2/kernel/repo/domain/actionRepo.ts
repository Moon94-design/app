import { createLocalId } from "@kernel/utils";
import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import { createJsonStorage } from "../storage/jsonStorage";
import type { RepoContract, RepoEntity } from "../types";

export type ActionItemRecord = RepoEntity & {
  title: string;
  details: string;
  issueId: string;
  issueLabel: string;
  vendorLabel: string;
  recordDate: string;
  writerName: string;
};

export type ActionDocRecord = RepoEntity & {
  recordDate: string;
  writerName: string;
  items: ActionItemRecord[];
  createdAt: string;
};

function normalizeUpdatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function normalizeActionItem(raw: unknown, fallbackDate: string, fallbackWriter: string): ActionItemRecord {
  const item = (raw ?? {}) as Record<string, unknown>;
  const itemId = typeof item.id === "string" && item.id.trim().length > 0 ? item.id : createLocalId("ACTION_ITEM");
  const recordDate =
    typeof item.recordDate === "string" && item.recordDate.trim().length > 0 ? item.recordDate : fallbackDate;
  const writerName =
    typeof item.writerName === "string" && item.writerName.trim().length > 0 ? item.writerName : fallbackWriter;

  return {
    id: itemId,
    title: typeof item.title === "string" ? item.title : "",
    details: typeof item.details === "string" ? item.details : "",
    issueId: typeof item.issueId === "string" ? item.issueId : "",
    issueLabel: typeof item.issueLabel === "string" ? item.issueLabel : "",
    vendorLabel: typeof item.vendorLabel === "string" ? item.vendorLabel : "",
    recordDate,
    writerName,
    updatedAt: normalizeUpdatedAt(item.updatedAt),
  };
}

function normalizeActionDoc(raw: unknown): ActionDocRecord | null {
  const doc = (raw ?? {}) as Record<string, unknown>;
  const recordDate =
    typeof doc.recordDate === "string" && doc.recordDate.trim().length > 0 ? doc.recordDate : "";
  const writerName =
    typeof doc.writerName === "string" && doc.writerName.trim().length > 0 ? doc.writerName : "";
  if (!recordDate || !writerName) return null;

  const docId = typeof doc.id === "string" && doc.id.trim().length > 0 ? doc.id : createLocalId("ACTION_DOC");
  const rawItems = Array.isArray(doc.items) ? doc.items : [];
  const items = rawItems.map((item) => normalizeActionItem(item, recordDate, writerName));

  return {
    id: docId,
    recordDate,
    writerName,
    items,
    createdAt: typeof doc.createdAt === "string" ? doc.createdAt : new Date().toISOString(),
    updatedAt: normalizeUpdatedAt(doc.updatedAt),
  };
}

export function createActionRepo(): RepoContract<ActionDocRecord> {
  const repo = createLocalRepo<ActionDocRecord>({
    storageKey: STORAGE_KEYS.action,
  });
  const storage = createJsonStorage();

  async function syncLegacy() {
    const current = await repo.getAll();

    const legacy = storage.getItem<unknown[]>(STORAGE_KEYS.actionDocsLegacyV1);
    const normalizedLegacy = (Array.isArray(legacy) ? legacy : [])
      .map((doc) => normalizeActionDoc(doc))
      .filter((doc): doc is ActionDocRecord => Boolean(doc));
    if (normalizedLegacy.length > 0) {
      const currentById = new Map(current.map((doc) => [doc.id, doc]));
      const toUpsert = normalizedLegacy.filter((legacyDoc) => {
        const currentDoc = currentById.get(legacyDoc.id);
        return !currentDoc || (legacyDoc.updatedAt ?? 0) > (currentDoc.updatedAt ?? 0);
      });
      if (toUpsert.length > 0) {
        await repo.upsertMany(toUpsert);
      }
    }
    storage.setItem(STORAGE_KEYS.actionLegacyMigratedMeta, true);
  }

  return {
    async getAll() {
      await syncLegacy();
      return repo.getAll();
    },
    async getById(id) {
      await syncLegacy();
      return repo.getById(id);
    },
    async upsert(item) {
      await syncLegacy();
      return repo.upsert(item);
    },
    async upsertMany(items) {
      await syncLegacy();
      return repo.upsertMany(items);
    },
    async remove(id) {
      await syncLegacy();
      return repo.remove(id);
    },
    async removeMany(ids) {
      await syncLegacy();
      return repo.removeMany(ids);
    },
  };
}
