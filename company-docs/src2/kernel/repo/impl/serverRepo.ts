import type { RepoContract, RepoEntity } from "../types";

function notImplemented(): Promise<never> {
	return Promise.reject(new Error("serverRepo not implemented"));
}

export function createServerRepo<T extends RepoEntity>(): RepoContract<T> {
	return {
		getAll: notImplemented,
		getById: notImplemented,
		upsert: notImplemented,
		upsertMany: notImplemented,
		remove: notImplemented,
		removeMany: notImplemented,
	};
}
