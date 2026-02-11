import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createConsumableRepo, createEquipmentRepo, createVendorRepo, type RepoContract } from "@kernel/repo";
import { createLocalId } from "@kernel/utils";
import { defaultConsumableDraft, type ConsumableDraft } from "@kernel/schema/consumable";
import type { Consumable, Equipment } from "@kernel/schema/equipment";
import type { Vendor } from "@kernel/schema/vendor";

function newId() {
  return createLocalId("CS");
}

export function useConsumableRegisterPage() {
  const equipmentRepo = useMemo(
    () => createEquipmentRepo() as unknown as RepoContract<Equipment>,
    []
  );
  const consumableRepo = useMemo(
    () => createConsumableRepo() as unknown as RepoContract<Consumable>,
    []
  );
  const vendorRepo = useMemo(
    () => createVendorRepo() as unknown as RepoContract<Vendor>,
    []
  );

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<ConsumableDraft>({
    key: DRAFT_KEYS.consumableRegister,
    initial: defaultConsumableDraft(),
  });

  useEffect(() => {
    let alive = true;
    Promise.all([equipmentRepo.getAll(), consumableRepo.getAll(), vendorRepo.getAll()]).then(
      ([equipmentItems, consumableItems, vendorItems]) => {
        if (!alive) return;
        setEquipments(equipmentItems);
        setConsumables(consumableItems);
        setVendors(vendorItems);
      }
    );
    return () => {
      alive = false;
    };
  }, [consumableRepo, equipmentRepo, vendorRepo]);

  const updateDraft = useCallback(
    (patch: Partial<ConsumableDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
  }, [discardDraft]);

  const equipmentName = useMemo(() => {
    const equipment = equipments.find((item) => item.id === draft.equipmentId);
    return equipment ? equipment.name : "";
  }, [draft.equipmentId, equipments]);

  const submit = useCallback(async () => {
    if (!draft.equipmentId) {
      alert("설비를 선택하세요.");
      return;
    }
    if (!draft.name.trim()) {
      alert("소모품명을 입력하세요.");
      return;
    }

    const now = Date.now();
    const vendor = vendors.find((item) => item.id === draft.vendorId);

    const nextConsumable: Consumable = {
      id: newId(),
      equipmentId: draft.equipmentId,
      equipmentName,
      name: draft.name.trim(),
      spec: draft.spec.trim(),
      replaceRule: draft.rule.trim(),
      minStock: Number(draft.minStock) || 0,
      vendorId: draft.vendorId || "",
      vendorName: vendor ? vendor.name : "",
      createdAt: now,
      updatedAt: now,
    };

    await consumableRepo.upsert(nextConsumable);
    const nextConsumables = await consumableRepo.getAll();
    setConsumables(nextConsumables);

    const nextEquipments = equipments.map((equipment) => {
      if (equipment.id !== draft.equipmentId) return equipment;
      const ids = Array.isArray(equipment.consumableIds) ? equipment.consumableIds : [];
      const nextIds = ids.includes(nextConsumable.id) ? ids : [...ids, nextConsumable.id];
      return { ...equipment, consumableIds: nextIds, updatedAt: now };
    });

    await equipmentRepo.upsertMany(nextEquipments);
    setEquipments(await equipmentRepo.getAll());

    discardDraft();
    alert("저장되었습니다.(로컬)");
  }, [consumableRepo, discardDraft, draft, equipmentName, equipmentRepo, equipments, vendors]);

  const remove = useCallback(
    async (id: string) => {
      const target = consumables.find((item) => item.id === id);
      await consumableRepo.remove(id);
      const nextConsumables = await consumableRepo.getAll();
      setConsumables(nextConsumables);

      if (!target?.equipmentId) return;
      const now = Date.now();
      const nextEquipments = equipments.map((equipment) => {
        if (equipment.id !== target.equipmentId) return equipment;
        const nextIds = (equipment.consumableIds || []).filter((consumableId) => consumableId !== id);
        return { ...equipment, consumableIds: nextIds, updatedAt: now };
      });
      await equipmentRepo.upsertMany(nextEquipments);
      setEquipments(await equipmentRepo.getAll());
    },
    [consumableRepo, consumables, equipmentRepo, equipments]
  );

  return {
    draft,
    equipments,
    vendors,
    consumables,
    updateDraft,
    resetDraft,
    submit,
    remove,
  };
}


