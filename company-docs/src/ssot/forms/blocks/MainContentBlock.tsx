/**
 * MainContentBlock — 내용 입력 블록 (SSOT 정본)
 * 
 * 역할:
 * - 상세/내용 textarea 통합
 * - UI 전용: props 기반, 상태 생성/저장 금지
 * - forwardRef 지원: 외부에서 textarea focus 제어 가능
 * 
 * 사용처: IssueForm, ActionForm
 */
import { forwardRef } from "react";

export type MainContentBlockProps = {
  label: string;              // "상세", "내용" 등
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;              // default: 3
  required?: boolean;         // default: false (라벨에 * 표시만)
  showLabel?: boolean;        // default: true
  editable?: boolean;         // default: true
};

const MainContentBlock = forwardRef<HTMLTextAreaElement, MainContentBlockProps>(
  (props, ref) => {
    const {
      label,
      value,
      onChange,
      placeholder,
      rows = 3,
      required = false,
      showLabel = true,
      editable = true,
    } = props;

    return (
      <div style={{ display: "grid", gridTemplateColumns: showLabel ? "100px 1fr" : "1fr", gap: 8, alignItems: "start" }}>
        {showLabel && <div className="p">{label}{required ? " *" : ""}</div>}
        <textarea
          ref={ref}
          className="textarea"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={!editable}
        />
      </div>
    );
  }
);

MainContentBlock.displayName = "MainContentBlock";

export default MainContentBlock;
