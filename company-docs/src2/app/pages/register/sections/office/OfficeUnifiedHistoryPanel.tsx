import { compactCardStyle, compactDangerButtonStyle, compactGhostButtonStyle } from "../common/dailyRecordView";
import type { OfficeHistoryLineItem, OfficeLinkTypeOption } from "../../hooks/office/types";

type OfficeUnifiedHistoryPanelProps = {
  items: OfficeHistoryLineItem[];
  linkTypeOptions: readonly OfficeLinkTypeOption[];
  onEditItem: (item: OfficeHistoryLineItem) => void;
  onRemoveItem: (item: OfficeHistoryLineItem) => Promise<{ ok: boolean; message: string }>;
};

export default function OfficeUnifiedHistoryPanel({
  items,
  linkTypeOptions,
  onEditItem,
  onRemoveItem,
}: OfficeUnifiedHistoryPanelProps) {
  const typeLabelMap = new Map(linkTypeOptions.map((item) => [item.id, item.label]));

  return (
    <>
      <h2 className="h1" style={{ fontSize: 16 }}>
        통합 사무 일지
      </h2>

      <div style={compactCardStyle}>
        <div style={{ fontWeight: 900, fontSize: 14, lineHeight: 1.35 }}>[일일][사무] 통합 일지</div>

        {items.length === 0 ? (
          <p className="p" style={{ marginTop: 8 }}>
            아직 저장한 세부 항목이 없습니다.
          </p>
        ) : null}

        {items.map((item) => (
          <div
            key={`${item.recordId}:${item.line.id}`}
            style={{
              marginTop: 6,
              marginLeft: 6,
              padding: "6px 8px",
              borderLeft: "2px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 6,
            }}
          >
            <div className="p" style={{ marginBottom: 3, fontSize: 11 }}>
              {item.recordDate} · {item.site || "-"} · {item.writerName || "-"} {item.writerRole || ""}
            </div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{item.line.subtitle}</div>
            <div className="p" style={{ marginTop: 2, fontSize: 11 }}>
              연계: {(item.line.linkedReferences || [])
                .map((ref) => `${typeLabelMap.get(ref.type) || ref.type}:${ref.label}`)
                .join(", ") || "-"}
            </div>
            <div className="p" style={{ marginTop: 2, whiteSpace: "pre-wrap", fontSize: 11 }}>
              {item.line.details}
            </div>
            <div className="row" style={{ marginTop: 4, gap: 6 }}>
              <button type="button" style={compactGhostButtonStyle} onClick={() => onEditItem(item)}>
                수정
              </button>
              <button
                type="button"
                style={compactDangerButtonStyle}
                onClick={async () => {
                  if (!confirm(`세부 항목 "${item.line.subtitle}"를 삭제하시겠습니까?`)) return;
                  const result = await onRemoveItem(item);
                  alert(result.message);
                }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
