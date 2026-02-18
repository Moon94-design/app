import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { formatDailyOfficeTitle } from "@kernel/schema/daily";
import { createDailyRepo, type RepoContract } from "@kernel/repo";
import { createLocalId, sortByRecordDateUpdated } from "@kernel/utils";
import {
  buildDefaultDraft,
  buildDefaultLineDraft,
  createOfficeLineId,
  OFFICE_BRANCH_OPTIONS,
  OFFICE_LINK_TYPE_OPTIONS,
} from "./office/constants";
import {
  addLineDraftLinkedReferenceCommand,
  makeOfficeJournalId,
  removeLineDraftLinkedReferenceCommand,
} from "./office/commands";
import type { LinkedReferenceCandidate } from "./common/linkedReferences";
import { createDefaultOfficePermissions } from "./office/permissions";
import { buildMergedHistoryLines, normalizeLineDraft } from "./office/mappers";
import type {
  DailyRepoRecord,
  OfficeDraft,
  OfficeHistoryLineItem,
  OfficeLinkedReference,
  OfficeLinkType,
  OfficeRecord,
} from "./office/types";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";
import { useOfficeLinkContext } from "./office/useOfficeLinkContext";

export type { OfficeDraft } from "./office/types";

type HistoryLineEditTarget = {
  recordId: string;
  lineId: string;
} | null;

