import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import { formatPhoneInput } from "../../../base/utils/phone";
import NameAutocomplete, { type NameItem } from "../../../base/components/NameAutocomplete";

type AgencyScope = "관계기관" | "지원사업" | "보조금" | "기타";
type Status = "거래중" | "보류" | "중단";

export type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  note: string;
};

export type Agency = {
  id: string;

  // ✅ 기존 페이지 호환용 표시명
  name: string;

  // ✅ 새 구조(메인/세부)
  baseName: string;
  detailTag: string;

  status: Status;
  scopes: AgencyScope[];
  scopeNotes: Record<string, string>;
  contacts: Contact[];
  region: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const KEY_DRAFT = "draft_agency_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `A_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function displayName(baseName: string, detailTag: string) {
  const b = (baseName || "").trim();
  const t = (detailTag || "").trim();
  return t ? `${b} · ${t}` : b;
}

type Draft = {
  baseName: string;
  detailTag: string;
  status: Status;
  region: string;
  scopes: AgencyScope[];
  scopeNotes: Record<string, string>;
  contacts: Contact[];
  notes: string;
};

function defaultDraft(): Draft {
  return {
    baseName: "",
    detailTag: "",
    status: "거래중",
    region: "",
    scopes: ["관계기관"],
    scopeNotes: { 관계기관: "" },
    contacts: [{ id: newId(), name: "", role: "담당", phone: "", email: "", note: "" }],
    notes: "",
  };
}

export type AgencyFormProps = {
  draftKey?: string;
  onSaved?: (agency: Agency) => void;
  hideList?: boolean;
  hideHeader?: boolean;
};

