import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDraftRepo } from "./draftRepo";
import type { DraftKey } from "./draftKeys";
import type { DraftRepo } from "./types";

type SetDraftOptions = {
	dirty?: boolean;
};

type UseDraftOptions<T> = {
	key: DraftKey;
	initial: T;
	migrate?: (value: T) => T;
	enabled?: boolean;
	repo?: DraftRepo<T>;
};

export function useDraft<T>(options: UseDraftOptions<T>) {
	const { key, initial, migrate, enabled = true } = options;
	const repo = useMemo(() => options.repo ?? createDraftRepo<T>(), [options.repo]);
	const initialRef = useRef(initial);

	const [draft, setDraftState] = useState<T>(initial);
	const [dirty, setDirty] = useState(false);
	const draftRef = useRef(draft);
	draftRef.current = draft;

	const applyMigrate = useCallback(
		(value: T) => (migrate ? migrate(value) : value),
		[migrate]
	);

	const loadDraft = useCallback(() => {
		const loaded = repo.load(key);
		if (loaded) {
			const next = applyMigrate(loaded);
			setDraftState(next);
			setDirty(false);
			return next;
		}
		setDraftState(initialRef.current);
		setDirty(false);
		return initialRef.current;
	}, [applyMigrate, key, repo]);

	useEffect(() => {
		if (!enabled) return;
		loadDraft();
	}, [enabled, loadDraft]);

	const setDraft = useCallback((next: T, opts?: SetDraftOptions) => {
		setDraftState(next);
		setDirty(opts?.dirty ?? true);
	}, []);

	const saveDraft = useCallback(
		(next?: T) => {
			const value = next ?? draftRef.current;
			repo.save(key, value);
			setDirty(false);
		},
		[key, repo]
	);

	const discardDraft = useCallback(() => {
		repo.clear(key);
		setDraftState(initialRef.current);
		setDirty(false);
	}, [key, repo]);

	return {
		draft,
		dirty,
		setDraft,
		loadDraft,
		saveDraft,
		discardDraft,
	};
}
