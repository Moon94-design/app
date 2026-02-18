import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import {
  createDailyRepo,
  createPartnerRepo,
  createVehicleRepo,
  type RepoContract,
  type RepoEntity,
} from "@kernel/repo";
import { type LogisticsRecord } from "@kernel/schema/daily";
import { type PartnerV2, type PartnerV2Draft } from "@kernel/schema/partner";
import { type Vehicle, type VehicleDraft } from "@kernel/schema/vehicle";
import { useActorProfileDraftSync } from "./common/useActorProfileDraftSync";
import {
  BASE_SCRAP_DETAIL_OPTIONS,
  CATEGORY_OPTIONS,
  DIRECTION_OPTIONS,
  KIND_OPTIONS,
  SITE_OPTIONS,
  defaultDraft,
  hasCategorySelection,
  hasPriceSelection,
  needsScrapDetail,
  normalizeKind,
} from "./logistics/constants";
import { mapPartner, mapVehicle } from "./logistics/mappers";
import { buildUpdatedLogisticsDraft } from "./logistics/draftUpdater";
import { mergeRecordsByDate } from "./logistics/merge";
import { useReturnSourceController } from "./logistics/useReturnSourceController";
import { type EditingLineTarget, removeLineCommand, startEditLineCommand } from "./logistics/lineEdit";
import {
  collectCustomScrapDetails,
  getSuggestedVehicleNos,
} from "./logistics/selectors";
import { createDefaultLogisticsPermissions } from "./logistics/permissions";
import {
  createPartnerQuickCommand,
  createVehicleQuickCommand,
  submitLogisticsCommand,
  updatePartnerQuickNameCommand,
} from "./logistics/commands";
import type {
  CreateResult,
  LogisticsDraft,
  PartnerOption,
  ProductCategory,
  SubmitResult,
  UpdatePartnerNameInput,
  UpdatePartnerNameResult,
  VehicleOption,
} from "./logistics/types";

type DailyRepoRecord = RepoEntity & Record<string, unknown>;

