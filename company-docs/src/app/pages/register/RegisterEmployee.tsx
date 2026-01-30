import { useMemo, useState } from "react";
import { formatPhoneInput } from "../../../base/utils/phone";

type Branch = "대구" | "성주";

type Employee = {
  id: string;
  name: string;
  branch: Branch;
  phone: string;
  job: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  name: string;
  branch: Branch;
  phone: string;
  job: string;
  memo: string;
};

const STORAGE_KEY = "local_employees_v1";
const DRAFT_KEY = "draft_employee_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `E_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; } catch { return fallback; }
}
function saveJson(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

function defaultDraft(): Draft {
  return { name: "", branch: "대구", phone: "", job: "", memo: "" };
}

export default function RegisterEmployee() {
  const [list, setList] = useState<Employee[]>(() => loadJson(STORAGE_KEY, [] as Employee[]));
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
    if (!draft.name.trim()) return alert("이름을 입력하세요.");
    if (!draft.phone.trim()) return alert("연락처를 입력하세요.");
    if (!draft.job.trim()) return alert("직무를 입력하세요.");

    const now = new Date().toISOString();
    const e: Employee = {
      id: newId(),
      name: draft.name.trim(),
      branch: draft.branch,
      phone: draft.phone.trim(),
      job: draft.job.trim(),
      memo: draft.memo.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const next = [e, ...list];
    setList(next);
    saveJson(STORAGE_KEY, next);
    resetDraft();
    alert("저장되었습니다.(로컬)");
  }

  function remove(id: string) {
    const next = list.filter((x) => x.id !== id);
    setList(next);
    saveJson(STORAGE_KEY, next);
  }

  return (
    <div className="card">
      <h1 className="h1">직원 등록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div><div className="p" style={{ marginTop: 0 }}>이름</div><input className="input" value={draft.name} onChange={(e) => persist({ ...draft, name: e.target.value })} /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>지부</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["대구","성주"] as const).map((b) => (
              <button key={b} type="button" className={`selBtn ${draft.branch === b ? "active" : ""}`} onClick={() => persist({ ...draft, branch: b })}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>연락처</div>
          <input className="input" inputMode="numeric" value={draft.phone} onChange={(e) => persist({ ...draft, phone: formatPhoneInput(e.target.value) })} placeholder="숫자만 입력 가능" />
        </div>

        <div><div className="p" style={{ marginTop: 0 }}>직무</div><input className="input" value={draft.job} onChange={(e) => persist({ ...draft, job: e.target.value })} placeholder="자유기입" /></div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>참고사항</div>
          <textarea className="textarea" rows={2} value={draft.memo} onChange={(e) => persist({ ...draft, memo: e.target.value })} placeholder="참고사항" />
        </div>
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
        <button type="button" className="btn" onClick={resetDraft}>초기화</button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize:15 }}>저장된 직원</div>
        {list.length === 0 ? <p className="p">아직 없음</p> : list.map((e) => (
          <div key={e.id} className="card" style={{ marginTop:10, background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div>
                <div style={{ fontWeight:900 }}>{e.name}</div>
                <div className="p" style={{ marginTop:6 }}>{e.branch} · {e.phone}</div>
                <div className="p" style={{ marginTop:6 }}>직무: {e.job}</div>
                {e.memo ? <div className="p" style={{ marginTop:6 }}>참고사항: {e.memo}</div> : null}
              </div>
              <button type="button" className="btn danger" onClick={() => remove(e.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
