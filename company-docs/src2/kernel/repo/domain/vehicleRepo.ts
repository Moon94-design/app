import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type VehicleRecord = RepoEntity & Record<string, unknown>;

export function createVehicleRepo(): RepoContract<VehicleRecord> {
  return createLocalRepo<VehicleRecord>({
    storageKey: STORAGE_KEYS.vehicle,
  });
}
