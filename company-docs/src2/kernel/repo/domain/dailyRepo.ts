import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type DailyRecord = RepoEntity & Record<string, unknown>;

export function createDailyRepo(): RepoContract<DailyRecord> {
	return createLocalRepo<DailyRecord>({
		storageKey: STORAGE_KEYS.daily,
	});
}
