import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type EmployeeRecord = RepoEntity & Record<string, unknown>;

export function createEmployeeRepo(): RepoContract<EmployeeRecord> {
  return createLocalRepo<EmployeeRecord>({
    storageKey: STORAGE_KEYS.employee,
  });
}
