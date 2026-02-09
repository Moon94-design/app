import { useEffect, useMemo, useState } from "react";
import { createPartnerBulkSnapshotRepo, type RepoContract } from "@kernel/repo";
import {
  defaultPartnerV2Draft,
  resolvePartnerStatus,
  type PartnerExtra,
  type PartnerV2,
  type TradeProfileItem,
} from "@kernel/schema/partner";

export type BulkProfileMode = "append" | "overwrite";

export type BulkApplyState = {
  importance: boolean;
  relationshipStatus: boolean;
  profiles: boolean;
};

export type BulkFormState = {
  importance: "상" | "중" | "하";
  relationshipStatus: "상" | "중" | "하";
  profiles: TradeProfileItem[];
  profileMode: BulkProfileMode;
};

export type BulkSnapshotMeta = {
  savedAt: number;
  count: number;
};

const defaultBulkApply: BulkApplyState = {
  importance: false,
  relationshipStatus: false,
  profiles: false,
};

const defaultBulkForm: BulkFormState = {
  importance: "중",
  relationshipStatus: "중",
  profiles: [],
  profileMode: "append",
};

function profileKey(profile: TradeProfileItem): string {
  return `${profile.direction}|${profile.item}|${profile.kind}`;
}

function dedupeProfiles(profiles: TradeProfileItem[]): TradeProfileItem[] {
  const seen = new Set<string>();
  const result: TradeProfileItem[] = [];
  profiles.forEach((profile) => {
    const key = profileKey(profile);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(profile);
  });
  return result;
}

function applyProfileBatch(
  current: TradeProfileItem[],
  incoming: TradeProfileItem[],
  mode: BulkProfileMode
): TradeProfileItem[] {
  if (mode === "overwrite") {
    return dedupeProfiles(incoming);
  }
  return dedupeProfiles([...current, ...incoming]);
}

type UsePartnerBulkEditArgs = {
  partnerRepo: RepoContract<PartnerV2>;
  onApplied: (items: PartnerV2[]) => void;
};

export function usePartnerBulkEdit({ partnerRepo, onApplied }: UsePartnerBulkEditArgs) {
  const snapshotRepo = useMemo(() => createPartnerBulkSnapshotRepo(), []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApply, setBulkApply] = useState<BulkApplyState>(defaultBulkApply);
  const [bulkForm, setBulkForm] = useState<BulkFormState>(defaultBulkForm);
  const [snapshotMeta, setSnapshotMeta] = useState<BulkSnapshotMeta | null>(null);

  useEffect(() => {
    const snapshot = snapshotRepo.load();
    if (!snapshot) return;
    setSnapshotMeta({ savedAt: snapshot.savedAt, count: snapshot.items.length });
  }, [snapshotRepo]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll(ids: string[]) {
    setSelectedIds(new Set(ids));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function addBulkProfile() {
    setBulkForm((prev) => ({
      ...prev,
      profiles: [...prev.profiles, { direction: "매입", item: "PP", kind: "압축", memo: "" }],
    }));
  }

  function updateBulkProfile(index: number, patch: Partial<TradeProfileItem>) {
    setBulkForm((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile, idx) => (idx === index ? { ...profile, ...patch } : profile)),
    }));
  }

  function removeBulkProfile(index: number) {
    setBulkForm((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((_, idx) => idx !== index),
    }));
  }

  async function applyBulk() {
    if (selectedIds.size === 0) {
      alert("선택된 거래처가 없습니다.");
      return;
    }
    if (!Object.values(bulkApply).some(Boolean)) {
      alert("일괄 적용할 항목을 선택하세요.");
      return;
    }
    if (!confirm(`선택한 ${selectedIds.size}건에 일괄 수정을 적용할까요?`)) return;

    const all = await partnerRepo.getAll();
    const targetSet = new Set(selectedIds);
    const snapshotItems = all.filter((p) => targetSet.has(p.id));
    snapshotRepo.save({ savedAt: Date.now(), items: snapshotItems });
    setSnapshotMeta({ savedAt: Date.now(), count: snapshotItems.length });

    const next = all.map((p) => {
      if (!targetSet.has(p.id)) return p;

      const extra: PartnerExtra = {
        ...defaultPartnerV2Draft().extra,
        ...p.extra,
      };
      let nextExtra: PartnerExtra = { ...extra };

      if (bulkApply.importance) nextExtra.importance = bulkForm.importance;
      if (bulkApply.relationshipStatus) nextExtra.relationshipStatus = bulkForm.relationshipStatus;
      if (bulkApply.profiles) {
        nextExtra.tradeProfiles = applyProfileBatch(
          extra.tradeProfiles ?? [],
          bulkForm.profiles,
          bulkForm.profileMode
        );
      }

      const nextStatus = resolvePartnerStatus(p.base, nextExtra);
      nextExtra = { ...nextExtra, status: nextStatus };

      return { ...p, extra: nextExtra, updatedAt: Date.now() };
    });

    await partnerRepo.upsertMany(next);
    onApplied(next);
    alert("일괄 수정이 적용되었습니다.");
  }

  async function undoBulk() {
    const snapshot = snapshotRepo.load();
    if (!snapshot || snapshot.items.length === 0) {
      alert("되돌릴 내역이 없습니다.");
      return;
    }
    if (!confirm("일괄 수정 되돌리기를 실행하시겠습니까?")) return;

    await partnerRepo.upsertMany(snapshot.items);
    const latest = await partnerRepo.getAll();
    onApplied(latest);
    snapshotRepo.clear();
    setSnapshotMeta(null);
    alert("되돌리기가 완료되었습니다.");
  }

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkApply,
    setBulkApply,
    bulkForm,
    setBulkForm,
    addBulkProfile,
    updateBulkProfile,
    removeBulkProfile,
    applyBulk,
    undoBulk,
    canUndo: !!snapshotMeta,
    snapshotMeta,
  };
}
