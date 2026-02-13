import type { RepoContract, RepoEntity } from "@kernel/repo";
import { recomputeLineMissing, toLogisticsSiteCode, type LogisticsLine, type LogisticsRecord } from "@kernel/schema/daily";
import {
  mergeTradeProfiles,
  resolvePartnerStatus,
  type PartnerV2,
  type TradeProfileItem,
} from "@kernel/schema/partner";
import { createLocalId } from "@kernel/utils";
import { defaultDraft } from "./constants";
import { formatDailyLogisticsTitle } from "./formatters";
import { normalizeProfileKind } from "./selectors";
import type { LogisticsDraft, SubmitResult } from "./types";

type DailyRepoRecord = RepoEntity & Record<string, unknown>;

type SubmitLogisticsCommandArgs = {
  dailyRepo: RepoContract<DailyRepoRecord>;
  partnerRepo: RepoContract<PartnerV2>;
  draft: LogisticsDraft;
  hasCategory: boolean;
  hasPrice: boolean;
  showScrapDetail: boolean;
  refreshRecords: () => Promise<LogisticsRecord[]>;
  saveDraft: (next: LogisticsDraft) => void;
  setDraft: (next: LogisticsDraft) => void;
  setCustomDetailInput: (next: string) => void;
};

function getReturnedKgForSource(
  records: LogisticsRecord[],
  sourceRecordId: string,
  sourceLineId: string
): number {
  return records.reduce((sum, record) => {
    const recordReturned = (record.lines || []).reduce((lineSum, line) => {
      if (!line.isReturn) return lineSum;
      if ((line.returnSourceRecordId || "").trim() !== sourceRecordId) return lineSum;
      if ((line.returnSourceLineId || "").trim() !== sourceLineId) return lineSum;
      return lineSum + (Number(line.returnedKg ?? line.kg ?? 0) || 0);
    }, 0);
    return sum + recordReturned;
  }, 0);
}

async function syncPartnerProfileFromLine(args: {
  partnerRepo: RepoContract<PartnerV2>;
  partnerId: string;
  line: LogisticsLine;
}) {
  const { partnerRepo, partnerId, line } = args;
  if (!partnerId || line.direction === "처리" || line.isReturn || !line.item) return;

  const partner = await partnerRepo.getById(partnerId);
  if (!partner) return;

  const nextProfile: TradeProfileItem = {
    direction: line.direction === "출고" ? "매출" : "매입",
    item: line.item as TradeProfileItem["item"],
    kind: normalizeProfileKind(line.kind),
    memo: line.detailItem?.trim() || "",
  };

  const mergedProfiles = mergeTradeProfiles(partner.extra.tradeProfiles || [], [nextProfile], "append");
  if (mergedProfiles.length === (partner.extra.tradeProfiles || []).length) return;

  const nextExtra = {
    ...partner.extra,
    tradeProfiles: mergedProfiles,
  };
  nextExtra.status = resolvePartnerStatus(partner.base, nextExtra);

  await partnerRepo.upsert({ ...partner, extra: nextExtra, updatedAt: Date.now() });
}

