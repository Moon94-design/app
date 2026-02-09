import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createConsumableRepo, createEquipmentRepo, createVendorRepo, type RepoContract } from "@kernel/repo";
import {
  defaultConsumableFields,
  defaultEquipmentDraft,
  type Consumable,
  type Equipment,
  type EquipmentDraft,
} from "@kernel/schema/equipment";
import type { Vendor } from "@kernel/schema/vendor";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `EQ_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function useEquipmentRegisterPage() {
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

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<EquipmentDraft>({
    key: DRAFT_KEYS.equipmentRegister,
    initial: defaultEquipmentDraft(),
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
    (patch: Partial<EquipmentDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
  }, [discardDraft]);

  const submitEquipment = useCallback(async () => {
    if (!draft.name.trim()) {
      alert("설비명을 입력하세요.");
      return;
    }
    if (!draft.location.trim()) {
      alert("설치 위치/구역을 입력하세요.");
      return;
    }

    const now = Date.now();
    const nextEquipment: Equipment = {
      id: newId(),
      name: draft.name.trim(),
      location: draft.location.trim(),
      equipType: draft.equipType,
      equipTypeNote: draft.equipTypeNote.trim(),
      importance: draft.importance,
      makerModel: draft.makerModel.trim(),
      installedAt: draft.installedAt.trim(),
      inspectCycle: draft.inspectCycle,
      inspectNote: draft.inspectNote.trim(),
      consumableIds: [],
      createdAt: now,
      updatedAt: now,
    };

    await equipmentRepo.upsert(nextEquipment);
    const nextEquipments = await equipmentRepo.getAll();
    setEquipments(nextEquipments);
    updateDraft({ activeEquipmentId: nextEquipment.id });
    alert("설비가 저장되었습니다. 이제 아래에서 소모품을 추가할 수 있습니다.");
  }, [draft, equipmentRepo, updateDraft]);

  const removeEquipment = useCallback(
    async (id: string) => {
      await equipmentRepo.remove(id);
      const nextEquipments = await equipmentRepo.getAll();
      setEquipments(nextEquipments);
      if (draft.activeEquipmentId === id) {
        updateDraft({ activeEquipmentId: "" });
      }
    },
    [draft.activeEquipmentId, equipmentRepo, updateDraft]
  );

  const selectEquipment = useCallback(
    (equipmentId: string) => {
      updateDraft({ activeEquipmentId: equipmentId });
    },
    [updateDraft]
  );

  const addConsumableFromEquipment = useCallback(async () => {
    if (!draft.activeEquipmentId) {
      alert("소모품을 추가할 설비를 선택하세요.");
      return;
    }

    const activeEq = equipments.find((equipment) => equipment.id === draft.activeEquipmentId);
    if (!activeEq) {
      alert("설비를 다시 선택하세요.");
      return;
    }

    if (!draft.cName.trim()) {
      alert("소모품명을 입력하세요.");
      return;
    }

    const now = Date.now();
    const vendor = vendors.find((item) => item.id === draft.cVendorId);

    const nextConsumable: Consumable = {
      id: newId(),
      equipmentId: activeEq.id,
      equipmentName: activeEq.name,
      name: draft.cName.trim(),
      spec: draft.cSpec.trim(),
      replaceRule: draft.cRule.trim(),
      minStock: Number(draft.cMin) || 0,
      vendorId: draft.cVendorId || "",
      vendorName: vendor ? vendor.name : "",
      createdAt: now,
      updatedAt: now,
    };

    await consumableRepo.upsert(nextConsumable);
    const nextConsumables = await consumableRepo.getAll();
    setConsumables(nextConsumables);

    const nextEquipments = equipments.map((item) => {
      if (item.id !== activeEq.id) return item;
      const ids = Array.isArray(item.consumableIds) ? item.consumableIds : [];
      const nextIds = ids.includes(nextConsumable.id) ? ids : [...ids, nextConsumable.id];
      return { ...item, consumableIds: nextIds, updatedAt: now };
    });

    await equipmentRepo.upsertMany(nextEquipments);
    setEquipments(await equipmentRepo.getAll());

    updateDraft(defaultConsumableFields());
    alert("소모품이 등록되었고, 소모품 등록 목록에도 자동 추가되었습니다.");
  }, [consumableRepo, draft, equipmentRepo, equipments, updateDraft, vendors]);

  const activeEquipment = useMemo(
    () => equipments.find((equipment) => equipment.id === draft.activeEquipmentId) || null,
    [draft.activeEquipmentId, equipments]
  );

  const activeConsumables = useMemo(() => {
    if (!activeEquipment) return [];
    const idSet = new Set(activeEquipment.consumableIds || []);
    return consumables.filter(
      (consumable) => consumable.equipmentId === activeEquipment.id || idSet.has(consumable.id)
    );
  }, [activeEquipment, consumables]);

  return {
    draft,
    equipments,
    vendors,
    activeEquipment,
    activeConsumables,
    updateDraft,
    resetDraft,
    submitEquipment,
    removeEquipment,
    selectEquipment,
    addConsumableFromEquipment,
  };
}
