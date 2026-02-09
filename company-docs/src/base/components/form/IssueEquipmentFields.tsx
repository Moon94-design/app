/**
 * IssueEquipmentFields - 설비 이슈 카테고리 필드
 * 
 * LinkedSelector 공통 컴포넌트 사용
 */
import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import LinkedSelector from "./LinkedSelector";
import type { IssueDraft } from "../../../domain/schema/daily/issue";

type EquipmentRow = {
  id: string;
  name: string;
  location: string;
  equipType: string;
  equipTypeNote: string;
  importance: string;
  makerModel: string;
  installedAt: string;
  inspectCycle: string;
  inspectNote: string;
  consumableIds: string[];
  createdAt: string;
  updatedAt: string;
};

function newId(prefix: string) {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

type Props = {
  draft: IssueDraft;
  onUpdate: <K extends keyof IssueDraft>(key: K, value: IssueDraft[K]) => void;
};

export default function IssueEquipmentFields({ draft, onUpdate }: Props) {
  const [equipments, setEquipments] = useState<EquipmentRow[]>(() => repo.equipments<EquipmentRow>().getAll());
  const [showEquipForm, setShowEquipForm] = useState(false);
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

  const equipOptions = useMemo(
    () => equipments.map((e) => ({ id: e.id, label: e.name, subLabel: e.location })),
    [equipments]
  );

  function handleEquipSelect(id: string, label: string) {
    onUpdate("e_equipmentId", id);
    onUpdate("e_equipmentLabel", label);
  }

  function submitEquip() {
    const name = equipDraft.name.trim();
    const location = equipDraft.location.trim();
    if (!name) return alert("설비명을 입력하세요.");
    if (!location) return alert("설치 위치를 입력하세요.");

    const now = new Date().toISOString();
    const row: EquipmentRow = {
      id: newId("EQ"),
      name,
      location,
      equipType: equipDraft.equipType,
      equipTypeNote: equipDraft.equipTypeNote.trim(),
      importance: equipDraft.importance,
      makerModel: equipDraft.makerModel.trim(),
      installedAt: equipDraft.installedAt.trim(),
      inspectCycle: equipDraft.inspectCycle,
      inspectNote: equipDraft.inspectNote.trim(),
      consumableIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const next = [row, ...equipments];
    setEquipments(next);
    repo.equipments<EquipmentRow>().setAll(next);

    handleEquipSelect(row.id, row.name);
    setShowEquipForm(false);
    setEquipDraft({
      name: "", location: "", equipType: "생산설비", equipTypeNote: "", importance: "중",
      makerModel: "", installedAt: "", inspectCycle: "월간", inspectNote: "",
    });
    alert("설비가 추가되었습니다.");
  }

  return (
    <>
      {/* 설비 선택 */}
      <LinkedSelector
        label="설비"
        options={equipOptions}
        selectedId={draft.e_equipmentId || ""}
        selectedLabel={draft.e_equipmentLabel || ""}
        onSelect={handleEquipSelect}
        placeholder="설비명 검색..."
        showAddButton
        onAddClick={() => setShowEquipForm(!showEquipForm)}
      />

      {/* 설비 인라인 추가 폼 */}
      {showEquipForm && (
        <div style={{ marginLeft: 108, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <input className="input" value={equipDraft.name} onChange={(e) => setEquipDraft({ ...equipDraft, name: e.target.value })} placeholder="설비명 *" />
            <input className="input" value={equipDraft.location} onChange={(e) => setEquipDraft({ ...equipDraft, location: e.target.value })} placeholder="설치 위치 *" />
            <div className="row" style={{ marginTop: 0 }}>
              <button type="button" className="btn primary" onClick={submitEquip}>저장</button>
              <button type="button" className="btn" onClick={() => setShowEquipForm(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 심각도 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">심각도</div>
        <div className="row" style={{ marginTop: 0 }}>
          {(["낮음", "보통", "높음"] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              className={`selBtn ${draft.e_severity === sev ? "active" : ""}`}
              onClick={() => onUpdate("e_severity", sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 증상 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
        <div className="p">증상</div>
        <textarea className="textarea" rows={2} value={draft.e_symptom} onChange={(e) => onUpdate("e_symptom", e.target.value)} />
      </div>

      {/* 진행상태 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">진행상태</div>
        <div className="row" style={{ marginTop: 0 }}>
          <button
            type="button"
            className={`selBtn ${draft.e_status === "진행중" ? "active" : ""}`}
            onClick={() => onUpdate("e_status", "진행중")}
            style={draft.e_status === "진행중" ? { background: "rgba(255,180,0,0.3)", borderColor: "rgba(255,180,0,0.5)" } : {}}
          >
            진행중
          </button>
          <button
            type="button"
            className={`selBtn ${draft.e_status === "완료" ? "active" : ""}`}
            onClick={() => onUpdate("e_status", "완료")}
            style={draft.e_status === "완료" ? { background: "rgba(0,200,100,0.3)", borderColor: "rgba(0,200,100,0.5)" } : {}}
          >
            해결완료
          </button>
        </div>
      </div>

      {/* 해결완료일 때만 조치/예방 필드 표시 */}
      {draft.e_status === "완료" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
            <div className="p">조치</div>
            <textarea className="textarea" rows={2} value={draft.e_action} onChange={(e) => onUpdate("e_action", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
            <div className="p">예방</div>
            <textarea className="textarea" rows={2} value={draft.e_prevent} onChange={(e) => onUpdate("e_prevent", e.target.value)} />
          </div>
        </>
      )}
    </>
  );
}
