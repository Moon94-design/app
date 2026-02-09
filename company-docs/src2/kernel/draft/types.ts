import type { DraftKey } from "./draftKeys";

export type DraftRepo<T> = {
	load(key: DraftKey): T | null;
	save(key: DraftKey, value: T): void;
	clear(key: DraftKey): void;
};

export type DraftState<T> = {
	value: T;
	dirty: boolean;
};
