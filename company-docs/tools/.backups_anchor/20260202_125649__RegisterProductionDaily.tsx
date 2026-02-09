import { useEffect, useMemo, useRef, useState } from "react";
import { repo } from "../../../data/repo";
import { useDraftState } from "../../../base/utils/useDraftState";
import TagInputText, { bumpPersonalTag, bumpSystemTag, listPersonalTags, listSystemTags } from "../../../base/components/TagInputText";

import type { ProductionDraft, ProductionLine, ProductionRecord, Shift, Product, Item } from "../../../domain/schema/daily/production";
import { defaultProductionDraft, normalizeProductionDraft, validateProductionDraft, toProductionRecord, newLine, makeProductionDocId } from "../../../domain/schema/daily/production";

type AddMode = "none" | "line";
const KEY_DRAFT = "draft_production_daily_schema_v2";

function buildAutoTitle(recordDate: string, writerName: string, writerRole: string) {
  const d = (recordDate || "").trim();
  const n = (writerName || "").trim();
  const r = (writerRole || "").trim();
  const mid = [n, r].filter(Boolean).join(" ");
  return `${d} ${mid ? mid + " " : ""}생산일지`.trim();
}

// 내용 끝 토큰(입력 중) 추출: 3글자 이상일 때 추천
function lastToken(text: string) {
  const t = (text || "").replace(/\s+/g, " ");
  const m = t.match(/([0-9A-Za-z가-힣-]{3,})\s*$/);
  return m ? m[1] : "";
}

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

type Sug = { tag: string; source: "system" | "personal" };

function buildSuggestions(details: string, selected: Set<string>, candidates: Sug[], dismissed: Set<string>) {
  const token = lastToken(details);
  if (!token) return [];

  const qLoose = normLoose(token);

  const out: Sug[] = [];
  for (const c of candidates) {
    const t = (c.tag || "").trim();
    if (!t) continue;
    if (selected.has(t)) continue;
    if (dismissed.has(t)) continue;

    const candLoose = normLoose(t);

    // 1) 일반 포함
    const includes = t.toLowerCase().includes(token.toLowerCase());
    // 2) 차량번호/숫자류는 뒤쪽 매칭 우대
    const suffix = candLoose.endsWith(qLoose);

    if (includes || suffix) {
      out.push(c);
      if (out.length >= 30) break; // 더보기용 상한
    }
  }
  return out;
}

