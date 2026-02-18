import type { RepoContract, RepoEntity } from "@kernel/repo";
import { fromLogisticsSiteCode, type LogisticsRecord } from "@kernel/schema/daily";
import type { LogisticsDraft, SubmitResult } from "./types";

type DailyRepoRecord = RepoEntity & Record<string, unknown>;

export type EditingLineTarget = {
  recordId: string;
  recordDate: string;
  lineIndex: number;
};

type StartEditLineCommandArgs = {
  records: LogisticsRecord[];
  recordId: string;
  lineIndex: number;
  draft: LogisticsDraft;
  canRead?: () => boolean;
};

type StartEditLineCommandResult = {
  result: SubmitResult;
  nextDraft?: LogisticsDraft;
  nextTarget?: EditingLineTarget;
};

type RemoveLineCommandArgs = {
  dailyRepo: RepoContract<DailyRepoRecord>;
  recordId: string;
  lineIndex: number;
  refreshRecords: () => Promise<LogisticsRecord[]>;
  canDelete?: () => boolean;
};

export function startEditLineCommand({
  records,
  recordId,
  lineIndex,
  draft,
  canRead,
}: StartEditLineCommandArgs): StartEditLineCommandResult {
  if (canRead && !canRead()) {
    return { result: { ok: false, message: "조회 권한이 없어 항목을 불러올 수 없습니다." } };
  }
  const record = records.find((row) => row.id === recordId);
  if (!record) {
    return { result: { ok: false, message: "수정할 유통 기록을 찾지 못했습니다." } };
  }

  const line = (record.lines || [])[lineIndex];
  if (!line) {
    return { result: { ok: false, message: "수정할 항목을 찾지 못했습니다." } };
  }

  const nextDraft: LogisticsDraft = {
    ...draft,
    recordDate: record.recordDate || draft.recordDate,
    site: fromLogisticsSiteCode(line.site || ""),
    writerName: record.writerName || draft.writerName,
    writerRole: record.writerRole || draft.writerRole,
    partnerId: line.partner?.id || "",
    partnerLabel: line.partner?.label || "",
    vehicleId: line.vehicle?.id || "",
    vehicleNo: line.vehicle?.label || "",
    direction: line.isReturn && line.sourceDirection ? line.sourceDirection : line.direction,
    kind: line.kind,
    item: line.item,
    detailItem: line.detailItem || "",
    grossKg: Number(line.grossKg || 0),
    tareKg: Number(line.tareKg || 0),
    kg: Number(line.kg || 0),
    unitPricePerKg: Number(line.unitPricePerKg || 0),
    memo: line.memo || "",
    isReturn: Boolean(line.isReturn),
    returnSourceDateFilter: line.isReturn ? record.recordDate || "" : "",
    returnSourceRecordId: line.returnSourceRecordId || "",
    returnSourceLineId: line.returnSourceLineId || "",
    sourceDirection: line.sourceDirection || "",
    sourceKg: Number(line.sourceKg || 0),
  };

  return {
    result: { ok: true, message: "항목을 수정 모드로 불러왔습니다. 상단 폼에서 저장해 주세요." },
    nextDraft,
    nextTarget: {
      recordId: record.id,
      recordDate: record.recordDate,
      lineIndex,
    },
  };
}

export async function removeLineCommand({
  dailyRepo,
  recordId,
  lineIndex,
  refreshRecords,
  canDelete,
}: RemoveLineCommandArgs): Promise<SubmitResult> {
  if (canDelete && !canDelete()) {
    return { ok: false, message: "삭제 권한이 없어 항목을 삭제할 수 없습니다." };
  }
  const target = (await dailyRepo.getById(recordId)) as LogisticsRecord | null;
  if (!target) {
    return { ok: false, message: "삭제할 유통 기록을 찾지 못했습니다." };
  }

  if (lineIndex < 0 || lineIndex >= (target.lines || []).length) {
    return { ok: false, message: "삭제할 항목 인덱스가 유효하지 않습니다." };
  }

  const nextLines = (target.lines || []).filter((_, index) => index !== lineIndex);

  if (nextLines.length === 0) {
    await dailyRepo.remove(target.id);
  } else {
    await dailyRepo.upsert({
      ...target,
      lines: nextLines,
      updatedAt: Date.now(),
    } as DailyRepoRecord);
  }

  await refreshRecords();
  return { ok: true, message: "선택한 유통 항목을 삭제했습니다." };
}