export async function submitLogisticsCommand({
  dailyRepo,
  partnerRepo,
  draft,
  hasCategory,
  hasPrice,
  showScrapDetail,
  refreshRecords,
  saveDraft,
  setDraft,
  setCustomDetailInput,
}: SubmitLogisticsCommandArgs): Promise<SubmitResult> {
  if (!draft.recordDate) {
    return { ok: false, message: "기록일을 입력해 주세요." };
  }
  if (!draft.site) {
    return { ok: false, message: "지부를 선택해 주세요." };
  }
  if (!draft.partnerId || !draft.partnerLabel) {
    return { ok: false, message: "거래처를 선택해 주세요." };
  }
  if (!draft.writerName.trim()) {
    return { ok: false, message: "작성자를 입력해 주세요." };
  }
  if (!draft.writerRole.trim()) {
    return { ok: false, message: "직책을 입력해 주세요." };
  }
  if (!draft.vehicleNo.trim()) {
    return { ok: false, message: "차량을 선택하거나 추천 차량번호를 눌러 주세요." };
  }
  if ((Number(draft.kg) || 0) <= 0) {
    return { ok: false, message: "실중량은 0보다 커야 합니다." };
  }
  if (hasCategory && !draft.item) {
    return { ok: false, message: "종류를 선택해 주세요." };
  }
  if (showScrapDetail && !draft.detailItem.trim()) {
    return { ok: false, message: "세부 품목을 선택하거나 입력해 주세요." };
  }
  if (hasPrice && (Number(draft.unitPricePerKg) || 0) <= 0) {
    return { ok: false, message: "단가는 0보다 커야 합니다." };
  }
  if (draft.isReturn) {
    if (!draft.returnSourceRecordId || !draft.returnSourceLineId) {
      return { ok: false, message: "반품 원본 항목을 선택해 주세요." };
    }
    if (!draft.sourceDirection) {
      return { ok: false, message: "반품 원본 방향 정보가 없습니다. 원본 항목을 다시 선택해 주세요." };
    }
    if ((Number(draft.sourceKg) || 0) <= 0) {
      return { ok: false, message: "반품 원본 중량 정보가 없습니다. 원본 항목을 다시 선택해 주세요." };
    }
  }

  const merged = await refreshRecords();
  const existed = merged.find((row) => row.recordDate === draft.recordDate);
  const now = Date.now();
  let storedDirection = draft.direction;

  if (draft.isReturn) {
    const sourceRecord = merged.find((record) => record.id === draft.returnSourceRecordId);
    const sourceLine = (sourceRecord?.lines || []).find((line) => line.lineId === draft.returnSourceLineId);
    if (!sourceRecord || !sourceLine || sourceLine.isReturn) {
      return { ok: false, message: "선택한 반품 원본 항목을 찾을 수 없습니다. 목록에서 다시 선택해 주세요." };
    }

    if (sourceLine.direction !== "매입" && sourceLine.direction !== "출고") {
      return { ok: false, message: "반품 원본 방향이 유통(매입/출고)이 아닙니다." };
    }

    const expectedDirection = sourceLine.direction;
    if (draft.direction !== expectedDirection) {
      return {
        ok: false,
        message: `반품 방향이 원본과 맞지 않습니다. 원본 ${sourceLine.direction} 방향으로 다시 선택해 주세요.`,
      };
    }

    const sourceKg = Number(sourceLine.kg) || 0;
    const requestedKg = Number(draft.kg) || 0;
    const alreadyReturnedKg = getReturnedKgForSource(
      merged,
      draft.returnSourceRecordId.trim(),
      draft.returnSourceLineId.trim()
    );
    const remainingKg = Math.max(0, sourceKg - alreadyReturnedKg);
    if (requestedKg > remainingKg) {
      return {
        ok: false,
        message: `반품 중량이 잔여 중량을 초과합니다. (잔여 ${remainingKg.toLocaleString()}kg)`,
      };
    }

    storedDirection = sourceLine.direction === "매입" ? "출고" : "매입";
  }

  const line: LogisticsLine = recomputeLineMissing({
    lineId: createLocalId("LOGLN"),
    direction: storedDirection,
    kind: draft.kind,
    item: hasCategory ? draft.item : "",
    detailItem: showScrapDetail ? draft.detailItem.trim() : "",
    site: toLogisticsSiteCode(draft.site),
    kg: Number(draft.kg) || 0,
    grossKg: Number(draft.grossKg) || 0,
    tareKg: Number(draft.tareKg) || 0,
    unitPricePerKg: hasPrice ? Number(draft.unitPricePerKg) || 0 : 0,
    partner: {
      id: draft.partnerId,
      label: draft.partnerLabel,
    },
    vehicle: {
      id: draft.vehicleId || draft.vehicleNo,
      label: draft.vehicleNo.trim(),
    },
    isReturn: draft.isReturn,
    returnSourceRecordId: draft.isReturn ? draft.returnSourceRecordId : undefined,
    returnSourceLineId: draft.isReturn ? draft.returnSourceLineId : undefined,
    sourceDirection: draft.isReturn ? draft.sourceDirection || undefined : undefined,
    sourceKg: draft.isReturn ? Number(draft.sourceKg) || 0 : undefined,
    returnedKg: draft.isReturn ? Number(draft.kg) || 0 : undefined,
  });

  const mergedTags = new Set<string>(existed?.tags || []);
  if (draft.isReturn) {
    mergedTags.add("반품");
  }

  const nextRecord: LogisticsRecord = existed
    ? {
        ...existed,
        lines: [line, ...(existed.lines || [])],
        tags: Array.from(mergedTags),
        writerName: draft.writerName.trim(),
        writerRole: draft.writerRole.trim(),
        updatedAt: now,
        title: formatDailyLogisticsTitle({
          writerName: draft.writerName,
          writerRole: draft.writerRole,
          recordDate: draft.recordDate,
        }),
      }
    : {
        id: createLocalId("LOG"),
        kind: "logistics",
        recordDate: draft.recordDate,
        createdAt: new Date(now).toISOString(),
        updatedAt: now,
        title: formatDailyLogisticsTitle({
          writerName: draft.writerName,
          writerRole: draft.writerRole,
          recordDate: draft.recordDate,
        }),
        details: "등록 화면에서 저장됨",
        tags: Array.from(mergedTags),
        writerName: draft.writerName.trim(),
        writerRole: draft.writerRole.trim(),
        lines: [line],
      };

  await dailyRepo.upsert(nextRecord as DailyRepoRecord);
  await syncPartnerProfileFromLine({ partnerRepo, partnerId: draft.partnerId, line });
  await refreshRecords();

  const nextDraft = {
    ...defaultDraft(),
    recordDate: draft.recordDate,
    site: draft.site,
  };
  setCustomDetailInput("");
  setDraft(nextDraft);
  saveDraft(nextDraft);

  return { ok: true, message: "유통 기록이 저장되었습니다." };
}
