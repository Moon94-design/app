import { useCallback, useMemo } from "react";
import type { LogisticsRecord } from "@kernel/schema/daily";
import type { LogisticsDraft, ReturnSourceCandidate } from "./types";
import { buildReturnSelectionPatch, isReturnSourceLocked } from "./returnSource";
import { findReturnSourceCandidate, getPartnerReturnSourceCandidates } from "./selectors";

type UseReturnSourceControllerArgs = {
  records: LogisticsRecord[];
  draft: LogisticsDraft;
  updateDraft: (patch: Partial<LogisticsDraft>) => void;
};

export function useReturnSourceController({
  records,
  draft,
  updateDraft,
}: UseReturnSourceControllerArgs) {
  const recentReturnSourceCandidates = useMemo(
    () =>
      getPartnerReturnSourceCandidates({
        records,
        partnerId: draft.partnerId,
        partnerLabel: draft.partnerLabel,
        limit: 5,
      }),
    [records, draft.partnerId, draft.partnerLabel]
  );

  const filteredReturnSourceCandidates = useMemo(() => {
    if (!draft.returnSourceDateFilter) return [];
    return getPartnerReturnSourceCandidates({
      records,
      partnerId: draft.partnerId,
      partnerLabel: draft.partnerLabel,
      dateFilter: draft.returnSourceDateFilter,
    });
  }, [records, draft.partnerId, draft.partnerLabel, draft.returnSourceDateFilter]);

  const allReturnSourceCandidates = useMemo(
    () =>
      getPartnerReturnSourceCandidates({
        records,
        partnerId: draft.partnerId,
        partnerLabel: draft.partnerLabel,
      }),
    [records, draft.partnerId, draft.partnerLabel]
  );

  const selectedReturnSource = useMemo(
    () =>
      findReturnSourceCandidate(
        allReturnSourceCandidates,
        draft.returnSourceRecordId,
        draft.returnSourceLineId
      ),
    [allReturnSourceCandidates, draft.returnSourceLineId, draft.returnSourceRecordId]
  );

  const activeReturnSourceCandidates = useMemo(
    () => (draft.returnSourceDateFilter ? filteredReturnSourceCandidates : recentReturnSourceCandidates),
    [draft.returnSourceDateFilter, filteredReturnSourceCandidates, recentReturnSourceCandidates]
  );

  const returnSourceLocked = useMemo(() => isReturnSourceLocked(draft), [draft]);

  const toggleReturnMode = useCallback(
    (nextIsReturn: boolean) => {
      if (!nextIsReturn) {
        updateDraft({
          isReturn: false,
          returnSourceDateFilter: "",
          returnSourceRecordId: "",
          returnSourceLineId: "",
          sourceDirection: "",
          sourceKg: 0,
        });
        return;
      }

      updateDraft({
        isReturn: true,
        returnSourceRecordId: "",
        returnSourceLineId: "",
        sourceDirection: "",
        sourceKg: 0,
        vehicleId: "",
        vehicleNo: "",
      });
    },
    [updateDraft]
  );

  const setReturnSourceDateFilter = useCallback(
    (date: string) => {
      updateDraft({
        returnSourceDateFilter: date,
        returnSourceRecordId: "",
        returnSourceLineId: "",
        sourceDirection: "",
        sourceKg: 0,
      });
    },
    [updateDraft]
  );

  const selectReturnSource = useCallback(
    (candidate: ReturnSourceCandidate) => {
      updateDraft(buildReturnSelectionPatch(candidate));
    },
    [updateDraft]
  );

  return {
    recentReturnSourceCandidates,
    filteredReturnSourceCandidates,
    activeReturnSourceCandidates,
    selectedReturnSource,
    returnSourceLocked,
    toggleReturnMode,
    setReturnSourceDateFilter,
    selectReturnSource,
  };
}
