import type { LogisticsRecord } from "@kernel/schema/daily";

type ManageLogisticsListSectionProps = {
  records: LogisticsRecord[];
  totalCount: number;
  siteFilter: "all" | "daegu" | "seongju";
  missingFilter: "all" | "missing" | "complete";
  onSiteFilterChange: (value: "all" | "daegu" | "seongju") => void;
  onMissingFilterChange: (value: "all" | "missing" | "complete") => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (id: string, scope: "all" | "missing") => void;
};

export default function ManageLogisticsListSection({
  records,
  totalCount,
  siteFilter,
  missingFilter,
  onSiteFilterChange,
  onMissingFilterChange,
  expandedIds,
  onToggleExpand,
  onEdit,
}: ManageLogisticsListSectionProps) {
  const visibleCount = records.length;

  const totalMissing = records.reduce(
    (sum, record) => sum + record.lines.filter((line) => line.baseMissing || line.extraMissing).length,
    0
  );

  if (records.length === 0) {
    return (
      <>
        <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, opacity: 0.7 }}>지점</span>
            <select
              className="input"
              style={{ width: 120 }}
              value={siteFilter}
              onChange={(event) => onSiteFilterChange(event.target.value as "all" | "daegu" | "seongju")}
            >
              <option value="all">전체</option>
              <option value="daegu">대구</option>
              <option value="seongju">성주</option>
            </select>
            <span style={{ fontSize: 13, opacity: 0.7 }}>미입력 구분</span>
            <select
              className="input"
              style={{ width: 170 }}
              value={missingFilter}
              onChange={(event) => onMissingFilterChange(event.target.value as "all" | "missing" | "complete")}
            >
              <option value="all">전체</option>
              <option value="missing">미입력</option>
              <option value="complete">완료</option>
            </select>
          </div>
        </div>
        <p className="p">
          조건에 맞는 유통기록이 없습니다. (전체 {totalCount}건)
        </p>
      </>
    );
  }

  return (
    <>
      <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>지점</span>
          <select
            className="input"
            style={{ width: 120 }}
            value={siteFilter}
            onChange={(event) => onSiteFilterChange(event.target.value as "all" | "daegu" | "seongju")}
          >
            <option value="all">전체</option>
            <option value="daegu">대구</option>
            <option value="seongju">성주</option>
          </select>
          <span style={{ fontSize: 13, opacity: 0.7 }}>미입력 구분</span>
          <select
            className="input"
            style={{ width: 170 }}
            value={missingFilter}
            onChange={(event) => onMissingFilterChange(event.target.value as "all" | "missing" | "complete")}
          >
            <option value="all">전체</option>
            <option value="missing">미입력</option>
            <option value="complete">완료</option>
          </select>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            표시 {visibleCount} / 전체 {totalCount}
          </span>
          <span style={{ fontSize: 12, opacity: 0.7, color: "rgba(255,170,90,1)" }}>
            미입력 {totalMissing}건
          </span>
        </div>
        <div className="p" style={{ marginTop: 10, marginBottom: 0, fontSize: 12, opacity: 0.75 }}>
          미입력은 필수/참조 입력이 비어 있는 라인. 완료는 미입력 항목이 없는 라인.
        </div>
      </div>

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
                  onClick={() =>
                    onEdit(record.id, missingFilter === "missing" ? "missing" : "all")
                  }
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {missingFilter === "missing" ? "미입력 수정" : "수정"}
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
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>지점</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>상태</th>
                      <th style={{ padding: "8px 4px", textAlign: "left" }}>미입력 항목</th>
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
                        <td style={{ padding: "8px 4px" }}>
                          {line.site === "daegu" ? "대구" : line.site === "seongju" ? "성주" : "-"}
                        </td>
                        <td style={{ padding: "8px 4px", fontSize: 11, opacity: 0.85 }}>
                          {line.baseMissing || line.extraMissing ? "미입력" : "완료"}
                        </td>
                        <td style={{ padding: "8px 4px", fontSize: 11, opacity: 0.85 }}>
                          {[...(line.baseMissingFields || []), ...(line.extraMissingFields || [])].join(", ") || "-"}
                        </td>
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
