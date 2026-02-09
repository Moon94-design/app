import { Link } from "react-router-dom";
import type { Consumable, Equipment, EquipmentDraft } from "@kernel/schema/equipment";
import type { Vendor } from "@kernel/schema/vendor";

type Props = {
  draft: EquipmentDraft;
  activeEquipment: Equipment | null;
  activeConsumables: Consumable[];
  vendors: Vendor[];
  onChange: (patch: Partial<EquipmentDraft>) => void;
  onSubmit: () => void;
};

export default function EquipmentConsumableSection({
  draft,
  activeEquipment,
  activeConsumables,
  vendors,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        소모품 추가(설비에서 바로)
      </div>

      <div className="p" style={{ marginTop: 10 }}>
        현재 설비: {activeEquipment ? activeEquipment.name : "(선택 필요)"}
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>
            소모품명
          </div>
          <input className="input" value={draft.cName} onChange={(e) => onChange({ cName: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            규격/모델
          </div>
          <input className="input" value={draft.cSpec} onChange={(e) => onChange({ cSpec: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            교체 주기/조건
          </div>
          <input className="input" value={draft.cRule} onChange={(e) => onChange({ cRule: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            최소 보유 수량(참고)
          </div>
          <input
            className="input"
            inputMode="numeric"
            value={String(draft.cMin)}
            onChange={(e) => onChange({ cMin: Number(e.target.value || 0) })}
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            공급 업체(선택)
          </div>
          <select className="input" value={draft.cVendorId} onChange={(e) => onChange({ cVendorId: e.target.value })}>
            <option value="">선택</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
          <div className="row">
            <Link className="btn" to="/register/master/vendor">
              정비/서비스 업체 추가
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit}>
          소모품 저장
        </button>
      </div>

      <div className="divider" />

      <div className="h1" style={{ fontSize: 15 }}>
        이 설비의 소모품
      </div>
      {activeConsumables.length === 0 ? (
        <p className="p">아직 없음</p>
      ) : (
        activeConsumables.map((consumable) => (
          <div
            key={consumable.id}
            className="card"
            style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}
          >
            <div style={{ fontWeight: 900 }}>{consumable.name}</div>
            <div className="p" style={{ marginTop: 6 }}>
              {consumable.spec ? `규격: ${consumable.spec} · ` : ""}
              {consumable.replaceRule ? `교체: ${consumable.replaceRule} · ` : ""}
              최소보유: {consumable.minStock}
            </div>
            {consumable.vendorName ? (
              <div className="p" style={{ marginTop: 6 }}>
                업체: {consumable.vendorName}
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
