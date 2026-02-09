# Draft P0 API 현장조사 — Partner V2 연결
> 작성일: 2026-02-09
> 목적: draft P0 API 모양이 SSOT 규칙/확장성/안전성에 맞는지 판정

1) useDraft 시그니처(원문)
```ts
// useDraft.ts (signature + return keys only)

type UseDraftOptions<T> = {
	key: string;
	initial: T;
	migrate?: (value: T) => T;
	enabled?: boolean;
	repo?: DraftRepo<T>;
};

export function useDraft<T>(options: UseDraftOptions<T>) {
	...
	return {
		draft,
		dirty,
		setDraft,
		loadDraft,
		saveDraft,
		discardDraft,
	};
}
```

types 핵심(원문)
```ts
// types.ts (DraftKey/DraftConfig/DraftState)

export type DraftRepo<T> = {
	load(key: string): T | null;
	save(key: string, value: T): void;
	clear(key: string): void;
};

export type DraftState<T> = {
	value: T;
	dirty: boolean;
};
```

draftRepo public API(원문)
```ts
// draftRepo.ts (save/load/remove signatures)

export function createDraftRepo<T>(): DraftRepo<T> {
	...
	return {
		load(key) {
			return storage.getItem<T>(key);
		},
		save(key, value) {
			storage.setItem(key, value);
		},
		clear(key) {
			storage.removeItem(key);
		},
	};
}
```

draftKeys 규칙(원문)
```ts
// draftKeys.ts

export const DRAFT_KEYS = {
	partnerV2: "draft:partner:v2",
} as const;

export type DraftKey = (typeof DRAFT_KEYS)[keyof typeof DRAFT_KEYS];
```

RegisterPartnerV2 사용 예시(원문)
```ts
// RegisterPartnerV2.tsx (useDraft usage + create/edit split)

const editMode = mode === "edit" && !!partnerId;
const {
	draft,
	setDraft,
	saveDraft,
	discardDraft,
} = useDraft<PartnerV2Draft>({
	key: DRAFT_KEYS.partnerV2,
	initial: defaultPartnerV2Draft(),
	migrate: normalizeDraft,
	enabled: !editMode,
});

useEffect(() => {
	if (!editMode || !partnerId) return;
	const found = repo.partners_v2<PartnerV2>().getAll().find((x) => x.id === partnerId);
	if (found) {
		setDraft({ base: found.base, extra: found.extra }, { dirty: false });
	}
}, [editMode, partnerId, setDraft]);

function persist(next: PartnerV2Draft) {
	setDraft(next);
	if (!editMode) {
		saveDraft(next);
	}
}
```

localStorage 직접 접근 0 확인



grep: localStorage\. in [src2/kernel/draft, RegisterPartnerV2] → 0 matches
