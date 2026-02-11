import { Link } from "react-router-dom";
import type { ConsumableDraft } from "@kernel/schema/consumable";
import type { Equipment } from "@kernel/schema/equipment";
import type { Vendor } from "@kernel/schema/vendor";

type Props = {
  draft: ConsumableDraft;
  equipments: Equipment[];
  vendors: Vendor[];
  onChange: (patch: Partial<ConsumableDraft>) => void;
};

export default function ConsumableFormSection({ draft, equipments, vendors, onChange }: Props) {
  return (
    <div className="form-grid">
      <div className="form-field">
        <div className="form-label">
          설비
        </div>
        <select className="input" value={draft.equipmentId} onChange={(e) => onChange({ equipmentId: e.target.value })}>
          <option value="">선택</option>
          {equipments.map((equipment) => (
            <option key={equipment.id} value={equipment.id}>
              {equipment.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <div className="form-label">
          소모품명
        </div>
        <input className="input" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          규격/모델
        </div>
        <input className="input" value={draft.spec} onChange={(e) => onChange({ spec: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          교체 주기/조건
        </div>
        <input className="input" value={draft.rule} onChange={(e) => onChange({ rule: e.target.value })} />
      </div>

      <div className="form-field">
        <div className="form-label">
          최소 보유 수량(참고)
        </div>
        <input
          className="input"
          inputMode="numeric"
          value={String(draft.minStock)}
          onChange={(e) => onChange({ minStock: Number(e.target.value || 0) })}
        />
      </div>

      <div className="form-field">
        <div className="form-label">
          공급 업체(선택)
        </div>
        <select className="input" value={draft.vendorId} onChange={(e) => onChange({ vendorId: e.target.value })}>
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
  );
}
