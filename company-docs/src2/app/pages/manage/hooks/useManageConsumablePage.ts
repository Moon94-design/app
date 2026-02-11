import { useEffect, useMemo, useState } from "react";
import { createConsumableRepo, createEquipmentRepo, createVendorRepo, type RepoContract } from "@kernel/repo";
import { defaultConsumableDraft, type ConsumableDraft } from "@kernel/schema/consumable";
import type { Consumable, Equipment } from "@kernel/schema/equipment";
import type { Vendor } from "@kernel/schema/vendor";

function toDraft(consumable: Consumable): ConsumableDraft {
  return {
    equipmentId: consumable.equipmentId,
    name: consumable.name,
    spec: consumable.spec,
    rule: consumable.replaceRule,
    minStock: consumable.minStock,
    vendorId: consumable.vendorId,
  };
}

export function useManageConsumablePage() {
  const consumableRepo = useMemo(
    () => createConsumableRepo() as unknown as RepoContract<Consumable>,
    []
  );
  const equipmentRepo = useMemo(
    () => createEquipmentRepo() as unknown as RepoContract<Equipment>,
    []
  );
  const vendorRepo = useMemo(
    () => createVendorRepo() as unknown as RepoContract<Vendor>,
    []
  );

  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ConsumableDraft | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([consumableRepo.getAll(), equipmentRepo.getAll(), vendorRepo.getAll()]).then(
      ([consumableItems, equipmentItems, vendorItems]) => {
        if (!alive) return;
        setConsumables(consumableItems.sort((a, b) => b.updatedAt - a.updatedAt));
        setEquipments(equipmentItems);
        setVendors(vendorItems);
      }
    );
    return () => {
      alive = false;
    };
  }, [consumableRepo, equipmentRepo, vendorRepo]);

  const editingConsumable = useMemo(
    () => consumables.find((consumable) => consumable.id === editingId) ?? null,
    [consumables, editingId]
  );

  async function refresh() {
    const [consumableItems, equipmentItems, vendorItems] = await Promise.all([
      consumableRepo.getAll(),
      equipmentRepo.getAll(),
      vendorRepo.getAll(),
    ]);
    setConsumables(consumableItems.sort((a, b) => b.updatedAt - a.updatedAt));
    setEquipments(equipmentItems);
    setVendors(vendorItems);
  }

  function startEdit(id: string) {
    const target = consumables.find((consumable) => consumable.id === id);
    if (!target) return;
    setEditingId(id);
    setDraft(toDraft(target));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft(patch: Partial<ConsumableDraft>) {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
  }

  async function save() {
    if (!editingConsumable || !draft) return;
    if (!draft.equipmentId) {
      alert("설비를 선택하세요.");
      return;
    }
    if (!draft.name.trim()) {
      alert("소모품명을 입력하세요.");
      return;
    }

    const now = Date.now();
    const equipment = equipments.find((item) => item.id === draft.equipmentId);
    const vendor = vendors.find((item) => item.id === draft.vendorId);

    const next: Consumable = {
      ...editingConsumable,
      equipmentId: draft.equipmentId,
      equipmentName: equipment ? equipment.name : "",
      name: draft.name.trim(),
      spec: draft.spec.trim(),
      replaceRule: draft.rule.trim(),
      minStock: Number(draft.minStock) || 0,
      vendorId: draft.vendorId || "",
      vendorName: vendor ? vendor.name : "",
      updatedAt: now,
    };

    await consumableRepo.upsert(next);

    const updates: Equipment[] = [];
    const prevEquipment = equipments.find((item) => item.id === editingConsumable.equipmentId);
    const nextEquipment = equipments.find((item) => item.id === draft.equipmentId);

    if (prevEquipment && prevEquipment.id !== draft.equipmentId) {
      updates.push({
        ...prevEquipment,
        consumableIds: (prevEquipment.consumableIds || []).filter((id) => id !== editingConsumable.id),
        updatedAt: now,
      });
    }
    if (nextEquipment) {
      const ids = nextEquipment.consumableIds || [];
      const nextIds = ids.includes(editingConsumable.id) ? ids : [...ids, editingConsumable.id];
      updates.push({ ...nextEquipment, consumableIds: nextIds, updatedAt: now });
    }
    if (updates.length > 0) {
      await equipmentRepo.upsertMany(updates);
    }

    await refresh();
    cancelEdit();
  }

  async function removeConsumable(id: string) {
    const target = consumables.find((consumable) => consumable.id === id);
    await consumableRepo.remove(id);

    if (target?.equipmentId) {
      const equipment = equipments.find((item) => item.id === target.equipmentId);
      if (equipment) {
        await equipmentRepo.upsert({
          ...equipment,
          consumableIds: (equipment.consumableIds || []).filter((consumableId) => consumableId !== id),
          updatedAt: Date.now(),
        });
      }
    }

    await refresh();
  }

  function resetDraft() {
    setDraft(defaultConsumableDraft());
  }

  return {
    consumables,
    equipments,
    vendors,
    editingConsumable,
    draft,
    startEdit,
    cancelEdit,
    updateDraft,
    save,
    removeConsumable,
    resetDraft,
  };
}

