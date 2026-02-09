import type { VehicleDraft } from "@kernel/schema/vehicle";

type Props = {
  draft: VehicleDraft;
  onChange: (patch: Partial<VehicleDraft>) => void;
  onChangePhone: (raw: string) => void;
  onSubmit: () => void;
};

export default function VehicleFormSection({
  draft,
  onChange,
  onChangePhone,
  onSubmit,
}: Props) {
  return (
    <>
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>
            차량번호 *
          </div>
          <input
            className="input"
            value={draft.vehicleNo}
            onChange={(e) => onChange({ vehicleNo: e.target.value })}
            placeholder="예: 12가 3456"
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            톤수
          </div>
          <select
            className="input"
            value={draft.tonClass}
            onChange={(e) => onChange({ tonClass: e.target.value as VehicleDraft["tonClass"] })}
          >
            <option value="">선택 (옵션)</option>
            <option value="1t">1t</option>
            <option value="5t">5t</option>
            <option value="25t">25t</option>
          </select>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            형태
          </div>
          <select
            className="input"
            value={draft.bodyType}
            onChange={(e) => onChange({ bodyType: e.target.value as VehicleDraft["bodyType"] })}
          >
            <option value="">선택 (옵션)</option>
            <option value="카고">카고</option>
            <option value="윙">윙</option>
            <option value="방통">방통</option>
          </select>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            운송사
          </div>
          <input
            className="input"
            value={draft.carrierName}
            onChange={(e) => onChange({ carrierName: e.target.value })}
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            기사명
          </div>
          <input
            className="input"
            value={draft.driverName}
            onChange={(e) => onChange({ driverName: e.target.value })}
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            기사 연락처
          </div>
          <input
            className="input"
            inputMode="numeric"
            value={draft.driverPhone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="숫자만 입력 가능"
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            태그
          </div>
          <input
            className="input"
            value={draft.tagsText}
            onChange={(e) => onChange({ tagsText: e.target.value })}
            placeholder="예: #냉동 #대형"
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>
            참고사항
          </div>
          <textarea
            className="input"
            rows={3}
            value={draft.memo}
            onChange={(e) => onChange({ memo: e.target.value })}
          />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit}>
          저장(로컬)
        </button>
      </div>
    </>
  );
}
