import { useEffect, useState } from "react";
import { DAILY_BRANCH_OPTIONS, type DailyBranch } from "@kernel/schema/daily";
import type { MyInfoProfile, SaveMyInfoInput } from "@kernel/user";

type MyInfoModalProps = {
  open: boolean;
  profile: MyInfoProfile | null;
  onClose: () => void;
  onSave: (input: SaveMyInfoInput) => void;
  onClear: () => void;
};

type FormState = {
  writerName: string;
  writerRole: string;
  site: DailyBranch;
};

function toFormState(profile: MyInfoProfile | null): FormState {
  return {
    writerName: profile?.writerName || "",
    writerRole: profile?.writerRole || "",
    site: profile?.site || DAILY_BRANCH_OPTIONS[0],
  };
}

export default function MyInfoModal({ open, profile, onClose, onSave, onClear }: MyInfoModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(profile));

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(profile));
  }, [open, profile]);

  if (!open) return null;

  function handleSave() {
    if (!form.writerName.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    if (!form.writerRole.trim()) {
      alert("직책을 입력해 주세요.");
      return;
    }
    onSave({
      writerName: form.writerName.trim(),
      writerRole: form.writerRole.trim(),
      site: form.site,
    });
    onClose();
  }

  return (
    <div className="shellModalBackdrop" role="dialog" aria-modal="true" aria-label="내 정보 설정">
      <div className="shellModalCard">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h3 className="h1" style={{ fontSize: 16 }}>
            내 정보
          </h3>
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="form-field">
            <p className="form-label">이름</p>
            <input
              className="input"
              value={form.writerName}
              onChange={(event) => setForm((prev) => ({ ...prev, writerName: event.target.value }))}
              placeholder="이름"
            />
          </div>
          <div className="form-field">
            <p className="form-label">직책</p>
            <input
              className="input"
              value={form.writerRole}
              onChange={(event) => setForm((prev) => ({ ...prev, writerRole: event.target.value }))}
              placeholder="직책"
            />
          </div>
          <div className="form-field">
            <p className="form-label">지부</p>
            <select
              className="input"
              value={form.site}
              onChange={(event) => setForm((prev) => ({ ...prev, site: event.target.value as DailyBranch }))}
            >
              {DAILY_BRANCH_OPTIONS.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button type="button" className="btn primary" onClick={handleSave}>
            저장
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              if (!confirm("저장된 내 정보를 초기화할까요?")) return;
              onClear();
              onClose();
            }}
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
