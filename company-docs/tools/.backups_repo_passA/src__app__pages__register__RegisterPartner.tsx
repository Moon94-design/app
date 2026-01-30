import { useMemo, useState } from "react";
import { formatPhoneInput } from "../../../base/utils/phone";

type Status = "거래중" | "보류" | "중단";
type Direction = "매입" | "출고";
type Kind = "압축품" | "분쇄품" | "펠렛";
type Item = "PP" | "PE";

type Contact = { id: string; name: string; role: string; phone: string; memo: string };

type Vehicle = {
  id: string; vehicleNo: string; carrier: string; driverName: string; driverPhone: string;
  tags: string[]; notes: string; createdAt: string; updatedAt: string;
};

type LinkedVehicle = { id: string; vehicleId: string; vehicleNo: string; driverPhone: string; memo: string };

type PriceRow = { id: string; direction: Direction; kind: Kind; item: Item; pricePerKg: number };

type Partner = {
  id: string;
  name: string;
  address: string;
  companyPhone: string;
  status: Status;
  tags: string[];
  memo: string;
  contacts: Contact[];
  vehicles: LinkedVehicle[];
  prices: PriceRow[];
  createdAt: string;
  updatedAt: string;
};

const KEY_PARTNERS = "local_partners_v2";
const KEY_VEHICLES = "local_vehicles_v1";
const KEY_DRAFT = "draft_partner_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `ID_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function allowedKinds(direction: Direction): Kind[] {
  return direction === "매입" ? ["압축품", "분쇄품"] : ["분쇄품", "펠렛"];
}

type Draft = {
  name: string;
  address: string;
  companyPhone: string;
  status: Status;
  tagsText: string;
  memo: string;
  contacts: Contact[];
  linkedVehicles: LinkedVehicle[];
  vehiclePick: string;
  prices: PriceRow[];
};

function defaultDraft(): Draft {
  return {
    name: "",
    address: "",
    companyPhone: "",
    status: "거래중",
    tagsText: "",
    memo: "",
    contacts: [{ id: newId(), name: "", role: "담당", phone: "", memo: "" }],
    linkedVehicles: [],
    vehiclePick: "",
    prices: [{ id: newId(), direction: "매입", kind: "압축품", item: "PP", pricePerKg: 0 }],
  };
}

