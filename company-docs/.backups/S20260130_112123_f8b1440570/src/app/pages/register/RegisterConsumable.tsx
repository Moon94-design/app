import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { repo } from "../../../data/repo";

type Vendor = { id: string; name: string; status: string; region: string; scopes: string[]; otherScopeText: string; contacts: any[]; notes: string; tags: string[]; createdAt: string; updatedAt: string };
type Equipment = { id: string; name: string; location: string; equipType: string; equipTypeNote: string; importance: string; makerModel: string; installedAt: string; inspectCycle: string; inspectNote: string; consumableIds: string[]; createdAt: string; updatedAt: string };
type Consumable = { id: string; equipmentId: string; equipmentName: string; name: string; spec: string; replaceRule: string; minStock: number; vendorId: string; vendorName: string; createdAt: string; updatedAt: string };

type Draft = { equipmentId: string; name: string; spec: string; rule: string; minStock: number; vendorId: string };

const KEY_EQUIP = "local_equipments_v1";
const KEY_CONS = "local_consumables_v1";
const KEY_VENDORS = "local_vendors_v1";
const DRAFT_KEY = "draft_consumable_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `ID_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }
function defaultDraft(): Draft { return { equipmentId: "", name: "", spec: "", rule: "", minStock: 0, vendorId: "" }; }

export default function RegisterConsumable() {
  const [equipments, setEquipments] = useState<Equipment[]>(() => loadJson(KEY_EQUIP, [] as Equipment[]));
  const [consumables, setConsumables] = useState<Consumable[]>(() => loadJson(KEY_CONS, [] as Consumable[]));
  const vendors = useMemo(() => loadJson<Vendor[]>(KEY_VENDORS, [] as Vendor[]), []);

  const initDraft = useMemo(() => loadJson<Draft>(DRAFT_KEY, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(DRAFT_KEY, next);
  }

  const equipmentName = useMemo(() => {
    const e = equipments.find((x) => x.id === draft.equipmentId);
    return e ? e.name : "";
  }, [equipments, draft.equipmentId]);

  function resetDraft() {
    persist(defaultDraft());
  }

  function submit() {
    if (!draft.equipmentId) return alert("설비를 선택하세요.");
    if (!draft.name.trim()) return alert("소모품명을 입력하세요.");

    const now = new Date().toISOString();
    const v = vendors.find((x) => x.id === draft.vendorId);

    const c: Consumable = {
      id: newId(),
      equipmentId: draft.equipmentId,
      equipmentName,
      name: draft.name.trim(),
      spec: draft.spec.trim(),
      replaceRule: draft.rule.trim(),
      minStock: Number(draft.minStock) || 0,
      vendorId: draft.vendorId || "",
      vendorName: v ? v.name : "",
      createdAt: now,
      updatedAt: now,
    };

    const consNext = [c, ...consumables];
    setConsumables(consNext);
    repo.consumables().setAll(consNext);

    const eqNext = equipments.map((e) => {
      if (e.id !== draft.equipmentId) return e;
      const ids = Array.isArray(e.consumableIds) ? e.consumableIds : [];
      const nextIds = ids.includes(c.id) ? ids : [...ids, c.id];
      return { ...e, consumableIds: nextIds, updatedAt: now };
    });
    setEquipments(eqNext);
    repo.equipments().setAll(eqNext);

    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function remove(id: string) {
    const consNext = consumables.filter((x) => x.id !== id);
    setConsumables(consNext);
    repo.consumables().setAll(consNext);
  }

  return (
    <div className="card">
      <h1 className="h1">소모품 등록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>설비</div>
          <select className="input" value={draft.equipmentId} onChange={(e) => persist({ ...draft, equipmentId: e.target.value })}>
            <option value="">선택</option>
            {equipments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>소모품명</div><input className="input" value={draft.name} onChange={(e) => persist({ ...draft, name: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>규격/모델</div><input className="input" value={draft.spec} onChange={(e) => persist({ ...draft, spec: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>교체 주기/조건</div><input className="input" value={draft.rule} onChange={(e) => persist({ ...draft, rule: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>최소 보유 수량(참고)</div>
          <input className="input" inputMode="numeric" value={String(draft.minStock)} onChange={(e) => persist({ ...draft, minStock: Number(e.target.value || 0) })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>공급 업체(선택)</div>
          <select className="input" value={draft.vendorId} onChange={(e) => persist({ ...draft, vendorId: e.target.value })}>
            <option value="">선택</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <div className="row">
            <Link className="btn" to="/register/master/vendor">정비/서비스 업체 추가</Link>
          </div>
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 소모품</div>

        {consumables.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          consumables.map((c) => (
            <div key={c.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
              <div style={{ fontWeight:900 }}>{c.name}</div>
              <div className="p" style={{ marginTop:6 }}>설비: {c.equipmentName || "-"} · 최소보유: {c.minStock}</div>
              {c.vendorName ? <div className="p" style={{ marginTop:6 }}>업체: {c.vendorName}</div> : null}
              <div className="row">
                <button type="button" className="btn danger" onClick={() => remove(c.id)}>삭제</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}