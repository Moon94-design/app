import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type ConsumableRecord = RepoEntity & Record<string, unknown>;

export function createConsumableRepo(): RepoContract<ConsumableRecord> {
  return createLocalRepo<ConsumableRecord>({
    storageKey: STORAGE_KEYS.consumable,
  });
}
