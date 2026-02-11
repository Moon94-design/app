import { useState } from "react";
import { buildTagsText, parseTags, type LogisticsLine, type LogisticsRecord } from "@kernel/schema/daily";

type ManageLogisticsEditFormSectionProps = {
  record: LogisticsRecord;
  onSave: (next: LogisticsRecord, tagsText: string) => Promise<void>;
  onCancel: () => void;
};

export default function ManageLogisticsEditFormSection({
  record,
  onSave,
  onCancel,
}: ManageLogisticsEditFormSectionProps) {
  const [form, setForm] = useState<LogisticsRecord>({
    ...record,
    lines: [...record.lines],
  });
  const [tagsText, setTagsText] = useState<string>(buildTagsText(record.tags));

  function updateLine(
    index: number,
    field: keyof LogisticsLine,
    value: LogisticsLine[keyof LogisticsLine]
  ) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, idx) =>
        idx === index ? { ...line, [field]: value } : line
      ),
    }));
  }

  function removeLine(index: number) {
    if (!confirm("이 라인을 삭제하시겠습니까?")) return;
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, idx) => idx !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(
      {
        ...form,
        tags: parseTags(tagsText),
        updatedAt: Date.now(),
      },
      tagsText
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="manage-edit-field">
        <label className="label">날짜</label>
        <input
          type="date"
          className="input"
          value={form.recordDate}
          onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">제목</label>
        <input
          type="text"
          className="input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">상세 내용</label>
        <textarea
          className="input"
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
          rows={3}
        />
      </div>

      <div className="manage-edit-field">
        <label className="label">태그 (쉼표 구분)</label>
        <input
          type="text"
          className="input"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="예: 계량현황, 확인필요"
        />
      </div>

      <div className="divider" />
      <h3 className="manage-edit-divider-title">거래 내역</h3>

      {form.lines.length === 0 ? (
        <p className="p">내역이 없습니다.</p>
      ) : (
        <div className="manage-edit-lines">
          {form.lines.map((line, idx) => (
            <div key={`${form.id}-${idx}`} className="card manage-edit-line-card">
              <div className="manage-edit-line-grid">
                <div>
                  <label className="label manage-edit-line-label">
                    방향
                  </label>
                  <select
                    className="input manage-edit-line-input"
                    value={line.direction}
                    onChange={(e) => updateLine(idx, "direction", e.target.value as LogisticsLine["direction"])}
                  >
                    <option value="매입">매입</option>
                    <option value="출고">출고</option>
                  </select>
                </div>
                <div>
                  <label className="label manage-edit-line-label">
                    분류
                  </label>
                  <select
                    className="input manage-edit-line-input"
                    value={line.kind}
                    onChange={(e) => updateLine(idx, "kind", e.target.value as LogisticsLine["kind"])}
                  >
                    <option value="압축품">압축품</option>
                    <option value="분쇄품">분쇄품</option>
                    <option value="펠렛">펠렛</option>
                  </select>
                </div>
                <div>
                  <label className="label manage-edit-line-label">
                    품목
                  </label>
                  <select
                    className="input manage-edit-line-input"
                    value={line.item}
                    onChange={(e) => updateLine(idx, "item", e.target.value as LogisticsLine["item"])}
                  >
                    <option value="PP">PP</option>
                    <option value="PE">PE</option>
                  </select>
                </div>
                <div>
                  <label className="label manage-edit-line-label">
                    중량(kg)
                  </label>
                  <input
                    type="number"
                    className="input manage-edit-line-input"
                    value={line.kg}
                    onChange={(e) => updateLine(idx, "kg", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label manage-edit-line-label">
                    단가
                  </label>
                  <input
                    type="number"
                    className="input manage-edit-line-input"
                    value={line.unitPricePerKg}
                    onChange={(e) =>
                      updateLine(idx, "unitPricePerKg", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="manage-edit-line-meta">
                거래처: {line.partner.label} | 차량: {line.vehicle?.label || "-"}
              </div>

              <button
                type="button"
                className="btn manage-action-btn manage-action-btn--danger"
                onClick={() => removeLine(idx)}
              >
                이 라인 삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="divider" />
      <div className="manage-edit-actions manage-edit-actions--wide">
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
