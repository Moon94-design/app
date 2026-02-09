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
const token = lastToken(details) || ""; // ✅ 기존 lastToken 사용 (TS6133 제거)
  if (!token || token.length < 2) return [];

  // ✅ 2글자 미만이면 추천 유지하지 않음
  if (!token || token.length < 2) return [];

  const tokenLower = token.toLowerCase();
  const tokenLoose = normLoose(token);

  // ✅ fallback: 현재 토큰에서 매칭이 없으면 prefix 길이를 줄여가며 "마지막으로 매칭된" 후보를 유지
  let query = tokenLower;
  let queryLoose = tokenLoose;

  const matchesPrefix = (q: string, qLoose: string) => {
    const out: Sug[] = [];
    for (const c of candidates) {
      const tag = (c.tag || "").trim();
      if (!tag) continue;
      if (selected.has(tag)) continue;
      if (dismissed.has(tag)) continue;

      const a = tag.toLowerCase();
      const aLoose = normLoose(tag);

      // prefix 우선 + loose prefix(하이픈/공백 제거) 보조
      const ok = a.startsWith(q) || (qLoose && aLoose.startsWith(qLoose));
      if (!ok) continue;

      out.push(c);
      if (out.length >= 30) break; // 더보기 상한
    }
    return out;
  };

  // 1) 토큰 전체로 먼저 시도
  let out = matchesPrefix(query, queryLoose);

  // 2) 없으면 prefix를 1글자씩 줄이며(최소 2) fallback
  if (out.length === 0) {
    for (let L = tokenLower.length - 1; L >= 2; L--) {
      query = tokenLower.slice(0, L);
      queryLoose = tokenLoose.slice(0, L);
      out = matchesPrefix(query, queryLoose);
      if (out.length > 0) break;
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

// ✅ 현재 타이핑 중 토큰(마지막 토큰). 추천은 2글자부터만 표시
const currentToken = useMemo(() => {
  const t = draft.details || "";
  const m = t.match(/([0-9A-Za-z가-힣-]{1,})$/);
  return m ? m[1] : "";
}, [draft.details]);

// ✅ 글을 "지우면"(길이 감소) dismissed 초기화 + 더보기 접기
const prevLenRef = useRef<number>((draft.details || "").length);
useEffect(() => {
  const len = (draft.details || "").length;
  if (len < prevLenRef.current) {
    setDismissed(new Set());
    setShowAll(false);
  }
  prevLenRef.current = len;
}, [draft.details]);

function normalizeLoose(s: string) {
  return normLoose((s || "").trim());
}

// ---------------------------------------
// ✅ typing 추천(관대): 2글자부터
// - prefix/contains/suffix 허용
// - 3-gram 윈도우(느슨한) 보조
// - 정렬: 점수(매칭 강도) → 태그 길이(긴 것 우선)
// - 짧은 포함 태그도 "후순위로 남김"
// ---------------------------------------
function typingSuggestions(tokenRaw: string): Sug[] {
  const token = (tokenRaw || "").trim();
  if (token.length < 2) return [];

  const q = token.toLowerCase();
  const qLoose = normalizeLoose(token);

  const grams3: string[] = [];
  if (qLoose.length >= 3) {
    for (let i = 0; i <= qLoose.length - 3; i++) grams3.push(qLoose.slice(i, i + 3));
  }

  const scored: Array<{ s: Sug; score: number; len: number }> = [];

  for (const c of candidatePool) {
    const tag = (c.tag || "").trim();
    if (!tag) continue;
    if (selectedTags.has(tag)) continue;
    if (dismissed.has(tag)) continue;

    const a = tag.toLowerCase();
    const aLoose = normalizeLoose(tag);

    let score = 0;

    // 강한 매칭: prefix
    if (a.startsWith(q) || (qLoose && aLoose.startsWith(qLoose))) score += 40;

    // 중간 포함
    if (a.includes(q) || (qLoose && aLoose.includes(qLoose))) score += 20;

    // 끝 포함(suffix): "끝글자 쳤을 때"도 잡힘
    if (a.endsWith(q) || (qLoose && aLoose.endsWith(qLoose))) score += 25;

    // 3-gram 윈도우 보조(타이핑 중 관대)
    if (score === 0 && grams3.length) {
      const hit3 = grams3.some((g) => aLoose.includes(g));
      if (hit3) score += 10;
    }

    if (score === 0) continue;

    scored.push({ s: c, score, len: tag.length });
  }

  scored.sort((x, y) => y.score - x.score || y.len - x.len);
  return scored.slice(0, 30).map((x) => x.s);
}

// ✅ 추천 리스트
const allSug = useMemo(() => typingSuggestions(currentToken), [
  currentToken,
  candidatePool,
  selectedTags,
  dismissed,
]);

// ✅ buildSuggestions 미사용(TS6133) 방지용: legacy 계산 (UI에는 안 씀)
const _legacySug = useMemo(
  () => buildSuggestions(currentToken, selectedTags, candidatePool, dismissed),
  [currentToken, selectedTags, candidatePool, dismissed]
);
void _legacySug;

const visibleSug = useMemo(() => {
  if (showAll) return allSug;
  return allSug.slice(0, 5);
}, [allSug, showAll]);

// ---------------------------------------
// ✅ 단어 경계에서 "완성 명칭 포함" 태그를 확정 추가
// - 공백/엔터/구두점 입력 시점에만 커밋(연산 최소)
// - 포함 기준: token.includes(tag) (연속 포함)
// - 겹치면 "가장 긴 태그만" 확정(longest-wins)
// ---------------------------------------
const lastCommittedRef = useRef<string>("");

function pickCommittedTagsFromToken(tokenRaw: string): string[] {
  const token = (tokenRaw || "").trim();
  if (!token) return [];

  const tokenLower = token.toLowerCase();
  const tokenLoose = normalizeLoose(token);

  const hits: string[] = [];
  for (const c of candidatePool) {
    const tag = (c.tag || "").trim();
    if (!tag) continue;
    if (selectedTags.has(tag)) continue;

    const tagLower = tag.toLowerCase();
    const tagLoose = normalizeLoose(tag);

    const ok =
      tokenLower.includes(tagLower) ||
      (tagLoose && tokenLoose.includes(tagLoose));

    if (ok) hits.push(tag);
  }

  // longest-wins: 긴 태그가 있으면 그 내부의 짧은 태그는 탈락
  hits.sort((a, b) => b.length - a.length);
  const kept: string[] = [];
  for (const t of hits) {
    const tl = t.toLowerCase();
    const shadowed = kept.some((k) => k.toLowerCase().includes(tl));
    if (!shadowed) kept.push(t);
  }
  return kept;
}

function commitTags(tags: string[]) {
  if (!tags.length) return;

  const next = (draft.tagsText || "").trim();
  const existing = new Set(
    next ? next.split(",").map((x) => x.trim()).filter(Boolean) : []
  );

  let changed = false;
  for (const t of tags) {
    if (!existing.has(t)) {
      existing.add(t);
      changed = true;
    }
  }
  if (!changed) return;

  const merged = Array.from(existing).join(", ");
  persist({ ...draft, tagsText: merged });
}

useEffect(() => {
  const d = draft.details || "";
  if (!d) return;

  const lastChar = d.slice(-1);
  const isBoundary = /[\s\n\r\t.,!?;:(){}\[\]"'“”‘’]/.test(lastChar);
  if (!isBoundary) return;

  // 경계 직전 토큰(1글자도 허용: a 태그 같은 것도 커밋 가능)
  const trimmed = d.replace(/[\s\n\r\t.,!?;:(){}\[\]"'“”‘’]+$/, "");
  const m = trimmed.match(/([0-9A-Za-z가-힣-]{1,})$/);
  const token = m ? m[1] : "";
  if (!token) return;

  // 같은 토큰 연속 커밋 방지
  if (lastCommittedRef.current === token) return;
  lastCommittedRef.current = token;

  const tags = pickCommittedTagsFromToken(token);
  commitTags(tags);
}, [draft.details, candidatePool, selectedTags]);

// ---------------------------------------
// ✅ 추천 클릭/삭제
// ---------------------------------------
function applySuggested(s: Sug) {
  const t = (s.tag || "").trim();
  if (!t) return;
  if (selectedTags.has(t)) return;

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