import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { repo } from "../../../data/repo";

type EquipType = "생산설비" | "유통설비" | "공용설비" | "기타";
type Importance = "상" | "중" | "하";
type InspectCycle = "주간" | "월간" | "분기" | "반기" | "연간" | "비정기";

type Vendor = {
  id: string;
  name: string;
  status: string;
  region: string;
  scopes: string[];
  otherScopeText: string;
  contacts: any[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type Consumable = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  name: string;
  spec: string;
  replaceRule: string;
  minStock: number;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
};

type Equipment = {
  id: string;
  name: string;
  location: string;

  equipType: EquipType;
  equipTypeNote: string;

  importance: Importance;

  makerModel: string;
  installedAt: string; // YYYY-MM-DD
  inspectCycle: InspectCycle;
  inspectNote: string;

  consumableIds: string[];

  createdAt: string;
  updatedAt: string;
};

const KEY_EQUIP = "local_equipments_v1";
const KEY_CONS = "local_consumables_v1";
const KEY_VENDORS = "local_vendors_v1";
const DRAFT_KEY = "draft_equipment_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `ID_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

type Draft = {
  name: string;
  location: string;
  equipType: EquipType;
  equipTypeNote: string;
  importance: Importance;
  makerModel: string;
  installedAt: string; // YYYY-MM-DD (4자리 연도 강제)
  inspectCycle: InspectCycle;
  inspectNote: string;

  activeEquipmentId: string;

  cName: string;
  cSpec: string;
  cRule: string;
  cMin: number;
  cVendorId: string;
};

function defaultDraft(): Draft {
  return {
    name: "",
    location: "",
    equipType: "생산설비",
    equipTypeNote: "",
    importance: "중",
    makerModel: "",
    installedAt: "",
    inspectCycle: "월간",
    inspectNote: "",
    activeEquipmentId: "",
    cName: "",
    cSpec: "",
    cRule: "",
    cMin: 0,
    cVendorId: "",
  };
}

/**
 * 설치일 입력을 YYYY-MM-DD로 강제.
 * - 숫자만 추출 후 YYYY-MM-DD 형태로 자동 조립
 * - 연도는 4자리로만
 */
function normalizeDateYYYYMMDD(raw: string): string {
  const d = (raw || "").replace(/\D/g, "").slice(0, 8); // YYYYMMDD 최대 8자리
  if (d.length <= 4) return d; // YYYY
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`; // YYYY-MM
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`; // YYYY-MM-DD
}

export default function RegisterEquipment() {
  const [equipments, setEquipments] = useState<Equipment[]>(() => loadJson(KEY_EQUIP, [] as Equipment[]));
  const [consumables, setConsumables] = useState<Consumable[]>(() => loadJson(KEY_CONS, [] as Consumable[]));
  const vendors = useMemo(() => loadJson<Vendor[]>(KEY_VENDORS, [] as Vendor[]), []);

  const initDraft = useMemo(() => loadJson<Draft>(DRAFT_KEY, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(DRAFT_KEY, next);
  }

  function resetDraft() {
    persist(defaultDraft());
  }

  function submitEquipment() {
    if (!draft.name.trim()) return alert("설비명을 입력하세요.");
    if (!draft.location.trim()) return alert("설치 위치/구역을 입력하세요.");

    // installedAt은 비어있어도 OK. 값이 있으면 최소 YYYY-MM-DD 형태 권장
    const now = new Date().toISOString();
    const eq: Equipment = {
      id: newId(),
      name: draft.name.trim(),
      location: draft.location.trim(),
      equipType: draft.equipType,
      equipTypeNote: draft.equipTypeNote.trim(),
      importance: draft.importance,
      makerModel: draft.makerModel.trim(),
      installedAt: draft.installedAt.trim(),
      inspectCycle: draft.inspectCycle,
      inspectNote: draft.inspectNote.trim(),
      consumableIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const next = [eq, ...equipments];
    setEquipments(next);
    repo.equipments().setAll(next);

    persist({ ...draft, activeEquipmentId: eq.id });

    alert("설비가 저장되었습니다. 이제 아래에서 소모품을 추가할 수 있습니다.");
  }

  function removeEquipment(id: string) {
    const next = equipments.filter((e) => e.id !== id);
    setEquipments(next);
    repo.equipments().setAll(next);

    if (draft.activeEquipmentId === id) {
      persist({ ...draft, activeEquipmentId: "" });
    }
  }

  function addConsumableFromEquipment() {
    if (!draft.activeEquipmentId) return alert("소모품을 추가할 설비를 선택하세요.");
    const eq = equipments.find((e) => e.id === draft.activeEquipmentId);
    if (!eq) return alert("설비를 다시 선택하세요.");
    if (!draft.cName.trim()) return alert("소모품명을 입력하세요.");

    const now = new Date().toISOString();
    const v = vendors.find((x) => x.id === draft.cVendorId);

    const cons: Consumable = {
      id: newId(),
      equipmentId: eq.id,
      equipmentName: eq.name,
      name: draft.cName.trim(),
      spec: draft.cSpec.trim(),
      replaceRule: draft.cRule.trim(),
      minStock: Number(draft.cMin) || 0,
      vendorId: draft.cVendorId || "",
      vendorName: v ? v.name : "",
      createdAt: now,
      updatedAt: now,
    };

    const consNext = [cons, ...consumables];
    setConsumables(consNext);
    repo.consumables().setAll(consNext);

    const eqNext = equipments.map((x) => {
      if (x.id !== eq.id) return x;
      const ids = Array.isArray(x.consumableIds) ? x.consumableIds : [];
      const nextIds = ids.includes(cons.id) ? ids : [...ids, cons.id];
      return { ...x, consumableIds: nextIds, updatedAt: now };
    });
    setEquipments(eqNext);
    repo.equipments().setAll(eqNext);

    persist({ ...draft, cName: "", cSpec: "", cRule: "", cMin: 0, cVendorId: "" });

    alert("소모품이 등록되었고, 소모품 등록 목록에도 자동 추가되었습니다.");
  }

  const activeEq = useMemo(() => equipments.find((e) => e.id === draft.activeEquipmentId) || null, [equipments, draft.activeEquipmentId]);

  const activeConsumables = useMemo(() => {
    if (!activeEq) return [];
    const idSet = new Set(activeEq.consumableIds || []);
    return consumables.filter((c) => c.equipmentId === activeEq.id || idSet.has(c.id));
  }, [activeEq, consumables]);

  return (
    <div className="card">
      <h1 className="h1">설비 등록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div><div className="p" style={{ marginTop: 0 }}>설비명</div><input className="input" value={draft.name} onChange={(e) => persist({ ...draft, name: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>설치 위치/구역</div><input className="input" value={draft.location} onChange={(e) => persist({ ...draft, location: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>설비 구분</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["생산설비","유통설비","공용설비","기타"] as const).map((t) => (
              <button key={t} type="button" className={`selBtn ${draft.equipType === t ? "active" : ""}`} onClick={() => persist({ ...draft, equipType: t })}>
                {t}
              </button>
            ))}
          </div>
          <input className="input" value={draft.equipTypeNote} onChange={(e) => persist({ ...draft, equipTypeNote: e.target.value })} placeholder="구분 설명(한 줄)" />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>중요도</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["상","중","하"] as const).map((v) => (
              <button key={v} type="button" className={`selBtn ${draft.importance === v ? "active" : ""}`} onClick={() => persist({ ...draft, importance: v })}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>제조사/모델</div><input className="input" value={draft.makerModel} onChange={(e) => persist({ ...draft, makerModel: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>설치일</div>
          <input
            className="input"
            inputMode="numeric"
            value={draft.installedAt}
            onChange={(e) => persist({ ...draft, installedAt: normalizeDateYYYYMMDD(e.target.value) })}
            placeholder="YYYY-MM-DD"
            maxLength={10}
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>점검 주기</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["주간","월간","분기","반기","연간","비정기"] as const).map((v) => (
              <button key={v} type="button" className={`selBtn ${draft.inspectCycle === v ? "active" : ""}`} onClick={() => persist({ ...draft, inspectCycle: v })}>
                {v}
              </button>
            ))}
          </div>
          <input className="input" value={draft.inspectNote} onChange={(e) => persist({ ...draft, inspectNote: e.target.value })} placeholder="주기 설명(한 줄)" />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submitEquipment}>설비 저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>소모품 추가(설비에서 바로)</div>

        <div className="p" style={{ marginTop: 10 }}>
          현재 설비: {activeEq ? activeEq.name : "(선택 필요)"}
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div><div className="p" style={{ marginTop: 0 }}>소모품명</div><input className="input" value={draft.cName} onChange={(e) => persist({ ...draft, cName: e.target.value })} /></div>
          <div><div className="p" style={{ marginTop: 0 }}>규격/모델</div><input className="input" value={draft.cSpec} onChange={(e) => persist({ ...draft, cSpec: e.target.value })} /></div>
          <div><div className="p" style={{ marginTop: 0 }}>교체 주기/조건</div><input className="input" value={draft.cRule} onChange={(e) => persist({ ...draft, cRule: e.target.value })} /></div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>최소 보유 수량(참고)</div>
            <input className="input" inputMode="numeric" value={String(draft.cMin)} onChange={(e) => persist({ ...draft, cMin: Number(e.target.value || 0) })} />
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>공급 업체(선택)</div>
            <select className="input" value={draft.cVendorId} onChange={(e) => persist({ ...draft, cVendorId: e.target.value })}>
              <option value="">선택</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <div className="row">
              <Link className="btn" to="/register/master/vendor">정비/서비스 업체 추가</Link>
            </div>
          </div>
        </div>

        <div className="row">
          <button type="button" className="btn primary" onClick={addConsumableFromEquipment}>소모품 저장</button>
        </div>

        <div className="divider" />

        <div className="h1" style={{ fontSize: 15 }}>이 설비의 소모품</div>
        {activeConsumables.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          activeConsumables.map((c) => (
            <div key={c.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontWeight: 900 }}>{c.name}</div>
              <div className="p" style={{ marginTop: 6 }}>
                {c.spec ? `규격: ${c.spec} · ` : ""}{c.replaceRule ? `교체: ${c.replaceRule} · ` : ""}최소보유: {c.minStock}
              </div>
              {c.vendorName ? <div className="p" style={{ marginTop: 6 }}>업체: {c.vendorName}</div> : null}
            </div>
          ))
        )}
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 설비</div>

        {equipments.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          equipments.map((e) => (
            <div key={e.id} className="card" style={{ marginTop: 10, background:"rgba(255,255,255,0.02)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{e.name}</div>
                  <div className="p" style={{ marginTop: 6 }}>{e.location} · {e.equipType} · {e.importance}</div>
                  <div className="p" style={{ marginTop: 6 }}>소모품: {(e.consumableIds || []).length}개</div>
                </div>
                <button type="button" className="btn danger" onClick={() => removeEquipment(e.id)}>삭제</button>
              </div>

              <div className="row">
                <button type="button" className="btn" onClick={() => persist({ ...draft, activeEquipmentId: e.id })}>이 설비로 소모품 추가</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="divider" />
      <div className="row">
        <Link className="btn" to="/register/master/consumable">소모품 등록으로 이동</Link>
      </div>
    </div>
  );
}