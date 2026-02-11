import type { ReactNode } from "react";

type MasterFormHeaderProps = {
  title: string;
  onReset: () => void;
  resetLabel?: string;
  rightSlot?: ReactNode;
};

export default function MasterFormHeader({
  title,
  onReset,
  resetLabel = "초기화",
  rightSlot,
}: MasterFormHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <h1 className="h1" style={{ margin: 0 }}>
        {title}
      </h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {rightSlot}
        <button type="button" className="btn" onClick={onReset}>
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
