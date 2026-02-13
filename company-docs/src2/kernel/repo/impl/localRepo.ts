import { createJsonStorage } from "../storage/jsonStorage";
import type { RepoContract, RepoEntity, StorageAdapter } from "../types";
import { appendRepoAuditEvent } from "./repoAudit";

type LocalRepoOptions = {
	storageKey: string;
	storage?: StorageAdapter;
};

function readAll<T>(storage: StorageAdapter, key: string): T[] {
	return storage.getItem<T[]>(key) ?? [];
}

export function createLocalRepo<T extends RepoEntity>(
	options: LocalRepoOptions
): RepoContract<T> {
	const storage = options.storage ?? createJsonStorage();
	const key = options.storageKey;

	return {
		async getAll() {
			return readAll<T>(storage, key);
		},
		async getById(id: string) {
			const items = readAll<T>(storage, key);
			return items.find((item) => item.id === id) ?? null;
		},
		async upsert(item: T) {
			const items = readAll<T>(storage, key);
			const updatedAt = item.updatedAt ?? Date.now();
			const next = { ...item, updatedAt } as T;
			const index = items.findIndex((it) => it.id === item.id);
			const action = index >= 0 ? "update" : "create";
			if (index >= 0) {
				items[index] = next;
			} else {
				items.push(next);
			}
			storage.setItem(key, items);
			appendRepoAuditEvent(action, key, next.id, next);
			return next;
		},
		async upsertMany(items: T[]) {
			const current = readAll<T>(storage, key);
			const previousById = new Map(current.map((item) => [item.id, item]));
			const nextMap = new Map(current.map((item) => [item.id, item]));
			const updatedItems = items.map((item) => {
				const updatedAt = item.updatedAt ?? Date.now();
				const next = { ...item, updatedAt } as T;
				nextMap.set(next.id, next);
				const action = previousById.has(next.id) ? "update" : "create";
				appendRepoAuditEvent(action, key, next.id, next);
				return next;
			});
			storage.setItem(key, Array.from(nextMap.values()));
			return updatedItems;
		},
		async remove(id: string) {
			const current = readAll<T>(storage, key);
			const removed = current.filter((item) => item.id === id);
			const items = current.filter((item) => item.id !== id);
			storage.setItem(key, items);
			removed.forEach((row) => appendRepoAuditEvent("delete", key, row.id, row));
		},
		async removeMany(ids: string[]) {
			const idSet = new Set(ids);
			const current = readAll<T>(storage, key);
			const removed = current.filter((item) => idSet.has(item.id));
			const items = current.filter((item) => !idSet.has(item.id));
			storage.setItem(key, items);
			removed.forEach((row) => appendRepoAuditEvent("delete", key, row.id, row));
		},
	};
}
