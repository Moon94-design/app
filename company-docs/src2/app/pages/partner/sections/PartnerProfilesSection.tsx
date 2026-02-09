import type { TradeProfileItem } from "@kernel/schema/partner";

type PartnerProfilesSectionProps = {
  profiles: TradeProfileItem[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<TradeProfileItem>) => void;
  onRemove: (index: number) => void;
};

export default function PartnerProfilesSection({
  profiles,
  onAdd,
  onUpdate,
  onRemove,
}: PartnerProfilesSectionProps) {
  return (
    <div>
      <label className="p" style={{ display: "block", marginBottom: 6 }}>거래 프로필</label>
      {profiles.length === 0 ? (
        <p className="p" style={{ fontSize: 12, opacity: 0.7 }}>프로필 없음</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {profiles.map((profile, idx) => (
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
                  onChange={(e) => onUpdate(idx, { direction: e.target.value as "매입" | "매출" })}
                >
                  <option value="매입">매입</option>
                  <option value="매출">매출</option>
                </select>
                <select
                  className="input"
                  value={profile.item}
                  onChange={(e) => onUpdate(idx, { item: e.target.value as "PP" | "PE" })}
                >
                  <option value="PP">PP</option>
                  <option value="PE">PE</option>
                </select>
                <select
                  className="input"
                  value={profile.kind}
                  onChange={(e) => onUpdate(idx, { kind: e.target.value as "압축" | "분쇄" | "펠렛" })}
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
                  onChange={(e) => onUpdate(idx, { memo: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn danger" onClick={() => onRemove(idx)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="btn" onClick={onAdd} style={{ marginTop: 8 }}>
        + 프로필 추가
      </button>
    </div>
  );
}
