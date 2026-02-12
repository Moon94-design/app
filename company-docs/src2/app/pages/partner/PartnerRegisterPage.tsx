import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MasterFormHeader } from "@kernel/components/master";
import { StatusBadge } from "@kernel/components/status";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createPartnerRepo, type RepoContract } from "@kernel/repo";
import {
  createLocalId,
  findSameBaseNameRows,
  findDuplicateByNamePair,
  normalizeNameKey,
} from "@kernel/utils";
import {
  createDefaultTradeProfile,
  defaultPartnerV2Draft,
  displayPartnerName,
  getPartnerStatusBadge,
  mergeTradeProfiles,
  type PartnerExtra,
  type PartnerV2,
  type PartnerV2Draft,
  resolvePartnerStatus,
  type TradeProfileItem,
} from "@kernel/schema/partner";
import PartnerBaseSection from "./sections/PartnerBaseSection";
import PartnerCreateFlow from "./sections/PartnerCreateFlow";
import PartnerExtraSection from "./sections/PartnerExtraSection";
import PartnerProfilesSection from "./sections/PartnerProfilesSection";
import PartnerRecentList from "./sections/PartnerRecentList";

function newId() {
  return createLocalId("PV2");
}

function formatPhone(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, "");
  if (cleaned.length === 0) return "";

  if (cleaned.startsWith("010") && cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("02") && cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("02") && cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  return cleaned;
}

function normalizeDraft(input: PartnerV2Draft): PartnerV2Draft {
  const next: PartnerV2Draft = {
    base: { ...input.base },
    extra: { ...input.extra },
  };

  if (!next.extra.tradeProfiles) {
    next.extra.tradeProfiles = [];
  }
  if (!next.extra.importance) {
    next.extra.importance = "중";
  }
  if (!next.extra.relationshipStatus) {
    next.extra.relationshipStatus = "중";
  }
  if (next.base.email === undefined) {
    next.base.email = "";
  }
  if (next.base.partnerDetailTag === undefined) {
    next.base.partnerDetailTag = "";
  }
  if (next.base.fax === undefined) {
    next.base.fax = "";
  }
  if (next.base.businessType === undefined) {
    next.base.businessType = "";
  }
  if (next.base.businessItem === undefined) {
    next.base.businessItem = "";
  }
  if (next.base.corporateNo === undefined) {
    next.base.corporateNo = "";
  }
  if (next.extra.bankAccount === undefined) {
    next.extra.bankAccount = "";
  }

  return next;
}

type PartnerLocationState = {
  partnerId?: string;
} | null;

