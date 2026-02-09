import type { StorageAdapter } from "../types";

const memoryStorage = new Map<string, string>();

type StorageLike = {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
};

function getStorage(): StorageLike {
	if (typeof localStorage !== "undefined") return localStorage;
	return {
		getItem(key) {
			return memoryStorage.get(key) ?? null;
		},
		setItem(key, value) {
			memoryStorage.set(key, value);
		},
		removeItem(key) {
			memoryStorage.delete(key);
		},
	};
}

export function createJsonStorage(): StorageAdapter {
	return {
		getItem<T>(key: string): T | null {
			const storage = getStorage();
			const raw = storage.getItem(key);
			if (!raw) return null;
			try {
				return JSON.parse(raw) as T;
			} catch {
				return null;
			}
		},
		setItem<T>(key: string, value: T): void {
			const storage = getStorage();
			storage.setItem(key, JSON.stringify(value));
		},
		removeItem(key: string): void {
			const storage = getStorage();
			storage.removeItem(key);
		},
	};
}
