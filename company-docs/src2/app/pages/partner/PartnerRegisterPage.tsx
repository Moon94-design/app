import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createPartnerRepo, type RepoContract } from "@kernel/repo";
import {
  defaultPartnerV2Draft,
  isPartnerComplete,
  type PartnerExtra,
  type PartnerV2,
  type PartnerV2Draft,
  type TradeProfileItem,
} from "@kernel/schema/partner";
import PartnerBaseSection from "./sections/PartnerBaseSection";
import PartnerCreateFlow from "./sections/PartnerCreateFlow";
import PartnerExtraSection from "./sections/PartnerExtraSection";
import PartnerHeader from "./sections/PartnerHeader";
import PartnerProfilesSection from "./sections/PartnerProfilesSection";
import PartnerRecentList from "./sections/PartnerRecentList";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `PV2_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
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

  const completed = useMemo(() => isPartnerComplete(draft.base, draft.extra), [draft]);

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
        tradeProfiles: [
          ...draft.extra.tradeProfiles,
          { direction: "매입", item: "PP", kind: "압축", memo: "" },
        ],
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
    if (!draft.base.partnerCode.trim()) {
      draft.base.partnerCode = `PC_${Date.now()}`;
    }

    const completion = isPartnerComplete(draft.base, draft.extra);
    const nextExtra: PartnerExtra = {
      ...draft.extra,
      status: completion ? "complete" : "incomplete",
    };

    if (editMode && editingId) {
      const existing = await partnerRepo.getById(editingId);
      const updated: PartnerV2 = {
        id: editingId,
        base: draft.base,
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
      base: draft.base,
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
    <div className="card">
      <PartnerHeader mode={editMode ? "edit" : "create"} completed={completed} onReset={handleReset} />

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
