import type { BulkApplyState, BulkFormState } from "./usePartnerBulkEdit";
import type { TradeProfileItem } from "@kernel/schema/partner";

type PartnerBulkEditPanelProps = {
  selectedCount: number;
  bulkApply: BulkApplyState;
  bulkForm: BulkFormState;
  setBulkApply: (updater: (prev: BulkApplyState) => BulkApplyState) => void;
  setBulkForm: (updater: (prev: BulkFormState) => BulkFormState) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onApply: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onAddProfile: () => void;
  onUpdateProfile: (index: number, patch: Partial<TradeProfileItem>) => void;
  onRemoveProfile: (index: number) => void;
};

export default function PartnerBulkEditPanel({
  selectedCount,
  bulkApply,
  bulkForm,
  setBulkApply,
  setBulkForm,
  onSelectAll,
  onClearSelection,
  onApply,
  onUndo,
  canUndo,
  onAddProfile,
  onUpdateProfile,
  onRemoveProfile,
}: PartnerBulkEditPanelProps) {
  return (
    <div className="card" style={{ marginTop: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span className="p" style={{ fontSize: 13 }}>선택 {selectedCount}건</span>
        <button type="button" className="btn" onClick={onSelectAll}>
          현재 목록 전체 선택
        </button>
        <button type="button" className="btn" onClick={onClearSelection}>
          선택 해제
        </button>
        <button type="button" className="btn primary" onClick={onApply}>
          일괄 적용
        </button>
        <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
          되돌리기
        </button>
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={bulkApply.importance}
              onChange={(event) => setBulkApply((prev) => ({ ...prev, importance: event.target.checked }))}
            />
            중요도
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={bulkApply.relationshipStatus}
              onChange={(event) => setBulkApply((prev) => ({ ...prev, relationshipStatus: event.target.checked }))}
            />
            관계현황
          </label>
          <select
            className="input"
            value={bulkForm.importance}
            onChange={(event) => setBulkForm((prev) => ({ ...prev, importance: event.target.value as "상" | "중" | "하" }))}
            disabled={!bulkApply.importance}
          >
            <option value="상">상</option>
            <option value="중">중</option>
            <option value="하">하</option>
          </select>
          <select
            className="input"
            value={bulkForm.relationshipStatus}
            onChange={(event) =>
              setBulkForm((prev) => ({
                ...prev,
                relationshipStatus: event.target.value as "상" | "중" | "하",
              }))
            }
            disabled={!bulkApply.relationshipStatus}
          >
            <option value="상">상</option>
            <option value="중">중</option>
            <option value="하">하</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={bulkApply.profiles}
              onChange={(event) => setBulkApply((prev) => ({ ...prev, profiles: event.target.checked }))}
            />
            거래 프로필
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                name="bulkProfileMode"
                value="append"
                checked={bulkForm.profileMode === "append"}
                onChange={() => setBulkForm((prev) => ({ ...prev, profileMode: "append" }))}
                disabled={!bulkApply.profiles}
              />
              추가
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                name="bulkProfileMode"
                value="overwrite"
                checked={bulkForm.profileMode === "overwrite"}
                onChange={() => setBulkForm((prev) => ({ ...prev, profileMode: "overwrite" }))}
                disabled={!bulkApply.profiles}
              />
              덮어쓰기
            </label>
          </div>
          <div style={{ opacity: bulkApply.profiles ? 1 : 0.5, pointerEvents: bulkApply.profiles ? "auto" : "none" }}>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "grid", gap: 8 }}>
                {bulkForm.profiles.length === 0 ? (
                  <p className="p" style={{ fontSize: 12, opacity: 0.7 }}>프로필 없음</p>
                ) : (
                  bulkForm.profiles.map((profile, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 4,
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <select
                          className="input"
                          value={profile.direction}
                          onChange={(e) => onUpdateProfile(idx, { direction: e.target.value as "매입" | "매출" })}
                        >
                          <option value="매입">매입</option>
                          <option value="매출">매출</option>
                        </select>
                        <select
                          className="input"
                          value={profile.item}
                          onChange={(e) => onUpdateProfile(idx, { item: e.target.value as "PP" | "PE" })}
                        >
                          <option value="PP">PP</option>
                          <option value="PE">PE</option>
                        </select>
                        <select
                          className="input"
                          value={profile.kind}
                          onChange={(e) => onUpdateProfile(idx, { kind: e.target.value as "압축" | "분쇄" | "펠렛" })}
                        >
                          <option value="압축">압축</option>
                          <option value="분쇄">분쇄</option>
                          <option value="펠렛">펠렛</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          className="input"
                          placeholder="프로필 메모"
                          value={profile.memo || ""}
                          onChange={(e) => onUpdateProfile(idx, { memo: e.target.value })}
                          style={{ flex: 1 }}
                        />
                        <button type="button" className="btn danger" onClick={() => onRemoveProfile(idx)}>
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button type="button" className="btn" onClick={onAddProfile} style={{ marginTop: 8 }}>
                + 프로필 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
