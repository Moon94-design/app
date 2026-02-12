import type { LogisticsLine } from "@kernel/schema/daily";

type SelectedDateLogisticsListProps = {
  recordDate: string;
  recordTitle?: string;
  lines: LogisticsLine[];
};

export default function SelectedDateLogisticsList({ recordDate, recordTitle, lines }: SelectedDateLogisticsListProps) {
  return (
    <>
      <div className="divider" />
      <h2 className="h1" style={{ fontSize: 16 }}>
        {recordDate} 유통 기록
      </h2>

      {recordTitle ? (
        <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontWeight: 900 }}>{recordTitle}</div>
        </div>
      ) : null}

      {lines.length === 0 ? (
        <p className="p">선택한 날짜에 저장된 유통 기록이 없습니다.</p>
      ) : (
        lines.map((line, index) => (
          <div
            key={`${recordDate}-${index}`}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900 }}>{line.partner.label || "-"}</div>
              <div className="p" style={{ marginTop: 0 }}>
                {line.vehicle?.label || "-"}
              </div>
            </div>
            <div className="p" style={{ marginTop: 8 }}>
              {line.direction} · {line.kind}
              {line.item ? ` · ${line.item}` : ""}
              {line.detailItem ? ` · ${line.detailItem}` : ""}
              {` · 총중량 ${Number(line.grossKg || 0).toLocaleString()}kg`}
              {` · 공차중량 ${Number(line.tareKg || 0).toLocaleString()}kg`}
              {` · 실중량 ${Number(line.kg || 0).toLocaleString()}kg`}
            </div>
          </div>
        ))
      )}
    </>
  );
}
