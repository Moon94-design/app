import { useMemo } from "react";
import { useDraftState } from "../../../base/utils/useDraftState";

type Branch = "대구" | "성주";
type Agency = { id: string; name: string; region: string };

type OfficeEntry = {
  id: string;
  createdAt: string;
  createdBy: string;
  branch: Branch;

  // 기본 업무(항상)
  internalTitle: string;
  internalDetail: string;

  // 하단 체크로 추가되는 섹션들
  addAgency: boolean;
  agencyId: string;
  agencyName: string;
  agencyChannel: "방문" | "전화" | "공문" | "이메일" | "포털" | "기타";
  agencyStatus: "접수" | "진행" | "완료";
  agencySummary: string;
  agencyDetail: string;
  agencyAction: string;
  agencyNext: string;

  addGrant: boolean;
  grantName: string;
  grantStage: "공고 확인" | "신청 준비" | "신청 완료" | "선정" | "정산" | "종료";
  grantDeadline: string; // YYYY-MM-DD
  grantTodo: string;

  addOther: boolean;
  otherTitle: string;
  otherDetail: string;
};

const KEY_AUTHOR = "local_author_name_v1";
const KEY_AGENCIES = "local_agencies_v1";
const KEY_LIST = "daily_office_v1";
const DRAFT_KEY = "draft_office_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `O_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultDraft(): OfficeEntry {
  return {
    id: "",
    createdAt: "",
    createdBy: "",
    branch: "대구",

    internalTitle: "",
    internalDetail: "",

    addAgency: false,
    agencyId: "",
    agencyName: "",
    agencyChannel: "방문",
    agencyStatus: "접수",
    agencySummary: "",
    agencyDetail: "",
    agencyAction: "",
    agencyNext: "",

    addGrant: false,
    grantName: "",
    grantStage: "공고 확인",
    grantDeadline: "",
    grantTodo: "",

    addOther: false,
    otherTitle: "",
    otherDetail: "",
  };
}

