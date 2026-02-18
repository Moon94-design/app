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
	const migrateRef = useRef(migrate);

	useEffect(() => {
		migrateRef.current = migrate;
	}, [migrate]);

	const applyMigrate = useCallback((value: T) => {
		const migrateFn = migrateRef.current;
		return migrateFn ? migrateFn(value) : value;
	}, []);

	const [draft, setDraftState] = useState<T>(() => {
		if (!enabled) return initial;
		const loaded = repo.load(key);
		return loaded ? (migrate ? migrate(loaded) : loaded) : initial;
	});
	const [dirty, setDirty] = useState(false);

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
	}, [enabled, key, loadDraft]);

	// Guardrail: persist dirty draft even if caller forgets to call saveDraft.
	useEffect(() => {
		if (!enabled) return;
		if (!dirty) return;
		const timer = setTimeout(() => {
			repo.save(key, draft);
			setDirty(false);
		}, 120);
		return () => clearTimeout(timer);
	}, [dirty, draft, enabled, key, repo]);

	const setDraft = useCallback((next: T, opts?: SetDraftOptions) => {
		setDraftState(next);
		setDirty(opts?.dirty ?? true);
	}, []);

	const saveDraft = useCallback(
		(next?: T) => {
			const value = next ?? draft;
			repo.save(key, value);
			setDirty(false);
		},
		[draft, key, repo]
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
