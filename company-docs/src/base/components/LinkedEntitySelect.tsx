/**
 * LinkedEntitySelect - 연계 엔티티 선택 공통 컴포넌트
 * 
 * 사용처: 설비, 직원, 이슈, 거래처 등 기준정보 연계 필드
 * 특징:
 * - 자유기입은 검색용, 실제 선택은 등록된 항목/해당없음만 가능
 * - 추가 버튼으로 인라인 등록 후 선택
 */
import { useMemo, useState } from "react";

export type EntityOption = {
  id: string;
  label: string;
  subLabel?: string;
};

type Props = {
  label: string;
  options: EntityOption[];
  selectedId: string;
  selectedLabel: string;
  onSelect: (id: string, label: string) => void;
  placeholder?: string;
  allowNone?: boolean;        // 해당없음 허용 여부
  onAddClick?: () => void;    // 추가 버튼 클릭 시
  showAddButton?: boolean;
};

const NONE_VALUE = "__none__";

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

export default function LinkedEntitySelect({
  label,
  options,
  selectedId,
  selectedLabel,
  onSelect,
  placeholder = "검색 또는 선택",
  allowNone = true,
  onAddClick,
  showAddButton = true,
}: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [showSug, setShowSug] = useState(false);

  // 검색 필터된 옵션
  const filteredOptions = useMemo(() => {
    const q = normLoose(searchInput);
    if (!q || q.length < 1) return [];
    return options.filter((o) => 
      normLoose(o.label).includes(q) || 
      (o.subLabel && normLoose(o.subLabel).includes(q))
    ).slice(0, 10);
  }, [searchInput, options]);

  function handleSelect(opt: EntityOption) {
    onSelect(opt.id, opt.label);
    setSearchInput(opt.label);
    setShowSug(false);
  }

  function handleDropdownChange(id: string) {
    if (id === NONE_VALUE) {
      onSelect(NONE_VALUE, "");
      setSearchInput("");
      return;
    }
    if (!id) {
      onSelect("", "");
      setSearchInput("");
      return;
    }
    const found = options.find((o) => o.id === id);
    if (found) {
      onSelect(found.id, found.label);
      setSearchInput(found.label);
    }
  }

  function handleSearchChange(val: string) {
    setSearchInput(val);
    setShowSug(true);
    // 검색어 변경 시 선택 해제하지 않음 (검색만 수행)
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
      <div className="p">{label}</div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
          {/* 자유기입 검색 */}
          <div style={{ position: "relative" }}>
            <input
              className="input"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 200)}
              placeholder={placeholder}
            />
            {showSug && filteredOptions.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg-card, #222)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                maxHeight: 200,
                overflow: "auto",
                zIndex: 100,
              }}>
                {filteredOptions.map((o) => (
                  <div
                    key={o.id}
                    style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    onClick={() => handleSelect(o)}
                    onMouseDown={(ev) => ev.preventDefault()}
                  >
                    {o.label}
                    {o.subLabel && <span style={{ opacity: 0.5 }}> · {o.subLabel}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 드롭다운 선택 */}
          <select
            className="input"
            value={selectedId || ""}
            onChange={(e) => handleDropdownChange(e.target.value)}
            style={{ width: 120 }}
          >
            <option value="">▼ 선택</option>
            {allowNone && <option value={NONE_VALUE}>해당없음</option>}
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
                {o.subLabel ? ` (${o.subLabel})` : ""}
              </option>
            ))}
          </select>

          {/* 추가 버튼 */}
          {showAddButton && onAddClick && (
            <button type="button" className="btn" onClick={onAddClick}>
              추가
            </button>
          )}
        </div>

        {/* 선택된 항목 표시 */}
        {selectedLabel && selectedId !== NONE_VALUE && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>선택됨: {selectedLabel}</div>
        )}
        {selectedId === NONE_VALUE && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>해당없음</div>
        )}
      </div>
    </div>
  );
}

/**
 * 연계 필드 유효성 검사
 * - 빈 값: 미선택 (경고 없음, 선택적 필드일 때)
 * - NONE_VALUE: 해당없음 (유효)
 * - 기타: 실제 ID가 options에 존재해야 유효
 */
export function validateLinkedEntity(
  id: string, 
  _label: string, 
  options: EntityOption[], 
  fieldName: string,
  required: boolean = false
): { ok: boolean; message?: string } {
  // 필수가 아니고 빈 값이면 OK
  if (!required && !id) {
    return { ok: true };
  }
  
  // 필수인데 빈 값이면 에러
  if (required && !id) {
    return { ok: false, message: `${fieldName}을(를) 선택해주세요.` };
  }

  // 해당없음은 OK
  if (id === NONE_VALUE) {
    return { ok: true };
  }

  // 등록된 항목인지 확인
  const found = options.find((o) => o.id === id);
  if (!found) {
    return { ok: false, message: `${fieldName}은(는) 등록된 항목에서 선택하거나 '해당없음'을 선택해주세요.` };
  }

  return { ok: true };
}

export { NONE_VALUE };
