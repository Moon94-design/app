import { displayPartnerName, type PartnerV2 } from "@kernel/schema/partner";
import { isCompleted, isPending } from "@kernel/schema/partner";

type PartnerManageListProps = {
  items: PartnerV2[];
  bulkMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (item: PartnerV2) => void;
  onPending: (item: PartnerV2) => void;
  onUnpending: (item: PartnerV2) => void;
  onDelete: (item: PartnerV2) => void;
};

export default function PartnerManageList({
  items,
  bulkMode,
  selectedIds,
  onToggleSelect,
  onEdit,
  onPending,
  onUnpending,
  onDelete,
}: PartnerManageListProps) {
  if (items.length === 0) {
    return <p className="p">항목이 없습니다.</p>;
  }

  return (
    <>
      {items.map((item) => {
        const pending = isPending(item.extra);
        const complete = isCompleted(item.extra);
        const statusLabel = complete ? "완료" : pending ? "보류" : "미완료";
        const statusBg = complete ? "#1976d2" : pending ? "#ff9800" : "#d32f2f";

        return (
          <div
            key={item.id}
            className="card"
            style={{
              marginTop: 10,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    style={{ marginTop: 4 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 900, display: "flex", gap: 8, alignItems: "center" }}>
                    {displayPartnerName(item.base.partnerName, item.base.partnerDetailTag)}
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
                    {item.base.addr1} {item.base.addr2}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn"
                  onClick={() => onEdit(item)}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  수정
                </button>
                {pending ? (
                  <button
                    className="btn"
                    onClick={() => onUnpending(item)}
                    style={{ fontSize: 12, padding: "6px 12px", background: "rgba(76,175,80,0.2)" }}
                  >
                    보류 해제
                  </button>
                ) : (
                  <button
                    className="btn"
                    onClick={() => onPending(item)}
                    style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,152,0,0.2)" }}
                  >
                    보류
                  </button>
                )}
                <button
                  className="btn"
                  onClick={() => onDelete(item)}
                  style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,100,100,0.2)" }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
