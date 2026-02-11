import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type WeighingRecord = RepoEntity & Record<string, unknown>;

export function createWeighingRepo(): RepoContract<WeighingRecord> {
  return createLocalRepo<WeighingRecord>({
    storageKey: STORAGE_KEYS.weighingTransactionsLegacyV1,
  });
}
