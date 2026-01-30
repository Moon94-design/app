import { useMemo, useState } from "react";
import { formatPhoneInput } from "../../../base/utils/phone";

type Status = "거래중" | "보류" | "중단";
type AgencyType = "감독/점검" | "검사/측정" | "민원/신고 대응" | "지원사업/보조금" | "기타";
type Scope = "환경" | "품질" | "안전" | "유통/표기" | "세무/회계" | "지원사업" | "기타";

type Contact = { id: string; name: string; role: string; phone: string; email: string; note: string };
type Agency = {
  id: string;
  name: string;
  status: Status;
  agencyType: AgencyType;
  agencyTypeOther: string;
  region: string;
  scopes: Scope[];
  scopeNotes: Record<string, string>;
  scopeOther: string;
  contacts: Contact[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "local_agencies_v1";
const KEY_DRAFT = "draft_agency_v1";

const TYPE_OPTIONS: AgencyType[] = ["감독/점검","검사/측정","민원/신고 대응","지원사업/보조금","기타"];
const SCOPE_OPTIONS: Scope[] = ["환경","품질","안전","유통/표기","세무/회계","지원사업","기타"];

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `A_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function loadAgencies(): Agency[] { return loadJson(STORAGE_KEY, [] as Agency[]); }
function saveAgencies(list: Agency[]) { saveJson(STORAGE_KEY, list); }

type Draft = {
  name: string;
  status: Status;
  agencyType: AgencyType;
  agencyTypeOther: string;
  region: string;
  scopes: Scope[];
  scopeNotes: Record<string,string>;
  scopeOther: string;
  contacts: Contact[];
  notes: string;
};

function defaultDraft(): Draft {
  return {
    name: "",
    status: "거래중",
    agencyType: "감독/점검",
    agencyTypeOther: "",
    region: "",
    scopes: ["환경"],
    scopeNotes: { 환경: "" },
    scopeOther: "",
    contacts: [{ id: newId(), name: "", role: "담당", phone: "", email: "", note: "" }],
    notes: "",
  };
}

export default function RegisterAgency() {
  const [list, setList] = useState<Agency[]>(() => loadAgencies());
  const initialDraft = useMemo(() => loadJson<Draft>(KEY_DRAFT, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initialDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(KEY_DRAFT, next);
  }

  const selectedScopes = useMemo(() => draft.scopes.slice(), [draft.scopes]);

  function toggleScope(s: Scope) {
    const has = draft.scopes.includes(s);
    const nextScopes = has ? draft.scopes.filter((x) => x !== s) : [...draft.scopes, s];

    const nextNotes = { ...draft.scopeNotes };
    if (!has) nextNotes[s] = nextNotes[s] || "";
    else delete nextNotes[s];

    const next = { ...draft, scopes: nextScopes, scopeNotes: nextNotes };
    if (!nextScopes.includes("기타")) next.scopeOther = "";
    persist(next);
  }

  function updateScopeNote(scope: Scope, text: string) {
    persist({ ...draft, scopeNotes: { ...draft.scopeNotes, [scope]: text } });
  }

  function addContact() {
    persist({ ...draft, contacts: [...draft.contacts, { id: newId(), name: "", role: "담당", phone: "", email: "", note: "" }] });
  }
  function removeContact(id: string) {
    const next = draft.contacts.filter((c) => c.id !== id);
    if (next.length === 0) next.push({ id: newId(), name: "", role: "담당", phone: "", email: "", note: "" });
    persist({ ...draft, contacts: next });
  }
  function updateContact(id: string, patch: Partial<Contact>) {
    persist({ ...draft, contacts: draft.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function resetDraft() {
    persist(defaultDraft());
  }

  function submit() {
    if (!draft.name.trim()) return alert("기관명을 입력하세요.");
    if (!draft.region.trim()) return alert("지역을 입력하세요.");
    if (draft.agencyType === "기타" && !draft.agencyTypeOther.trim()) return alert("기타 유형을 입력하세요.");
    if (draft.scopes.length === 0) return alert("업무범위를 선택하세요.");
    if (draft.scopes.includes("기타") && !draft.scopeOther.trim()) return alert("업무범위(기타) 내용을 입력하세요.");
    for (const s of draft.scopes) if (!(draft.scopeNotes[s] || "").trim()) return alert(`업무범위 "${s}" 설명을 입력하세요.`);

    const cleanContacts = draft.contacts
      .map((c) => ({ ...c, name: c.name.trim(), role: c.role.trim(), phone: c.phone.trim(), email: c.email.trim(), note: c.note.trim() }))
      .filter((c) => c.name || c.phone || c.email || c.note);
    if (!cleanContacts.some((c) => c.phone || c.email)) return alert("연락처를 입력하세요.");

    const now = new Date().toISOString();
    const agency: Agency = {
      id: newId(),
      name: draft.name.trim(),
      status: draft.status,
      agencyType: draft.agencyType,
      agencyTypeOther: draft.agencyTypeOther.trim(),
      region: draft.region.trim(),
      scopes: draft.scopes,
      scopeNotes: Object.fromEntries(draft.scopes.map((s) => [s, (draft.scopeNotes[s] || "").trim()])),
      scopeOther: draft.scopeOther.trim(),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const next = [agency, ...list];
    setList(next);
    saveAgencies(next);
    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function removeAgency(id: string) {
    const next = list.filter((x) => x.id !== id);
    setList(next);
    saveAgencies(next);
  }

  return (
    <div className="card">
      <h1 className="h1">관계기관 등록</h1>

      <div style={{ marginTop: 14, display:"grid", gap:10 }}>
        <div><div className="p" style={{ marginTop:0 }}>기관명</div><input className="input" value={draft.name} onChange={(e) => persist({ ...draft, name: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop:0 }}>상태</div>
          <div className="row" style={{ marginTop:8 }}>
            {(["거래중","보류","중단"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.status===s?"active":""}`} onClick={() => persist({ ...draft, status: s })}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop:0 }}>기관 유형</div>
          <div className="row" style={{ marginTop:8 }}>
            {TYPE_OPTIONS.map((t) => (
              <button key={t} type="button" className={`selBtn ${draft.agencyType===t?"active":""}`} onClick={() => persist({ ...draft, agencyType: t })}>{t}</button>
            ))}
          </div>
          {draft.agencyType === "기타" ? (
            <div style={{ marginTop:10 }}>
              <input className="input" value={draft.agencyTypeOther} onChange={(e) => persist({ ...draft, agencyTypeOther: e.target.value })} placeholder="기타 유형" />
            </div>
          ) : null}
        </div>

        <div><div className="p" style={{ marginTop:0 }}>지역</div><input className="input" value={draft.region} onChange={(e) => persist({ ...draft, region: e.target.value })} /></div>

        <div className="divider" />

        <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
          <div className="h1" style={{ fontSize:15 }}>업무범위</div>

          <div className="row" style={{ marginTop:8 }}>
            {SCOPE_OPTIONS.map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.scopes.includes(s)?"active":""}`} onClick={() => toggleScope(s)}>{s}</button>
            ))}
          </div>

          {draft.scopes.includes("기타") ? (
            <div style={{ marginTop:10 }}>
              <input className="input" value={draft.scopeOther} onChange={(e) => persist({ ...draft, scopeOther: e.target.value })} placeholder="업무범위(기타) 내용" />
            </div>
          ) : null}

          <div style={{ marginTop:12, display:"grid", gap:10 }}>
            {selectedScopes.map((s) => (
              <div key={s}>
                <div className="p" style={{ marginTop:0 }}>{s} 설명</div>
                <input className="input" value={draft.scopeNotes[s] || ""} onChange={(e) => updateScopeNote(s, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
          <div className="h1" style={{ fontSize:15 }}>연락처</div>

          {draft.contacts.map((c) => (
            <div key={c.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
              <div style={{ display:"grid", gap:10 }}>
                <input className="input" value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} placeholder="이름" />
                <input className="input" value={c.role} onChange={(e) => updateContact(c.id, { role: e.target.value })} placeholder="직책/부서" />
                <input className="input" inputMode="numeric" value={c.phone} onChange={(e) => updateContact(c.id, { phone: formatPhoneInput(e.target.value) })} placeholder="숫자만 입력 가능" />
                <input className="input" value={c.email} onChange={(e) => updateContact(c.id, { email: e.target.value })} placeholder="이메일" />
                <input className="input" value={c.note} onChange={(e) => updateContact(c.id, { note: e.target.value })} placeholder="참고사항" />
              </div>

              <div className="row">
                <button type="button" className="btn danger" onClick={() => removeContact(c.id)} disabled={draft.contacts.length <= 1}>삭제</button>
              </div>
            </div>
          ))}

          <div className="row">
            <button type="button" className="btn" onClick={addContact}>연락처 추가</button>
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop:0 }}>참고사항</div>
          <textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => persist({ ...draft, notes: e.target.value })} placeholder="참고사항" />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize:15 }}>저장된 기관</div>
        {list.length === 0 ? <p className="p">아직 없음</p> : list.map((a) => (
          <div key={a.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div><div style={{ fontWeight:900 }}>{a.name}</div><div className="p" style={{ marginTop:6 }}>{a.region}</div></div>
              <button type="button" className="btn danger" onClick={() => removeAgency(a.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
