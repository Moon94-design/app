import type { LogisticsDraft, ReturnSourceCandidate } from "./types";

export function buildReturnSelectionPatch(candidate: ReturnSourceCandidate): Partial<LogisticsDraft> {
  const nextKg = Number(candidate.remainingKg) || 0;

  return {
    isReturn: true,
    returnSourceRecordId: candidate.sourceRecordId,
    returnSourceLineId: candidate.sourceLineId,
    sourceDirection: candidate.sourceDirection,
    sourceKg: Number(candidate.sourceKg) || 0,
    direction: candidate.sourceDirection,
    kind: candidate.kind,
    item: candidate.item,
    detailItem: candidate.detailItem || "",
    vehicleNo: "",
    vehicleId: "",
    grossKg: nextKg,
    tareKg: 0,
    kg: nextKg,
    unitPricePerKg: Number(candidate.unitPricePerKg) || 0,
  };
}

export function isReturnSourceLocked(draft: LogisticsDraft): boolean {
  return Boolean(draft.isReturn && draft.returnSourceRecordId && draft.returnSourceLineId);
}
