import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createVehicleRepo, type RepoContract } from "@kernel/repo";
import { createLocalId, findDuplicateByVehicleNo, formatPhoneInput } from "@kernel/utils";
import {
  defaultVehicleDraft,
  resolveVehicleStatus,
  type Vehicle,
  type VehicleDraft,
} from "@kernel/schema/vehicle";

function newId() {
  return createLocalId("V");
}

export function useVehicleRegisterPage() {
  const vehicleRepo = useMemo(
    () => createVehicleRepo() as unknown as RepoContract<Vehicle>,
    []
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<VehicleDraft>({
    key: DRAFT_KEYS.vehicleRegister,
    initial: defaultVehicleDraft(),
  });

  useEffect(() => {
    let alive = true;
    vehicleRepo.getAll().then((items) => {
      if (alive) setVehicles(items);
    });
    return () => {
      alive = false;
    };
  }, [vehicleRepo]);

  const updateDraft = useCallback(
    (patch: Partial<VehicleDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const onChangePhone = useCallback(
    (raw: string) => {
      updateDraft({ driverPhone: formatPhoneInput(raw) });
    },
    [updateDraft]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
  }, [discardDraft]);

  const submit = useCallback(async () => {
    if (!draft.vehicleNo.trim()) {
      alert("李⑤웾踰덊샇???꾩닔?낅땲??");
      return;
    }

    const allVehicles = await vehicleRepo.getAll();
    const duplicate = findDuplicateByVehicleNo(
      allVehicles,
      (row) => row.vehicleNo || "",
      draft.vehicleNo
    );
    if (duplicate) {
      alert("?숈씪??李⑤웾踰덊샇媛 ?대? ?덉뒿?덈떎. 湲곗〈 李⑤웾???섏젙?댁꽌 援щ텇 ?뺣낫瑜?蹂댁셿??二쇱꽭??");
      return;
    }

    const now = Date.now();
    const nextVehicle: Vehicle = {
      id: newId(),
      vehicleNo: draft.vehicleNo.trim(),
      tonClass: draft.tonClass,
      bodyType: draft.bodyType,
      carrierName: draft.carrierName.trim(),
      driverName: draft.driverName.trim(),
      driverPhone: draft.driverPhone.trim(),
      tagsText: draft.tagsText.trim(),
      memo: draft.memo.trim(),
      source: "manual",
      status: resolveVehicleStatus(draft),
      createdAt: now,
      updatedAt: now,
    };

    await vehicleRepo.upsert(nextVehicle);
    setVehicles(await vehicleRepo.getAll());
    discardDraft();
    alert("??λ릺?덉뒿?덈떎.(濡쒖뺄)");
  }, [discardDraft, draft, vehicleRepo]);

  const remove = useCallback(
    async (id: string) => {
      await vehicleRepo.remove(id);
      setVehicles(await vehicleRepo.getAll());
    },
    [vehicleRepo]
  );

  return {
    draft,
    vehicles,
    updateDraft,
    onChangePhone,
    submit,
    resetDraft,
    remove,
  };
}
