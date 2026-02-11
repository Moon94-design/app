import { createLocalId } from "@kernel/utils";
import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import { createJsonStorage } from "../storage/jsonStorage";
import type { RepoContract, RepoEntity } from "../types";

export type IssueItemRecord = RepoEntity & {
  title: string;
  details: string;
  status: string;
  category: string;
  recordDate: string;
  writerName: string;
};

export type IssueDocRecord = RepoEntity & {
  recordDate: string;
  writerName: string;
  writerRole?: string;
  items: IssueItemRecord[];
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

function normalizeIssueItem(raw: unknown, fallbackDate: string, fallbackWriter: string): IssueItemRecord {
  const item = (raw ?? {}) as Record<string, unknown>;
  const itemId = typeof item.id === "string" && item.id.trim().length > 0 ? item.id : createLocalId("ISSUE_ITEM");
  const recordDate =
    typeof item.recordDate === "string" && item.recordDate.trim().length > 0 ? item.recordDate : fallbackDate;
  const writerName =
    typeof item.writerName === "string" && item.writerName.trim().length > 0 ? item.writerName : fallbackWriter;

  return {
    id: itemId,
    title: typeof item.title === "string" ? item.title : "",
    details: typeof item.details === "string" ? item.details : "",
    status: typeof item.status === "string" ? item.status : "진행중",
    category: typeof item.categoryLabel === "string" ? item.categoryLabel : typeof item.category === "string" ? item.category : "",
    recordDate,
    writerName,
    updatedAt: normalizeUpdatedAt(item.updatedAt),
  };
}

function normalizeIssueDoc(raw: unknown): IssueDocRecord | null {
  const doc = (raw ?? {}) as Record<string, unknown>;
  const recordDate =
    typeof doc.recordDate === "string" && doc.recordDate.trim().length > 0 ? doc.recordDate : "";
  const writerName =
    typeof doc.writerName === "string" && doc.writerName.trim().length > 0 ? doc.writerName : "";
  if (!recordDate || !writerName) return null;

  const docId = typeof doc.id === "string" && doc.id.trim().length > 0 ? doc.id : createLocalId("ISSUE_DOC");
  const rawItems = Array.isArray(doc.items) ? doc.items : [];
  const items = rawItems.map((item) => normalizeIssueItem(item, recordDate, writerName));

  return {
    id: docId,
    recordDate,
    writerName,
    writerRole: typeof doc.writerRole === "string" ? doc.writerRole : "",
    items,
    createdAt: typeof doc.createdAt === "string" ? doc.createdAt : new Date().toISOString(),
    updatedAt: normalizeUpdatedAt(doc.updatedAt),
  };
}

export function createIssueRepo(): RepoContract<IssueDocRecord> {
  const repo = createLocalRepo<IssueDocRecord>({
    storageKey: STORAGE_KEYS.issue,
  });
  const storage = createJsonStorage();

  async function syncLegacy() {
    const current = await repo.getAll();

    const legacy = storage.getItem<unknown[]>(STORAGE_KEYS.issueDocsLegacyV1);
    const normalizedLegacy = (Array.isArray(legacy) ? legacy : [])
      .map((doc) => normalizeIssueDoc(doc))
      .filter((doc): doc is IssueDocRecord => Boolean(doc));
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
    storage.setItem(STORAGE_KEYS.issueLegacyMigratedMeta, true);
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
