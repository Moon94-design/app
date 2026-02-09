/**
 * ProductionIssuePanel - 생산일지 내 이슈 추가/연결 패널
 * 
 * 역할:
 * - ISSUE_PANEL 앵커 구간을 별도 컴포넌트로 분리
 * - 이슈 추가/연결/표시 (인라인 설비/직원 등록 포함)
 * 
 * 사용처: RegisterProductionDaily
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { repo } from "../../../../data/repo";
import {
  TagInputText,
  bumpPersonalTag,
  bumpSystemTag,
  ConfirmedTagChips,
} from "../../../../ssot";

import { addIssueItem, listIssueItems, removeIssueItem } from "../../../../data/issueRepo";
import { defaultIssueDraft, normalizeIssueDraft, validateIssueDraft, toIssueItem } from "../../../../domain/schema/daily/issue";
import type { IssueDraft, IssueItem } from "../../../../ssot";
import type { EquipmentRow, EmployeeRow } from './productionTypes';
import IssueEquipmentInlineForm from "./IssueEquipmentInlineForm";
import IssueEmployeeInlineForm from "./IssueEmployeeInlineForm";

type Sug = { tag: string; source: "system" | "personal" };

function normLoose(s: string) {
  return (s || "").toLowerCase().replace(/[\s-]/g, "").trim();
}

export type ProductionIssuePanelProps = {
  recordDate: string;
  writerName: string;
  site?: "대구" | "성주";
  candidatePool: Sug[];
  onBaseTick: () => void;
};

export default function ProductionIssuePanel(props: ProductionIssuePanelProps) {
  const { recordDate, writerName, site, candidatePool, onBaseTick } = props;

  const noneOption = "__none__";
  const [items, setItems] = useState<IssueItem[]>(() => listIssueItems(recordDate, writerName));
  const [open, setOpen] = useState(false);
  const [issueDraft, setIssueDraft] = useState<IssueDraft>(() => ({
    ...defaultIssueDraft(),
    recordDate,
    writerName,
    site,
  }));

  const [equipments, setEquipments] = useState<EquipmentRow[]>(() => repo.equipments<EquipmentRow>().getAll());
  const [employees, setEmployees] = useState<EmployeeRow[]>(() => repo.employees<EmployeeRow>().getAll());

  const [showEquipForm, setShowEquipForm] = useState(false);
  const [showEmpForm, setShowEmpForm] = useState(false);

  useEffect(() => {
    setItems(listIssueItems(recordDate, writerName));
  }, [recordDate, writerName]);

  useEffect(() => {
    setIssueDraft((prev) => normalizeIssueDraft({
      ...prev,
      recordDate,
      writerName,
      site,
    }));
  }, [recordDate, writerName, site]);

  const seededRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const nextEquip = repo.equipments<EquipmentRow>().getAll();
    const nextEmp = repo.employees<EmployeeRow>().getAll();
    setEquipments(nextEquip);
    setEmployees(nextEmp);

    const agencies = repo.agencies<any>().getAll().map((x: any) => (x?.name || x?.baseName || "").trim()).filter(Boolean);
    const partners = repo.partners<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const vehicles = repo.vehicles<any>().getAll().map((x: any) => (x?.vehicleNo || "").trim()).filter(Boolean);
    const vendors = repo.vendors<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);
    const consumables = repo.consumables<any>().getAll().map((x: any) => (x?.name || "").trim()).filter(Boolean);

    const all = [...agencies, ...partners, ...vehicles, ...nextEquip.map((e) => e.name), ...nextEmp.map((e) => e.name), ...vendors, ...consumables].filter(Boolean);
    for (const name of all) {
      const n = (name || "").trim();
      if (!n || seededRef.current.has(n)) continue;
      seededRef.current.add(n);
      bumpSystemTag("issue", n);
    }
  }, [open]);

  const [issueDismissed, setIssueDismissed] = useState<Set<string>>(() => new Set());
  const [issueShowAll, setIssueShowAll] = useState(false);

  const issueSelectedTags = useMemo(() => {
    const set = new Set<string>();
    (issueDraft.tagsText || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((t) => set.add(t.startsWith("#") ? t.slice(1).trim() : t));
    return set;
  }, [issueDraft.tagsText]);

  const issueCurrentToken = useMemo(() => {
    const d = issueDraft.details || "";
    if (!d) return "";
    const match = d.match(/([0-9A-Za-z가-힣-]+)$/);
    return match ? match[1] : "";
  }, [issueDraft.details]);

  function issueTypingSuggestions(tokenRaw: string): Sug[] {
    const token = (tokenRaw || "").trim();
    if (token.length < 2) return [];

    const q = token.toLowerCase();
    const qLoose = normLoose(token);

    const grams3: string[] = [];
    if (qLoose.length >= 3) {
      for (let i = 0; i <= qLoose.length - 3; i++) grams3.push(qLoose.slice(i, i + 3));
    }

    const scored: Array<{ s: Sug; score: number; len: number }> = [];

    for (const c of candidatePool) {
      const tag = (c.tag || "").trim();
      if (!tag) continue;
      if (issueSelectedTags.has(tag)) continue;
      if (issueDismissed.has(tag)) continue;

      const a = tag.toLowerCase();
      const aLoose = normLoose(tag);

      let score = 0;

      if (a.startsWith(q) || (qLoose && aLoose.startsWith(qLoose))) score += 40;
      if (a.includes(q) || (qLoose && aLoose.includes(qLoose))) score += 20;
      if (a.endsWith(q) || (qLoose && aLoose.endsWith(qLoose))) score += 25;

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

  const issueAllSug = useMemo(() => issueTypingSuggestions(issueCurrentToken), [issueCurrentToken, candidatePool, issueSelectedTags, issueDismissed]);
  const issueVisibleSug = useMemo(() => (issueShowAll ? issueAllSug : issueAllSug.slice(0, 5)), [issueAllSug, issueShowAll]);

  const issuePrevLenRef = useRef<number>((issueDraft.details || "").length);
  useEffect(() => {
    const len = (issueDraft.details || "").length;
    if (len < issuePrevLenRef.current) {
      setIssueDismissed(new Set());
      setIssueShowAll(false);
    }
    issuePrevLenRef.current = len;
  }, [issueDraft.details]);

  const issueLastCommittedRef = useRef<string>("");

  function normalizeLoose(s: string) {
    return normLoose((s || "").trim());
  }

  function issuePickCommittedTagsFromToken(tokenRaw: string): string[] {
    const token = (tokenRaw || "").trim();
    if (!token) return [];

    const tokenLower = token.toLowerCase();
    const tokenLoose = normalizeLoose(token);

    const hits: string[] = [];
    for (const c of candidatePool) {
      const tag = (c.tag || "").trim();
      if (!tag) continue;
      if (issueSelectedTags.has(tag)) continue;

      const tagLower = tag.toLowerCase();
      const tagLoose = normalizeLoose(tag);

      const ok = tokenLower.includes(tagLower) || (tagLoose && tokenLoose.includes(tagLoose));

      if (ok) hits.push(tag);
    }

    hits.sort((a, b) => b.length - a.length);
    const kept: string[] = [];
    for (const t of hits) {
      const tl = t.toLowerCase();
      const shadowed = kept.some((k) => k.toLowerCase().includes(tl));
      if (!shadowed) kept.push(t);
    }
    return kept;
  }

  function issueCommitTags(tags: string[]) {
    if (!tags.length) return;

    const next = (issueDraft.tagsText || "").trim();
    const existing = new Set(next ? next.split(",").map((x) => x.trim()).filter(Boolean) : []);

    let changed = false;
    for (const t of tags) {
      if (!existing.has(t)) {
        existing.add(t);
        changed = true;
      }
    }
    if (!changed) return;

    const merged = Array.from(existing).join(", ");
    updateField("tagsText", merged as any);
  }

  useEffect(() => {
    const d = issueDraft.details || "";
    if (!d) return;

    const lastChar = d.slice(-1);
    const isBoundary = /[\s\n\r\t.,!?;:(){}\[\]"'""'']/.test(lastChar);
    if (!isBoundary) return;

    const trimmed = d.replace(/[\s\n\r\t.,!?;:(){}\[\]"'""'']+$/, "");
    const m = trimmed.match(/([0-9A-Za-z가-힣-]{1,})$/);
    const token = m ? m[1] : "";
    if (!token) return;

    if (issueLastCommittedRef.current === token) return;
    issueLastCommittedRef.current = token;

    const tags = issuePickCommittedTagsFromToken(token);
    issueCommitTags(tags);
  }, [issueDraft.details, candidatePool, issueSelectedTags]);

  function applyIssueSuggested(s: Sug) {
    const t = (s.tag || "").trim();
    if (!t) return;
    if (issueSelectedTags.has(t)) return;
    if (s.source === "system") bumpSystemTag("issue", t);
    else bumpPersonalTag("issue", t);

    const next = (issueDraft.tagsText || "").trim();
    const merged = next ? `${next}, ${t}` : t;
    updateField("tagsText", merged as any);
  }

  function dismissIssueSuggested(tag: string) {
    const t = (tag || "").trim();
    if (!t) return;
    setIssueDismissed((prev) => {
      const n = new Set(prev);
      n.add(t);
      return n;
    });
  }

  function updateField<K extends keyof IssueDraft>(k: K, v: IssueDraft[K]) {
    setIssueDraft((p) => ({ ...p, [k]: v }));
  }

  function submitIssue() {
    const vr = validateIssueDraft(issueDraft);
    if (!vr.ok) return alert(vr.errors[0]?.message || "입력값을 확인하세요.");

    const tags = (issueDraft.tagsText || "")
      .split(",")
      .map((x) => (x || "").trim())
      .filter(Boolean)
      .map((x) => (x.startsWith("#") ? x.slice(1).trim() : x));

    for (const t of tags) {
      const isSystem = candidatePool.some((c) => c.tag === t && c.source === "system");
      if (isSystem) bumpSystemTag("issue", t);
      else bumpPersonalTag("issue", t);
    }

    const item = toIssueItem(issueDraft);
    addIssueItem(issueDraft.recordDate, issueDraft.writerName, item);
    setItems(listIssueItems(issueDraft.recordDate, issueDraft.writerName));
    setOpen(false);
    setIssueDraft(defaultIssueDraft());
    alert("이슈가 저장되었습니다.");
  }

  function doRemove(id: string) {
    removeIssueItem(recordDate, writerName, id);
    setItems(listIssueItems(recordDate, writerName));
  }

  const issueShowSuggestions = !!issueDraft.details && issueVisibleSug.length > 0;

  return (
    <div>
      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="btn" onClick={() => setOpen((v) => !v)}>
          {open ? "닫기" : "이슈 추가"}
        </button>
      </div>

      {open ? (
        <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
              <div className="p">분류</div>
              <div className="row">
                {(["quality", "equipment", "safety"] as const).map((c) => (
                  <button key={c} type="button" className={`selBtn ${issueDraft.category === c ? "active" : ""}`} onClick={() => updateField("category", c)}>
                    {c === "quality" ? "품질" : c === "equipment" ? "설비" : "안전"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
              <div className="p">제목</div>
              <input className="input" value={issueDraft.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
              <div className="p">상세</div>
              <textarea className="textarea" rows={3} value={issueDraft.details} onChange={(e) => updateField("details", e.target.value)} />
            </div>

            {issueShowSuggestions ? (
              <div style={{ padding: "8px 12px", background: "rgba(0,0,0,0.35)", borderRadius: 6, fontSize: 13 }}>
                <div style={{ marginBottom: 6, opacity: 0.7 }}>추천 태그</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {issueVisibleSug.map((s) => {
                    const isSystem = s.source === "system";
                    return (
                      <div
                        key={`${s.source}:${s.tag}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 999,
                          overflow: "hidden",
                          border: isSystem ? "1px solid rgba(70,130,255,0.65)" : "1px solid rgba(255,255,255,0.10)",
                          background: isSystem ? "rgba(70,130,255,0.20)" : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <button
                          type="button"
                          className="btn"
                          style={{
                            borderRadius: 0,
                            background: "transparent",
                            padding: "8px 10px",
                            flex: 3,
                            textAlign: "left",
                          }}
                          onClick={() => applyIssueSuggested(s)}
                        >
                          #{s.tag}
                        </button>

                        <button
                          type="button"
                          className="btn"
                          style={{
                            borderRadius: 0,
                            background: "rgba(255,70,70,0.18)",
                            borderLeft: "1px solid rgba(255,70,70,0.25)",
                            padding: "8px 10px",
                            flex: 1,
                            minWidth: 46,
                          }}
                          title="추천에서 제외"
                          onClick={() => dismissIssueSuggested(s.tag)}
                        >
                          🗑
                        </button>
                      </div>
                    );
                  })}

                  {issueAllSug.length > 5 ? (
                    <button type="button" className="btn" onClick={() => setIssueShowAll((v) => !v)}>
                      {issueShowAll ? "접기" : `더보기(${issueAllSug.length})`}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
              <div className="p">태그</div>
              <div>
                <ConfirmedTagChips
                  tagsText={issueDraft.tagsText}
                  onRemove={(t) => {
                    const arr = (issueDraft.tagsText || "")
                      .split(",")
                      .map((y) => y.trim())
                      .filter(Boolean)
                      .filter((y) => y !== t);
                    updateField("tagsText", arr.join(", ") as any);
                  }}
                  compact={true}
                />
                <TagInputText value={issueDraft.tagsText} onChange={(next) => updateField("tagsText", next)} scope="issue" showChips={false} />
              </div>
            </div>

            {/* category specific */}
            {issueDraft.category === "quality" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">종류</div>
                  <select className="input" value={issueDraft.q_kind || ""} onChange={(e) => updateField("q_kind", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="압축품">압축품</option>
                    <option value="분쇄품">분쇄품</option>
                    <option value="펠렛">펠렛</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">품목</div>
                  <select className="input" value={issueDraft.q_item || ""} onChange={(e) => updateField("q_item", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="PP">PP</option>
                    <option value="PE">PE</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">심각도</div>
                  <select className="input" value={issueDraft.q_severity} onChange={(e) => updateField("q_severity", e.target.value as any)}>
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">발생원인</div>
                  <textarea className="textarea" rows={2} value={issueDraft.q_cause} onChange={(e) => updateField("q_cause", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">조치내용</div>
                  <textarea className="textarea" rows={2} value={issueDraft.q_action} onChange={(e) => updateField("q_action", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">예방대책</div>
                  <textarea className="textarea" rows={2} value={issueDraft.q_prevent} onChange={(e) => updateField("q_prevent", e.target.value)} />
                </div>
              </>
            ) : null}

            {issueDraft.category === "equipment" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">설비</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                    <select
                      className="input"
                      value={issueDraft.e_equipmentId || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id === noneOption) {
                          updateField("e_equipmentId", noneOption);
                          updateField("e_equipmentLabel", "");
                          return;
                        }
                        const found = equipments.find((eq) => eq.id === id);
                        updateField("e_equipmentId", id);
                        updateField("e_equipmentLabel", found?.name || "");
                      }}
                    >
                      <option value="">선택</option>
                      <option value={noneOption}>해당없음</option>
                      {equipments.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                    <button type="button" className="btn" onClick={() => setShowEquipForm((v) => !v)}>
                      {showEquipForm ? "닫기" : "추가"}
                    </button>
                  </div>
                </div>

                <IssueEquipmentInlineForm
                  show={showEquipForm}
                  onClose={() => setShowEquipForm(false)}
                  equipments={equipments}
                  onUpdateEquipments={(list) => setEquipments(list)}
                  onSubmitSuccess={(equipId, equipName) => {
                    updateField("e_equipmentId", equipId);
                    updateField("e_equipmentLabel", equipName);
                    onBaseTick();
                  }}
                />

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">증상</div>
                  <textarea className="textarea" rows={2} value={issueDraft.e_symptom} onChange={(e) => updateField("e_symptom", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">조치</div>
                  <textarea className="textarea" rows={2} value={issueDraft.e_action} onChange={(e) => updateField("e_action", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">예방</div>
                  <textarea className="textarea" rows={2} value={issueDraft.e_prevent} onChange={(e) => updateField("e_prevent", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">상태</div>
                  <select className="input" value={issueDraft.e_status} onChange={(e) => updateField("e_status", e.target.value as any)}>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                  </select>
                </div>
              </>
            ) : null}

            {issueDraft.category === "safety" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">직원</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                    <select
                      className="input"
                      value={issueDraft.s_employeeId || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id === noneOption) {
                          updateField("s_employeeId", noneOption);
                          updateField("s_employeeLabel", "");
                          return;
                        }
                        const found = employees.find((emp) => emp.id === id);
                        updateField("s_employeeId", id);
                        updateField("s_employeeLabel", found?.name || "");
                      }}
                    >
                      <option value="">선택</option>
                      <option value={noneOption}>해당없음</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                    <button type="button" className="btn" onClick={() => setShowEmpForm((v) => !v)}>
                      {showEmpForm ? "닫기" : "추가"}
                    </button>
                  </div>
                </div>

                <IssueEmployeeInlineForm
                  show={showEmpForm}
                  onClose={() => setShowEmpForm(false)}
                  employees={employees}
                  onUpdateEmployees={(list) => setEmployees(list)}
                  onSubmitSuccess={(empId, empName) => {
                    updateField("s_employeeId", empId);
                    updateField("s_employeeLabel", empName);
                    onBaseTick();
                  }}
                />

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">위험도</div>
                  <select className="input" value={issueDraft.s_risk} onChange={(e) => updateField("s_risk", e.target.value as any)}>
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="p">장소</div>
                  <input className="input" value={issueDraft.s_location} onChange={(e) => updateField("s_location", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">조치</div>
                  <textarea className="textarea" rows={2} value={issueDraft.s_action} onChange={(e) => updateField("s_action", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
                  <div className="p">예방</div>
                  <textarea className="textarea" rows={2} value={issueDraft.s_prevent} onChange={(e) => updateField("s_prevent", e.target.value)} />
                </div>
              </>
            ) : null}

            <div className="row">
              <button type="button" className="btn primary" onClick={submitIssue}>저장</button>
              <button type="button" className="btn" onClick={() => { setOpen(false); setIssueDraft(defaultIssueDraft()); }}>취소</button>
            </div>
          </div>
        </div>
      ) : null}

      {items.length ? (
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {items.map((it) => (
            <div key={it.id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{it.title}{it.site ? ` (${it.site})` : ""}</div>
                  <div className="p" style={{ marginTop: 6, opacity: 0.8 }}>{it.category} · {it.createdAt}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn" onClick={() => alert(it.details || "")} title="상세">보기</button>
                  <button type="button" className="btn danger" onClick={() => doRemove(it.id)}>삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
