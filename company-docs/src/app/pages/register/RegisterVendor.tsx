import { useMemo, useState } from "react";
import { formatPhoneInput } from "../../../base/utils/phone";
import { loadJson, saveJson } from "../../../base/utils/pageStorage";

type Status = "거래중" | "보류" | "중단";
type Scope = "기계" | "전기" | "통신" | "소모품" | "정비" | "기타";

type Contact = { id: string; name: string; role: string; phone: string; note: string };

type Vendor = {
  id: string;
  name: string;
  status: Status;
  region: string;
  scopes: Scope[];
  otherScopeText: string;
  contacts: Contact[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  name: string;
  status: Status;
  region: string;
  scopes: Scope[];
  otherScopeText: string;
  tagsText: string;
  notes: string;
  contacts: Contact[];
};

const STORAGE_KEY = "local_vendors_v1";
const DRAFT_KEY = "draft_vendor_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `V_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

const SCOPE_OPTIONS: Scope[] = ["기계","전기","통신","소모품","정비","기타"];

function defaultDraft(): Draft {
  return {
    name: "",
    status: "거래중",
    region: "",
    scopes: ["정비"],
    otherScopeText: "",
    tagsText: "",
    notes: "",
    contacts: [{ id: newId(), name: "", role: "담당", phone: "", note: "" }],
  };
}

export default function RegisterVendor() {
  const [vendors, setVendors] = useState<Vendor[]>(() => loadJson(STORAGE_KEY, [] as Vendor[]));
  const initDraft = useMemo(() => loadJson<Draft>(DRAFT_KEY, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(DRAFT_KEY, next);
  }

  const tags = useMemo(() => (draft.tagsText || "").split(",").map((t) => t.trim()).filter(Boolean), [draft.tagsText]);

  function toggleScope(s: Scope) {
    const has = draft.scopes.includes(s);
    const nextScopes = has ? draft.scopes.filter((x) => x !== s) : [...draft.scopes, s];
    const next = { ...draft, scopes: nextScopes };
    if (!nextScopes.includes("기타")) next.otherScopeText = "";
    persist(next);
  }

  function addContact() {
    persist({ ...draft, contacts: [...draft.contacts, { id: newId(), name: "", role: "담당", phone: "", note: "" }] });
  }
  function removeContact(id: string) {
    const next = draft.contacts.filter((c) => c.id !== id);
    if (next.length === 0) next.push({ id: newId(), name: "", role: "담당", phone: "", note: "" });
    persist({ ...draft, contacts: next });
  }
  function updateContact(id: string, patch: Partial<Contact>) {
    persist({ ...draft, contacts: draft.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function resetDraft() {
    persist(defaultDraft());
  }

  function submit() {
    if (!draft.name.trim()) return alert("업체명을 입력하세요.");
    if (!draft.region.trim()) return alert("지역을 입력하세요.");
    if (draft.scopes.length === 0) return alert("서비스 범위를 최소 1개 선택하세요.");
    if (draft.scopes.includes("기타") && !draft.otherScopeText.trim()) return alert("기타 내용을 입력하세요.");

    const cleanContacts = draft.contacts
      .map((c) => ({ ...c, name: c.name.trim(), role: c.role.trim(), phone: c.phone.trim(), note: c.note.trim() }))
      .filter((c) => c.name || c.phone || c.note);
    if (!cleanContacts.some((c) => !!c.phone)) return alert("연락처를 입력하세요.");

    const now = new Date().toISOString();
    const v: Vendor = {
      id: newId(),
      name: draft.name.trim(),
      status: draft.status,
      region: draft.region.trim(),
      scopes: draft.scopes,
      otherScopeText: draft.otherScopeText.trim(),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      tags,
      createdAt: now,
      updatedAt: now,
    };

    const next = [v, ...vendors];
    setVendors(next);
    saveJson(STORAGE_KEY, next);
    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function removeVendor(id: string) {
    const next = vendors.filter((x) => x.id !== id);
    setVendors(next);
    saveJson(STORAGE_KEY, next);
  }

  return (
    <div className="card">
      <h1 className="h1">정비/서비스 업체 등록</h1>

      <div style={{ marginTop: 14, display:"grid", gap:10 }}>
        <div><div className="p" style={{ marginTop:0 }}>업체명</div><input className="input" value={draft.name} onChange={(e) => persist({ ...draft, name: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop:0 }}>상태</div>
          <div className="row" style={{ marginTop:8 }}>
            {(["거래중","보류","중단"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.status===s?"active":""}`} onClick={() => persist({ ...draft, status: s })}>{s}</button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop:0 }}>지역</div><input className="input" value={draft.region} onChange={(e) => persist({ ...draft, region: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop:0 }}>서비스 범위</div>
          <div className="row" style={{ marginTop:8 }}>
            {SCOPE_OPTIONS.map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.scopes.includes(s)?"active":""}`} onClick={() => toggleScope(s)}>{s}</button>
            ))}
          </div>
          {draft.scopes.includes("기타") ? (
            <div style={{ marginTop:10 }}>
              <input className="input" value={draft.otherScopeText} onChange={(e) => persist({ ...draft, otherScopeText: e.target.value })} placeholder="기타 내용" />
            </div>
          ) : null}
        </div>

        <div><div className="p" style={{ marginTop:0 }}>태그(쉼표)</div><input className="input" value={draft.tagsText} onChange={(e) => persist({ ...draft, tagsText: e.target.value })} /></div>

        <div><div className="p" style={{ marginTop:0 }}>참고사항</div><textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => persist({ ...draft, notes: e.target.value })} placeholder="참고사항" /></div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize:15 }}>연락처</div>

        {draft.contacts.map((c) => (
          <div key={c.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"grid", gap:10 }}>
              <input className="input" value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} placeholder="이름" />
              <input className="input" value={c.role} onChange={(e) => updateContact(c.id, { role: e.target.value })} placeholder="역할" />
              <input className="input" inputMode="numeric" value={c.phone} onChange={(e) => updateContact(c.id, { phone: formatPhoneInput(e.target.value) })} placeholder="숫자만 입력 가능" />
              <input className="input" value={c.note} onChange={(e) => updateContact(c.id, { note: e.target.value })} placeholder="참고사항" />
            </div>
            <div className="row">
              <button type="button" className="btn danger" onClick={() => removeContact(c.id)} disabled={draft.contacts.length <= 1}>삭제</button>
            </div>
          </div>
        ))}

        <div className="row"><button type="button" className="btn" onClick={addContact}>연락처 추가</button></div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize:15 }}>저장된 업체</div>
        {vendors.length === 0 ? <p className="p">아직 없음</p> : vendors.map((v) => (
          <div key={v.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div><div style={{ fontWeight:900 }}>{v.name}</div><div className="p" style={{ marginTop:6 }}>{v.region} · {v.status}</div></div>
              <button type="button" className="btn danger" onClick={() => removeVendor(v.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
