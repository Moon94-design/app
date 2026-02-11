import type { CSSProperties } from "react";

type ProfileLike = {
  direction: string;
  item: string;
  kind: string;
  memo?: string;
};

type ProfilesEditorProps = {
  label?: string;
  profiles: ProfileLike[];
  directionOptions: readonly string[];
  itemOptions: readonly string[];
  kindOptions: readonly string[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ProfileLike>) => void;
  onRemove: (index: number) => void;
  addLabel?: string;
  emptyLabel?: string;
  disabled?: boolean;
  containerStyle?: CSSProperties;
};

export default function ProfilesEditor({
  label,
  profiles,
  directionOptions,
  itemOptions,
  kindOptions,
  onAdd,
  onUpdate,
  onRemove,
  addLabel = "프로필 추가",
  emptyLabel = "프로필 없음",
  disabled = false,
  containerStyle,
}: ProfilesEditorProps) {
  return (
    <div style={containerStyle}>
      {label ? (
        <label className="p" style={{ display: "block", marginBottom: 6 }}>
          {label}
        </label>
      ) : null}

      {profiles.length === 0 ? (
        <p className="p" style={{ fontSize: 12, opacity: 0.7 }}>
          {emptyLabel}
        </p>
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
                  disabled={disabled}
                  onChange={(e) => onUpdate(idx, { direction: e.target.value })}
                >
                  {directionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={profile.item}
                  disabled={disabled}
                  onChange={(e) => onUpdate(idx, { item: e.target.value })}
                >
                  {itemOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={profile.kind}
                  disabled={disabled}
                  onChange={(e) => onUpdate(idx, { kind: e.target.value })}
                >
                  {kindOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  placeholder="프로필 메모"
                  value={profile.memo || ""}
                  disabled={disabled}
                  onChange={(e) => onUpdate(idx, { memo: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn danger" onClick={() => onRemove(idx)} disabled={disabled}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="btn" onClick={onAdd} style={{ marginTop: 8 }} disabled={disabled}>
        {addLabel}
      </button>
    </div>
  );
}
