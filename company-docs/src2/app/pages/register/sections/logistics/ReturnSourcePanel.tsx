import type { ReturnSourceCandidate } from "@app2/pages/register/hooks/logistics/types";

type ReturnSourcePanelProps = {
  isReturnMode: boolean;
  returnSourceDateFilter: string;
  selectedReturnSource: ReturnSourceCandidate | null;
  activeReturnSourceCandidates: ReturnSourceCandidate[];
  onToggleReturnMode: (nextIsReturn: boolean) => void;
  onChangeReturnSourceDateFilter: (date: string) => void;
  onSelectReturnSource: (candidate: ReturnSourceCandidate) => void;
};

function formatSourceCandidateLabel(candidate: ReturnSourceCandidate): string {
  const vehicle = candidate.vehicleNo ? ` · ${candidate.vehicleNo}` : "";
  const item = candidate.item ? ` · ${candidate.item}` : "";
  const detail = candidate.detailItem ? ` · ${candidate.detailItem}` : "";
  return `${candidate.sourceRecordDate} · ${candidate.sourceDirection} · ${candidate.kind}${item}${detail}${vehicle}`;
}

export default function ReturnSourcePanel({
  isReturnMode,
  returnSourceDateFilter,
  selectedReturnSource,
  activeReturnSourceCandidates,
  onToggleReturnMode,
  onChangeReturnSourceDateFilter,
  onSelectReturnSource,
}: ReturnSourcePanelProps) {
  return (
    <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
          <input
            type="checkbox"
            checked={isReturnMode}
            onChange={(event) => onToggleReturnMode(event.target.checked)}
          />
          반품 등록
        </label>
        {isReturnMode ? (
          <input
            type="date"
            className="input"
            style={{ width: 180 }}
            value={returnSourceDateFilter}
            onChange={(event) => onChangeReturnSourceDateFilter(event.target.value)}
          />
        ) : null}
      </div>

      {isReturnMode ? (
        <>
          <p className="p" style={{ marginTop: 8, marginBottom: 6, fontSize: 12 }}>
            날짜 미선택 시 거래처 최근 5건, 날짜 선택 시 해당 날짜 원본 항목을 보여 줍니다.
          </p>
          {selectedReturnSource ? (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(255,170,90,0.12)",
                border: "1px solid rgba(255,170,90,0.45)",
              }}
            >
              선택 원본: {formatSourceCandidateLabel(selectedReturnSource)}
              {` · 원본 ${selectedReturnSource.sourceKg.toLocaleString()}kg`}
            </div>
          ) : null}

          {activeReturnSourceCandidates.length > 0 ? (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {activeReturnSourceCandidates.map((candidate) => {
                const selected =
                  selectedReturnSource?.sourceRecordId === candidate.sourceRecordId &&
                  selectedReturnSource?.sourceLineId === candidate.sourceLineId;
                return (
                  <button
                    key={`${candidate.sourceRecordId}:${candidate.sourceLineId}`}
                    type="button"
                    className={`selBtn ${selected ? "active" : ""}`}
                    style={{ textAlign: "left", justifyContent: "space-between", width: "100%" }}
                    onClick={() => onSelectReturnSource(candidate)}
                  >
                    <span>{formatSourceCandidateLabel(candidate)}</span>
                    <span style={{ marginLeft: 8, fontSize: 12 }}>
                      잔여 {candidate.remainingKg.toLocaleString()}kg
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="p" style={{ marginTop: 8, marginBottom: 0 }}>
              선택 가능한 반품 원본 항목이 없습니다.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
