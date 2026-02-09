import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import { useDraftState } from "../../../base/utils/useDraftState";
import TagInputText from "../../../base/components/TagInputText";

import type { ProductionDraft, ProductionLine, ProductionRecord, Shift, Product, Item } from "../../../domain/schema/daily/production";
import { defaultProductionDraft, normalizeProductionDraft, validateProductionDraft, toProductionRecord, newLine, makeProductionDocId } from "../../../domain/schema/daily/production";

type AddMode = "none" | "line";

const KEY_DRAFT = "draft_production_daily_schema_v1";

export default function RegisterProductionDaily() {
  const [docs, setDocs] = useState<ProductionRecord[]>(() => repo.productionDaily<ProductionRecord>().getAll());

  const { state: raw, setState: setRaw, reset, clear } = useDraftState<any>(KEY_DRAFT, defaultProductionDraft());
  const draft: ProductionDraft = useMemo(() => normalizeProductionDraft(raw), [raw]);

  const [addMode, setAddMode] = useState<AddMode>("none");
  const [line, setLine] = useState<ProductionLine>(() => newLine());

  function persist(next: ProductionDraft) {
    setRaw(normalizeProductionDraft(next));
  }

  function toggle(m: AddMode) {
    setAddMode((p) => (p === m ? "none" : m));
  }

  function addLine() {
    const l: ProductionLine = {
      ...line,
      bags: Number(line.bags) || 0,
      kg: Number(line.kg) || 0,
      memo: (line.memo || "").trim(),
    };
    persist({ ...draft, lines: [l, ...(draft.lines || [])] });
    setLine(newLine());
  }

  function removeLine(id: string) {
    persist({ ...draft, lines: (draft.lines || []).filter((x) => x.id !== id) });
  }

  function upsertSave() {
    const vr = validateProductionDraft(draft);
    if (!vr.ok) return alert(vr.errors[0]?.message || "입력값을 확인하세요.");

    const stableId = makeProductionDocId(draft.recordDate, draft.site, draft.writerName);
    const now = new Date().toISOString();

    const nextDoc: ProductionRecord = {
      ...toProductionRecord(draft, stableId),
      createdAt: (() => {
        const prev = docs.find((d) => d.id === stableId);
        return prev?.createdAt || now;
      })(),
      updatedAt: now,
    };

    const next = [nextDoc, ...docs.filter((d) => d.id !== stableId)];
    setDocs(next);
    repo.productionDaily<ProductionRecord>().setAll(next);

    alert("저장되었습니다.");
  }

  function removeDoc(id: string) {
    const next = docs.filter((d) => d.id !== id);
    setDocs(next);
    repo.productionDaily<ProductionRecord>().setAll(next);
  }

  const recent = useMemo(() => docs.slice(0, 30), [docs]);

  return (
    <div className="card">
      <h1 className="h1">생산일지</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>기록날짜</div>
          <input className="input" type="date" value={draft.recordDate} onChange={(e) => persist({ ...draft, recordDate: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>지부</div>
          <div className="row" style={{ marginTop: 0 }}>
            {(["대구", "성주"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.site === s ? "active" : ""}`} onClick={() => persist({ ...draft, site: s })}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>작성자</div>
          <input className="input" value={draft.writerName} onChange={(e) => persist({ ...draft, writerName: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>제목</div>
          <input className="input" value={draft.title} onChange={(e) => persist({ ...draft, title: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>내용</div>
          <textarea className="textarea" rows={3} value={draft.details} onChange={(e) => persist({ ...draft, details: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>태그</div>
          <div>
            <TagInputText value={draft.tagsText} onChange={(next) => persist({ ...draft, tagsText: next })} scope="production" />
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>생산 항목</div>

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

        {(draft.lines || []).length ? (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {(draft.lines || []).map((x) => (
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
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={upsertSave}>저장</button>
        <button type="button" className="btn" onClick={() => { clear(); reset(); setRaw(defaultProductionDraft()); setAddMode("none"); setLine(newLine()); }}>
          초기화
        </button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>최근 문서</div>

        {recent.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          recent.map((d) => (
            <div key={d.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {d.recordDate} · {d.site} · {d.writerName || "-"} · {d.title}
                  </div>
                  <div className="p" style={{ marginTop: 6, opacity: 0.8 }}>
                    항목 {d.lines?.length || 0}개 · updated {d.updatedAt}
                  </div>
                </div>
                <button type="button" className="btn danger" onClick={() => removeDoc(d.id)}>삭제</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}