import { useEffect, useMemo, useRef, useState } from "react";

export type FilterableSelectOption = {
  id: string;
  label: string;
};

type FilterableSelectProps = {
  value: string;
  options: readonly FilterableSelectOption[];
  onChange: (nextId: string) => void;
  searchPlaceholder?: string;
  emptyOptionLabel?: string;
  noResultText?: string;
  allowEmpty?: boolean;
};

function toSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export default function FilterableSelect({
  value,
  options,
  onChange,
  searchPlaceholder = "검색 후 아래 목록에서 선택",
  emptyOptionLabel = "선택 안함",
  noResultText = "검색 결과가 없습니다.",
  allowEmpty = true,
}: FilterableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value) || null,
    [options, value]
  );

  useEffect(() => {
    setInputValue(selectedOption?.label || "");
  }, [selectedOption?.id, selectedOption?.label]);

  useEffect(() => {
    function handleOutsideMouseDown(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, []);

  const normalizedQuery = toSearchText(inputValue);
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) => toSearchText(option.label).includes(normalizedQuery));
  }, [normalizedQuery, options]);

  function handleInputChange(nextText: string) {
    setInputValue(nextText);
    setOpen(true);

    if (!value || !allowEmpty) return;
    const selectedLabel = selectedOption?.label?.trim() || "";
    if (!selectedLabel || nextText.trim() !== selectedLabel) {
      onChange("");
    }
  }

  function handleSelect(nextId: string) {
    onChange(nextId);
    const nextOption = options.find((option) => option.id === nextId) || null;
    setInputValue(nextOption?.label || "");
    setOpen(false);
  }

  function handleToggleOpen() {
    setOpen((prev) => !prev);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          className="input"
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder={searchPlaceholder}
          autoComplete="off"
          style={{ paddingRight: 36 }}
        />
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label="목록 열기"
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: "rgba(240,240,240,0.9)",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: 12,
          }}
        >
          ▾
        </button>
      </div>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "rgba(24,26,31,0.98)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
          }}
        >
          {allowEmpty ? (
            <button
              type="button"
              onClick={() => handleSelect("")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                border: "none",
                background: value ? "transparent" : "rgba(255,255,255,0.08)",
                color: "rgba(240,240,240,0.95)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {emptyOptionLabel}
            </button>
          ) : null}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  border: "none",
                  background: option.id === value ? "rgba(255,255,255,0.08)" : "transparent",
                  color: "rgba(240,240,240,0.95)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div style={{ padding: "8px 10px", fontSize: 12, color: "rgba(240,240,240,0.7)" }}>{noResultText}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