export default function RegisterPartner() {
  const [partners, setPartners] = useState<Partner[]>(() => loadJson(KEY_PARTNERS, [] as Partner[]));
  const vehiclesDir = useMemo(() => loadJson<Vehicle[]>(KEY_VEHICLES, [] as Vehicle[]), []);

  const initialDraft = useMemo(() => loadJson<Draft>(KEY_DRAFT, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initialDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(KEY_DRAFT, next);
  }

  const tags = useMemo(() => (draft.tagsText || "").split(",").map((t) => t.trim()).filter(Boolean), [draft.tagsText]);

  function updateContact(id: string, patch: Partial<Contact>) {
    const nextContacts = draft.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persist({ ...draft, contacts: nextContacts });
  }
  function addContact() {
    persist({ ...draft, contacts: [...draft.contacts, { id: newId(), name: "", role: "담당", phone: "", memo: "" }] });
  }
  function removeContact(id: string) {
    const nextContacts = draft.contacts.filter((c) => c.id !== id);
    if (nextContacts.length === 0) nextContacts.push({ id: newId(), name: "", role: "담당", phone: "", memo: "" });
    persist({ ...draft, contacts: nextContacts });
  }

  function addLinkedVehicle() {
    if (!draft.vehiclePick) return alert("차량을 선택하세요.");
    const v = vehiclesDir.find((x) => x.id === draft.vehiclePick);
    if (!v) return;
    if (draft.linkedVehicles.some((lv) => lv.vehicleId === v.id)) return alert("이미 추가된 차량입니다.");

    persist({
      ...draft,
      linkedVehicles: [...draft.linkedVehicles, { id: newId(), vehicleId: v.id, vehicleNo: v.vehicleNo, driverPhone: v.driverPhone || "", memo: "" }],
      vehiclePick: "",
    });
  }
  function removeLinkedVehicle(id: string) {
    persist({ ...draft, linkedVehicles: draft.linkedVehicles.filter((v) => v.id !== id) });
  }
  function updateLinkedVehicle(id: string, patch: Partial<LinkedVehicle>) {
    persist({ ...draft, linkedVehicles: draft.linkedVehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  }

  function addPriceRow() {
    persist({ ...draft, prices: [...draft.prices, { id: newId(), direction: "출고", kind: "분쇄품", item: "PP", pricePerKg: 0 }] });
  }
  function removePriceRow(id: string) {
    const nextPrices = draft.prices.filter((p) => p.id !== id);
    if (nextPrices.length === 0) nextPrices.push({ id: newId(), direction: "매입", kind: "압축품", item: "PP", pricePerKg: 0 });
    persist({ ...draft, prices: nextPrices });
  }
  function updatePriceRow(id: string, patch: Partial<PriceRow>) {
    persist({ ...draft, prices: draft.prices.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }
  function setDirectionForRow(id: string, direction: Direction) {
    const next = draft.prices.map((p) => {
      if (p.id !== id) return p;
      const kinds = allowedKinds(direction);
      const nextKind = kinds.includes(p.kind) ? p.kind : kinds[0];
      return { ...p, direction, kind: nextKind };
    });
    persist({ ...draft, prices: next });
  }

  function resetDraft() {
    const d = defaultDraft();
    persist(d);
  }

  function submit() {
    if (!draft.name.trim()) return alert("거래처명을 입력하세요.");
    if (!draft.address.trim()) return alert("주소를 입력하세요.");

    const cleanContacts = draft.contacts
      .map((c) => ({ ...c, name: c.name.trim(), role: c.role.trim(), phone: c.phone.trim(), memo: c.memo.trim() }))
      .filter((c) => c.name || c.phone || c.memo);

    const cleanVehicles = draft.linkedVehicles.map((v) => ({ ...v, vehicleNo: v.vehicleNo.trim(), driverPhone: v.driverPhone.trim(), memo: v.memo.trim() }));

    const cleanPrices = draft.prices.map((r) => {
      const allowed = allowedKinds(r.direction);
      const kind = allowed.includes(r.kind) ? r.kind : allowed[0];
      return { ...r, kind, pricePerKg: Number(r.pricePerKg) || 0 };
    });

    const now = new Date().toISOString();
    const p: Partner = {
      id: newId(),
      name: draft.name.trim(),
      address: draft.address.trim(),
      companyPhone: draft.companyPhone.trim(),
      status: draft.status,
      tags,
      memo: draft.memo.trim(),
      contacts: cleanContacts,
      vehicles: cleanVehicles,
      prices: cleanPrices,
      createdAt: now,
      updatedAt: now,
    };

    const next = [p, ...partners];
    setPartners(next);
    saveJson(KEY_PARTNERS, next);
    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function removePartner(id: string) {
    const next = partners.filter((x) => x.id !== id);
    setPartners(next);
    saveJson(KEY_PARTNERS, next);
  }

  return (
    <div className="card">
      <h1 className="h1">거래처 등록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div><div className="p" style={{ marginTop: 0 }}>거래처명</div><input className="input" value={draft.name} onChange={(e) => persist({ ...draft, name: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>주소</div><input className="input" value={draft.address} onChange={(e) => persist({ ...draft, address: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>대표번호(선택)</div>
          <input className="input" inputMode="numeric" value={draft.companyPhone} onChange={(e) => persist({ ...draft, companyPhone: formatPhoneInput(e.target.value) })} placeholder="숫자만 입력 가능" />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>상태</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["거래중","보류","중단"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${draft.status === s ? "active" : ""}`} onClick={() => persist({ ...draft, status: s })}>{s}</button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>태그(쉼표)</div><input className="input" value={draft.tagsText} onChange={(e) => persist({ ...draft, tagsText: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>참고사항</div><textarea className="textarea" rows={2} value={draft.memo} onChange={(e) => persist({ ...draft, memo: e.target.value })} placeholder="참고사항" /></div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>담당자</div>

        {draft.contacts.map((c) => (
          <div key={c.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"grid", gap:10 }}>
              <input className="input" value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} placeholder="이름" />
              <input className="input" value={c.role} onChange={(e) => updateContact(c.id, { role: e.target.value })} placeholder="역할" />
              <input className="input" inputMode="numeric" value={c.phone} onChange={(e) => updateContact(c.id, { phone: formatPhoneInput(e.target.value) })} placeholder="숫자만 입력 가능" />
              <input className="input" value={c.memo} onChange={(e) => updateContact(c.id, { memo: e.target.value })} placeholder="참고사항" />
            </div>
            <div className="row">
              <button type="button" className="btn danger" onClick={() => removeContact(c.id)} disabled={draft.contacts.length <= 1}>삭제</button>
            </div>
          </div>
        ))}

        <div className="row">
          <button type="button" className="btn" onClick={addContact}>담당자 추가</button>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>차량(연결)</div>

        <div style={{ marginTop:10, display:"grid", gap:10 }}>
          <select className="input" value={draft.vehiclePick} onChange={(e) => persist({ ...draft, vehiclePick: e.target.value })}>
            <option value="">차량 선택</option>
            {vehiclesDir.map((v) => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
          </select>
          <div className="row"><button type="button" className="btn" onClick={addLinkedVehicle}>차량 추가</button></div>
        </div>

        {draft.linkedVehicles.length ? (
          <div style={{ marginTop:12, display:"grid", gap:10 }}>
            {draft.linkedVehicles.map((v) => (
              <div key={v.id} className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
                <div style={{ fontWeight: 900 }}>{v.vehicleNo}</div>
                <div style={{ marginTop:10, display:"grid", gap:10 }}>
                  <input className="input" inputMode="numeric" value={v.driverPhone} onChange={(e) => updateLinkedVehicle(v.id, { driverPhone: formatPhoneInput(e.target.value) })} placeholder="숫자만 입력 가능" />
                  <input className="input" value={v.memo} onChange={(e) => updateLinkedVehicle(v.id, { memo: e.target.value })} placeholder="참고사항" />
                </div>
                <div className="row"><button type="button" className="btn danger" onClick={() => removeLinkedVehicle(v.id)}>삭제</button></div>
              </div>
            ))}
          </div>
        ) : <p className="p" style={{ marginTop: 10 }}>연결된 차량 없음</p>}
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>단가(초기 기준)</div>

        {draft.prices.map((r) => {
          const kinds = allowedKinds(r.direction);
          return (
            <div key={r.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
              <div className="row" style={{ justifyContent:"space-between", marginTop:0 }}>
                <div className="row" style={{ marginTop:0 }}>
                  {(["매입","출고"] as const).map((d) => (
                    <button key={d} type="button" className={`selBtn ${r.direction===d?"active":""}`} onClick={() => setDirectionForRow(r.id, d)}>{d}</button>
                  ))}
                </div>
                <button type="button" className="btn danger" onClick={() => removePriceRow(r.id)} disabled={draft.prices.length <= 1}>삭제</button>
              </div>

              <div className="row">
                {kinds.map((k) => (
                  <button key={k} type="button" className={`selBtn ${r.kind===k?"active":""}`} onClick={() => updatePriceRow(r.id, { kind: k })}>{k}</button>
                ))}
              </div>

              <div className="row">
                {(["PP","PE"] as const).map((it) => (
                  <button key={it} type="button" className={`selBtn ${r.item===it?"active":""}`} onClick={() => updatePriceRow(r.id, { item: it })}>{it}</button>
                ))}
              </div>

              <div style={{ marginTop:10 }}>
                <div className="p" style={{ marginTop:0 }}>단가 (원/Kg)</div>
                <input className="input" inputMode="numeric" value={String(r.pricePerKg)} onChange={(e) => updatePriceRow(r.id, { pricePerKg: Number(e.target.value || 0) })} />
              </div>
            </div>
          );
        })}

        <div className="row"><button type="button" className="btn" onClick={addPriceRow}>단가 항목 추가</button></div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 거래처</div>
        {partners.length === 0 ? <p className="p">아직 없음</p> : partners.map((p) => (
          <div key={p.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{p.name}</div>
                <div className="p" style={{ marginTop:6 }}>{p.address}</div>
              </div>
              <button type="button" className="btn danger" onClick={() => removePartner(p.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
