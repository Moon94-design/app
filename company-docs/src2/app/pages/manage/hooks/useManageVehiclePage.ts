import { useEffect, useMemo, useState } from "react";
import { createVehicleRepo, type RepoContract } from "@kernel/repo";
import {
  isVehicleComplete,
  isVehicleIncomplete,
  isVehiclePending,
  resolveVehicleStatusFromRecord,
  type Vehicle,
} from "@kernel/schema/vehicle";

type VehicleFilter = "all" | "incomplete" | "pending" | "complete";

export function useManageVehiclePage() {
  const vehicleRepo = useMemo(
    () => createVehicleRepo() as unknown as RepoContract<Vehicle>,
    []
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<VehicleFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    vehicleRepo.getAll().then((items) => {
      if (!alive) return;
      const next = items.map((item) => ({
        ...item,
        status: resolveVehicleStatusFromRecord(item),
      }));
      setVehicles(next);
    });
    return () => {
      alive = false;
    };
  }, [vehicleRepo]);

  const filteredVehicles = useMemo(() => {
    if (filter === "incomplete") return vehicles.filter((v) => isVehicleIncomplete(v));
    if (filter === "pending") return vehicles.filter((v) => isVehiclePending(v));
    if (filter === "complete") return vehicles.filter((v) => isVehicleComplete(v));
    return vehicles;
  }, [vehicles, filter]);

  const counts = useMemo(
    () => ({
      total: vehicles.length,
      incomplete: vehicles.filter((v) => isVehicleIncomplete(v)).length,
      pending: vehicles.filter((v) => isVehiclePending(v)).length,
      complete: vehicles.filter((v) => isVehicleComplete(v)).length,
    }),
    [vehicles]
  );

  const editingVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === editingId) ?? null,
    [vehicles, editingId]
  );

  async function refresh() {
    const items = await vehicleRepo.getAll();
    setVehicles(
      items.map((item) => ({
        ...item,
        status: resolveVehicleStatusFromRecord(item),
      }))
    );
  }

  async function saveVehicle(next: Vehicle) {
    await vehicleRepo.upsert({
      ...next,
      status: resolveVehicleStatusFromRecord(next),
      updatedAt: Date.now(),
    });
    await refresh();
    setEditingId(null);
  }

  async function removeVehicle(id: string) {
    await vehicleRepo.remove(id);
    await refresh();
  }

  async function markPending(id: string) {
    const target = vehicles.find((vehicle) => vehicle.id === id);
    if (!target) return;
    await vehicleRepo.upsert({
      ...target,
      status: "pending",
      updatedAt: Date.now(),
    });
    await refresh();
  }

  function startEdit(id: string) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return {
    vehicles: filteredVehicles,
    counts,
    filter,
    setFilter,
    editingVehicle,
    startEdit,
    cancelEdit,
    saveVehicle,
    removeVehicle,
    markPending,
  };
}
