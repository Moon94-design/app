import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createDailyRepo, type RepoContract } from "@kernel/repo";
import { createLocalId, sortByRecordDateUpdated } from "@kernel/utils";
import type { ProductionDraft, ProductionLine, ProductionRecord } from "@kernel/schema/daily";
import {
  buildDefaultDraft,
  buildDefaultLine,
  ITEM_OPTIONS,
  PRODUCT_OPTIONS,
  SHIFT_OPTIONS,
  SITE_OPTIONS,
} from "./production/constants";
import { submitProductionCommand } from "./production/commands";
import type { DailyRepoRecord } from "./production/types";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";

export function useRegisterProductionPage() {
  const dailyRepo = useMemo(() => createDailyRepo() as unknown as RepoContract<DailyRepoRecord>, []);

  const [docs, setDocs] = useState<ProductionRecord[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<ProductionDraft>({
    key: DRAFT_KEYS.productionDaily,
    initial: buildDefaultDraft(),
    migrate: (loaded) => ({
      ...loaded,
      lineDraft: loaded.lineDraft || buildDefaultLine(),
    }),
  });
  const { actorProfile, writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });
  const siteTouchedRef = useRef(false);

  const refresh = useCallback(async () => {
    const all = await dailyRepo.getAll();
    const production = all.filter((item) => item.kind === "production") as ProductionRecord[];
    setDocs(sortByRecordDateUpdated(production));
  }, [dailyRepo]);

  useEffect(() => {
    refresh();
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
    (patch: Partial<ProductionDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const lineDraft = draft.lineDraft || buildDefaultLine();

  const setLineDraft = useCallback(
    (updater: ProductionLine | ((prev: ProductionLine) => ProductionLine)) => {
      const prevLine = draft.lineDraft || buildDefaultLine();
      const nextLine = typeof updater === "function" ? updater(prevLine) : updater;
      const next = { ...draft, lineDraft: nextLine };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const addLine = useCallback(() => {
    if ((Number(lineDraft.bags) || 0) <= 0) {
      alert("생산수량(자루)은 0보다 커야 합니다.");
      return;
    }

    const nextLine: ProductionLine = {
      ...lineDraft,
      id: createLocalId("PL"),
      bags: Number(lineDraft.bags) || 0,
      kg: 0,
      memo: lineDraft.memo.trim(),
    };

    const next = {
      ...draft,
      lines: [nextLine, ...(draft.lines || [])],
      lineDraft: buildDefaultLine(),
    };
    setDraft(next);
    saveDraft(next);
  }, [draft, lineDraft, saveDraft, setDraft]);

  const removeLine = useCallback(
    (id: string) => {
      const next = {
        ...draft,
        lines: (draft.lines || []).filter((line) => line.id !== id),
      };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const resetDraft = useCallback(() => {
    siteTouchedRef.current = false;
    discardDraft();
  }, [discardDraft]);

  const submit = useCallback(async () => {
    const result = await submitProductionCommand({
      dailyRepo,
      draft,
      actorId: actorProfile?.id,
      docs,
      refresh,
      resetDraft,
    });
    alert(result.message);
  }, [actorProfile?.id, dailyRepo, docs, draft, refresh, resetDraft]);

  const removeDoc = useCallback(
    async (id: string) => {
      await dailyRepo.remove(id);
      await refresh();
    },
    [dailyRepo, refresh]
  );

  return {
    draft,
    docs,
    lineDraft,
    setLineDraft,
    shiftOptions: SHIFT_OPTIONS,
    productOptions: PRODUCT_OPTIONS,
    itemOptions: ITEM_OPTIONS,
    siteOptions: SITE_OPTIONS,
    writerLocked,
    updateDraft,
    addLine,
    removeLine,
    resetDraft,
    submit,
    removeDoc,
  };
}