export function AgencyForm(props: AgencyFormProps) {
  const draftKey = props.draftKey || KEY_DRAFT;

  const [list, setList] = useState<Agency[]>(() => repo.agencies<Agency>().getAll());
  const initialDraft = useMemo(() => loadJson<Draft>(draftKey, defaultDraft()), [draftKey]);
  const [draft, setDraft] = useState<Draft>(() => initialDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(draftKey, next);
  }

  const nameItems: NameItem[] = useMemo(() => list.map((a) => ({ id: a.id, baseName: a.baseName, detailTag: a.detailTag || "" })), [list]);

  function renameAgency(id: string, nextBase: string, nextTag: string) {
    const now = new Date().toISOString();
    const baseName = nextBase.trim();
    const detailTag = nextTag.trim();
    const next = list.map((x) => (x.id === id ? { ...x, baseName, detailTag, name: displayName(baseName, detailTag), updatedAt: now } : x));
    setList(next);
    repo.agencies<Agency>().setAll(next);
  }

  function toggleScope(s: AgencyScope) {
    const has = draft.scopes.includes(s);
    const nextScopes = has ? draft.scopes.filter((x) => x !== s) : [...draft.scopes, s];
    const nextNotes = { ...draft.scopeNotes };
    if (!has) nextNotes[s] = nextNotes[s] || "";
    else delete nextNotes[s];
    persist({ ...draft, scopes: nextScopes.length ? nextScopes : ["관계기관"], scopeNotes: nextNotes });
  }

  function updateScopeNote(s: AgencyScope, txt: string) {
    persist({ ...draft, scopeNotes: { ...draft.scopeNotes, [s]: txt } });
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
    const base = (draft.baseName || "").trim();
    if (!base) return alert("기관명을 입력하세요.");
    if (!draft.region.trim()) return alert("지역을 입력하세요.");
    if (draft.scopes.length === 0) return alert("업무범위를 선택하세요.");
    for (const s of draft.scopes) if (!(draft.scopeNotes[s] || "").trim()) return alert(`업무범위 "${s}" 설명을 입력하세요.`);

    const cleanContacts = draft.contacts
      .map((c) => ({ ...c, name: c.name.trim(), role: c.role.trim(), phone: c.phone.trim(), email: c.email.trim(), note: c.note.trim() }))
      .filter((c) => c.name || c.phone || c.email || c.note);
    if (!cleanContacts.some((c) => c.phone || c.email)) return alert("연락처를 입력하세요.");

    const tag = (draft.detailTag || "").trim();
    const exists = list.some((x) => x.baseName.trim() === base && (x.detailTag || "").trim() === tag);
    if (exists) return alert("동일한 기관명이 이미 존재합니다. 드롭다운에서 수정하거나 기존 항목을 사용하세요.");

    const now = new Date().toISOString();
    const row: Agency = {
      id: newId(),
      baseName: base,
      detailTag: tag,
      name: displayName(base, tag),
      status: draft.status,
      region: draft.region.trim(),
      scopes: draft.scopes,
      scopeNotes: Object.fromEntries(draft.scopes.map((s) => [s, (draft.scopeNotes[s] || "").trim()])),
      contacts: cleanContacts,
      notes: draft.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const next = [row, ...list];
    setList(next);
    repo.agencies<Agency>().setAll(next);

    props.onSaved?.(row);

    resetDraft();
    alert("저장되었습니다.");
  }

  function removeAgency(id: string) {
    const next = list.filter((x) => x.id !== id);
    setList(next);
    repo.agencies<Agency>().setAll(next);
  }

  return (
    <div className="card" style={{ padding: props.hideHeader ? 0 : undefined }}>
      {!props.hideHeader ? <h1 className="h1">관계기관 등록</h1> : null}

      <div style={{ marginTop: props.hideHeader ? 0 : 14, display: "grid", gap: 10 }}>
        <NameAutocomplete
          label="기관명(메인)"
          value={draft.baseName}
          onChange={(v) => persist({ ...draft, baseName: v })}
          items={nameItems}
          onPick={(it) => persist({ ...draft, baseName: it.baseName })}
          onRename={renameAgency}
        />

        <div>
          <div className="p" style={{ marginTop: 0 }}>세부태그(선택)</div>
          <input className="input" value={draft.detailTag} onChange={(e) => persist({ ...draft, detailTag: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>상태</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["거래중", "보류", "중단"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.status === s ? "active" : ""}`} onClick={() => persist({ ...draft, status: s })}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>지역</div>
          <input className="input" value={draft.region} onChange={(e) => persist({ ...draft, region: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>업무범위(복수)</div>
          <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
            {(["관계기관", "지원사업", "보조금", "기타"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.scopes.includes(s) ? "active" : ""}`} onClick={() => toggleScope(s)}>
                {s}
              </button>
            ))}
          </div>

          {draft.scopes.length ? (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {draft.scopes.map((s) => (
                <div key={s}>
                  <div className="p" style={{ marginTop: 0 }}>{s} 설명</div>
                  <input className="input" value={draft.scopeNotes[s] || ""} onChange={(e) => updateScopeNote(s, e.target.value)} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>비고</div>
          <textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => persist({ ...draft, notes: e.target.value })} />
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>연락처</div>

        {draft.contacts.map((c) => (
          <div key={c.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <input className="input" value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} placeholder="담당자명" />
              <input className="input" value={c.role} onChange={(e) => updateContact(c.id, { role: e.target.value })} placeholder="역할" />
              <input className="input" inputMode="numeric" value={c.phone} onChange={(e) => updateContact(c.id, { phone: formatPhoneInput(e.target.value) })} placeholder="전화(숫자만)" />
              <input className="input" value={c.email} onChange={(e) => updateContact(c.id, { email: e.target.value })} placeholder="이메일(선택)" />
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

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      {!props.hideList ? (
        <>
          <div className="divider" />
          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="h1" style={{ fontSize: 15 }}>저장된 기관</div>
            {list.length === 0 ? (
              <p className="p">아직 없음</p>
            ) : (
              list.map((x) => (
                <div key={x.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        {x.baseName}{x.detailTag ? <span style={{ marginLeft: 8, opacity: 0.7 }}>· {x.detailTag}</span> : null}
                      </div>
                      <div className="p" style={{ marginTop: 6 }}>{x.status} · {x.region}</div>
                    </div>
                    <button type="button" className="btn danger" onClick={() => removeAgency(x.id)}>삭제</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function RegisterAgency() {
  return <AgencyForm />;
}