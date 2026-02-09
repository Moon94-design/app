import { createJsonStorage } from "../repo/storage/jsonStorage";
import type { DraftKey } from "./draftKeys";
import type { DraftRepo } from "./types";

type DraftRepoOptions = {
	prefix?: string;
	strict?: boolean;
};

function validateKey(key: DraftKey, options?: DraftRepoOptions) {
	const prefix = options?.prefix ?? "draft:";
	if (options?.strict === false) return;
	if (!key.startsWith(prefix)) {
		throw new Error(`Draft key must start with "${prefix}": ${key}`);
	}
}

export function createDraftRepo<T>(options?: DraftRepoOptions): DraftRepo<T> {
	const storage = createJsonStorage();

	return {
		load(key) {
			validateKey(key, options);
			return storage.getItem<T>(key);
		},
		save(key, value) {
			validateKey(key, options);
			storage.setItem(key, value);
		},
		clear(key) {
			validateKey(key, options);
			storage.removeItem(key);
		},
	};
}