export function useRegisterLogisticsPage() {
  const dailyRepo = useMemo(() => createDailyRepo() as unknown as RepoContract<DailyRepoRecord>, []);
  const partnerRepo = useMemo(() => createPartnerRepo() as unknown as RepoContract<PartnerV2>, []);
  const vehicleRepo = useMemo(() => createVehicleRepo() as unknown as RepoContract<Vehicle>, []);

  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [records, setRecords] = useState<LogisticsRecord[]>([]);
  const [customDetailInput, setCustomDetailInput] = useState("");
  const [editingLineTarget, setEditingLineTarget] = useState<EditingLineTarget | null>(null);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<LogisticsDraft>({
    key: DRAFT_KEYS.logisticsDaily,
    initial: defaultDraft(),
  });
  const { actorProfile, writerLocked } = useActorProfileDraftSync({
    draft,
    setDraft,
    saveDraft,
  });
  const siteTouchedRef = useRef(false);
  const permissions = useMemo(() => createDefaultLogisticsPermissions(), []);

  const refreshMasters = useCallback(async () => {
    const [partnerRows, vehicleRows] = await Promise.all([partnerRepo.getAll(), vehicleRepo.getAll()]);
    setPartners(partnerRows.map((row) => mapPartner(row as unknown as Record<string, unknown>)));
    setVehicles(
      vehicleRows
        .map((row) => mapVehicle(row as unknown as Record<string, unknown>))
        .filter((row): row is VehicleOption => Boolean(row))
    );
  }, [partnerRepo, vehicleRepo]);

  const refreshRecords = useCallback(async () => {
    const all = await dailyRepo.getAll();
    const logistics = all.filter((item) => item.kind === "logistics").map((item) => item as LogisticsRecord);
    const merged = mergeRecordsByDate(logistics);

    if (merged.upsertIds.size > 0) {
      const upsertTargets = merged.records.filter((row) => merged.upsertIds.has(row.id));
      if (upsertTargets.length > 0) {
        await dailyRepo.upsertMany(upsertTargets as DailyRepoRecord[]);
      }
    }
    if (merged.staleIds.length > 0) {
      await dailyRepo.removeMany(merged.staleIds);
    }

    setRecords(merged.records);
    return merged.records;
  }, [dailyRepo]);

  useEffect(() => {
    let alive = true;
    async function bootstrap() {
      await refreshMasters();
      if (!alive) return;
      await refreshRecords();
    }
    bootstrap();
    return () => {
      alive = false;
    };
  }, [refreshMasters, refreshRecords]);

  useEffect(() => {
    if (!actorProfile) return;
    if (siteTouchedRef.current) return;
    if (draft.site === actorProfile.site) return;
    const next = { ...draft, site: actorProfile.site };
    setDraft(next);
    saveDraft(next);
  }, [actorProfile, draft, saveDraft, setDraft]);

  const kinds = useMemo(() => KIND_OPTIONS[draft.direction], [draft.direction]);
  const hasCategory = hasCategorySelection(draft.direction);
  const hasPrice = hasPriceSelection(draft.direction);
  const showScrapDetail = needsScrapDetail(draft.direction, draft.kind) && hasCategory && Boolean(draft.item);

  const scrapDetailOptions = useMemo(() => {
    if (!showScrapDetail || !draft.item) return [];
    return BASE_SCRAP_DETAIL_OPTIONS[draft.item as ProductCategory] ?? [];
  }, [draft.item, showScrapDetail]);

  const customScrapDetailOptions = useMemo(() => {
    if (!showScrapDetail || !draft.item) return [];
    const item = draft.item as ProductCategory;
    const base = BASE_SCRAP_DETAIL_OPTIONS[item] ?? [];
    const baseSet = new Set(base.map((option) => option.trim().toLocaleLowerCase()));
    const custom = collectCustomScrapDetails(records, item, normalizeKind);
    const filtered: string[] = [];
    const seen = new Set<string>();

    for (const value of custom) {
      const trimmed = value.trim();
      if (!trimmed) continue;
      const normalized = trimmed.toLocaleLowerCase();
      if (normalized === "기타") continue;
      if (baseSet.has(normalized)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      filtered.push(trimmed);
    }

    return filtered;
  }, [draft.item, records, showScrapDetail]);

  const vehicleSuggestions = useMemo(
    () => getSuggestedVehicleNos(records, draft.partnerId, draft.partnerLabel),
    [records, draft.partnerId, draft.partnerLabel]
  );

  const updateDraft = useCallback(
    (patch: Partial<LogisticsDraft>) => {
      if (patch.site !== undefined) {
        siteTouchedRef.current = true;
      }
      const { nextDraft, clearCustomDetailInput } = buildUpdatedLogisticsDraft({
        draft,
        patch,
        partners,
        vehicles,
        records,
      });

      if (clearCustomDetailInput) {
        setCustomDetailInput("");
      }

      setDraft(nextDraft);
      saveDraft(nextDraft);
    },
    [draft, partners, records, saveDraft, setDraft, vehicles]
  );

  const {
    recentReturnSourceCandidates,
    filteredReturnSourceCandidates,
    activeReturnSourceCandidates,
    selectedReturnSource,
    returnSourceLocked,
    toggleReturnMode,
    setReturnSourceDateFilter,
    selectReturnSource,
  } = useReturnSourceController({
    records,
    draft,
    updateDraft,
  });

  const resetDraft = useCallback(() => {
    siteTouchedRef.current = false;
    setCustomDetailInput("");
    setEditingLineTarget(null);
    discardDraft();
  }, [discardDraft]);

  const selectScrapDetail = useCallback(
    (detailItem: string) => {
      updateDraft({ detailItem: detailItem.trim() });
    },
    [updateDraft]
  );

  const applyCustomScrapDetail = useCallback(() => {
    const trimmed = customDetailInput.trim();
    if (!trimmed) {
      return { ok: false, message: "세부 품목을 입력해 주세요." };
    }
    selectScrapDetail(trimmed);
    setCustomDetailInput("");
    return { ok: true, message: "세부 품목을 적용했습니다." };
  }, [customDetailInput, selectScrapDetail]);

  const updatePartnerQuickName = useCallback(
    async (input: UpdatePartnerNameInput): Promise<UpdatePartnerNameResult> =>
      updatePartnerQuickNameCommand({ partnerRepo, refreshMasters, input }),
    [partnerRepo, refreshMasters]
  );

  const createPartnerQuick = useCallback(
    async (input: PartnerV2Draft): Promise<CreateResult> =>
      createPartnerQuickCommand({ partnerRepo, refreshMasters, input }),
    [partnerRepo, refreshMasters]
  );

  const createVehicleQuick = useCallback(
    async (input: VehicleDraft): Promise<CreateResult> =>
      createVehicleQuickCommand({ vehicleRepo, refreshMasters, input }),
    [refreshMasters, vehicleRepo]
  );

  const startEditLine = useCallback(
    (recordId: string, lineIndex: number): SubmitResult => {
      const command = startEditLineCommand({
        records,
        recordId,
        lineIndex,
        draft,
        canRead: permissions.canRead,
      });
      if (!command.result.ok || !command.nextDraft || !command.nextTarget) {
        return command.result;
      }
      setDraft(command.nextDraft);
      saveDraft(command.nextDraft);
      setEditingLineTarget(command.nextTarget);
      return command.result;
    },
    [draft, records, saveDraft, setDraft]
  );

  const removeLine = useCallback(
    async (recordId: string, lineIndex: number): Promise<SubmitResult> => {
      const result = await removeLineCommand({
        dailyRepo,
        recordId,
        lineIndex,
        refreshRecords,
        canDelete: permissions.canDelete,
      });
      if (!result.ok) return result;
      if (editingLineTarget?.recordId === recordId && editingLineTarget.lineIndex === lineIndex) {
        setEditingLineTarget(null);
      }
      return result;
    },
    [dailyRepo, editingLineTarget, refreshRecords]
  );

  const submit = useCallback(
    async (): Promise<SubmitResult> => {
      const activeEdit = editingLineTarget;
      const nextRecordDate = draft.recordDate;

      const submitResult = await submitLogisticsCommand({
        dailyRepo,
        partnerRepo,
        draft,
        actorId: actorProfile?.id,
        canWrite: permissions.canWrite,
        hasCategory,
        hasPrice,
        showScrapDetail,
        refreshRecords,
        saveDraft,
      setDraft: (next) => setDraft(next),
      setCustomDetailInput,
      });

      if (!submitResult.ok) return submitResult;
      if (!activeEdit) return submitResult;

      const removeIndex =
        activeEdit.recordDate === nextRecordDate ? activeEdit.lineIndex + 1 : activeEdit.lineIndex;
      const removeResult = await removeLine(activeEdit.recordId, removeIndex);
      setEditingLineTarget(null);

      if (!removeResult.ok) {
        return {
          ok: true,
          message: "수정 내용은 저장되었지만 기존 항목 정리에 실패했습니다. 관리 화면에서 확인해 주세요.",
        };
      }

      return { ok: true, message: "유통 항목이 수정되었습니다." };
    },
    [
      dailyRepo,
      draft,
      editingLineTarget,
      hasCategory,
      hasPrice,
      partnerRepo,
      refreshRecords,
      removeLine,
      saveDraft,
      setDraft,
      showScrapDetail,
      actorProfile?.id,
    ]
  );

  return {
    draft,
    siteOptions: SITE_OPTIONS,
    partners,
    vehicles,
    records,
    kinds,
    directionOptions: DIRECTION_OPTIONS,
    categoryOptions: CATEGORY_OPTIONS,
    hasCategorySelection: hasCategory,
    hasPriceSelection: hasPrice,
    showScrapDetailSelection: showScrapDetail,
    isReturnMode: draft.isReturn,
    isReturnSourceLocked: returnSourceLocked,
    scrapDetailOptions,
    customScrapDetailOptions,
    customDetailInput,
    setCustomDetailInput,
    selectScrapDetail,
    applyCustomScrapDetail,
    returnSourceDateFilter: draft.returnSourceDateFilter,
    recentReturnSourceCandidates,
    filteredReturnSourceCandidates,
    activeReturnSourceCandidates,
    selectedReturnSource,
    toggleReturnMode,
    setReturnSourceDateFilter,
    selectReturnSource,
    editingLineTarget,
    vehicleSuggestions,
    writerLocked,
    updateDraft,
    resetDraft,
    submit,
    startEditLine,
    removeLine,
    createPartnerQuick,
    createVehicleQuick,
    updatePartnerQuickName,
  };
}



