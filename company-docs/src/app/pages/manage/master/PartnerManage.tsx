/**
 * PartnerManage.tsx
 * 거래처 관리 페이지 (리스트 + 필터 + 수정)
 * 
 * 엑셀 업로드는 "홈 > 엑셀등록 > 거래처 업로드"에서 하세요.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPartnerRepo } from "@kernel/repo";
import type { PartnerExtra, PartnerStatus, PartnerV2 } from "@kernel/schema/partner";
import { defaultPartnerV2Draft, isCompleted, isPending, isIncomplete } from "@kernel/schema/partner";
import RegisterPartnerV2 from "../../register/partner/RegisterPartnerV2";

export default function PartnerManage() {
  const partnerRepo = useMemo(
    () =>
      createPartnerRepo() as unknown as {
        getAll: () => Promise<PartnerV2[]>;
        upsertMany: (items: PartnerV2[]) => Promise<PartnerV2[]>;
        remove: (id: string) => Promise<void>;
      },
    []
  );
  const [partners, setPartners] = useState<PartnerV2[]>([]);
  const [filter, setFilter] = useState<"all" | "incomplete" | "pending" | "complete">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

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
      const base = partner.base;
      const baseFields = [
        base.partnerName,
        base.ceoName,
        base.phone,
        base.zip,
        base.addr1,
        base.addr2,
        base.businessNo,
        base.contactName,
        base.contactPhone,
      ];
      const extraFields = [
        extra.note ?? "",
        extra.contactMemo ?? "",
        extra.bankAccount ?? "",
        extra.importance ?? "",
        extra.relationshipStatus ?? "",
      ];
      const baseOk = baseFields.every((value) => value.trim().length > 0);
      const extraOk = extraFields.every((value) => value.trim().length > 0);
      const profilesOk = (extra.tradeProfiles?.length ?? 0) > 0;
      const computedComplete = baseOk && extraOk && profilesOk;
      const nextStatus: PartnerStatus = extra.status === "pending"
        ? "pending"
        : computedComplete
          ? "complete"
          : "incomplete";

      return { ...partner, extra: { ...extra, status: nextStatus } };
    });
  }, [partners]);

  const filtered = useMemo(() => {
    if (filter === "incomplete") return normalized.filter((p) => isIncomplete(p.extra));
    if (filter === "pending") return normalized.filter((p) => isPending(p.extra));
    if (filter === "complete") return normalized.filter((p) => isCompleted(p.extra));
    return normalized;
  }, [normalized, filter]);

  const incompleteCount = normalized.filter((p) => isIncomplete(p.extra)).length;
  const pendingCount = normalized.filter((p) => isPending(p.extra)).length;
  const completeCount = normalized.filter((p) => isCompleted(p.extra)).length;

  // 보류 처리
  async function handlePending(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 보류 처리하시겠습니까?`)) return;
    
    const all = await partnerRepo.getAll();
    const next = all.map((p) => {
      if (p.id === id) {
        return { ...p, extra: { ...p.extra, status: "pending" as const }, updatedAt: Date.now() };
      }
      return p;
    });
    await partnerRepo.upsertMany(next);
    setPartners(next);
    alert("보류 처리되었습니다.");
  }

  // 삭제
  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;
    await partnerRepo.remove(id);
    setPartners(await partnerRepo.getAll());
    alert("삭제되었습니다.");
  }

  if (editingId) {
    return (
      <RegisterPartnerV2
        mode="edit"
        partnerId={editingId}
        onClose={() => {
          setEditingId(null);
          partnerRepo.getAll().then((items) => setPartners(items));
        }}
      />
    );
  }

  return (
    <div className="card">
      <h1 className="h1">거래처 관리</h1>

      {/* 엑셀 업로드 안내 */}
      <div style={{
        padding: 16,
        background: "rgba(25, 118, 210, 0.08)",
        borderRadius: 4,
        marginBottom: 20,
        border: "1px solid rgba(25, 118, 210, 0.3)",
      }}>
        <p className="p" style={{ margin: 0, fontSize: 14 }}>
          💡 <strong>거래처 엑셀 일괄 등록</strong>은 <Link to="/excel" style={{ color: "#1976d2", textDecoration: "underline" }}>홈 &gt; 엑셀등록 &gt; 거래처 업로드</Link>에서 하실 수 있습니다.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className={`btn ${filter === "all" ? "primary" : ""}`} onClick={() => setFilter("all")}>
          전체 ({partners.length})
        </button>
        <button className={`btn ${filter === "incomplete" ? "primary" : ""}`} onClick={() => setFilter("incomplete")}>
          미완료 ({incompleteCount})
        </button>
        <button className={`btn ${filter === "pending" ? "primary" : ""}`} onClick={() => setFilter("pending")}>
          보류 ({pendingCount})
        </button>
        <button className={`btn ${filter === "complete" ? "primary" : ""}`} onClick={() => setFilter("complete")}>
          완료 ({completeCount})
        </button>
      </div>

      <div className="divider" />

      {filtered.length === 0 ? (
        <p className="p">항목이 없습니다.</p>
      ) : (
        filtered.map((p) => {
          const pending = isPending(p.extra);
          const complete = isCompleted(p.extra);
          const statusLabel = complete ? "완료" : pending ? "보류" : "미완료";
          const statusBg = complete ? "#1976d2" : pending ? "#ff9800" : "#d32f2f";

          return (
            <div
              key={p.id}
              className="card"
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, display: "flex", gap: 8, alignItems: "center" }}>
                    {p.base.partnerName}
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: statusBg,
                        color: "white",
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="p" style={{ marginTop: 6, fontSize: 12 }}>
                    {p.base.addr1} {p.base.addr2}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn"
                    onClick={() => setEditingId(p.id)}
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    수정
                  </button>
                  {!pending && (
                    <button
                      className="btn"
                      onClick={() => handlePending(p.id, p.base.partnerName)}
                      style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,152,0,0.2)" }}
                    >
                      보류
                    </button>
                  )}
                  <button
                    className="btn"
                    onClick={() => handleDelete(p.id, p.base.partnerName)}
                    style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,100,100,0.2)" }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
