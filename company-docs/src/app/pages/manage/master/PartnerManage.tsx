/**
 * PartnerManage.tsx
 * 거래처 관리 페이지 (리스트 + 필터 + 수정)
 * 
 * 엑셀 업로드는 "홈 > 엑셀등록 > 거래처 업로드"에서 하세요.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { repo } from "../../../../data/repo";
import type { PartnerV2 } from "../../register/partner/partnerV2Types";
import { isCompleted, isPending, isIncomplete } from "../../register/partner/partnerV2Types";
import RegisterPartnerV2 from "../../register/partner/RegisterPartnerV2";

export default function PartnerManage() {
  const [partners, setPartners] = useState<PartnerV2[]>(() => repo.partners_v2<PartnerV2>().getAll());
  const [filter, setFilter] = useState<"all" | "incomplete" | "pending" | "complete">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "incomplete") return partners.filter((p) => isIncomplete(p.extra));
    if (filter === "pending") return partners.filter((p) => isPending(p.extra));
    if (filter === "complete") return partners.filter((p) => isCompleted(p.extra));
    return partners;
  }, [partners, filter]);

  const incompleteCount = partners.filter((p) => isIncomplete(p.extra)).length;
  const pendingCount = partners.filter((p) => isPending(p.extra)).length;
  const completeCount = partners.filter((p) => isCompleted(p.extra)).length;

  // 보류 처리
  function handlePending(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 보류 처리하시겠습니까?`)) return;
    
    const all = repo.partners_v2<PartnerV2>().getAll();
    const next = all.map((p) => {
      if (p.id === id) {
        return { ...p, extra: { ...p.extra, status: "pending" as const }, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    repo.partners_v2<PartnerV2>().setAll(next);
    setPartners(next);
    alert("보류 처리되었습니다.");
  }

  // 삭제
  function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;

    repo.partners_v2<PartnerV2>().removeById(id);
    setPartners(repo.partners_v2<PartnerV2>().getAll());
    alert("삭제되었습니다.");
  }

  if (editingId) {
    return (
      <RegisterPartnerV2
        mode="edit"
        partnerId={editingId}
        onClose={() => {
          setEditingId(null);
          setPartners(repo.partners_v2<PartnerV2>().getAll());
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
          미입력 ({incompleteCount})
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
          const statusLabel = complete ? "완료" : pending ? "보류" : "미입력";
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
