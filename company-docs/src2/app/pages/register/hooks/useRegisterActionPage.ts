import { useCallback, useEffect, useMemo, useState } from "react";
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

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<ActionRegisterDraft>({
    key: DRAFT_KEYS.actionRegister,
    initial: defaultDraft(),
  });
  const { writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });

  const refresh = useCallback(async () => {
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
  }, [actionRepo, issueRepo, vendorRepo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const updateDraft = useCallback(
    (patch: Partial<ActionRegisterDraft>) => {
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
    discardDraft();
  }, [discardDraft]);

  const applyPreset = useCallback(
    (patch: Partial<ActionRegisterDraft>) => {
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
      }),
    [actionRepo, discardDraft, draft, issueRepo, refresh]
  );

  const removeItem = useCallback(
    (docId: string, itemId: string) =>
      removeActionItemCommand({
        actionRepo,
        docId,
        itemId,
        refresh,
      }),
    [actionRepo, refresh]
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
