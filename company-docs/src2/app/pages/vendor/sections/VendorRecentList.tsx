import type { Vendor } from "@kernel/schema/vendor";

type Props = {
  vendors: Vendor[];
  onRemove: (id: string) => void;
};

export default function VendorRecentList({ vendors, onRemove }: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        저장된 업체
      </div>
      {vendors.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{vendor.name}</div>
                <div className="p" style={{ marginTop: 6 }}>
                  {vendor.region} · {vendor.status}
                </div>
              </div>
              <button type="button" className="btn danger" onClick={() => onRemove(vendor.id)}>
                삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
