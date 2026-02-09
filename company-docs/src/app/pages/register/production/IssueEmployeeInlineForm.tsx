/**
 * IssueEmployeeInlineForm - 이슈 등록 시 직원 인라인 추가/수정 폼
 * 
 * 역할:
 * - 이슈 작성 중 직원이 없을 때 즉시 추가
 * - 중복 체크 및 수정 기능
 * 
 * 사용처: ProductionIssuePanel
 */

import { useState } from "react";
import { repo } from "../../../../data/repo";
import type { EmployeeRow } from './productionTypes';

function newId(prefix: string) {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export type IssueEmployeeInlineFormProps = {
  show: boolean;
  onClose: () => void;
  employees: EmployeeRow[];
  onUpdateEmployees: (list: EmployeeRow[]) => void;
  onSubmitSuccess?: (empId: string, empName: string) => void;
};

export default function IssueEmployeeInlineForm(props: IssueEmployeeInlineFormProps) {
  const { show, onClose, employees, onUpdateEmployees, onSubmitSuccess } = props;

  const [empDraft, setEmpDraft] = useState({ name: "", branch: "대구" as "대구" | "성주", phone: "", job: "", memo: "" });
  const [empEditId, setEmpEditId] = useState<string>("");
  const [empDupId, setEmpDupId] = useState<string>("");

  function resetEmpDraft() {
    setEmpDraft({ name: "", branch: "대구", phone: "", job: "", memo: "" });
    setEmpEditId("");
    setEmpDupId("");
  }

  function loadEmpToEdit(id: string) {
    const found = employees.find((e) => e.id === id);
    if (!found) return;
    setEmpDraft({
      name: found.name,
      branch: found.branch,
      phone: found.phone || "",
      job: found.job || "",
      memo: found.memo || "",
    });
    setEmpEditId(id);
  }

  function submitEmp() {
    if (!empDraft.name.trim()) return alert("직원명을 입력하세요.");

    const emp = {
      id: empEditId || newId("emp"),
      name: empDraft.name.trim(),
      branch: empDraft.branch,
      phone: empDraft.phone.trim(),
      job: empDraft.job.trim(),
      memo: empDraft.memo.trim(),
      createdAt: empEditId ? employees.find((e) => e.id === empEditId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (empEditId) {
      const nextList = employees.map((e) => (e.id === empEditId ? emp : e));
      repo.employees<EmployeeRow>().setAll(nextList);
      onUpdateEmployees(nextList);
    } else {
      const nextList = [emp, ...employees];
      repo.employees<EmployeeRow>().setAll(nextList);
      onUpdateEmployees(nextList);
      if (onSubmitSuccess) {
        onSubmitSuccess(emp.id, emp.name);
      }
    }

    resetEmpDraft();
    onClose();
  }

  if (!show) return null;

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <div><div className="p" style={{ marginTop: 0 }}>이름</div><input className="input" value={empDraft.name} onChange={(e) => setEmpDraft({ ...empDraft, name: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>지부</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["대구", "성주"] as const).map((b) => (
              <button key={b} type="button" className={`selBtn ${empDraft.branch === b ? "active" : ""}`} onClick={() => setEmpDraft({ ...empDraft, branch: b })}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>연락처</div><input className="input" value={empDraft.phone} onChange={(e) => setEmpDraft({ ...empDraft, phone: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>직무</div><input className="input" value={empDraft.job} onChange={(e) => setEmpDraft({ ...empDraft, job: e.target.value })} /></div>
        <div><div className="p" style={{ marginTop: 0 }}>참고사항</div><textarea className="textarea" rows={2} value={empDraft.memo} onChange={(e) => setEmpDraft({ ...empDraft, memo: e.target.value })} /></div>

        {empDraft.name.trim() && employees.some((e) => (e.name || "").trim() === empDraft.name.trim() && e.id !== empEditId) ? (
          <div style={{ display: "grid", gap: 6 }}>
            <div className="p" style={{ marginTop: 0, opacity: 0.8 }}>동일한 직원명이 있습니다.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <select className="input" value={empDupId} onChange={(e) => setEmpDupId(e.target.value)}>
                {employees.filter((e) => (e.name || "").trim() === empDraft.name.trim()).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} · {e.branch}</option>
                ))}
              </select>
              <button type="button" className="btn" onClick={() => loadEmpToEdit(empDupId)}>수정</button>
            </div>
          </div>
        ) : null}

        <div className="row">
          <button type="button" className="btn primary" onClick={submitEmp}>{empEditId ? "수정" : "저장"}</button>
          <button type="button" className="btn" onClick={() => { resetEmpDraft(); onClose(); }}>취소</button>
        </div>
      </div>
    </div>
  );
}
