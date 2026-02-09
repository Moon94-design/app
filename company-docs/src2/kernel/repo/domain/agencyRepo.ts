import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type AgencyRecord = RepoEntity & Record<string, unknown>;

export function createAgencyRepo(): RepoContract<AgencyRecord> {
  return createLocalRepo<AgencyRecord>({
    storageKey: STORAGE_KEYS.agency,
  });
}
