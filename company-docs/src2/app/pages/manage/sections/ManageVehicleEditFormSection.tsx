import { useState } from "react";
import { formatPhoneInput } from "@kernel/utils";
import {
  resolveVehicleStatusFromRecord,
  type Vehicle,
  type VehicleBodyType,
  type VehicleTonClass,
} from "@kernel/schema/vehicle";

type ManageVehicleEditFormSectionProps = {
  vehicle: Vehicle;
  onSave: (next: Vehicle) => Promise<void>;
  onCancel: () => void;
};

export default function ManageVehicleEditFormSection({
  vehicle,
  onSave,
  onCancel,
}: ManageVehicleEditFormSectionProps) {
  const [form, setForm] = useState<Vehicle>({ ...vehicle });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vehicleNo.trim()) {
      alert("차량번호는 필수입니다.");
      return;
    }
    await onSave({
      ...form,
      vehicleNo: form.vehicleNo.trim(),
      carrierName: form.carrierName.trim(),
      driverName: form.driverName.trim(),
      driverPhone: form.driverPhone.trim(),
      tagsText: form.tagsText.trim(),
      memo: form.memo.trim(),
      status: resolveVehicleStatusFromRecord(form),
      updatedAt: Date.now(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="manage-edit-field">
        <label className="label">차량번호 *</label>
        <input
          type="text"
          className="input"
          value={form.vehicleNo}
          onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">톤수</label>
        <select
          className="input"
          value={form.tonClass}
          onChange={(e) => setForm({ ...form, tonClass: e.target.value as VehicleTonClass })}
        >
          <option value="">미완성</option>
          <option value="1t">1t</option>
          <option value="5t">5t</option>
          <option value="25t">25t</option>
        </select>
      </div>

      <div className="manage-edit-field">
        <label className="label">형태</label>
        <select
          className="input"
          value={form.bodyType}
          onChange={(e) => setForm({ ...form, bodyType: e.target.value as VehicleBodyType })}
        >
          <option value="">미완성</option>
          <option value="카고">카고</option>
          <option value="윙">윙</option>
          <option value="방통">방통</option>
        </select>
      </div>

      <div className="manage-edit-field">
        <label className="label">운송사</label>
        <input
          type="text"
          className="input"
          value={form.carrierName}
          onChange={(e) => setForm({ ...form, carrierName: e.target.value })}
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">기사명</label>
        <input
          type="text"
          className="input"
          value={form.driverName}
          onChange={(e) => setForm({ ...form, driverName: e.target.value })}
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">기사 연락처</label>
        <input
          type="text"
          className="input"
          value={form.driverPhone}
          onChange={(e) => setForm({ ...form, driverPhone: formatPhoneInput(e.target.value) })}
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">태그</label>
        <input
          type="text"
          className="input"
          value={form.tagsText}
          onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
          placeholder="예: #냉동 #대형"
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">참고사항</label>
        <textarea
          className="input"
          rows={3}
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
        />
      </div>

      {form.status === "pending" && (
        <div className="manage-edit-warn-box">
          <p className="p manage-edit-warn-text">
            현재 <strong>보류</strong> 상태입니다.
          </p>
          <button
            type="button"
            className="btn manage-action-btn manage-action-btn--warn"
            onClick={() => setForm({ ...form, status: "incomplete" })}
          >
            보류 해제 (미입력으로 변경)
          </button>
        </div>
      )}

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
