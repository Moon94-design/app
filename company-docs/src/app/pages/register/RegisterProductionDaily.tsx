import { useEffect, useMemo, useRef, useState } from "react";
import { repo } from "../../../data/repo";
import { 
  useDraftState, 
  listPersonalTags, 
  listSystemTags,
  usePreserveSelection
} from "../../../ssot";
import RecordHeaderBlock from "../../../ssot/forms/blocks/RecordHeaderBlock";
import AutoTitleBlock from "../../../ssot/forms/blocks/AutoTitleBlock";
import TagBlock from "../../../ssot/forms/blocks/TagBlock";
import ProductionLinesEditor from "./production/ProductionLinesEditor";
import ProductionIssuePanel from "./production/ProductionIssuePanel";
import ExcelUploadPanel from "./production/excel/ExcelUploadPanel";

import type { ProductionDraft, ProductionLine, ProductionRecord } from "../../../ssot";
import { defaultProductionDraft, normalizeProductionDraft, validateProductionDraft, toProductionRecord, newLine, makeProductionDocId } from "../../../domain/schema/daily/production";

type AddMode = "none" | "line";
const KEY_DRAFT = "draft_production_daily_schema_v2";

type Sug = { tag: string; source: "system" | "personal" };

export default function RegisterProductionDaily() {
  const [docs, setDocs] = useState<ProductionRecord[]>(() => repo.productionDaily<ProductionRecord>().getAll());

  const { state: raw, setState: setRaw, reset, clear } = useDraftState<any>(KEY_DRAFT, defaultProductionDraft());
  const draft: ProductionDraft = useMemo(() => normalizeProductionDraft(raw), [raw]);

  const [addMode, setAddMode] = useState<AddMode>("none");
  const [line, setLine] = useState<ProductionLine>(() => newLine());
  const [baseTick, setBaseTick] = useState(0);
  const [showExcelPanel, setShowExcelPanel] = useState(false);

  // [ANCHOR:TITLE_AUTO_START]
  // ✅ AutoTitleBlock으로 교체 (titleAuto, titleTouchedRef, buildAutoTitle 함수 제거)
  // [ANCHOR:TITLE_AUTO_END]

  const detailsRef = useRef<HTMLTextAreaElement | null>(null);
  const preserve = usePreserveSelection(detailsRef);

  function persist(next: ProductionDraft) {
    setRaw(normalizeProductionDraft(next));
  }

  function toggle(m: AddMode) {
    setAddMode((p) => (p === m ? "none" : m));
  }

  // 기준정보 후보(확장): 모든 기준등록 명칭 + (태그 인덱스 system/personal)
  const candidatePool: Sug[] = useMemo(() => {
    const agencies = repo.agencies<any>().getAll().map((x: any) => (x?.name || x?.baseName || "").trim()).filter(Boolean);
    const partners = repo.partners<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const vehicles = repo.vehicles<any>().getAll().map((x: any) => (x?.vehicleNo || "").trim()).filter(Boolean);
    const equipments = repo.equipments<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const employees = repo.employees<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const vendors = repo.vendors<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const consumables = repo.consumables<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);

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
    for (const t of equipments) push(t, "system");
    for (const t of employees) push(t, "system");
    for (const t of vendors) push(t, "system");
    for (const t of consumables) push(t, "system");

    return out.slice(0, 600);
  }, [baseTick]);

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
  // ✅ 자동 커밋 로직(단어 경계에서 "완성 명칭 포함" 태그 자동 확정)
  // - 공백/엔터/구두점 입력 시점에만 커밋
  // - longest-wins: 긴 태그 우선
  const lastCommittedRef = useRef<string>("");

  function normLoose(s: string) {
    return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
  }

  function normalizeLoose(s: string) {
    return normLoose((s || "").trim());
  }

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
  preserve(() => {
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
  });
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

  function upsertSave() {
    const vr = validateProductionDraft(draft);
    if (!vr.ok) return alert(vr.errors[0]?.message || "입력값을 확인하세요.");

    const stableId = makeProductionDocId(draft.recordDate, draft.site, draft.writerName);
    const now = new Date().toISOString();

    const finalDraft = (() => {
      const t = (draft.title || "").trim();
      if (t) return draft;
      // 제목이 비어있으면 자동완성 (AutoTitleBlock과 동일한 로직)
      const d = (draft.recordDate || "").trim();
      const n = (draft.writerName || "").trim();
      const r = (draft.writerRole || "").trim();
      const mid = [n, r].filter(Boolean).join(" ");
      const autoTitle = `${d} ${mid ? mid + " " : ""}생산일지`.trim();
      return { ...draft, title: autoTitle };
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

  // [ANCHOR:ISSUE_PANEL_START]
  // [ANCHOR:ISSUE_PANEL_END]

  const recent = useMemo(() => docs.slice(0, 30), [docs]);

  return (
    <div className="card">
      <h1 className="h1">생산일지</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {/* [ANCHOR:RECORD_HEADER_START] */}
        <RecordHeaderBlock
          recordDate={draft.recordDate}
          onChangeRecordDate={(date) => persist({ ...draft, recordDate: date })}
          writerName={draft.writerName}
          setWriterName={(name) => persist({ ...draft, writerName: name })}
          writerRole={draft.writerRole}
          setWriterRole={(role) => persist({ ...draft, writerRole: role })}
          site={draft.site}
          onChangeSite={(site) => {
            if (site === "대구" || site === "성주") {
              persist({ ...draft, site });
            }
          }}
          siteOptions={["대구", "성주"]}
          showDate={true}
          showSite={true}
          showWriter={true}
        />
        {/* [ANCHOR:RECORD_HEADER_END] */}

        <AutoTitleBlock
          recordDate={draft.recordDate}
          writerName={draft.writerName}
          writerRole={draft.writerRole}
          suffix="생산일지"
          title={draft.title}
          onTitleChange={(title) => {
            // 제목이 동일하면 persist 호출 방지 (무한 루프 방지)
            if ((title || "").trim() === (draft.title || "").trim()) return;
            persist({ ...draft, title });
          }}
          placeholder="클릭하면 자동완성"
          showLabel={true}
        />

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>내용</div>
          <textarea ref={detailsRef} className="textarea" rows={3} value={draft.details} onChange={(e) => persist({ ...draft, details: e.target.value })} />
        </div>

        <TagBlock
          scope="production"
          tagsText={draft.tagsText}
          onChangeTagsText={(next) => persist({ ...draft, tagsText: next })}
          detailsText={draft.details}
          candidates={candidatePool}
          placeholder="태그 입력"
          showChips={true}
          onAfterAdd={() => detailsRef.current?.focus()}
        />

        {/* 이슈 추가/연결 섹션 */}
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start", marginTop: 6 }}>
          <div className="p" style={{ marginTop: 0 }}>이슈</div>
          <div>
            <ProductionIssuePanel
              recordDate={draft.recordDate}
              writerName={draft.writerName}
              candidatePool={candidatePool}
              onBaseTick={() => setBaseTick((t) => t + 1)}
            />
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>생산 항목</div>

        {/* 엑셀 업로드 버튼 */}
        <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => setShowExcelPanel(!showExcelPanel)}>
            {showExcelPanel ? "엑셀 업로드 닫기" : "📁 엑셀 업로드 (Phase5-1 MVP)"}
          </button>
        </div>

        {/* 엑셀 업로드 패널 */}
        {showExcelPanel && (
          <div style={{ marginTop: 12 }}>
            <ExcelUploadPanel
              recordDate={draft.recordDate}
              onClose={() => setShowExcelPanel(false)}
            />
          </div>
        )}

        {/* [ANCHOR:LINES_EDITOR_START] */}
        <ProductionLinesEditor
          addMode={addMode}
          toggle={toggle}
          line={line}
          setLine={setLine}
          addLine={addLine}
          lines={draft.lines || []}
          removeLine={removeLine}
        />
        {/* [ANCHOR:LINES_EDITOR_END] */}
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