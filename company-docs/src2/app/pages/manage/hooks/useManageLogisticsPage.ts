import { useEffect, useMemo, useState } from "react";
import {
  createDailyRepo,
  createWeighingRepo,
  type RepoContract,
  type RepoEntity,
} from "@kernel/repo";
import {
  applyTagText,
  convertAllWeighingToLogistics,
  withNormalizedLogisticsRecord,
  type LogisticsLine,
  type LogisticsRecord,
  type WeighingTransaction,
} from "@kernel/schema/daily";

type WeighingRepoRecord = WeighingTransaction & RepoEntity;
type DailyRepoRecord = RepoEntity & Record<string, unknown>;
type DailySeedMetaRecord = DailyRepoRecord & {
  kind: "__meta";
  key: "seed:manage:daily:logistics:from-weighing:v1";
  createdAt: string;
};

const LOGISTICS_SEED_META_ID = "seed:manage:daily:logistics:from-weighing:v1";

export function useManageLogisticsPage() {
  const dailyRepo = useMemo(
    () => createDailyRepo() as unknown as RepoContract<DailyRepoRecord>,
    []
  );
  const weighingRepo = useMemo(
    () => createWeighingRepo() as unknown as RepoContract<WeighingRepoRecord>,
    []
  );
  const [records, setRecords] = useState<LogisticsRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      setLoading(true);

      const dailyAll = await dailyRepo.getAll();
      const hasSeedMeta = dailyAll.some((record) => record.id === LOGISTICS_SEED_META_ID);
      const logisticsOnly = dailyAll
        .filter((record) => record.kind === "logistics")
        .map((record) => withNormalizedLogisticsRecord(record as LogisticsRecord))
        .sort((a, b) => b.recordDate.localeCompare(a.recordDate));

      if (logisticsOnly.length > 0) {
        if (alive) {
          setRecords(logisticsOnly);
          setLoading(false);
        }
        return;
      }

      if (hasSeedMeta) {
        if (alive) {
          setRecords([]);
          setLoading(false);
        }
        return;
      }

      const weighing = await weighingRepo.getAll();
      const converted = convertAllWeighingToLogistics(weighing as WeighingTransaction[]);

      if (converted.length > 0) {
        await dailyRepo.upsertMany(converted as DailyRepoRecord[]);
      }
      await dailyRepo.upsert({
        id: LOGISTICS_SEED_META_ID,
        kind: "__meta",
        key: LOGISTICS_SEED_META_ID,
        createdAt: new Date().toISOString(),
        updatedAt: Date.now(),
      } as DailySeedMetaRecord);

      if (alive) {
        setRecords(converted.slice().reverse());
        setLoading(false);
      }
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, [dailyRepo, weighingRepo]);

  const editingRecord = useMemo(
    () => records.find((record) => record.id === editingId) ?? null,
    [records, editingId]
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function startEdit(id: string) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveRecord(record: LogisticsRecord, tagsText: string) {
    const next = applyTagText(
      {
        ...record,
        updatedAt: Date.now(),
      },
      tagsText
    );
    await dailyRepo.upsert(next as DailyRepoRecord);
    const dailyAll = await dailyRepo.getAll();
    const logisticsOnly = dailyAll
      .filter((item) => item.kind === "logistics")
      .map((item) => withNormalizedLogisticsRecord(item as LogisticsRecord))
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    setRecords(logisticsOnly);
    setEditingId(null);
  }

  async function removeLine(record: LogisticsRecord, lineIndex: number) {
    const nextLines = record.lines.filter((_, idx) => idx !== lineIndex);
    const next = {
      ...record,
      lines: nextLines,
      updatedAt: Date.now(),
    };
    await dailyRepo.upsert(next as DailyRepoRecord);
    await saveRecord(next, next.tags.join(", "));
  }

  function updateLine(
    lines: LogisticsLine[],
    index: number,
    field: keyof LogisticsLine,
    value: LogisticsLine[keyof LogisticsLine]
  ): LogisticsLine[] {
    return lines.map((line, idx) => (idx === index ? { ...line, [field]: value } : line));
  }

  return {
    loading,
    records,
    expandedIds,
    editingRecord,
    toggleExpand,
    startEdit,
    cancelEdit,
    saveRecord,
    removeLine,
    updateLine,
  };
}
