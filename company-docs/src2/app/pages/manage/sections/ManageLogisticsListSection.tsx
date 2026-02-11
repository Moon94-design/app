import type { LogisticsRecord } from "@kernel/schema/daily";

type ManageLogisticsListSectionProps = {
  records: LogisticsRecord[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (id: string) => void;
};

export default function ManageLogisticsListSection({
  records,
  expandedIds,
  onToggleExpand,
  onEdit,
}: ManageLogisticsListSectionProps) {
  if (records.length === 0) {
    return <p className="p">계량현황/유통기록 데이터가 없습니다.</p>;
  }

  return (
    <>
      {records.map((record) => {
        const expanded = expandedIds.has(record.id);
        const totalKg = record.lines.reduce((sum, line) => sum + line.kg, 0);
        const totalAmount = record.lines.reduce(
          (sum, line) => sum + line.kg * line.unitPricePerKg,
          0
        );

        return (
          <div
            key={record.id}
            className="card"
            style={{
              marginTop: 10,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>
                  {record.recordDate} ({record.lines.length}건)
                </div>
                <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
                  총 중량: {totalKg.toLocaleString()}kg | 총 금액:{" "}
                  {totalAmount.toLocaleString()}원
                </div>
                {record.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {record.tags.map((tag, idx) => (
                      <span
                        key={`${record.id}-tag-${idx}`}
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "rgba(70,130,255,0.2)",
                          border: "1px solid rgba(70,130,255,0.4)",
                          color: "rgba(70,130,255,1)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn"
                  onClick={() => onToggleExpand(record.id)}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {expanded ? "접기" : "펼치기"}
                </button>
                <button
                  className="btn"
                  onClick={() => onEdit(record.id)}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  수정
                </button>
              </div>
            </div>

            {expanded && (
              <div style={{ marginTop: 16, overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>방향</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>분류</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>품목</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>거래처</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>차량</th>
                      <th style={{ padding: "8px 4px", textAlign: "right" }}>중량(kg)</th>
                      <th style={{ padding: "8px 4px", textAlign: "right" }}>단가</th>
                      <th style={{ padding: "8px 4px", textAlign: "right" }}>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.lines.map((line, idx) => (
                      <tr
                        key={`${record.id}-${idx}`}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td style={{ padding: "8px 4px" }}>{line.direction}</td>
                        <td style={{ padding: "8px 4px" }}>{line.kind}</td>
                        <td style={{ padding: "8px 4px" }}>{line.item}</td>
                        <td style={{ padding: "8px 4px" }}>{line.partner.label}</td>
                        <td style={{ padding: "8px 4px" }}>{line.vehicle?.label || "-"}</td>
                        <td style={{ padding: "8px 4px", textAlign: "right" }}>
                          {line.kg.toLocaleString()}
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "right" }}>
                          {line.unitPricePerKg.toLocaleString()}
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "right" }}>
                          {(line.kg * line.unitPricePerKg).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
