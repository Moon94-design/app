import { useState } from "react";
import type {
  Equipment,
  EquipmentImportance,
  EquipmentInspectCycle,
  EquipmentType,
} from "@kernel/schema/equipment";

type ManageEquipmentEditFormSectionProps = {
  equipment: Equipment;
  onSave: (next: Equipment) => Promise<void>;
  onCancel: () => void;
};

const EQUIP_TYPES: EquipmentType[] = ["생산설비", "유통설비", "공용설비", "기타"];
const IMPORTANCE_OPTIONS: EquipmentImportance[] = ["상", "중", "하"];
const INSPECT_CYCLES: EquipmentInspectCycle[] = ["주간", "월간", "분기", "반기", "연간", "비정기"];

export default function ManageEquipmentEditFormSection({
  equipment,
  onSave,
  onCancel,
}: ManageEquipmentEditFormSectionProps) {
  const [form, setForm] = useState<Equipment>({ ...equipment });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("설비명을 입력하세요.");
      return;
    }
    if (!form.location.trim()) {
      alert("설치 위치/구역을 입력하세요.");
      return;
    }
    await onSave({
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
      equipTypeNote: form.equipTypeNote.trim(),
      makerModel: form.makerModel.trim(),
      installedAt: form.installedAt.trim(),
      inspectNote: form.inspectNote.trim(),
      updatedAt: Date.now(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="manage-edit-field">
        <label className="label">설비명</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">설치 위치/구역</label>
        <input
          className="input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">설비 구분</label>
        <div className="row manage-edit-choice-row">
          {EQUIP_TYPES.map((equipType) => (
            <button
              key={equipType}
              type="button"
              className={`selBtn ${form.equipType === equipType ? "active" : ""}`}
              onClick={() => setForm({ ...form, equipType })}
            >
              {equipType}
            </button>
          ))}
        </div>
        <input
          className="input"
          value={form.equipTypeNote}
          onChange={(e) => setForm({ ...form, equipTypeNote: e.target.value })}
          placeholder="구분 설명(한 줄)"
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">중요도</label>
        <div className="row manage-edit-choice-row">
          {IMPORTANCE_OPTIONS.map((importance) => (
            <button
              key={importance}
              type="button"
              className={`selBtn ${form.importance === importance ? "active" : ""}`}
              onClick={() => setForm({ ...form, importance })}
            >
              {importance}
            </button>
          ))}
        </div>
      </div>

      <div className="manage-edit-field">
        <label className="label">제조사/모델</label>
        <input
          className="input"
          value={form.makerModel}
          onChange={(e) => setForm({ ...form, makerModel: e.target.value })}
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">설치일</label>
        <input
          className="input"
          inputMode="numeric"
          value={form.installedAt}
          onChange={(e) =>
            setForm({
              ...form,
              installedAt: e.target.value.replace(/[^0-9-]/g, "").slice(0, 10),
            })
          }
          placeholder="YYYY-MM-DD"
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">점검 주기</label>
        <div className="row manage-edit-choice-row">
          {INSPECT_CYCLES.map((inspectCycle) => (
            <button
              key={inspectCycle}
              type="button"
              className={`selBtn ${form.inspectCycle === inspectCycle ? "active" : ""}`}
              onClick={() => setForm({ ...form, inspectCycle })}
            >
              {inspectCycle}
            </button>
          ))}
        </div>
        <input
          className="input"
          value={form.inspectNote}
          onChange={(e) => setForm({ ...form, inspectNote: e.target.value })}
          placeholder="주기 설명(한 줄)"
        />
      </div>

      <div className="manage-edit-actions">
        <button type="submit" className="btn primary">
          저장
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}
