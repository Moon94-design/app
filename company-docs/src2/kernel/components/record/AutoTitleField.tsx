import { useEffect, useRef } from "react";
import { buildAutoTitle } from "@kernel/schema/daily";

type AutoTitleFieldProps = {
  recordDate: string;
  writerName: string;
  writerRole?: string;
  category?: string;
  suffix?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  requiredMark?: boolean;
};

export default function AutoTitleField({
  recordDate,
  writerName,
  writerRole,
  category,
  suffix = "기록",
  value,
  onChange,
  placeholder = "비워두면 자동완성",
  requiredMark = false,
}: AutoTitleFieldProps) {
  const touchedRef = useRef(false);

  useEffect(() => {
    if (!value.trim()) touchedRef.current = false;
  }, [value]);

  useEffect(() => {
    if (touchedRef.current) return;
    const next = buildAutoTitle(recordDate, writerName, writerRole, category, suffix);
    if (next && next !== value) onChange(next);
  }, [recordDate, writerName, writerRole, category, suffix, value, onChange]);

  return (
    <div className="form-field">
      <p className="form-label">제목{requiredMark ? " *" : ""}</p>
      <input
        className="input"
        value={value}
        placeholder={placeholder}
        onFocus={() => {
          if (!touchedRef.current && !value.trim()) {
            const next = buildAutoTitle(recordDate, writerName, writerRole, category, suffix);
            if (next) onChange(next);
          }
        }}
        onChange={(e) => {
          touchedRef.current = true;
          onChange(e.target.value);
        }}
      />
    </div>
  );
}
