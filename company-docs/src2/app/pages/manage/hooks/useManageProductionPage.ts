import { useCallback, useEffect, useMemo, useState } from "react";
import { createLocalId, sortByRecordDateUpdated } from "@kernel/utils";
import { createDailyRepo, type RepoContract, type RepoEntity, STORAGE_KEYS } from "@kernel/repo";
import { createJsonStorage } from "@kernel/repo/storage/jsonStorage";

type DailyRecord = RepoEntity & Record<string, unknown>;

export type ProductionRecord = DailyRecord & {
  kind: "production";
  recordDate: string;
  title: string;
  writerName: string;
  writerRole: string;
  site: string;
  details: string;
  lines: unknown[];
  tags: string[];
};

function toUpdatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function normalizeProduction(raw: unknown): ProductionRecord | null {
  const source = (raw ?? {}) as Record<string, unknown>;
  const recordDate =
    typeof source.recordDate === "string" && source.recordDate.trim().length > 0 ? source.recordDate : "";
  if (!recordDate) return null;

  const id = typeof source.id === "string" && source.id.trim().length > 0 ? source.id : createLocalId("PROD");
  const lines = Array.isArray(source.lines) ? source.lines : [];
  const title =
    typeof source.title === "string" && source.title.trim().length > 0
      ? source.title
      : `${recordDate} 생산기록`;

  return {
    ...(source as DailyRecord),
    id,
    kind: "production",
    recordDate,
    title,
    writerName: typeof source.writerName === "string" ? source.writerName : "",
    writerRole: typeof source.writerRole === "string" ? source.writerRole : "",
    site: typeof source.site === "string" ? source.site : "",
    details: typeof source.details === "string" ? source.details : "",
    lines,
    tags: Array.isArray(source.tags) ? source.tags.filter((tag): tag is string => typeof tag === "string") : [],
    updatedAt: toUpdatedAt(source.updatedAt),
  };
}

export function useManageProductionPage() {
  const dailyRepo = useMemo(
    () => createDailyRepo() as unknown as RepoContract<DailyRecord>,
    []
  );
  const storage = useMemo(() => createJsonStorage(), []);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const syncLegacyProduction = useCallback(async () => {
    const all = await dailyRepo.getAll();
    const currentById = new Map(
      all
        .filter((record) => record.kind === "production")
        .map((record) => [record.id, toUpdatedAt(record.updatedAt)])
    );

    const legacy = storage.getItem<unknown[]>(STORAGE_KEYS.dailyProductionLegacyV1);
    const normalizedLegacy = (Array.isArray(legacy) ? legacy : [])
      .map((row) => normalizeProduction(row))
      .filter((row): row is ProductionRecord => Boolean(row));

    if (normalizedLegacy.length > 0) {
      const toUpsert = normalizedLegacy.filter((legacyRecord) => {
        const currentUpdatedAt = currentById.get(legacyRecord.id);
        return currentUpdatedAt === undefined || (legacyRecord.updatedAt ?? 0) > currentUpdatedAt;
      });
      if (toUpsert.length > 0) {
        await dailyRepo.upsertMany(toUpsert as DailyRecord[]);
      }
    }
    storage.setItem(STORAGE_KEYS.dailyProductionLegacyMigratedMeta, true);
  }, [dailyRepo, storage]);

  const refresh = useCallback(async () => {
    await syncLegacyProduction();
    const all = await dailyRepo.getAll();
    const production = all
      .filter((record) => record.kind === "production")
      .map((record) => normalizeProduction(record))
      .filter((record): record is ProductionRecord => Boolean(record));
    setRecords(sortByRecordDateUpdated(production));
  }, [dailyRepo, syncLegacyProduction]);

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      setLoading(true);
      if (!alive) return;
      await refresh();
      if (alive) setLoading(false);
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, [refresh]);

  async function removeRecord(id: string) {
    await dailyRepo.remove(id);
    await refresh();
  }

  return {
    loading,
    records,
    removeRecord,
  };
}
