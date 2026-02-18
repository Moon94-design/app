import type { ReactNode } from "react";

type LayerModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function LayerModal({ title, onClose, children }: LayerModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "min(920px, 96vw)",
          maxHeight: "88vh",
          overflow: "auto",
          background: "#10141b",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h3 className="h1" style={{ margin: 0, fontSize: 18 }}>
            {title}
          </h3>
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="divider" />
        {children}
      </div>
    </div>
  );
}
