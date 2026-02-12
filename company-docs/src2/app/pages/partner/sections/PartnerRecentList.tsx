import { displayPartnerName, type PartnerV2 } from "@kernel/schema/partner";

type PartnerRecentListProps = {
  docs: PartnerV2[];
  onLoad: (doc: PartnerV2) => void;
};

export default function PartnerRecentList({ docs, onLoad }: PartnerRecentListProps) {
  if (docs.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>최근 등록</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {docs.slice(0, 5).map((doc) => (
          <div
            key={doc.id}
            className="card"
            style={{
              background: "rgba(255,255,255,0.02)",
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 900 }}>
                {displayPartnerName(doc.base.partnerName, doc.base.partnerDetailTag)}
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                대표: {doc.base.ceoName}
              </div>
            </div>
            <button type="button" className="btn" onClick={() => onLoad(doc)}>
              불러오기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
