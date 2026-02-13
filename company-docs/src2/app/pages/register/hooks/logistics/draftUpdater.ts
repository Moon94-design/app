import { hasCategorySelection, hasPriceSelection, KIND_OPTIONS, needsScrapDetail, normalizeKind, toNumber } from "./constants";
import { resolveSelectionValue } from "../common/selection";
import { resolvePartnerPrice } from "./mappers";
import { getLatestPartnerLine, getLatestPartnerUnitPrice } from "./selectors";
import type { LogisticsDraft, PartnerOption, VehicleOption } from "./types";
import type { LogisticsRecord } from "@kernel/schema/daily";

type BuildUpdatedDraftArgs = {
  draft: LogisticsDraft;
  patch: Partial<LogisticsDraft>;
  partners: PartnerOption[];
  vehicles: VehicleOption[];
  records: LogisticsRecord[];
};

export function buildUpdatedLogisticsDraft({
  draft,
  patch,
  partners,
  vehicles,
  records,
}: BuildUpdatedDraftArgs): { nextDraft: LogisticsDraft; clearCustomDetailInput: boolean } {
  const next: LogisticsDraft = {
    ...draft,
    ...patch,
  };

  let clearCustomDetailInput = false;
  let appliedRecentPartnerPrice = false;

  function clearReturnSource(nextDraft: LogisticsDraft) {
    nextDraft.returnSourceRecordId = "";
    nextDraft.returnSourceLineId = "";
    nextDraft.sourceDirection = "";
    nextDraft.sourceKg = 0;
  }

  if (patch.isReturn === false) {
    clearReturnSource(next);
    next.returnSourceDateFilter = "";
  }

  if (patch.direction) {
    const nextKinds = KIND_OPTIONS[patch.direction];
    if (!nextKinds.includes(next.kind)) {
      next.kind = nextKinds[0];
    }
    if (!hasCategorySelection(patch.direction)) {
      next.item = "";
    } else if (!next.item) {
      next.item = "PP";
    }
  }

  if (patch.kind) {
    next.kind = normalizeKind(patch.kind);
  }

  if (!needsScrapDetail(next.direction, next.kind)) {
    next.detailItem = "";
    clearCustomDetailInput = true;
  }

  if (patch.partnerId !== undefined) {
    if (next.isReturn) {
      clearReturnSource(next);
      next.returnSourceDateFilter = "";
    }

    next.partnerLabel = resolveSelectionValue({
      options: partners,
      selectedId: patch.partnerId,
      currentValue: next.partnerLabel,
      fallbackValue: patch.partnerLabel,
      getId: (row) => row.id,
      getValue: (row) => row.label,
    });

    const latest = getLatestPartnerLine(records, patch.partnerId || "", next.partnerLabel || "");
    if (latest && !next.isReturn) {
      next.direction = latest.direction;
      next.kind = normalizeKind(String(latest.kind || ""));
      next.item = latest.item || "PP";
      next.detailItem = latest.detailItem || "";

      const vehicleNo = latest.vehicle?.label?.trim() || "";
      next.vehicleNo = vehicleNo;
      if (vehicleNo) {
        const vehicle = vehicles.find((row) => row.vehicleNo === vehicleNo);
        next.vehicleId = vehicle?.id || "";
      }
    }
  }

  if (patch.vehicleId !== undefined) {
    next.vehicleNo = resolveSelectionValue({
      options: vehicles,
      selectedId: patch.vehicleId,
      currentValue: next.vehicleNo,
      fallbackValue: patch.vehicleNo,
      getId: (row) => row.id,
      getValue: (row) => row.vehicleNo,
    });
  }

  if (patch.vehicleNo !== undefined && patch.vehicleId === undefined) {
    const target = vehicles.find((row) => row.vehicleNo === String(patch.vehicleNo).trim());
    next.vehicleId = target?.id || "";
  }

  const shouldApplyRecentPriceByContext =
    next.partnerId &&
    !next.isReturn &&
    patch.unitPricePerKg === undefined &&
    (patch.partnerId !== undefined ||
      patch.direction !== undefined ||
      patch.kind !== undefined ||
      patch.item !== undefined);

  if (shouldApplyRecentPriceByContext) {
    const latestUnitPricePerKg = getLatestPartnerUnitPrice(records, {
      partnerId: next.partnerId,
      partnerLabel: next.partnerLabel,
      direction: next.direction,
      kind: next.kind,
      item: next.item,
    });

    if (hasPriceSelection(next.direction) && latestUnitPricePerKg > 0) {
      next.unitPricePerKg = latestUnitPricePerKg;
      appliedRecentPartnerPrice = true;
    }
  }

  const shouldAutoResolvePrice =
    next.partnerId &&
    !appliedRecentPartnerPrice &&
    hasCategorySelection(next.direction) &&
    patch.unitPricePerKg === undefined &&
    (patch.partnerId !== undefined ||
      patch.direction !== undefined ||
      patch.kind !== undefined ||
      patch.item !== undefined);

  if (shouldAutoResolvePrice) {
    const partner = partners.find((row) => row.id === next.partnerId);
    next.unitPricePerKg = resolvePartnerPrice(partner, next.direction, next.kind, next.item, hasPriceSelection);
  }

  const grossKg = patch.grossKg !== undefined ? toNumber(patch.grossKg) : toNumber(next.grossKg);
  const tareKg = patch.tareKg !== undefined ? toNumber(patch.tareKg) : toNumber(next.tareKg);
  next.grossKg = grossKg;
  next.tareKg = tareKg;
  next.kg = Math.max(0, grossKg - tareKg);

  return {
    nextDraft: next,
    clearCustomDetailInput,
  };
}
