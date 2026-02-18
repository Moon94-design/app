import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import {
  createActionRepo,
  createIssueRepo,
  createVendorRepo,
  type IssueDocRecord,
  type RepoContract,
  type RepoEntity,
} from "@kernel/repo";
import { sortByRecordDateUpdated } from "@kernel/utils";
import { ACTION_BRANCH_OPTIONS, defaultDraft } from "./action/constants";
import { createDefaultActionPermissions } from "./action/permissions";
import { removeActionItemCommand, submitActionCommand } from "./action/commands";
import { toPendingIssues, toVendorOption } from "./action/selectors";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";
import { resolveSelectionValue } from "./common/selection";
import type {
  ActionDocExt,
  ActionRegisterDraft,
  ActionSubmitOptions,
  PendingIssue,
  VendorOption,
} from "./action/types";

export type { ActionRegisterDraft, ActionSubmitOptions, PendingIssue, VendorOption } from "./action/types";

type VendorRow = RepoEntity & Record<string, unknown>;

export function useRegisterActionPage() {
  const actionRepo = useMemo(
    () => createActionRepo() as unknown as RepoContract<ActionDocExt>,
    []
  );
  const issueRepo = useMemo(
    () => createIssueRepo() as unknown as RepoContract<IssueDocRecord>,
    []
  );
  const vendorRepo = useMemo(
    () => createVendorRepo() as unknown as RepoContract<VendorRow>,
    []
  );

  const [docs, setDocs] = useState<ActionDocExt[]>([]);
  const [pendingIssues, setPendingIssues] = useState<PendingIssue[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const permissions = useMemo(() => createDefaultActionPermissions(), []);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<ActionRegisterDraft>({
    key: DRAFT_KEYS.actionRegister,
    initial: defaultDraft(),
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
      setPendingIssues([]);
      setVendors([]);
      return;
    }
    const [actionDocs, issueDocs, vendorRows] = await Promise.all([
      actionRepo.getAll(),
      issueRepo.getAll(),
      vendorRepo.getAll(),
    ]);

    setDocs(sortByRecordDateUpdated(actionDocs));
    setPendingIssues(toPendingIssues(issueDocs));
    setVendors(
      vendorRows
        .map((row) => toVendorOption(row))
        .filter((row): row is VendorOption => Boolean(row))
    );
  }, [actionRepo, issueRepo, permissions, vendorRepo]);

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

  const updateDraft = useCallback(
    (patch: Partial<ActionRegisterDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      const next = { ...draft, ...patch };
      if (patch.vendorId !== undefined) {
        const nextVendorLabel = resolveSelectionValue({
          options: vendors,
          selectedId: patch.vendorId,
          currentValue: next.vendorLabel,
          fallbackValue: patch.vendorLabel,
          getId: (row) => row.id,
          getValue: (row) => row.name,
        });
        next.vendorLabel = nextVendorLabel;
        if (!nextVendorLabel) next.vendorCost = 0;
      }
      if (patch.issueId !== undefined) {
        next.issueLabel = resolveSelectionValue({
          options: pendingIssues,
          selectedId: patch.issueId,
          currentValue: next.issueLabel,
          fallbackValue: patch.issueLabel,
          getId: (row) => row.id,
          getValue: (row) => row.title,
        });
      }
      setDraft(next);
      saveDraft(next);
    },
    [draft, pendingIssues, saveDraft, setDraft, vendors]
  );

  const resetDraft = useCallback(() => {
    siteTouchedRef.current = false;
    discardDraft();
  }, [discardDraft]);

  const applyPreset = useCallback(
    (patch: Partial<ActionRegisterDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      const next = { ...draft, ...patch };
      setDraft(next, { dirty: true });
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const submit = useCallback(
    (options?: ActionSubmitOptions) =>
      submitActionCommand({
        actionRepo,
        issueRepo,
        draft,
        refresh,
        discardDraft,
        options,
        canWrite: permissions.canWrite,
      }),
    [actionRepo, discardDraft, draft, issueRepo, permissions.canWrite, refresh]
  );

  const removeItem = useCallback(
    (docId: string, itemId: string) =>
      removeActionItemCommand({
        actionRepo,
        docId,
        itemId,
        refresh,
        canDelete: permissions.canDelete,
      }),
    [actionRepo, permissions.canDelete, refresh]
  );

  return {
    draft,
    docs,
    siteOptions: ACTION_BRANCH_OPTIONS,
    writerLocked,
    pendingIssues,
    vendors,
    updateDraft,
    applyPreset,
    resetDraft,
    submit,
    removeItem,
  };
}

