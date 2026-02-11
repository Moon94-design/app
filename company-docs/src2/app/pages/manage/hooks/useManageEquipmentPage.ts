import { useEffect, useMemo, useState } from "react";
import { createEquipmentRepo, type RepoContract } from "@kernel/repo";
import type {
  Equipment,
  EquipmentImportance,
  EquipmentInspectCycle,
  EquipmentType,
} from "@kernel/schema/equipment";

export function useManageEquipmentPage() {
  const equipmentRepo = useMemo(
    () => createEquipmentRepo() as unknown as RepoContract<Equipment>,
    []
  );
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    equipmentRepo.getAll().then((items) => {
      if (!alive) return;
      setEquipments(items.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => {
      alive = false;
    };
  }, [equipmentRepo]);

  const editingEquipment = useMemo(
    () => equipments.find((equipment) => equipment.id === editingId) ?? null,
    [equipments, editingId]
  );

  async function refresh() {
    const items = await equipmentRepo.getAll();
    setEquipments(items.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async function saveEquipment(next: Equipment) {
    await equipmentRepo.upsert({
      ...next,
      name: next.name.trim(),
      location: next.location.trim(),
      equipTypeNote: next.equipTypeNote.trim(),
      makerModel: next.makerModel.trim(),
      installedAt: next.installedAt.trim(),
      inspectNote: next.inspectNote.trim(),
      updatedAt: Date.now(),
    });
    await refresh();
    setEditingId(null);
  }

  async function removeEquipment(id: string) {
    await equipmentRepo.remove(id);
    await refresh();
  }

  function startEdit(id: string) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function updateType(next: Equipment, equipType: EquipmentType): Equipment {
    return { ...next, equipType };
  }

  function updateImportance(next: Equipment, importance: EquipmentImportance): Equipment {
    return { ...next, importance };
  }

  function updateInspectCycle(next: Equipment, inspectCycle: EquipmentInspectCycle): Equipment {
    return { ...next, inspectCycle };
  }

  return {
    equipments,
    editingEquipment,
    startEdit,
    cancelEdit,
    saveEquipment,
    removeEquipment,
    updateType,
    updateImportance,
    updateInspectCycle,
  };
}
