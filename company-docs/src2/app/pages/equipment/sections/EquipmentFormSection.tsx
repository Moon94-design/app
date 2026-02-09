import type { EquipmentDraft, EquipmentImportance, EquipmentInspectCycle, EquipmentType } from "@kernel/schema/equipment";

type Props = {
  draft: EquipmentDraft;
  onChange: (patch: Partial<EquipmentDraft>) => void;
};

const EQUIP_TYPES: EquipmentType[] = ["생산설비", "유통설비", "공용설비", "기타"];
const IMPORTANCE_OPTIONS: EquipmentImportance[] = ["상", "중", "하"];
const INSPECT_CYCLES: EquipmentInspectCycle[] = ["주간", "월간", "분기", "반기", "연간", "비정기"];

export default function EquipmentFormSection({ draft, onChange }: Props) {
  return (
    <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
      <div>
        <div className="p" style={{ marginTop: 0 }}>
          설비명
        </div>
        <input className="input" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          설치 위치/구역
        </div>
        <input className="input" value={draft.location} onChange={(e) => onChange({ location: e.target.value })} />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          설비 구분
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          {EQUIP_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`selBtn ${draft.equipType === type ? "active" : ""}`}
              onClick={() => onChange({ equipType: type })}
            >
              {type}
            </button>
          ))}
        </div>
        <input
          className="input"
          value={draft.equipTypeNote}
          onChange={(e) => onChange({ equipTypeNote: e.target.value })}
          placeholder="구분 설명(한 줄)"
        />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          중요도
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          {IMPORTANCE_OPTIONS.map((importance) => (
            <button
              key={importance}
              type="button"
              className={`selBtn ${draft.importance === importance ? "active" : ""}`}
              onClick={() => onChange({ importance })}
            >
              {importance}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          제조사/모델
        </div>
        <input
          className="input"
          value={draft.makerModel}
          onChange={(e) => onChange({ makerModel: e.target.value })}
        />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          설치일
        </div>
        <input
          className="input"
          inputMode="numeric"
          value={draft.installedAt}
          onChange={(e) => onChange({ installedAt: e.target.value.replace(/[^0-9-]/g, "").slice(0, 10) })}
          placeholder="YYYY-MM-DD"
        />
      </div>

      <div>
        <div className="p" style={{ marginTop: 0 }}>
          점검 주기
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          {INSPECT_CYCLES.map((inspectCycle) => (
            <button
              key={inspectCycle}
              type="button"
              className={`selBtn ${draft.inspectCycle === inspectCycle ? "active" : ""}`}
              onClick={() => onChange({ inspectCycle })}
            >
              {inspectCycle}
            </button>
          ))}
        </div>
        <input
          className="input"
          value={draft.inspectNote}
          onChange={(e) => onChange({ inspectNote: e.target.value })}
          placeholder="주기 설명(한 줄)"
        />
      </div>
    </div>
  );
}