export default function PartnerRegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PartnerLocationState;
  const editingId = state?.partnerId ?? null;
  const editMode = !!editingId;

  const partnerRepo = useMemo(
    () => createPartnerRepo() as unknown as RepoContract<PartnerV2>,
    []
  );

  const [docs, setDocs] = useState<PartnerV2[]>([]);
  const originalRef = useRef<PartnerV2Draft | null>(null);

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
    let alive = true;
    partnerRepo.getAll().then((items) => {
      if (alive) setDocs(items);
    });
    return () => {
      alive = false;
    };
  }, [partnerRepo]);

  useEffect(() => {
    if (!editMode || !editingId) return;
    let alive = true;
    partnerRepo.getById(editingId).then((found) => {
      if (!alive || !found) return;
      const nextDraft = { base: found.base, extra: found.extra };
      originalRef.current = nextDraft;
      setDraft(nextDraft, { dirty: false });
    });
    return () => {
      alive = false;
    };
  }, [editMode, editingId, partnerRepo, setDraft]);

  const status = useMemo(() => resolvePartnerStatus(draft.base, draft.extra), [draft]);
  const statusBadge = useMemo(() => getPartnerStatusBadge(status), [status]);
  const duplicateCandidates = useMemo(() => {
    const baseName = normalizeNameKey(draft.base.partnerName || "");
    if (!baseName) return [];
    return findSameBaseNameRows(
      docs,
      (row) => row.base.partnerName || "",
      draft.base.partnerName,
      editMode && editingId ? editingId : undefined
    ).map((row) => ({
      id: row.id,
      label: displayPartnerName(row.base.partnerName, row.base.partnerDetailTag),
    }));
  }, [docs, draft.base.partnerName, editMode, editingId]);

  function persist(next: PartnerV2Draft) {
    setDraft(next);
    if (!editMode) {
      saveDraft(next);
    }
  }

  function updateBase(patch: Partial<PartnerV2Draft["base"]>) {
    persist({ ...draft, base: { ...draft.base, ...patch } });
  }

  function updateExtra(patch: Partial<PartnerV2Draft["extra"]>) {
    persist({ ...draft, extra: { ...draft.extra, ...patch } });
  }

  function addProfile() {
    persist({
      ...draft,
      extra: {
        ...draft.extra,
        tradeProfiles: mergeTradeProfiles(draft.extra.tradeProfiles, [createDefaultTradeProfile()], "append"),
      },
    });
  }

  function updateProfile(idx: number, patch: Partial<TradeProfileItem>) {
    const nextProfiles = draft.extra.tradeProfiles.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    persist({ ...draft, extra: { ...draft.extra, tradeProfiles: nextProfiles } });
  }

  function removeProfile(idx: number) {
    const nextProfiles = draft.extra.tradeProfiles.filter((_, i) => i !== idx);
    persist({ ...draft, extra: { ...draft.extra, tradeProfiles: nextProfiles } });
  }

  async function save() {
    if (!draft.base.partnerName.trim()) {
      return alert("거래처명을 입력하세요.");
    }

    const now = Date.now();
    const nextBase = {
      ...draft.base,
      partnerCode: draft.base.partnerCode.trim() || `PC_${Date.now()}`,
    };

    const completion = resolvePartnerStatus(nextBase, draft.extra) === "complete";
    const nextExtra: PartnerExtra = {
      ...draft.extra,
      status: completion ? "complete" : "incomplete",
    };

    const allDocs = await partnerRepo.getAll();
    const detailTag = (nextBase.partnerDetailTag || "").trim();
    const exactDuplicate = findDuplicateByNamePair(
      allDocs,
      (row) => row.base.partnerName || "",
      (row) => row.base.partnerDetailTag || "",
      nextBase.partnerName,
      detailTag,
      editMode && editingId ? editingId : undefined
    );
    if (exactDuplicate) {
      alert("동일한 거래처명/세부 조합이 이미 있습니다. 세부를 수정하거나 기존 항목을 사용해 주세요.");
      return;
    }
    const sameBase = findSameBaseNameRows(
      allDocs,
      (row) => row.base.partnerName || "",
      nextBase.partnerName,
      editMode && editingId ? editingId : undefined
    );
    if (sameBase.length > 0 && !detailTag) {
      alert("동일한 거래처명이 이미 있습니다. 거래처명 세부를 입력해서 구분해 주세요.");
      return;
    }

    if (editMode && editingId) {
      const existing = await partnerRepo.getById(editingId);
      const updated: PartnerV2 = {
        id: editingId,
        base: nextBase,
        extra: nextExtra,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await partnerRepo.upsert(updated);
      setDocs(await partnerRepo.getAll());
      alert("수정 완료");
      return;
    }

    const newDoc: PartnerV2 = {
      id: newId(),
      base: nextBase,
      extra: nextExtra,
      createdAt: now,
      updatedAt: now,
    };
    await partnerRepo.upsert(newDoc);
    setDocs(await partnerRepo.getAll());
    alert("저장 완료");
    discardDraft();
    if (!completion) {
      navigate("/manage/master");
    }
  }

  function handleReset() {
    if (editMode && originalRef.current) {
      setDraft(originalRef.current, { dirty: false });
      return;
    }
    discardDraft();
  }

  function handleLoad(doc: PartnerV2) {
    const next = { base: doc.base, extra: doc.extra };
    setDraft(next);
    saveDraft(next);
  }

  return (
    <div className="card menu-page">
      <MasterFormHeader
        title={`거래처 ${editMode ? "수정" : "등록"}`}
        onReset={handleReset}
        rightSlot={editMode ? <StatusBadge label={statusBadge.label} tone={statusBadge.tone} /> : null}
      />
      <div className="divider" />

      {editMode && (
        <div style={{ marginBottom: 20 }}>
          <p className="p" style={{ fontSize: 13 }}>
            수정 모드: 모든 정보 변경 가능
          </p>
        </div>
      )}

      {editMode ? (
        <>
          <PartnerBaseSection base={draft.base} onUpdate={updateBase} formatPhone={formatPhone} />

          <div className="divider" />

          <div style={{ display: "grid", gap: 14 }}>
            <PartnerExtraSection extra={draft.extra} onUpdate={updateExtra} />
            <PartnerProfilesSection
              profiles={draft.extra.tradeProfiles}
              onAdd={addProfile}
              onUpdate={updateProfile}
              onRemove={removeProfile}
            />
          </div>
        </>
      ) : (
        <PartnerCreateFlow
          draft={draft}
          onUpdateBase={updateBase}
          onUpdateExtra={updateExtra}
          onAddProfile={addProfile}
          onUpdateProfile={updateProfile}
          onRemoveProfile={removeProfile}
          formatPhone={formatPhone}
          duplicatePartners={duplicateCandidates}
          onSaveDuplicate={async ({ id, partnerName, partnerDetailTag }) => {
            const target = await partnerRepo.getById(id);
            if (!target) {
              return { ok: false, message: "대상 거래처를 찾지 못했습니다." };
            }

            const nextName = partnerName.trim();
            const nextDetail = partnerDetailTag.trim();
            if (!nextName) {
              return { ok: false, message: "거래처명을 입력해 주세요." };
            }

            const allDocs = await partnerRepo.getAll();
            const duplicate = findDuplicateByNamePair(
              allDocs,
              (row) => row.base.partnerName || "",
              (row) => row.base.partnerDetailTag || "",
              nextName,
              nextDetail,
              id
            );
            if (duplicate) {
              return { ok: false, message: "동일한 거래처명/세부 조합이 이미 있습니다." };
            }

            const nextBase = {
              ...target.base,
              partnerName: nextName,
              partnerDetailTag: nextDetail,
            };
            const nextExtra = { ...target.extra };
            nextExtra.status = resolvePartnerStatus(nextBase, nextExtra);

            await partnerRepo.upsert({
              ...target,
              base: nextBase,
              extra: nextExtra,
              updatedAt: Date.now(),
            });

            setDocs(await partnerRepo.getAll());
            return { ok: true, message: "기존 거래처명을 수정했습니다." };
          }}
        />
      )}

      <div className="row" style={{ gap: 8, marginTop: 20 }}>
        <button type="button" className="btn primary" onClick={save}>
          {editMode ? "수정" : "저장"}
        </button>
        {editMode && (
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            취소
          </button>
        )}
      </div>

      {!editMode && <PartnerRecentList docs={docs} onLoad={handleLoad} />}
    </div>
  );
}