export default function RegisterOfficeDaily() {
  const agencies = useMemo(() => loadJson<Agency[]>(KEY_AGENCIES, [] as Agency[]), []);
  const list = useMemo(() => loadJson<OfficeEntry[]>(KEY_LIST, [] as OfficeEntry[]), []);
  const { state: form, setState: setForm, reset: resetForm } = useDraftState<OfficeEntry>(DRAFT_KEY, defaultDraft());

  function patch(p: Partial<OfficeEntry>) {
    setForm({ ...form, ...p });
  }

  function pickAgency(id: string) {
    const a = agencies.find((x) => x.id === id);
    patch({ agencyId: id, agencyName: a ? a.name : "" });
  }

  function submit() {
    const by = (localStorage.getItem(KEY_AUTHOR) || "").trim() || "작성자 미설정";

    if (!form.branch) return alert("지부를 선택하세요.");

    // 기본 업무는 최소 제목은 있어야 저장(표기 없이 강제)
    if (!form.internalTitle.trim()) return alert("업무 제목을 입력하세요.");

    if (form.addAgency) {
      if (!form.agencyId) return alert("관계기관을 선택하세요.");
      if (!form.agencySummary.trim()) return alert("관계기관 업무 요약을 입력하세요.");
      if (!form.agencyAction.trim()) return alert("조치/대응을 입력하세요.");
    }

    if (form.addGrant) {
      if (!form.grantName.trim()) return alert("지원사업명을 입력하세요.");
      // 마감일은 비워도 되지만, 쓰려면 날짜형식 권장(여기선 강제 안함)
    }

    if (form.addOther) {
      if (!form.otherTitle.trim()) return alert("기타 제목을 입력하세요.");
    }

    const saved: OfficeEntry = {
      ...form,
      id: newId(),
      createdAt: nowIso(),
      createdBy: by,
    };

    const next = [saved, ...list];
    saveJson(KEY_LIST, next);

    // draft 초기화
    resetForm();
    alert("저장되었습니다.(로컬)");
  }

  const recent = useMemo(() => loadJson<OfficeEntry[]>(KEY_LIST, [] as OfficeEntry[]).slice(0, 20), [form]);

  return (
    <div className="card">
      <h1 className="h1">사무 기록</h1>
      <p className="p">여러 업무를 한 번에 입력하고 저장할 수 있습니다.</p>

      <div className="divider" />

      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>지부</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["대구", "성주"] as const).map((b) => (
              <button key={b} type="button" className={`selBtn ${form.branch === b ? "active" : ""}`} onClick={() => patch({ branch: b })}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="h1" style={{ fontSize: 15 }}>기본 업무</div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div>
              <div className="p" style={{ marginTop: 0 }}>업무 제목</div>
              <input className="input" value={form.internalTitle} onChange={(e) => patch({ internalTitle: e.target.value })} />
            </div>

            <div>
              <div className="p" style={{ marginTop: 0 }}>업무 내용</div>
              <textarea className="textarea" rows={4} value={form.internalDetail} onChange={(e) => patch({ internalDetail: e.target.value })} />
            </div>
          </div>
        </div>

        {/* 하단 체크로 “가끔” 쓰는 섹션 펼치기 */}
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="h1" style={{ fontSize: 15 }}>추가 입력</div>

          <div className="row">
            <button type="button" className={`selBtn ${form.addAgency ? "active" : ""}`} onClick={() => patch({ addAgency: !form.addAgency })}>
              관계기관
            </button>
            <button type="button" className={`selBtn ${form.addGrant ? "active" : ""}`} onClick={() => patch({ addGrant: !form.addGrant })}>
              지원사업/보조금
            </button>
            <button type="button" className={`selBtn ${form.addOther ? "active" : ""}`} onClick={() => patch({ addOther: !form.addOther })}>
              기타
            </button>
          </div>

          {form.addAgency ? (
            <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
              <div className="h1" style={{ fontSize: 15 }}>관계기관</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div>
                  <div className="p" style={{ marginTop: 0 }}>기관</div>
                  <select className="input" value={form.agencyId} onChange={(e) => pickAgency(e.target.value)}>
                    <option value="">선택</option>
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>채널</div>
                  <div className="row" style={{ marginTop: 8 }}>
                    {(["방문","전화","공문","이메일","포털","기타"] as const).map((c) => (
                      <button key={c} type="button" className={`selBtn ${form.agencyChannel === c ? "active" : ""}`} onClick={() => patch({ agencyChannel: c })}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>상태</div>
                  <div className="row" style={{ marginTop: 8 }}>
                    {(["접수","진행","완료"] as const).map((s) => (
                      <button key={s} type="button" className={`selBtn ${form.agencyStatus === s ? "active" : ""}`} onClick={() => patch({ agencyStatus: s })}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>요약</div>
                  <input className="input" value={form.agencySummary} onChange={(e) => patch({ agencySummary: e.target.value })} />
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>상세</div>
                  <textarea className="textarea" rows={4} value={form.agencyDetail} onChange={(e) => patch({ agencyDetail: e.target.value })} />
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>조치/대응</div>
                  <textarea className="textarea" rows={3} value={form.agencyAction} onChange={(e) => patch({ agencyAction: e.target.value })} />
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>후속 일정</div>
                  <input className="input" value={form.agencyNext} onChange={(e) => patch({ agencyNext: e.target.value })} />
                </div>
              </div>
            </div>
          ) : null}

          {form.addGrant ? (
            <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
              <div className="h1" style={{ fontSize: 15 }}>지원사업/보조금</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div>
                  <div className="p" style={{ marginTop: 0 }}>사업명</div>
                  <input className="input" value={form.grantName} onChange={(e) => patch({ grantName: e.target.value })} />
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>단계</div>
                  <div className="row" style={{ marginTop: 8 }}>
                    {(["공고 확인","신청 준비","신청 완료","선정","정산","종료"] as const).map((s) => (
                      <button key={s} type="button" className={`selBtn ${form.grantStage === s ? "active" : ""}`} onClick={() => patch({ grantStage: s })}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>마감일</div>
                  <input className="input" type="date" value={form.grantDeadline} onChange={(e) => patch({ grantDeadline: e.target.value })} />
                </div>

                <div>
                  <div className="p" style={{ marginTop: 0 }}>해야 할 일</div>
                  <textarea className="textarea" rows={4} value={form.grantTodo} onChange={(e) => patch({ grantTodo: e.target.value })} />
                </div>
              </div>
            </div>
          ) : null}

          {form.addOther ? (
            <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
              <div className="h1" style={{ fontSize: 15 }}>기타</div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div>
                  <div className="p" style={{ marginTop: 0 }}>제목</div>
                  <input className="input" value={form.otherTitle} onChange={(e) => patch({ otherTitle: e.target.value })} />
                </div>
                <div>
                  <div className="p" style={{ marginTop: 0 }}>내용</div>
                  <textarea className="textarea" rows={4} value={form.otherDetail} onChange={(e) => patch({ otherDetail: e.target.value })} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="row">
          <button type="button" className="btn primary" onClick={submit}>저장(로컬)</button>
          <button type="button" className="btn" onClick={() => resetForm()}>초기화</button>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 사무 기록(최근 20개)</div>

        {recent.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          recent.map((r) => (
            <div key={r.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontWeight: 900 }}>{r.branch} · {r.createdBy}</div>
              <div className="p" style={{ marginTop: 6 }}>{r.createdAt.slice(0, 19).replace("T"," ")}</div>
              <div className="p" style={{ marginTop: 6 }}>{r.internalTitle}</div>
              <div className="row" style={{ marginTop: 10 }}>
                {r.addAgency ? <div className="pill">관계기관</div> : null}
                {r.addGrant ? <div className="pill">지원사업</div> : null}
                {r.addOther ? <div className="pill">기타</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}