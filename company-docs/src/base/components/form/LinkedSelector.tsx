/**
 * LinkedSelector - 연계 선택기 (검색+드롭다운, 자유입력 불가)
 * 
 * 특징:
 * - 검색은 필터링 용도로만 사용
 * - 반드시 목록에서 선택하거나 "해당없음" 선택
 * - 선택 안 하고 다른 곳 클릭하면 검색어 초기화
 */
import { useMemo, useState, useCallback } from "react";

export const NONE_VALUE = "__none__";

type Option = {
  id: string;
  label: string;
  subLabel?: string;
};

type LinkedSelectorProps = {
  label: string;
  options: Option[];
  selectedId: string;
  selectedLabel?: string;
  onSelect: (id: string, label: string) => void;
  placeholder?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  required?: boolean;  // true면 해당없음도 불가
};

export default function LinkedSelector({
  label,
  options,
  selectedId,
  selectedLabel,
  onSelect,
  placeholder,
  showAddButton = false,
  onAddClick,
  required = false,
}: LinkedSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 검색 필터
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return options.slice(0, 30);
    const q = searchTerm.toLowerCase();
    return options.filter((o) =>
      o.label.toLowerCase().includes(q) || (o.subLabel && o.subLabel.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [searchTerm, options]);

  // 표시용 라벨
  const displayLabel = useMemo(() => {
    if (selectedId === NONE_VALUE) return "해당없음";
    if (!selectedId) return "";
    return selectedLabel || options.find((o) => o.id === selectedId)?.label || "";
  }, [selectedId, selectedLabel, options]);

  // 선택 핸들러
  const handleSelect = useCallback((id: string, lbl: string) => {
    onSelect(id, lbl);
    setSearchTerm("");
    setIsOpen(false);
  }, [onSelect]);

  // 드롭다운 닫기 (선택 없으면 검색어 초기화)
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    // 선택이 없으면 검색어 초기화
    if (!selectedId) {
      setSearchTerm("");
    }
  }, [selectedId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
      <div className="p">{label}</div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: showAddButton ? "1fr auto" : "1fr", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <input
                className="input"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder || "검색..."}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{ padding: "8px 12px" }}
              >
                ▼
              </button>
            </div>

            {/* 드롭다운 목록 */}
            {isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "var(--bg-card, #222)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  maxHeight: 280,
                  overflow: "auto",
                  zIndex: 100,
                  marginTop: 4,
                }}
              >
                {/* 해당없음 옵션 (required가 아닐 때만) */}
                {!required && (
                  <div
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      background: selectedId === NONE_VALUE ? "rgba(70,130,255,0.2)" : undefined,
                    }}
                    onClick={() => handleSelect(NONE_VALUE, "")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span style={{ opacity: 0.7 }}>해당없음</span>
                  </div>
                )}

                {/* 옵션 목록 */}
                {filtered.length > 0 ? (
                  filtered.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: selectedId === o.id ? "rgba(70,130,255,0.2)" : undefined,
                      }}
                      onClick={() => handleSelect(o.id, o.label)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div>{o.label}</div>
                      {o.subLabel && (
                        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{o.subLabel}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "12px", opacity: 0.5, textAlign: "center" }}>
                    {searchTerm ? "검색 결과 없음" : "항목 없음"}
                  </div>
                )}
              </div>
            )}

            {/* 외부 클릭 시 닫기 */}
            {isOpen && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={closeDropdown}
              />
            )}
          </div>

          {/* 추가 버튼 */}
          {showAddButton && onAddClick && (
            <button type="button" className="btn" onClick={onAddClick}>
              추가
            </button>
          )}
        </div>

        {/* 선택된 항목 표시 */}
        {selectedId && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              background: selectedId === NONE_VALUE ? "rgba(255,255,255,0.05)" : "rgba(70,130,255,0.15)",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <span>✓ {displayLabel}</span>
            <button
              type="button"
              onClick={() => onSelect("", "")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "inherit",
                opacity: 0.6,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
