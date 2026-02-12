import { deleteFromIndex, type TagIndexRow } from "@kernel/utils";

type PersonalTagManagerProps = {
  manageOpen: boolean;
  personalQuery: string;
  onChangePersonalQuery: (next: string) => void;
  personalRows: TagIndexRow[];
  personalKey: string;
  refreshIndexView: () => void;
};

export default function PersonalTagManager({
  manageOpen,
  personalQuery,
  onChangePersonalQuery,
  personalRows,
  personalKey,
  refreshIndexView,
}: PersonalTagManagerProps) {
  if (!manageOpen) return null;

  const q = personalQuery.trim().toLowerCase();
  const filtered = personalRows.filter((row) => !q || row.tag.toLowerCase().includes(q));
  const sorted = filtered.sort((a, b) => (b.total || 0) - (a.total || 0)).slice(0, 200);

  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
        padding: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>개인 태그(삭제 가능)</div>
        <input
          value={personalQuery}
          onChange={(e) => onChangePersonalQuery(e.target.value)}
          placeholder="검색..."
          style={{
            width: 220,
            maxWidth: "55vw",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.18)",
            color: "white",
            outline: "none",
            fontSize: 13,
          }}
        />
      </div>

      <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
        {`표시 ${Math.min(filtered.length, 200)} / 전체 ${personalRows.length}`}
      </div>

      {personalRows.length === 0 ? (
        <div className="p" style={{ marginTop: 8, opacity: 0.75 }}>
          아직 없음
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {sorted.map((row) => (
            <div
              key={row.tag}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: 10,
                background: "rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  #{row.tag}
                </div>
                <div style={{ opacity: 0.65, fontSize: 12 }}>({row.total})</div>
              </div>
              <button
                type="button"
                className="btn danger"
                style={{ padding: "6px 10px" }}
                onClick={() => {
                  deleteFromIndex(personalKey, row.tag);
                  refreshIndexView();
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

