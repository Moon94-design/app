/**
 * IssueEquipmentInlineForm - 이슈 등록 시 설비 인라인 추가/수정 폼
 * 
 * 역할:
 * - 이슈 작성 중 설비가 없을 때 즉시 추가
 * - 중복 체크 및 수정 기능
 * 
 * 사용처: ProductionIssuePanel
 */

import { useState } from "react";
import { repo } from "../../../../data/repo";
import type { EquipmentRow } from './productionTypes';

function newId(prefix: string) {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export type IssueEquipmentInlineFormProps = {
  show: boolean;
  onClose: () => void;
  equipments: EquipmentRow[];
  onUpdateEquipments: (list: EquipmentRow[]) => void;
  onSubmitSuccess?: (equipId: string, equipName: string) => void;
};

export default function IssueEquipmentInlineForm(props: IssueEquipmentInlineFormProps) {
  const { show, onClose, equipments, onUpdateEquipments, onSubmitSuccess } = props;

  const [equipDraft, setEquipDraft] = useState({
    name: "",
    location: "",
    equipType: "생산설비",
    equipTypeNote: "",
    importance: "중",
    makerModel: "",
    installedAt: "",
    inspectCycle: "월간",
    inspectNote: "",
  });
  const [equipEditId, setEquipEditId] = useState<string>("");
  const [equipDupId, setEquipDupId] = useState<string>("");

  function resetEquipDraft() {
    setEquipDraft({
      name: "",
      location: "",
      equipType: "생산설비",
      equipTypeNote: "",
      importance: "중",
      makerModel: "",
      installedAt: "",
      inspectCycle: "월간",
      inspectNote: "",
    });
    setEquipEditId("");
    setEquipDupId("");
  }

  function loadEquipToEdit(id: string) {
    const found = equipments.find((e) => e.id === id);
    if (!found) return;
    setEquipDraft({
      name: found.name,
      location: found.location,
      equipType: found.equipType,
      equipTypeNote: found.equipTypeNote || "",
      importance: found.importance,
      makerModel: found.makerModel || "",
      installedAt: found.installedAt || "",
      inspectCycle: found.inspectCycle,
      inspectNote: found.inspectNote || "",
    });
    setEquipEditId(id);
  }

  function submitEquip() {
    if (!equipDraft.name.trim()) return alert("설비명을 입력하세요.");

    const equip = {
      id: equipEditId || newId("equip"),
      name: equipDraft.name.trim(),
      location: equipDraft.location.trim(),
      equipType: equipDraft.equipType,
      equipTypeNote: equipDraft.equipTypeNote.trim(),
      importance: equipDraft.importance,
      makerModel: equipDraft.makerModel.trim(),
      installedAt: equipDraft.installedAt.trim(),
      inspectCycle: equipDraft.inspectCycle,
      inspectNote: equipDraft.inspectNote.trim(),
      consumableIds: [],
      createdAt: equipEditId ? equipments.find((e) => e.id === equipEditId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (equipEditId) {
      const nextList = equipments.map((e) => (e.id === equipEditId ? equip : e));
      repo.equipments<EquipmentRow>().setAll(nextList);
      onUpdateEquipments(nextList);
    } else {
      const nextList = [equip, ...equipments];
      repo.equipments<EquipmentRow>().setAll(nextList);
      onUpdateEquipments(nextList);
      if (onSubmitSuccess) {
        onSubmitSuccess(equip.id, equip.name);
      }
    }

    resetEquipDraft();
    onClose();
  }

  if (!show) return null;

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <div><div className="p" style={{ marginTop: 0 }}>설비명</div><input className="input" value={equipDraft.name} onChange={(e) => setEquipDraft({ ...equipDraft, name: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>위치</div><input className="input" value={equipDraft.location} onChange={(e) => setEquipDraft({ ...equipDraft, location: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>종류</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["생산설비", "운반기계", "기타"] as const).map((t) => (
              <button key={t} type="button" className={`selBtn ${equipDraft.equipType === t ? "active" : ""}`} onClick={() => setEquipDraft({ ...equipDraft, equipType: t })}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>종류상세</div><input className="input" value={equipDraft.equipTypeNote} onChange={(e) => setEquipDraft({ ...equipDraft, equipTypeNote: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>중요도</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["상", "중", "하"] as const).map((i) => (
              <button key={i} type="button" className={`selBtn ${equipDraft.importance === i ? "active" : ""}`} onClick={() => setEquipDraft({ ...equipDraft, importance: i })}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>제조사/모델</div><input className="input" value={equipDraft.makerModel} onChange={(e) => setEquipDraft({ ...equipDraft, makerModel: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>설치일</div><input className="input" type="date" value={equipDraft.installedAt} onChange={(e) => setEquipDraft({ ...equipDraft, installedAt: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>점검주기</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["일간", "주간", "월간", "분기", "반기", "연간"] as const).map((c) => (
              <button key={c} type="button" className={`selBtn ${equipDraft.inspectCycle === c ? "active" : ""}`} onClick={() => setEquipDraft({ ...equipDraft, inspectCycle: c })}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>점검항목</div><textarea className="textarea" rows={2} value={equipDraft.inspectNote} onChange={(e) => setEquipDraft({ ...equipDraft, inspectNote: e.target.value })} /></div>

        {equipDraft.name.trim() && equipments.some((e) => (e.name || "").trim() === equipDraft.name.trim() && e.id !== equipEditId) ? (
          <div style={{ display: "grid", gap: 6 }}>
            <div className="p" style={{ marginTop: 0, opacity: 0.8 }}>동일한 설비명이 있습니다.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <select className="input" value={equipDupId} onChange={(e) => setEquipDupId(e.target.value)}>
                {equipments.filter((e) => (e.name || "").trim() === equipDraft.name.trim()).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} · {e.location}</option>
                ))}
              </select>
              <button type="button" className="btn" onClick={() => loadEquipToEdit(equipDupId)}>수정</button>
            </div>
          </div>
        ) : null}

        <div className="row">
          <button type="button" className="btn primary" onClick={submitEquip}>{equipEditId ? "수정" : "저장"}</button>
          <button type="button" className="btn" onClick={() => { resetEquipDraft(); onClose(); }}>취소</button>
        </div>
      </div>
    </div>
  );
}