export default function RegisterProductionDaily() {
  const [docs, setDocs] = useState<ProductionRecord[]>(() => repo.productionDaily<ProductionRecord>().getAll());

  const { state: raw, setState: setRaw, reset, clear } = useDraftState<any>(KEY_DRAFT, defaultProductionDraft());
  const draft: ProductionDraft = useMemo(() => normalizeProductionDraft(raw), [raw]);

  const [addMode, setAddMode] = useState<AddMode>("none");
  const [line, setLine] = useState<ProductionLine>(() => newLine());

  // [ANCHOR:TITLE_AUTO_START]
  const [titleAuto, setTitleAuto] = useState(false);
  const titleTouchedRef = useRef(false);

  function persist(next: ProductionDraft) {
    setRaw(normalizeProductionDraft(next));
  }

  function ensureTitleIfAuto(nextDraft: ProductionDraft) {
    if (!titleAuto) return;
    const auto = buildAutoTitle(nextDraft.recordDate, nextDraft.writerName, nextDraft.writerRole);
    if ((nextDraft.title || "").trim() !== auto) {
      setRaw(normalizeProductionDraft({ ...nextDraft, title: auto }));
    }
  }

  function onFocusTitle() {
    titleTouchedRef.current = true;
    setTitleAuto(true);
    const auto = buildAutoTitle(draft.recordDate, draft.writerName, draft.writerRole);
    if (!(draft.title || "").trim()) {
      persist({ ...draft, title: auto });
    } else {
      ensureTitleIfAuto(draft);
    }
  }

  function onChangeTitle(v: string) {
    if (titleTouchedRef.current) setTitleAuto(false);
    persist({ ...draft, title: v });
  }
  // [ANCHOR:TITLE_AUTO_END]

  function toggle(m: AddMode) {
    setAddMode((p) => (p === m ? "none" : m));
  }

  // 기준정보 후보(보수적): 기관/거래처/차량 + (태그 인덱스 system/personal)
  const candidatePool: Sug[] = useMemo(() => {
    const agencies = repo.agencies<any>().getAll().map((x: any) => (x?.name || x?.baseName || "").trim()).filter(Boolean);
    const partners = repo.partners<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const vehicles = repo.vehicles<any>().getAll().map((x: any) => (x?.vehicleNo || "").trim()).filter(Boolean);

    const systemTags = listSystemTags().filter((t) => t.trim().length >= 2);
    const personalTags = listPersonalTags().filter((t) => t.trim().length >= 2);

    const seen = new Set<string>();
    const out: Sug[] = [];

    const push = (tag: string, source: "system" | "personal") => {
      const t = (tag || "").trim();
      if (!t) return;
      if (seen.has(`${source}:${t}`)) return;
      // 동일 태그는 source 우선순위: personal 먼저 넣고, system은 같은 태그면 생략
      if (source === "system" && personalTags.includes(t)) return;
      seen.add(`${source}:${t}`);
      out.push({ tag: t, source });
    };

    // personal tags 먼저
    for (const t of personalTags) push(t, "personal");
    // system tags
    for (const t of systemTags) push(t, "system");

    // 기준정보 이름은 system 취급
    for (const t of agencies) push(t, "system");
    for (const t of partners) push(t, "system");
    for (const t of vehicles) push(t, "system");

    return out.slice(0, 600);
  }, [draft.recordDate]);

  const selectedTags = useMemo(() => {
    const set = new Set<string>();
    (draft.tagsText || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((t) => set.add(t.startsWith("#") ? t.slice(1).trim() : t));
    return set;
  }, [draft.tagsText]);

  // [ANCHOR:TAG_SUGGEST_START]
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);

  const allSug = useMemo(() => buildSuggestions(draft.details, selectedTags, candidatePool, dismissed), [draft.details, selectedTags, candidatePool, dismissed]);

  const visibleSug = useMemo(() => {
    if (showAll) return allSug;
    return allSug.slice(0, 5);
  }, [allSug, showAll]);

  function applySuggested(s: Sug) {
    const t = (s.tag || "").trim();
    if (!t) return;
    if (selectedTags.has(t)) return;

    // source 유지
    if (s.source === "system") bumpSystemTag("production", t);
    else bumpPersonalTag("production", t);

    const next = (draft.tagsText || "").trim();
    const merged = next ? `${next}, ${t}` : t;
    persist({ ...draft, tagsText: merged });
  }

  function dismissSuggested(tag: string) {
    const t = (tag || "").trim();
    if (!t) return;
    setDismissed((prev) => {
      const n = new Set(prev);
      n.add(t);
      return n;
    });
  }
  // [ANCHOR:TAG_SUGGEST_END]

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

  // 자동모드면 날짜/작성자/직책 변화에 따라 제목 갱신
  useEffect(() => {
    if (!titleAuto) return;
    ensureTitleIfAuto(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.recordDate, draft.writerName, draft.writerRole, titleAuto]);

  function upsertSave() {
    const vr = validateProductionDraft(draft);
    if (!vr.ok) return alert(vr.errors[0]?.message || "입력값을 확인하세요.");

    const stableId = makeProductionDocId(draft.recordDate, draft.site, draft.writerName);
    const now = new Date().toISOString();

    const finalDraft = (() => {
      const t = (draft.title || "").trim();
      if (t) return draft;
      return { ...draft, title: buildAutoTitle(draft.recordDate, draft.writerName, draft.writerRole) };
    })();

    const nextDoc: ProductionRecord = {
      ...toProductionRecord(finalDraft, stableId),
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
          <div className="p" style={{ marginTop: 0 }}>직책</div>
          <input className="input" value={draft.writerRole} onChange={(e) => persist({ ...draft, writerRole: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>제목</div>
          <input className="input" value={draft.title} onFocus={onFocusTitle} onChange={(e) => onChangeTitle(e.target.value)} placeholder="클릭하면 자동완성" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>내용</div>
          <textarea className="textarea" rows={3} value={draft.details} onChange={(e) => persist({ ...draft, details: e.target.value })} />
        </div>

        {/* 추천 태그 */}
        {visibleSug.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
            <div className="p" style={{ marginTop: 0 }}>추천 태그</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {visibleSug.map((s) => {
                const isSystem = s.source === "system";
                return (
                  <div
                    key={`${s.source}:${s.tag}`}
                    style={{
                      display: "flex",
                      borderRadius: 999,
                      overflow: "hidden",
                      border: isSystem ? "1px solid rgba(70,130,255,0.65)" : "1px solid rgba(255,255,255,0.10)",
                      background: isSystem ? "rgba(70,130,255,0.20)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* 3/4: 추가 */}
                    <button
                      type="button"
                      className="btn"
                      style={{
                        borderRadius: 0,
                        background: "transparent",
                        padding: "8px 10px",
                      }}
                      onClick={() => applySuggested(s)}
                    >
                      #{s.tag}
                    </button>

                    {/* 1/4: 삭제(연한 빨강) */}
                    <button
                      type="button"
                      className="btn"
                      style={{
                        borderRadius: 0,
                        background: "rgba(255,70,70,0.18)",
                        borderLeft: "1px solid rgba(255,70,70,0.25)",
                        padding: "8px 10px",
                        minWidth: 46,
                      }}
                      title="추천에서 제외"
                      onClick={() => dismissSuggested(s.tag)}
                    >
                      🗑
                    </button>
                  </div>
                );
              })}

              {allSug.length > 5 ? (
                <button type="button" className="btn" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "접기" : `더보기(${allSug.length})`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

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
        <button
          type="button"
          className="btn"
          onClick={() => {
            clear();
            reset();
            setRaw(defaultProductionDraft());
            setAddMode("none");
            setLine(newLine());
            setTitleAuto(false);
            titleTouchedRef.current = false;
          }}
        >
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
                    {d.recordDate} · {d.site} · {(d.writerName || "-")} {(d.writerRole || "")} · {d.title}
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