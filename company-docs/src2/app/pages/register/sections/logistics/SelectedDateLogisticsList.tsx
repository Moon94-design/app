import { LOGISTICS_AMOUNT_TONE_COLOR, ReturnStatusBadge } from "@kernel/components/status";
import {
  buildReturnedKgBySourceFromLines,
  formatReturnWeightText,
  getLineReturnStatus,
  getLogisticsLineAmountView,
  type LogisticsLine,
  type ReturnStatusInfo,
} from "@kernel/schema/daily";

type SelectedDateLogisticsListProps = {
  recordDate: string;
  recordId?: string;
  recordTitle?: string;
  lines: LogisticsLine[];
  onEditLine?: (lineIndex: number) => void;
  onDeleteLine?: (lineIndex: number) => void;
};

function getNetKg(line: LogisticsLine, returnStatus: ReturnStatusInfo | null): number {
  if (returnStatus?.role === "return-target") {
    return Math.max(0, returnStatus.sourceKg - returnStatus.returnedKg);
  }
  return Number(line.kg || 0);
}

export default function SelectedDateLogisticsList({
  recordDate,
  recordId,
  recordTitle,
  lines,
  onEditLine,
  onDeleteLine,
}: SelectedDateLogisticsListProps) {
  const statusRecordId = (recordId || recordDate).trim();
  const returnedKgBySource = buildReturnedKgBySourceFromLines(statusRecordId, lines);

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
        <p className="p">선택한 날짜에 등록한 유통 기록이 없습니다.</p>
      ) : (
        lines.map((line, index) => {
          const returnStatus = getLineReturnStatus({
            recordId: statusRecordId,
            line,
            returnedKgBySource,
          });
          const netKg = getNetKg(line, returnStatus);
          const amountView = getLogisticsLineAmountView({
            line,
            netKg,
            returnStatus,
          });
          const weightText = returnStatus
            ? formatReturnWeightText(returnStatus)
            : Number(line.kg || 0).toLocaleString();
          const unitPriceText = Number(line.unitPricePerKg || 0).toLocaleString();

          return (
            <div
              key={`${recordId || recordDate}-${index}`}
              className="card"
              style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 900, wordBreak: "break-word" }}>
                    {line.vehicle?.label?.trim()
                      ? `${line.partner.label || "-"} - ${line.vehicle.label.trim()}`
                      : line.partner.label || "-"}
                  </div>
                  {returnStatus ? (
                    <div style={{ marginTop: 4 }}>
                      <ReturnStatusBadge label={returnStatus.label} role={returnStatus.role} />
                    </div>
                  ) : null}
                  <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                    {line.isReturn ? "반품" : line.direction} · {line.kind}
                    {line.item ? ` · ${line.item}` : ""}
                    {line.detailItem ? ` · ${line.detailItem}` : ""}
                    {` · 총중량 ${Number(line.grossKg || 0).toLocaleString()}kg`}
                    {` · 공차중량 ${Number(line.tareKg || 0).toLocaleString()}kg`}
                    {` · 중량 ${weightText}kg`}
                    {` · 단가 ${unitPriceText}원`}
                    <span style={{ color: LOGISTICS_AMOUNT_TONE_COLOR[amountView.tone], fontWeight: 700 }}>
                      {` · 금액 ${amountView.amount.toLocaleString()}원`}
                    </span>
                  </div>
                </div>
                {onEditLine || onDeleteLine ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginLeft: "auto",
                      flex: "0 0 auto",
                    }}
                  >
                    {onEditLine ? (
                      <button
                        type="button"
                        className="btn"
                        style={{ fontSize: 12, padding: "4px 10px", minWidth: 72 }}
                        onClick={() => onEditLine(index)}
                      >
                        수정
                      </button>
                    ) : null}
                    {onDeleteLine ? (
                      <button
                        type="button"
                        className="btn danger"
                        style={{ fontSize: 12, padding: "4px 10px", minWidth: 72 }}
                        onClick={() => onDeleteLine(index)}
                      >
                        삭제
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
