import { useCallback, useEffect, useMemo, useState } from "react";
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
  toNumber,
} from "./logistics/constants";
import { mapPartner, mapVehicle, resolvePartnerPrice } from "./logistics/mappers";
import { mergeRecordsByDate } from "./logistics/merge";
import {
  collectCustomScrapDetails,
  getLatestPartnerLine,
  getSuggestedVehicleNos,
} from "./logistics/selectors";
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

  // TODO: 계정 연동 이후 작성자 고정으로 전환.
  const writerLocked = false;

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<LogisticsDraft>({
    key: DRAFT_KEYS.logisticsDaily,
    initial: defaultDraft(),
  });

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

  const kinds = useMemo(() => KIND_OPTIONS[draft.direction], [draft.direction]);
  const hasCategory = hasCategorySelection(draft.direction);
  const hasPrice = hasPriceSelection(draft.direction);
  const showScrapDetail = needsScrapDetail(draft.direction, draft.kind) && hasCategory && Boolean(draft.item);

  const scrapDetailOptions = useMemo(() => {
    if (!showScrapDetail || !draft.item) return [];
    const item = draft.item as ProductCategory;
    const base = BASE_SCRAP_DETAIL_OPTIONS[item] ?? [];
    const custom = collectCustomScrapDetails(records, item, normalizeKind);
    return Array.from(new Set([...base, ...custom]));
  }, [draft.item, records, showScrapDetail]);

  const vehicleSuggestions = useMemo(
    () => getSuggestedVehicleNos(records, draft.partnerId, draft.partnerLabel),
    [records, draft.partnerId, draft.partnerLabel]
  );

  const updateDraft = useCallback(
    (patch: Partial<LogisticsDraft>) => {
      const next: LogisticsDraft = {
        ...draft,
        ...patch,
      };

      if (patch.direction) {
        const nextKinds = KIND_OPTIONS[patch.direction];
        if (!nextKinds.includes(next.kind)) {
          next.kind = nextKinds[0];
        }
        if (!hasCategorySelection(patch.direction)) {
          next.item = "";
          next.unitPricePerKg = 0;
        } else if (!next.item) {
          next.item = "PP";
        }
      }

      if (patch.kind) {
        next.kind = normalizeKind(patch.kind);
      }

      if (!needsScrapDetail(next.direction, next.kind)) {
        next.detailItem = "";
        setCustomDetailInput("");
      }

      if (patch.partnerId !== undefined) {
        const target = partners.find((row) => row.id === patch.partnerId);
        next.partnerLabel = target?.label || "";

        const latest = getLatestPartnerLine(records, target?.id || "", target?.label || "");
        if (latest) {
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
        const target = vehicles.find((row) => row.id === patch.vehicleId);
        next.vehicleNo = target?.vehicleNo || "";
      }

      if (patch.vehicleNo !== undefined && patch.vehicleId === undefined) {
        const target = vehicles.find((row) => row.vehicleNo === String(patch.vehicleNo).trim());
        next.vehicleId = target?.id || "";
      }

      const shouldAutoResolvePrice =
        next.partnerId &&
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

      setDraft(next);
      saveDraft(next);
    },
    [draft, partners, records, saveDraft, setDraft, vehicles]
  );

  const resetDraft = useCallback(() => {
    setCustomDetailInput("");
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
      return { ok: false, message: "?몃? ?덈ぉ???낅젰??二쇱꽭??" };
    }
    selectScrapDetail(trimmed);
    setCustomDetailInput("");
    return { ok: true, message: "?몃? ?덈ぉ???곸슜?섏뿀?듬땲??" };
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

  const submit = useCallback(
    async (): Promise<SubmitResult> =>
      submitLogisticsCommand({
        dailyRepo,
        partnerRepo,
        draft,
        hasCategory,
        hasPrice,
        showScrapDetail,
        refreshRecords,
        saveDraft,
        setDraft: (next) => setDraft(next),
        setCustomDetailInput,
      }),
    [
      dailyRepo,
      draft,
      hasCategory,
      hasPrice,
      partnerRepo,
      refreshRecords,
      saveDraft,
      setDraft,
      showScrapDetail,
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
    scrapDetailOptions,
    customDetailInput,
    setCustomDetailInput,
    selectScrapDetail,
    applyCustomScrapDetail,
    vehicleSuggestions,
    writerLocked,
    updateDraft,
    resetDraft,
    submit,
    createPartnerQuick,
    createVehicleQuick,
    updatePartnerQuickName,
  };
}