export function useRegisterOfficePage() {
  const dailyRepo = useMemo(() => createDailyRepo() as unknown as RepoContract<DailyRepoRecord>, []);
  const [records, setRecords] = useState<OfficeRecord[]>([]);
  const [historyLineEditTarget, setHistoryLineEditTarget] = useState<HistoryLineEditTarget>(null);
  const permissions = useMemo(() => createDefaultOfficePermissions(), []);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<OfficeDraft>({
    key: DRAFT_KEYS.officeDaily,
    initial: buildDefaultDraft(),
    migrate: (loaded) => ({
      ...loaded,
      lineDraft: normalizeLineDraft(loaded.lineDraft || buildDefaultLineDraft()),
    }),
  });

  const { actorProfile, writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });
  const siteTouchedRef = useRef(false);

  const refreshRecords = useCallback(async () => {
    if (!permissions.canRead()) {
      setRecords([]);
      return;
    }
    const all = await dailyRepo.getAll();
    const office = all.filter((item) => item.kind === "office") as OfficeRecord[];
    setRecords(sortByRecordDateUpdated(office));
  }, [dailyRepo, permissions]);

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  useEffect(() => {
    if (!actorProfile) return;
    if (siteTouchedRef.current) return;
    if (draft.site === actorProfile.site) return;
    const next = { ...draft, site: actorProfile.site };
    setDraft(next);
    saveDraft(next);
  }, [actorProfile, draft, saveDraft, setDraft]);

  const updateDraft = useCallback(
    (patch: Partial<OfficeDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const { lineOptions, suggestionCandidates } = useOfficeLinkContext({
    currentLinkType: draft.lineDraft.linkType,
    detailsText: draft.lineDraft.details,
  });

  const mergedHistoryLines = useMemo<OfficeHistoryLineItem[]>(() => buildMergedHistoryLines(records), [records]);

  const clearLineDraft = useCallback(() => {
    const next: OfficeDraft = {
      ...draft,
      lineDraft: buildDefaultLineDraft(),
    };
    setDraft(next);
    saveDraft(next);
  }, [draft, saveDraft, setDraft]);

  const updateLineDraft = useCallback(
    (patch: Partial<OfficeDraft["lineDraft"]>) => {
      let nextLineDraft = { ...draft.lineDraft, ...patch };
      if (patch.linkType && patch.linkType !== draft.lineDraft.linkType) {
        nextLineDraft = {
          ...nextLineDraft,
          linkId: "",
        };
      }
      const next = { ...draft, lineDraft: nextLineDraft };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const commitLineDraft = useCallback(async () => {
    if (historyLineEditTarget) {
      if (!permissions.canWrite()) return { ok: false, message: "수정 권한이 없습니다." };
      if (!draft.lineDraft.subtitle.trim()) return { ok: false, message: "세부 제목을 입력해 주세요." };
      if (!draft.lineDraft.details.trim()) return { ok: false, message: "내용을 입력해 주세요." };

      const record = records.find((item) => item.id === historyLineEditTarget.recordId);
      if (!record) return { ok: false, message: "대상 일지를 찾지 못했습니다." };

      const nextLines = (record.lines || []).map((line) =>
        line.id === historyLineEditTarget.lineId
          ? {
              ...line,
              subtitle: draft.lineDraft.subtitle.trim(),
              details: draft.lineDraft.details.trim(),
              linkedReferences: (draft.lineDraft.linkedReferences || []).map((ref) => ({ ...ref })),
            }
          : line
      );
      const nextRecord: OfficeRecord = {
        ...record,
        lines: nextLines,
        updatedAt: Date.now(),
      };
      await dailyRepo.upsert(nextRecord as DailyRepoRecord);
      await refreshRecords();
      setHistoryLineEditTarget(null);
      clearLineDraft();
      return { ok: true, message: "세부 항목을 수정했습니다." };
    }

    if (!permissions.canWrite()) return { ok: false, message: "저장 권한이 없습니다." };
    if (!draft.recordDate) return { ok: false, message: "기록일을 입력해 주세요." };
    if (!draft.site) return { ok: false, message: "지부를 선택해 주세요." };

    const writerName = draft.writerName.trim();
    const writerRole = draft.writerRole.trim();
    if (!writerName) return { ok: false, message: "작성자를 입력해 주세요." };
    if (!writerRole) return { ok: false, message: "직책을 입력해 주세요." };
    if (!draft.lineDraft.subtitle.trim()) return { ok: false, message: "세부 제목을 입력해 주세요." };
    if (!draft.lineDraft.details.trim()) return { ok: false, message: "내용을 입력해 주세요." };

    const nextLine = {
      id: createOfficeLineId() || createLocalId("OFFICE_LINE"),
      subtitle: draft.lineDraft.subtitle.trim(),
      details: draft.lineDraft.details.trim(),
      linkedReferences: (draft.lineDraft.linkedReferences || []).map((ref) => ({ ...ref })),
    };

    const matchedRecords = records.filter(
      (item) =>
        item.recordDate === draft.recordDate &&
        item.site === draft.site &&
        (item.writerName || "").trim() === writerName &&
        (item.writerRole || "").trim() === writerRole
    );

    const dedupedLines: OfficeRecord["lines"] = [nextLine];
    const seenLineIds = new Set<string>([nextLine.id]);
    for (const line of matchedRecords.flatMap((item) => item.lines || [])) {
      const lineId = (line.id || "").trim() || createLocalId("OFFICE_LINE");
      if (seenLineIds.has(lineId)) continue;
      seenLineIds.add(lineId);
      dedupedLines.push({ ...line, id: lineId });
    }

    const nowMs = Date.now();
    const journalId = makeOfficeJournalId(draft.recordDate, draft.site, writerName);
    const baseRecord = matchedRecords.find((item) => item.id === journalId) || matchedRecords[0];
    const nextRecord: OfficeRecord = {
      id: journalId,
      kind: "office",
      recordDate: draft.recordDate,
      site: draft.site,
      writerName,
      writerRole,
      title: formatDailyOfficeTitle({ writerName, writerRole, recordDate: draft.recordDate }),
      details: "",
      tags: [],
      lines: dedupedLines,
      createdAt: baseRecord?.createdAt || new Date(nowMs).toISOString(),
      updatedAt: nowMs,
    };

    await dailyRepo.upsert(nextRecord as DailyRepoRecord);

    const staleIds = matchedRecords.map((item) => item.id).filter((id) => id !== journalId);
    if (staleIds.length > 0) {
      await dailyRepo.removeMany(staleIds);
    }

    await refreshRecords();
    clearLineDraft();
    return { ok: true, message: "세부 항목을 등록했습니다." };
  }, [clearLineDraft, dailyRepo, draft, historyLineEditTarget, permissions, records, refreshRecords]);

  const selectLinkedReference = useCallback(
    (nextId: string) => {
      if (!nextId) {
        updateLineDraft({ linkId: "" });
        return;
      }
      const selected = lineOptions.find((item) => item.id === nextId);
      if (!selected) return;
      const nextDraft = addLineDraftLinkedReferenceCommand(draft, {
        type: draft.lineDraft.linkType,
        id: selected.id,
        label: selected.label,
      });
      setDraft(nextDraft);
      saveDraft(nextDraft);
    },
    [draft, lineOptions, saveDraft, setDraft, updateLineDraft]
  );

  const addSuggestionCandidate = useCallback(
    (candidate: LinkedReferenceCandidate<OfficeLinkType>) => {
      const nextDraft = addLineDraftLinkedReferenceCommand(draft, {
        type: candidate.type,
        id: candidate.id,
        label: candidate.label,
      });
      const next: OfficeDraft = {
        ...nextDraft,
        lineDraft: {
          ...nextDraft.lineDraft,
          linkType: candidate.type,
        },
      };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const removeLinkedReference = useCallback(
    (reference: OfficeLinkedReference) => {
      const nextDraft = removeLineDraftLinkedReferenceCommand(draft, reference);
      setDraft(nextDraft);
      saveDraft(nextDraft);
    },
    [draft, saveDraft, setDraft]
  );

  const beginHistoryLineEdit = useCallback(
    (item: OfficeHistoryLineItem) => {
      const next: OfficeDraft = {
        ...draft,
        lineDraft: {
          subtitle: item.line.subtitle,
          details: item.line.details,
          linkType: item.line.linkedReferences[0]?.type || draft.lineDraft.linkType,
          linkId: "",
          linkedReferences: (item.line.linkedReferences || []).map((ref) => ({ ...ref })),
        },
      };
      setHistoryLineEditTarget({ recordId: item.recordId, lineId: item.line.id });
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const cancelHistoryLineEdit = useCallback(() => {
    setHistoryLineEditTarget(null);
    clearLineDraft();
  }, [clearLineDraft]);

  const removeHistoryLine = useCallback(
    async (item: OfficeHistoryLineItem) => {
      if (!permissions.canDelete()) return { ok: false, message: "삭제 권한이 없습니다." };
      const record = records.find((row) => row.id === item.recordId);
      if (!record) return { ok: false, message: "대상 일지를 찾지 못했습니다." };

      const nextLines = (record.lines || []).filter((line) => line.id !== item.line.id);
      if (!nextLines.length) {
        await dailyRepo.remove(record.id);
      } else {
        const nextRecord: OfficeRecord = {
          ...record,
          lines: nextLines,
          updatedAt: Date.now(),
        };
        await dailyRepo.upsert(nextRecord as DailyRepoRecord);
      }
      await refreshRecords();
      setHistoryLineEditTarget((prev) =>
        prev && prev.recordId === item.recordId && prev.lineId === item.line.id ? null : prev
      );
      return { ok: true, message: "세부 항목을 삭제했습니다." };
    },
    [dailyRepo, permissions, records, refreshRecords]
  );

  const resetDraft = useCallback(() => {
    siteTouchedRef.current = false;
    setHistoryLineEditTarget(null);
    discardDraft();
  }, [discardDraft]);

  return {
    draft,
    lineOptions,
    suggestionCandidates,
    linkTypeOptions: OFFICE_LINK_TYPE_OPTIONS,
    siteOptions: OFFICE_BRANCH_OPTIONS,
    mergedHistoryLines,
    historyLineEditTarget,
    writerLocked,
    updateDraft,
    updateLineDraft,
    commitLineDraft,
    selectLinkedReference,
    addSuggestionCandidate,
    removeLinkedReference,
    beginHistoryLineEdit,
    cancelHistoryLineEdit,
    removeHistoryLine,
    resetDraft,
  };
}
