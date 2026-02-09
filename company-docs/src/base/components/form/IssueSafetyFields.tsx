/**
 * IssueSafetyFields - 안전 이슈 카테고리 필드
 * 
 * LinkedSelector 공통 컴포넌트 사용
 */
import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import LinkedSelector from "./LinkedSelector";
import type { IssueDraft } from "../../../domain/schema/daily/issue";

type EmployeeRow = {
  id: string;
  name: string;
  branch: "대구" | "성주";
  phone: string;
  job: string;
  memo: string;
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

export default function IssueSafetyFields({ draft, onUpdate }: Props) {
  const [employees, setEmployees] = useState<EmployeeRow[]>(() => repo.employees<EmployeeRow>().getAll());
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [empDraft, setEmpDraft] = useState({
    name: "",
    branch: "대구" as "대구" | "성주",
    phone: "",
    job: "",
    memo: "",
  });

  const empOptions = useMemo(
    () => employees.map((e) => ({ id: e.id, label: e.name, subLabel: e.job })),
    [employees]
  );

  function handleEmpSelect(id: string, label: string) {
    onUpdate("s_employeeId", id);
    onUpdate("s_employeeLabel", label);
  }

  function submitEmp() {
    const name = empDraft.name.trim();
    if (!name) return alert("이름을 입력하세요.");
    if (!empDraft.phone.trim()) return alert("연락처를 입력하세요.");
    if (!empDraft.job.trim()) return alert("직무를 입력하세요.");

    const now = new Date().toISOString();
    const row: EmployeeRow = {
      id: newId("EMP"),
      name,
      branch: empDraft.branch,
      phone: empDraft.phone.trim(),
      job: empDraft.job.trim(),
      memo: empDraft.memo.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const next = [row, ...employees];
    setEmployees(next);
    repo.employees<EmployeeRow>().setAll(next);

    handleEmpSelect(row.id, row.name);
    setShowEmpForm(false);
    setEmpDraft({ name: "", branch: "대구", phone: "", job: "", memo: "" });
    alert("직원이 추가되었습니다.");
  }

  return (
    <>
      {/* 직원 선택 */}
      <LinkedSelector
        label="직원"
        options={empOptions}
        selectedId={draft.s_employeeId || ""}
        selectedLabel={draft.s_employeeLabel || ""}
        onSelect={handleEmpSelect}
        placeholder="직원명 검색..."
        showAddButton
        onAddClick={() => setShowEmpForm(!showEmpForm)}
      />

      {/* 직원 인라인 추가 폼 */}
      {showEmpForm && (
        <div style={{ marginLeft: 108, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <input className="input" value={empDraft.name} onChange={(e) => setEmpDraft({ ...empDraft, name: e.target.value })} placeholder="이름 *" />
            <input className="input" value={empDraft.phone} onChange={(e) => setEmpDraft({ ...empDraft, phone: e.target.value })} placeholder="연락처 *" />
            <input className="input" value={empDraft.job} onChange={(e) => setEmpDraft({ ...empDraft, job: e.target.value })} placeholder="직무 *" />
            <div className="row" style={{ marginTop: 0 }}>
              {(["대구", "성주"] as const).map((b) => (
                <button key={b} type="button" className={`selBtn ${empDraft.branch === b ? "active" : ""}`} onClick={() => setEmpDraft({ ...empDraft, branch: b })}>{b}</button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 0 }}>
              <button type="button" className="btn primary" onClick={submitEmp}>저장</button>
              <button type="button" className="btn" onClick={() => setShowEmpForm(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 위험도 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">위험도</div>
        <div className="row" style={{ marginTop: 0 }}>
          {(["낮음", "보통", "높음"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`selBtn ${draft.s_risk === r ? "active" : ""}`}
              onClick={() => onUpdate("s_risk", r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 장소 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "center" }}>
        <div className="p">장소 *</div>
        <input
          className="input"
          value={draft.s_location}
          onChange={(e) => onUpdate("s_location", e.target.value)}
          placeholder="발생 장소"
        />
      </div>

      {/* 조치 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
        <div className="p">조치 *</div>
        <textarea
          className="textarea"
          rows={2}
          value={draft.s_action}
          onChange={(e) => onUpdate("s_action", e.target.value)}
        />
      </div>

      {/* 재발방지 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, alignItems: "start" }}>
        <div className="p">재발방지</div>
        <textarea
          className="textarea"
          rows={2}
          value={draft.s_prevent}
          onChange={(e) => onUpdate("s_prevent", e.target.value)}
        />
      </div>
    </>
  );
}
