import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type EquipmentRecord = RepoEntity & Record<string, unknown>;

export function createEquipmentRepo(): RepoContract<EquipmentRecord> {
  return createLocalRepo<EquipmentRecord>({
    storageKey: STORAGE_KEYS.equipment,
  });
}
