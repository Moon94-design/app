import { STORAGE_KEYS } from "../keys";
import { createLocalRepo } from "../impl/localRepo";
import type { RepoContract, RepoEntity } from "../types";

export type PartnerRecord = RepoEntity & Record<string, unknown>;

export function createPartnerRepo(): RepoContract<PartnerRecord> {
	return createLocalRepo<PartnerRecord>({
		storageKey: STORAGE_KEYS.partner,
	});
}
