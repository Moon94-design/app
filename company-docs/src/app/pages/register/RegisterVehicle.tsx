/**
 * RegisterVehicle.tsx
 * 차량 신규 등록 페이지
 * - 차량번호, 톤수, 형태, 운송사, 기사 정보 등
 */

import { useMemo, useState } from "react";
import { formatPhoneInput } from "../../../base/utils/phone";
import { repo } from "../../../data/repo";
import { loadJson, saveJson } from "../../../base/utils/pageStorage";
import type { Vehicle } from "../home/excel/vehicle/vehicleTypes";

type Draft = {
  vehicleNo: string;
  tonClass: "" | "1t" | "5t" | "25t";
  bodyType: "" | "카고" | "윙" | "방통";
  carrierName: string;
  driverName: string;
  driverPhone: string;
  tagsText: string;
  memo: string;
};

const DRAFT_KEY = "draft_vehicle_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `V_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function defaultDraft(): Draft {
  return {
    vehicleNo: "",
    tonClass: "",
    bodyType: "",
    carrierName: "",
    driverName: "",
    driverPhone: "",
    tagsText: "",
    memo: "",
  };
}

export default function RegisterVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => repo.vehicles<Vehicle>().getAll());
  const initDraft = useMemo(() => loadJson<Draft>(DRAFT_KEY, defaultDraft()), []);
  const [draft, setDraft] = useState<Draft>(() => initDraft);

  function persist(next: Draft) {
    setDraft(next);
    saveJson(DRAFT_KEY, next);
  }

  function resetDraft() {
    persist(defaultDraft());
  }

  function submit() {
    if (!draft.vehicleNo.trim()) return alert("차량번호는 필수입니다.");

    const now = new Date().toISOString();
    const v: Vehicle = {
      id: newId(),
      vehicleNo: draft.vehicleNo.trim(),
      tonClass: draft.tonClass,
      bodyType: draft.bodyType,
      carrierName: draft.carrierName.trim(),
      driverName: draft.driverName.trim(),
      driverPhone: draft.driverPhone.trim(),
      tagsText: draft.tagsText.trim(),
      memo: draft.memo.trim(),
      source: "manual",
      createdAt: now,
      updatedAt: now,
    };

    const next = [v, ...vehicles];
    setVehicles(next);
    repo.vehicles<Vehicle>().setAll(next);
    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function remove(id: string) {
    repo.vehicles<Vehicle>().removeById(id);
    setVehicles(repo.vehicles<Vehicle>().getAll());
  }

  return (
    <div className="card">
      <h1 className="h1">차량 등록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>차량번호 *</div>
          <input
            className="input"
            value={draft.vehicleNo}
            onChange={(e) => persist({ ...draft, vehicleNo: e.target.value })}
            placeholder="예: 12가 3456"
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>톤수</div>
          <select
            className="input"
            value={draft.tonClass}
            onChange={(e) => persist({ ...draft, tonClass: e.target.value as any })}
          >
            <option value="">선택 (옵션)</option>
            <option value="1t">1t</option>
            <option value="5t">5t</option>
            <option value="25t">25t</option>
          </select>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>형태</div>
          <select
            className="input"
            value={draft.bodyType}
            onChange={(e) => persist({ ...draft, bodyType: e.target.value as any })}
          >
            <option value="">선택 (옵션)</option>
            <option value="카고">카고</option>
            <option value="윙">윙</option>
            <option value="방통">방통</option>
          </select>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>운송사</div>
          <input
            className="input"
            value={draft.carrierName}
            onChange={(e) => persist({ ...draft, carrierName: e.target.value })}
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>기사명</div>
          <input
            className="input"
            value={draft.driverName}
            onChange={(e) => persist({ ...draft, driverName: e.target.value })}
          />
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
          <div className="p" style={{ marginTop: 0 }}>태그</div>
          <input
            className="input"
            value={draft.tagsText}
            onChange={(e) => persist({ ...draft, tagsText: e.target.value })}
            placeholder="예: #냉동 #대형"
          />
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>참고사항</div>
          <textarea
            className="input"
            rows={3}
            value={draft.memo}
            onChange={(e) => persist({ ...draft, memo: e.target.value })}
          />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장(로컬)
        </button>
        <button type="button" className="btn" onClick={resetDraft}>
          초기화
        </button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>
          저장된 차량 ({vehicles.length}건)
        </div>

        {vehicles.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          vehicles.map((v) => (
            <div key={v.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{v.vehicleNo}</div>
                  <div className="p" style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                    {v.tonClass || "미완성"} / {v.bodyType || "미완성"}
                    {v.carrierName && ` / ${v.carrierName}`}
                  </div>
                  {v.driverName && <div className="p" style={{ marginTop: 4, fontSize: 13 }}>기사: {v.driverName}</div>}
                  {v.driverPhone && <div className="p" style={{ marginTop: 2, fontSize: 13 }}>연락처: {v.driverPhone}</div>}
                </div>
                <button type="button" className="btn danger" onClick={() => remove(v.id)}>
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
