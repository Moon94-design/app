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
type SiteFilter = "all" | "daegu" | "seongju";
type MissingFilter = "all" | "missing" | "complete";
type EditScope = "all" | "missing";
type DailySeedMetaRecord = DailyRepoRecord & {
  kind: "__meta";
  key: "seed:manage:daily:logistics:from-weighing:v1";
  createdAt: string;
};

const LOGISTICS_SEED_META_ID = "seed:manage:daily:logistics:from-weighing:v1";

function isTradeLogisticsLine(line: LogisticsLine): boolean {
  return line.direction === "매입" || line.direction === "출고";
}

function toTradeOnlyRecord(record: LogisticsRecord): LogisticsRecord | null {
  const tradeLines = (record.lines || []).filter((line) => isTradeLogisticsLine(line));
  if (tradeLines.length === 0) return null;
  return {
    ...record,
    lines: tradeLines,
  };
}

function mergeLogisticsByDate(records: LogisticsRecord[]): LogisticsRecord[] {
  const grouped = new Map<string, LogisticsRecord>();
  for (const record of records) {
    const key = record.recordDate || "1900-01-01";
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, {
        ...record,
        title: `${key} 유통기록 (${record.lines.length}건)`,
      });
      continue;
    }
    const mergedLines = [...current.lines, ...record.lines];
    grouped.set(key, {
      ...current,
      lines: mergedLines,
      tags: Array.from(new Set([...(current.tags || []), ...(record.tags || [])])),
      title: `${key} 유통기록 (${mergedLines.length}건)`,
      updatedAt: Math.max(Number(current.updatedAt || 0), Number(record.updatedAt || 0)),
    });
  }
  return Array.from(grouped.values()).sort((a, b) => b.recordDate.localeCompare(a.recordDate));
}

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
  const [editingScope, setEditingScope] = useState<EditScope>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [siteFilter, setSiteFilter] = useState<SiteFilter>("all");
  const [missingFilter, setMissingFilter] = useState<MissingFilter>("all");

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      setLoading(true);

      const dailyAll = await dailyRepo.getAll();
      const logisticsOnly = dailyAll
        .filter((record) => record.kind === "logistics")
        .map((record) => withNormalizedLogisticsRecord(record as LogisticsRecord))
      const merged = mergeLogisticsByDate(logisticsOnly);

      if (merged.length > 0) {
        if (alive) {
          setRecords(merged);
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
        setRecords(mergeLogisticsByDate(converted.slice().reverse()));
        setLoading(false);
      }
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, [dailyRepo, weighingRepo]);

  const tradeRecords = useMemo(
    () =>
      records
        .map((record) => toTradeOnlyRecord(record))
        .filter((record): record is LogisticsRecord => Boolean(record)),
    [records]
  );

  const editingRecord = useMemo(() => {
    if (!editingId) return null;
    const source = records.find((record) => record.id === editingId);
    if (!source) return null;
    return toTradeOnlyRecord(source);
  }, [records, editingId]);

  const filteredRecords = useMemo(() => {
    return tradeRecords
      .map((record) => {
        const nextLines = record.lines.filter((line) => {
          const siteOk = siteFilter === "all" ? true : (line.site || "") === siteFilter;
          const missingOk =
            missingFilter === "all"
              ? true
              : missingFilter === "missing"
                ? Boolean(line.baseMissing || line.extraMissing)
                : !line.baseMissing && !line.extraMissing;
          return siteOk && missingOk;
        });
        return { ...record, lines: nextLines };
      })
      .filter((record) => record.lines.length > 0);
  }, [tradeRecords, siteFilter, missingFilter]);

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

  function startEdit(id: string, scope: EditScope = "all") {
    setEditingId(id);
    setEditingScope(scope);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingScope("all");
  }

  async function saveRecord(record: LogisticsRecord, tagsText: string) {
    const source = records.find((row) => row.id === record.id);
    const nextTradeLines = record.lines.filter((line) => isTradeLogisticsLine(line));
    const nextProcessingLines = record.lines.filter((line) => !isTradeLogisticsLine(line));
    const sourceProcessingLines = source
      ? source.lines.filter((line) => !isTradeLogisticsLine(line))
      : [];

    const next = applyTagText(
      withNormalizedLogisticsRecord({
        ...record,
        lines:
          nextProcessingLines.length > 0
            ? [...nextTradeLines, ...nextProcessingLines]
            : [...nextTradeLines, ...sourceProcessingLines],
        updatedAt: Date.now(),
      }),
      tagsText
    );
    await dailyRepo.upsert(next as DailyRepoRecord);
    const dailyAll = await dailyRepo.getAll();
    const logisticsOnly = dailyAll
      .filter((item) => item.kind === "logistics")
      .map((item) => withNormalizedLogisticsRecord(item as LogisticsRecord))
    setRecords(mergeLogisticsByDate(logisticsOnly));
    setEditingId(null);
    setEditingScope("all");
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
    records: filteredRecords,
    rawRecords: tradeRecords,
    expandedIds,
    editingRecord,
    editingScope,
    siteFilter,
    setSiteFilter,
    missingFilter,
    setMissingFilter,
    toggleExpand,
    startEdit,
    cancelEdit,
    saveRecord,
    removeLine,
    updateLine,
  };
}
