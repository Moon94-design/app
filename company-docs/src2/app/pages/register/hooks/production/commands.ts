import type { RepoContract } from "@kernel/repo";
import type { ProductionDraft, ProductionRecord } from "@kernel/schema/daily";
import { makeProductionDocId, makeProductionLegacyDocId } from "./constants";
import { formatDailyProductionTitle } from "./formatters";
import type { DailyRepoRecord, ProductionDocs, SubmitResult } from "./types";

type SubmitProductionCommandArgs = {
  dailyRepo: RepoContract<DailyRepoRecord>;
  draft: ProductionDraft;
  actorId?: string;
  docs: ProductionDocs;
  refresh: () => Promise<void>;
  resetDraft: () => void;
};

export async function submitProductionCommand({
  dailyRepo,
  draft,
  actorId,
  docs,
  refresh,
  resetDraft,
}: SubmitProductionCommandArgs): Promise<SubmitResult> {
  if (!draft.recordDate) {
    return { ok: false, message: "기록일을 입력해 주세요." };
  }
  if (!draft.writerName.trim()) {
    return { ok: false, message: "작성자를 입력해 주세요." };
  }
  if (!draft.writerRole.trim()) {
    return { ok: false, message: "직책을 입력해 주세요." };
  }
  if (!draft.site) {
    return { ok: false, message: "지부를 선택해 주세요." };
  }
  if (!(draft.lines || []).length) {
    return { ok: false, message: "생산 항목을 1개 이상 추가해 주세요." };
  }

  const title = formatDailyProductionTitle({
    writerName: draft.writerName,
    writerRole: draft.writerRole,
    recordDate: draft.recordDate,
  });

  const nowMs = Date.now();
  const actorKey = actorId?.trim() || draft.writerName.trim();
  const id = makeProductionDocId(draft.recordDate, draft.site, actorKey);
  const legacyId = makeProductionLegacyDocId(draft.recordDate, draft.site, draft.writerName);
  const existed = docs.find((item) => item.id === id || item.id === legacyId);

  const record: ProductionRecord = {
    id,
    kind: "production",
    recordDate: draft.recordDate,
    createdAt: existed?.createdAt || new Date(nowMs).toISOString(),
    updatedAt: nowMs,
    writerId: actorId?.trim() || undefined,
    writerName: draft.writerName.trim(),
    writerRole: draft.writerRole.trim(),
    site: draft.site,
    title,
    details: "",
    tags: [],
    lines: (draft.lines || []).map((line) => ({
      ...line,
      bags: Number(line.bags) || 0,
      kg: 0,
      memo: line.memo.trim(),
    })),
  };

  await dailyRepo.upsert(record as unknown as DailyRepoRecord);
  if (existed?.id && existed.id !== id) {
    await dailyRepo.remove(existed.id);
  }
  await refresh();
  resetDraft();

  return { ok: true, message: "생산 기록이 저장되었습니다." };
}
