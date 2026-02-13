import { createLocalId } from "@kernel/utils";
import { normalizeDailyBranch, type DailyBranch } from "@kernel/schema/daily";
import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import { createJsonStorage } from "../storage/jsonStorage";
import type { RepoContract, RepoEntity } from "../types";

export type ActionItemRecord = RepoEntity & {
  title: string;
  details: string;
  issueId: string;
  issueLabel: string;
  vendorId?: string;
  vendorLabel: string;
  vendorCost?: number;
  recordDate: string;
  writerName: string;
  writerRole?: string;
  site?: DailyBranch;
  tags?: string[];
};

export type ActionDocRecord = RepoEntity & {
  recordDate: string;
  writerName: string;
  writerRole?: string;
  site?: DailyBranch;
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

function normalizeSite(value: unknown): DailyBranch | undefined {
  return normalizeDailyBranch(value);
}

function normalizeIdToken(value: string, fallback: string): string {
  const token = value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9가-힣_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return token || fallback;
}

function makeLegacyActionDocId(recordDate: string, site: DailyBranch | undefined, writerName: string): string {
  const siteToken = normalizeIdToken(site || "site", "site");
  const writerToken = normalizeIdToken(writerName, "writer");
  return `ACTION_DOC_${recordDate}_${siteToken}_${writerToken}`;
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag): tag is string => tag.length > 0);
}

function normalizeActionItem(
  raw: unknown,
  fallbackDate: string,
  fallbackWriter: string,
  fallbackRole?: string,
  fallbackSite?: DailyBranch
): ActionItemRecord {
  const item = (raw ?? {}) as Record<string, unknown>;
  const itemId = typeof item.id === "string" && item.id.trim().length > 0 ? item.id : createLocalId("ACTION_ITEM");
  const recordDate =
    typeof item.recordDate === "string" && item.recordDate.trim().length > 0 ? item.recordDate : fallbackDate;
  const writerName =
    typeof item.writerName === "string" && item.writerName.trim().length > 0 ? item.writerName : fallbackWriter;
  const writerRole =
    typeof item.writerRole === "string" && item.writerRole.trim().length > 0
      ? item.writerRole.trim()
      : fallbackRole || "";
  const site = normalizeSite(item.site) || fallbackSite;
  const vendorId = typeof item.vendorId === "string" ? item.vendorId.trim() : "";
  const vendorCost = normalizeNumber(item.vendorCost);
  const tags = normalizeTags(item.tags);

  return {
    id: itemId,
    title: typeof item.title === "string" ? item.title : "",
    details: typeof item.details === "string" ? item.details : "",
    issueId: typeof item.issueId === "string" ? item.issueId : "",
    issueLabel: typeof item.issueLabel === "string" ? item.issueLabel : "",
    vendorId: vendorId || undefined,
    vendorLabel: typeof item.vendorLabel === "string" ? item.vendorLabel : "",
    vendorCost,
    recordDate,
    writerName,
    writerRole,
    site,
    tags: tags.length > 0 ? tags : undefined,
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

  const writerRole = typeof doc.writerRole === "string" ? doc.writerRole.trim() : "";
  const site = normalizeSite(doc.site);
  const docId =
    typeof doc.id === "string" && doc.id.trim().length > 0
      ? doc.id
      : makeLegacyActionDocId(recordDate, site, writerName);
  const rawItems = Array.isArray(doc.items) ? doc.items : [];
  const items = rawItems.map((item) => normalizeActionItem(item, recordDate, writerName, writerRole, site));

  return {
    id: docId,
    recordDate,
    writerName,
    writerRole,
    site,
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
  let legacySynced = false;

  async function syncLegacy() {
    if (legacySynced) return;
    const migratedMeta = storage.getItem<boolean>(STORAGE_KEYS.actionLegacyMigratedMeta);
    if (migratedMeta) {
      legacySynced = true;
      return;
    }

    const current = await repo.getAll();

    const legacy = storage.getItem<unknown[]>(STORAGE_KEYS.actionDocsLegacyV1);
    const normalizedLegacy: ActionDocRecord[] = [];
    let skippedInvalid = 0;
    for (const doc of Array.isArray(legacy) ? legacy : []) {
      const normalized = normalizeActionDoc(doc);
      if (normalized) {
        normalizedLegacy.push(normalized);
      } else {
        skippedInvalid += 1;
      }
    }
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

    if (skippedInvalid > 0) {
      console.warn(`[actionRepo] skipped ${skippedInvalid} invalid legacy docs during one-time migration`);
    }
    storage.setItem(STORAGE_KEYS.actionLegacyMigratedMeta, true);
    legacySynced = true;
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
