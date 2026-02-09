import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type VendorRecord = RepoEntity & Record<string, unknown>;

export function createVendorRepo(): RepoContract<VendorRecord> {
  return createLocalRepo<VendorRecord>({
    storageKey: STORAGE_KEYS.vendor,
  });
}
