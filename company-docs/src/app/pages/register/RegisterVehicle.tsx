import { useMemo, useState } from "react";
import { formatPhoneInput } from "../../../base/utils/phone";

type Vehicle = {
  id: string;
  vehicleNo: string;
  carrier: string;
  driverName: string;
  driverPhone: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  vehicleNo: string;
  carrier: string;
  driverName: string;
  driverPhone: string;
  tagsText: string;
  notes: string;
};

const STORAGE_KEY = "local_vehicles_v1";
const DRAFT_KEY = "draft_vehicle_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `V_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function defaultDraft(): Draft {
  return { vehicleNo: "", carrier: "", driverName: "", driverPhone: "", tagsText: "", notes: "" };
}

export default function RegisterVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadJson(STORAGE_KEY, [] as Vehicle[]));
  const initDraft = useMemo(() => loadJson<Draft>(DRAFT_KEY, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(DRAFT_KEY, next);
  }

  const tags = useMemo(() => (draft.tagsText || "").split(",").map((t) => t.trim()).filter(Boolean), [draft.tagsText]);

  function resetDraft() {
    persist(defaultDraft());
  }

  function submit() {
    if (!draft.vehicleNo.trim()) return alert("차량번호는 필수입니다.");

    const now = new Date().toISOString();
    const v: Vehicle = {
      id: newId(),
      vehicleNo: draft.vehicleNo.trim(),
      carrier: draft.carrier.trim(),
      driverName: draft.driverName.trim(),
      driverPhone: draft.driverPhone.trim(),
      tags,
      notes: draft.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const next = [v, ...vehicles];
    setVehicles(next);
    saveJson(STORAGE_KEY, next);
    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function remove(id: string) {
    const next = vehicles.filter((x) => x.id !== id);
    setVehicles(next);
    saveJson(STORAGE_KEY, next);
  }

  return (
    <div className="card">
      <h1 className="h1">차량 등록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>차량번호</div>
          <input className="input" value={draft.vehicleNo} onChange={(e) => persist({ ...draft, vehicleNo: e.target.value })} placeholder="예: 12가 3456" />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>운송사</div>
          <input className="input" value={draft.carrier} onChange={(e) => persist({ ...draft, carrier: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>기사명</div>
          <input className="input" value={draft.driverName} onChange={(e) => persist({ ...draft, driverName: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>기사 연락처</div>
          <input
            className="input"
            inputMode="numeric"
            value={draft.driverPhone}
            onChange={(e) => persist({ ...draft, driverPhone: formatPhoneInput(e.target.value) })}
            placeholder="숫자만 입력 가능"
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>태그(쉼표)</div>
          <input className="input" value={draft.tagsText} onChange={(e) => persist({ ...draft, tagsText: e.target.value })} />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>참고사항</div>
          <textarea className="textarea" rows={2} value={draft.notes} onChange={(e) => persist({ ...draft, notes: e.target.value })} placeholder="참고사항" />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 차량</div>

        {vehicles.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          vehicles.map((v) => (
            <div key={v.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{v.vehicleNo}</div>
                  {v.driverPhone ? <div className="p" style={{ marginTop: 6 }}>연락처: {v.driverPhone}</div> : null}
                </div>
                <button type="button" className="btn danger" onClick={() => remove(v.id)}>삭제</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
