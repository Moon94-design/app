import type { ReactNode } from "react";

type BaseRecentListProps<T> = {
  title: string;
  items: T[];
  emptyLabel?: string;
  getKey: (item: T) => string;
  renderPrimary: (item: T) => ReactNode;
  renderSecondary?: (item: T) => ReactNode;
  renderExtra?: (item: T) => ReactNode;
  renderAction?: (item: T) => ReactNode;
};

export default function BaseRecentList<T>({
  title,
  items,
  emptyLabel = "아직 없음",
  getKey,
  renderPrimary,
  renderSecondary,
  renderExtra,
  renderAction,
}: BaseRecentListProps<T>) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="h1" style={{ fontSize: 15 }}>
        {title}
      </div>

      {items.length === 0 ? (
        <p className="p">{emptyLabel}</p>
      ) : (
        items.map((item) => (
          <div key={getKey(item)} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{renderPrimary(item)}</div>
                {renderSecondary ? (
                  <div className="p" style={{ marginTop: 6 }}>
                    {renderSecondary(item)}
                  </div>
                ) : null}
                {renderExtra ? <div style={{ marginTop: 6 }}>{renderExtra(item)}</div> : null}
              </div>
              {renderAction ? renderAction(item) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
