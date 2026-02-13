import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import {
  createAgencyRepo,
  createConsumableRepo,
  createDailyRepo,
  createEmployeeRepo,
  createEquipmentRepo,
  createPartnerRepo,
  createVehicleRepo,
  createVendorRepo,
  type RepoContract,
} from "@kernel/repo";
import { createLocalId, listPersonalTags, listSystemTags, sortByRecordDateUpdated } from "@kernel/utils";
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
import { buildTagCandidates, collectMasterTags } from "./production/selectors";
import type { DailyRepoRecord, MasterRepoRecord, SuggestCandidate } from "./production/types";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";

export function useRegisterProductionPage() {
  const dailyRepo = useMemo(() => createDailyRepo() as unknown as RepoContract<DailyRepoRecord>, []);
  const agencyRepo = useMemo(() => createAgencyRepo() as unknown as RepoContract<MasterRepoRecord>, []);
  const partnerRepo = useMemo(() => createPartnerRepo() as unknown as RepoContract<MasterRepoRecord>, []);
  const vehicleRepo = useMemo(() => createVehicleRepo() as unknown as RepoContract<MasterRepoRecord>, []);
  const equipmentRepo = useMemo(() => createEquipmentRepo() as unknown as RepoContract<MasterRepoRecord>, []);
  const employeeRepo = useMemo(() => createEmployeeRepo() as unknown as RepoContract<MasterRepoRecord>, []);
  const vendorRepo = useMemo(() => createVendorRepo() as unknown as RepoContract<MasterRepoRecord>, []);
  const consumableRepo = useMemo(() => createConsumableRepo() as unknown as RepoContract<MasterRepoRecord>, []);

  const [docs, setDocs] = useState<ProductionRecord[]>([]);
  const [lineDraft, setLineDraft] = useState<ProductionLine>(buildDefaultLine);
  const [tagCandidates, setTagCandidates] = useState<SuggestCandidate[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<ProductionDraft>({
    key: DRAFT_KEYS.productionDaily,
    initial: buildDefaultDraft(),
  });
  const { writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });

  const refresh = useCallback(async () => {
    const all = await dailyRepo.getAll();
    const production = all.filter((item) => item.kind === "production") as ProductionRecord[];
    setDocs(sortByRecordDateUpdated(production));
  }, [dailyRepo]);

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      const [agencyRows, partnerRows, vehicleRows, equipmentRows, employeeRows, vendorRows, consumableRows] =
        await Promise.all([
          agencyRepo.getAll(),
          partnerRepo.getAll(),
          vehicleRepo.getAll(),
          equipmentRepo.getAll(),
          employeeRepo.getAll(),
          vendorRepo.getAll(),
          consumableRepo.getAll(),
        ]);

      const systemTags = listSystemTags().filter((item) => item.trim().length >= 2);
      const personalTags = listPersonalTags().filter((item) => item.trim().length >= 2);
      const masterNames = [
        ...collectMasterTags(agencyRows, ["name", "baseName", "detailTag"]),
        ...collectMasterTags(partnerRows, ["name", "partnerName"]),
        ...collectMasterTags(vehicleRows, ["vehicleNo"]),
        ...collectMasterTags(equipmentRows, ["name"]),
        ...collectMasterTags(employeeRows, ["name"]),
        ...collectMasterTags(vendorRows, ["name"]),
        ...collectMasterTags(consumableRows, ["name"]),
      ];

      if (!alive) return;
      setTagCandidates(buildTagCandidates(systemTags, personalTags, masterNames));
      await refresh();
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, [
    agencyRepo,
    consumableRepo,
    employeeRepo,
    equipmentRepo,
    partnerRepo,
    refresh,
    vehicleRepo,
    vendorRepo,
  ]);

  const updateDraft = useCallback(
    (patch: Partial<ProductionDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const addLine = useCallback(() => {
    if ((Number(lineDraft.kg) || 0) <= 0) {
      alert("생산량(kg)은 0보다 커야 해.");
      return;
    }

    const nextLine: ProductionLine = {
      ...lineDraft,
      id: createLocalId("PL"),
      bags: Number(lineDraft.bags) || 0,
      kg: Number(lineDraft.kg) || 0,
      memo: lineDraft.memo.trim(),
    };

    const next = {
      ...draft,
      lines: [nextLine, ...(draft.lines || [])],
    };
    setDraft(next);
    saveDraft(next);
    setLineDraft(buildDefaultLine());
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
    discardDraft();
    setLineDraft(buildDefaultLine());
  }, [discardDraft]);

  const submit = useCallback(async () => {
    const result = await submitProductionCommand({
      dailyRepo,
      draft,
      docs,
      refresh,
      resetDraft,
    });
    alert(result.message);
  }, [dailyRepo, docs, draft, refresh, resetDraft]);

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
    tagCandidates,
    writerLocked,
    updateDraft,
    addLine,
    removeLine,
    resetDraft,
    submit,
    removeDoc,
  };
}
