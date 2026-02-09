export type RepoEntity = {
	id: string;
	updatedAt?: number;
};

export interface RepoContract<T extends RepoEntity> {
	getAll(): Promise<T[]>;
	getById(id: string): Promise<T | null>;
	upsert(item: T): Promise<T>;
	upsertMany(items: T[]): Promise<T[]>;
	remove(id: string): Promise<void>;
	removeMany(ids: string[]): Promise<void>;
}

export interface DocRepoContract<
	D extends RepoEntity,
	I extends RepoEntity
> extends RepoContract<D> {
	getItems(docId: string): Promise<I[]>;
	upsertItem(docId: string, item: I): Promise<I>;
	removeItem(docId: string, itemId: string): Promise<void>;
}

export interface StorageAdapter {
	getItem<T>(key: string): T | null;
	setItem<T>(key: string, value: T): void;
	removeItem(key: string): void;
}
