import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPartnerRepo, type RepoContract } from "@kernel/repo";
import {
  defaultPartnerV2Draft,
  isCompleted,
  isIncomplete,
  isPartnerComplete,
  isPending,
  resolvePartnerStatus,
  type PartnerExtra,
  type PartnerStatus,
  type PartnerV2,
} from "@kernel/schema/partner";
import PartnerManageList from "./sections/PartnerManageList";
import PartnerManageToolbar from "./sections/PartnerManageToolbar";
import PartnerBulkEditPanel from "./bulk/PartnerBulkEditPanel";
import { usePartnerBulkEdit } from "./bulk/usePartnerBulkEdit";

type PartnerManagePageProps = {
  onBack?: () => void;
};

export default function PartnerManagePage({ onBack }: PartnerManagePageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/master"));
  const partnerRepo = useMemo(
    () => createPartnerRepo() as unknown as RepoContract<PartnerV2>,
    []
  );
  const [partners, setPartners] = useState<PartnerV2[]>([]);
  const [filter, setFilter] = useState<"all" | "incomplete" | "pending" | "complete">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const bulkEdit = usePartnerBulkEdit({ partnerRepo, onApplied: setPartners });

  useEffect(() => {
    let alive = true;
    partnerRepo.getAll().then((items) => {
      if (alive) setPartners(items);
    });
    return () => {
      alive = false;
    };
  }, [partnerRepo]);

  const normalized = useMemo(() => {
    return partners.map((partner) => {
      const extra: PartnerExtra = {
        ...defaultPartnerV2Draft().extra,
        ...partner.extra,
      };
      const nextStatus: PartnerStatus = resolvePartnerStatus(partner.base, extra);

      return { ...partner, extra: { ...extra, status: nextStatus } };
    });
  }, [partners]);

  const filtered = useMemo(() => {
    if (filter === "incomplete") return normalized.filter((p) => isIncomplete(p.extra));
    if (filter === "pending") return normalized.filter((p) => isPending(p.extra));
    if (filter === "complete") return normalized.filter((p) => isCompleted(p.extra));
    return normalized;
  }, [normalized, filter]);

  const searched = useMemo(() => {
    const keyword = searchQuery.trim();
    if (!keyword) return filtered;
    return filtered.filter((p) => p.base.partnerName.includes(keyword));
  }, [filtered, searchQuery]);

  const incompleteCount = normalized.filter((p) => isIncomplete(p.extra)).length;
  const pendingCount = normalized.filter((p) => p.extra.status === "pending").length;
  const completeCount = normalized.filter((p) => p.extra.status === "complete").length;

  function toggleBulkMode() {
    setBulkMode((prev) => {
      const next = !prev;
      if (!next) {
        bulkEdit.clearSelection();
      }
      return next;
    });
  }

  async function handlePending(target: PartnerV2) {
    if (!confirm(`"${target.base.partnerName}"을(를) 보류 처리하시겠습니까?`)) return;

    const all = await partnerRepo.getAll();
    const next = all.map((p) => {
      if (p.id === target.id) {
        return { ...p, extra: { ...p.extra, status: "pending" as const }, updatedAt: Date.now() };
      }
      return p;
    });
    await partnerRepo.upsertMany(next);
    setPartners(next);
    alert("보류 처리되었습니다.");
  }

  async function handleUnpending(target: PartnerV2) {
    if (!confirm(`"${target.base.partnerName}" 보류를 해제하시겠습니까?`)) return;

    const all = await partnerRepo.getAll();
    const next = all.map((p) => {
      if (p.id === target.id) {
        const extra: PartnerExtra = {
          ...defaultPartnerV2Draft().extra,
          ...p.extra,
        };
        const nextStatus: PartnerStatus = isPartnerComplete(p.base, extra) ? "complete" : "incomplete";
        return { ...p, extra: { ...extra, status: nextStatus }, updatedAt: Date.now() };
      }
      return p;
    });
    await partnerRepo.upsertMany(next);
    setPartners(next);
    alert("보류 해제되었습니다.");
  }

  async function handleDelete(target: PartnerV2) {
    if (!confirm(`"${target.base.partnerName}"을(를) 삭제하시겠습니까?`)) return;
    await partnerRepo.remove(target.id);
    setPartners(await partnerRepo.getAll());
    alert("삭제되었습니다.");
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 className="h1">거래처 관리</h1>
        <button type="button" className="btn" onClick={resolvedOnBack}>
          뒤로
        </button>
      </div>

      <div
        style={{
          padding: 16,
          background: "rgba(25, 118, 210, 0.08)",
          borderRadius: 4,
          marginBottom: 20,
          border: "1px solid rgba(25, 118, 210, 0.3)",
        }}
      >
        <p className="p" style={{ margin: 0, fontSize: 14 }}>
          💡 <strong>거래처 엑셀 일괄 등록</strong>은{" "}
          <Link to="/excel" style={{ color: "#1976d2", textDecoration: "underline" }}>
            홈 &gt; 엑셀등록 &gt; 거래처 업로드
          </Link>
          에서 하실 수 있습니다.
        </p>
      </div>

      <PartnerManageToolbar
        filter={filter}
        counts={{
          all: partners.length,
          incomplete: incompleteCount,
          pending: pendingCount,
          complete: completeCount,
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilter}
        bulkMode={bulkMode}
        onToggleBulkMode={toggleBulkMode}
      />

      {bulkMode && (
        <PartnerBulkEditPanel
          selectedCount={bulkEdit.selectedIds.size}
          bulkApply={bulkEdit.bulkApply}
          bulkForm={bulkEdit.bulkForm}
          setBulkApply={bulkEdit.setBulkApply}
          setBulkForm={bulkEdit.setBulkForm}
          onSelectAll={() => bulkEdit.selectAll(searched.map((p) => p.id))}
          onClearSelection={bulkEdit.clearSelection}
          onApply={bulkEdit.applyBulk}
          onUndo={bulkEdit.undoBulk}
          canUndo={bulkEdit.canUndo}
          onAddProfile={bulkEdit.addBulkProfile}
          onUpdateProfile={bulkEdit.updateBulkProfile}
          onRemoveProfile={bulkEdit.removeBulkProfile}
        />
      )}

      <div className="divider" />

      <PartnerManageList
        items={searched}
        bulkMode={bulkMode}
        selectedIds={bulkEdit.selectedIds}
        onToggleSelect={bulkEdit.toggleSelect}
        onEdit={(item) => navigate("/register/master/partner", { state: { partnerId: item.id } })}
        onPending={handlePending}
        onUnpending={handleUnpending}
        onDelete={handleDelete}
      />
    </div>
  );
}
