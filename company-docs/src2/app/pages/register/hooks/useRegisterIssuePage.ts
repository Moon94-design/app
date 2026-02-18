import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { DAILY_BRANCH_OPTIONS } from "@kernel/schema/daily";
import { createIssueRepo, type IssueDocRecord, type RepoContract } from "@kernel/repo";
import { sortByRecordDateUpdated, todayYmd } from "@kernel/utils";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";
import { removeIssueDocCommand, submitIssueCommand } from "./issue/commands";
import { createDefaultIssuePermissions } from "./issue/permissions";
import type { LinkedReferenceCandidate } from "./common/linkedReferences";
import { OFFICE_LINK_TYPE_OPTIONS } from "./office/constants";
import type { OfficeLinkedReference, OfficeLinkType } from "./office/types";
import { useOfficeLinkContext } from "./office/useOfficeLinkContext";
import type { IssueRegisterDraft, IssueSubmitOptions } from "./issue/types";

export type { IssueRegisterDraft } from "./issue/types";

function defaultIssueDraft(): IssueRegisterDraft {
  return {
    recordDate: todayYmd(),
    site: DAILY_BRANCH_OPTIONS[0],
    writerName: "",
    writerRole: "",
    category: "현장",
    title: "",
    details: "",
    linkType: "partner",
    linkId: "",
    linkedReferences: [],
    status: "진행중",
  };
}

export function useRegisterIssuePage() {
  const issueRepo = useMemo(() => createIssueRepo() as unknown as RepoContract<IssueDocRecord>, []);
  const [docs, setDocs] = useState<IssueDocRecord[]>([]);
  const permissions = useMemo(() => createDefaultIssuePermissions(), []);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<IssueRegisterDraft>({
    key: DRAFT_KEYS.issueRegister,
    initial: defaultIssueDraft(),
  });
  const { actorProfile, writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });
  const siteTouchedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!permissions.canRead()) {
      setDocs([]);
      return;
    }
    const all = await issueRepo.getAll();
    setDocs(sortByRecordDateUpdated(all));
  }, [issueRepo, permissions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!actorProfile) return;
    if (siteTouchedRef.current) return;
    if (draft.site === actorProfile.site) return;
    const next = { ...draft, site: actorProfile.site };
    setDraft(next);
    saveDraft(next);
  }, [actorProfile, draft, saveDraft, setDraft]);

  const { lineOptions, suggestionCandidates } = useOfficeLinkContext({
    currentLinkType: draft.linkType,
    detailsText: draft.details,
  });

  const updateDraft = useCallback(
    (patch: Partial<IssueRegisterDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      let next = { ...draft, ...patch };
      if (patch.linkType && patch.linkType !== draft.linkType) {
        next = {
          ...next,
          linkId: "",
        };
      }
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const appendLinkedReference = useCallback(
    (nextReference: OfficeLinkedReference) => {
      const exists = (draft.linkedReferences || []).some(
        (item) => item.type === nextReference.type && item.id === nextReference.id
      );
      if (exists) return draft;
      return {
        ...draft,
        linkId: "",
        linkedReferences: [...(draft.linkedReferences || []), nextReference],
      };
    },
    [draft]
  );

  const selectLinkedReference = useCallback(
    (nextId: string) => {
      if (!nextId) {
        updateDraft({ linkId: "" });
        return;
      }
      const selected = lineOptions.find((item) => item.id === nextId);
      if (!selected) return;
      const next = appendLinkedReference({
        type: draft.linkType,
        id: selected.id,
        label: selected.label,
      });
      setDraft(next);
      saveDraft(next);
    },
    [appendLinkedReference, draft, lineOptions, saveDraft, setDraft, updateDraft]
  );

  const addSuggestionCandidate = useCallback(
    (candidate: LinkedReferenceCandidate<OfficeLinkType>) => {
      const appended = appendLinkedReference({
        type: candidate.type,
        id: candidate.id,
        label: candidate.label,
      });
      const next = {
        ...appended,
        linkType: candidate.type,
      };
      setDraft(next);
      saveDraft(next);
    },
    [appendLinkedReference, saveDraft, setDraft]
  );

  const removeLinkedReference = useCallback(
    (type: OfficeLinkType, id: string) => {
      const next: IssueRegisterDraft = {
        ...draft,
        linkedReferences: (draft.linkedReferences || []).filter((item) => !(item.type === type && item.id === id)),
      };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const applyPreset = useCallback(
    (patch: Partial<IssueRegisterDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      const next = { ...draft, ...patch };
      setDraft(next, { dirty: true });
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const resetDraft = useCallback(() => {
    siteTouchedRef.current = false;
    discardDraft();
  }, [discardDraft]);

  const submit = useCallback(
    (options?: IssueSubmitOptions) =>
      submitIssueCommand({
        issueRepo,
        draft,
        refresh,
        discardDraft,
        options,
        canWrite: permissions.canWrite,
      }),
    [discardDraft, draft, issueRepo, permissions.canWrite, refresh]
  );

  const removeDoc = useCallback(
    (id: string) =>
      removeIssueDocCommand({
        issueRepo,
        id,
        refresh,
        canDelete: permissions.canDelete,
      }),
    [issueRepo, permissions.canDelete, refresh]
  );

  return {
    draft,
    docs,
    lineOptions,
    suggestionCandidates,
    linkTypeOptions: OFFICE_LINK_TYPE_OPTIONS,
    siteOptions: DAILY_BRANCH_OPTIONS,
    writerLocked,
    updateDraft,
    selectLinkedReference,
    addSuggestionCandidate,
    removeLinkedReference,
    applyPreset,
    resetDraft,
    submit,
    removeDoc,
  };
}
