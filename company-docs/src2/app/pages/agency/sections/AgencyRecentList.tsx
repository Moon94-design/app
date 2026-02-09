import type { Agency } from "@kernel/schema/agency";

type Props = {
  agencies: Agency[];
  onRemove: (id: string) => void;
};

export default function AgencyRecentList({ agencies, onRemove }: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        저장된 기관
      </div>
      {agencies.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        agencies.map((agency) => (
          <div
            key={agency.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>
                  {agency.baseName}
                  {agency.detailTag ? <span style={{ marginLeft: 8, opacity: 0.7 }}>· {agency.detailTag}</span> : null}
                </div>
                <div className="p" style={{ marginTop: 6 }}>
                  {agency.status} · {agency.region}
                </div>
              </div>
              <button type="button" className="btn danger" onClick={() => onRemove(agency.id)}>
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
