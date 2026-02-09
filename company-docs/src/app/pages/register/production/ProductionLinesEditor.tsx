/**
 * ProductionLinesEditor - 생산 항목 입력/편집 컴포넌트
 * 
 * 역할:
 * - LINES_EDITOR 앵커 구간을 별도 컴포넌트로 분리
 * - 생산 항목(line) 추가/삭제/표시
 * 
 * 사용처: RegisterProductionDaily
 */

import type { ProductionLine, Shift, Product, Item } from "../../../../ssot";

type AddMode = "none" | "line";

export type ProductionLinesEditorProps = {
  addMode: AddMode;
  toggle: (m: AddMode) => void;
  line: ProductionLine;
  setLine: (line: ProductionLine) => void;
  addLine: () => void;
  lines: ProductionLine[];
  removeLine: (id: string) => void;
};

export default function ProductionLinesEditor(props: ProductionLinesEditorProps) {
  const { addMode, toggle, line, setLine, addLine, lines, removeLine } = props;

  return (
    <>
      <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
        <button type="button" className={`selBtn ${addMode === "line" ? "active" : ""}`} onClick={() => toggle("line")}>
          항목 추가
        </button>
      </div>

      {addMode === "line" ? (
        <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
              <div className="p" style={{ marginTop: 0 }}>근무</div>
              <div className="row" style={{ marginTop: 0 }}>
                {(["주간", "오후", "야간"] as const).map((s: Shift) => (
                  <button key={s} type="button" className={`selBtn ${line.shift === s ? "active" : ""}`} onClick={() => setLine({ ...line, shift: s })}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
              <div className="p" style={{ marginTop: 0 }}>생산품</div>
              <div className="row" style={{ marginTop: 0 }}>
                {(["분쇄품", "펠렛"] as const).map((p: Product) => (
                  <button key={p} type="button" className={`selBtn ${line.product === p ? "active" : ""}`} onClick={() => setLine({ ...line, product: p })}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
              <div className="p" style={{ marginTop: 0 }}>품목</div>
              <div className="row" style={{ marginTop: 0 }}>
                {(["PP", "PE"] as const).map((it: Item) => (
                  <button key={it} type="button" className={`selBtn ${line.item === it ? "active" : ""}`} onClick={() => setLine({ ...line, item: it })}>
                    {it}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
              <div className="p" style={{ marginTop: 0 }}>자루</div>
              <input className="input" inputMode="numeric" value={String(line.bags)} onChange={(e) => setLine({ ...line, bags: Number(e.target.value || 0) })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
              <div className="p" style={{ marginTop: 0 }}>Kg(선택)</div>
              <input className="input" inputMode="numeric" value={String(line.kg)} onChange={(e) => setLine({ ...line, kg: Number(e.target.value || 0) })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
              <div className="p" style={{ marginTop: 0 }}>비고</div>
              <textarea className="textarea" rows={2} value={line.memo} onChange={(e) => setLine({ ...line, memo: e.target.value })} />
            </div>
          </div>

          <div className="row">
            <button type="button" className="btn primary" onClick={addLine}>추가</button>
          </div>
        </div>
      ) : null}

      {(lines || []).length ? (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {(lines || []).map((x) => (
            <div key={x.id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {x.shift} · {x.product} · {x.item}
                  </div>
                  <div className="p" style={{ marginTop: 6 }}>
                    {x.bags}자루{x.kg ? ` · ${x.kg}kg` : ""}{x.memo ? ` · ${x.memo}` : ""}
                  </div>
                </div>
                <button type="button" className="btn danger" onClick={() => removeLine(x.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="p" style={{ marginTop: 10 }}>아직 없음</p>}
    </>
  );
}
