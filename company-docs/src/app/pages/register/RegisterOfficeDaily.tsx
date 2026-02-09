import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import { useDraftState } from "../../../base/utils/useDraftState";
import TagInputText from "../../../base/components/TagInputText";

import type { OfficeDraft, OfficeExtraAgency, OfficeExtraEtc, OfficeRecord } from "../../../domain/schema/daily/office";
import { defaultOfficeDraft, normalizeOfficeDraft, validateOfficeDraft, toOfficeRecord } from "../../../domain/schema/daily/office";

import type { Agency } from "./RegisterAgency";
import { AgencyForm } from "./RegisterAgency";

type AddMode = "none" | "agency" | "etc";

const KEY_DRAFT = "draft_office_daily_schema_v2";

function makeId(prefix: string) {
  // @ts-ignore
  const uuid = (globalThis.crypto?.randomUUID?.() as string | undefined) || "";
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function agencyLabel(a: Agency) {
  // RegisterAgency가 name을 유지하는 구조(호환) 기준
  const n = (a.name || "").trim();
  if (n) return n;
  const base = (a.baseName || "").trim();
  const tag = (a.detailTag || "").trim();
  return tag ? `${base} · ${tag}` : base || "(기관명 없음)";
}

export default function RegisterOfficeDaily() {
  // ✅ 관계기관은 state로 들고 있어야 인라인 추가 후 즉시 갱신 가능
  const [agenciesDir, setAgenciesDir] = useState<Agency[]>(() => repo.agencies<Agency>().getAll());

  const [list, setList] = useState<OfficeRecord[]>(() => repo.officeDaily<OfficeRecord>().getAll());

  const { state: raw, setState: setRaw, reset, clear } = useDraftState<any>(KEY_DRAFT, defaultOfficeDraft());
  const draft: OfficeDraft = useMemo(() => normalizeOfficeDraft(raw), [raw]);

  // ✅ 추가입력 UI state
  const [addMode, setAddMode] = useState<AddMode>("none");

  const [agencyPick, setAgencyPick] = useState<string>("");
  const [agencyTitle, setAgencyTitle] = useState<string>("");
  const [agencyDetails, setAgencyDetails] = useState<string>("");

  const [etcTitle, setEtcTitle] = useState<string>("");
  const [etcDetails, setEtcDetails] = useState<string>("");

  // ✅ 인라인 기관 폼 토글
  const [showAgencyForm, setShowAgencyForm] = useState<boolean>(false);

  function persist(next: OfficeDraft) {
    setRaw(normalizeOfficeDraft(next));
  }

  function toggleMode(m: AddMode) {
    setAddMode((prev) => (prev === m ? "none" : m));
  }

  function refreshAgencies(selectId?: string) {
    const next = repo.agencies<Agency>().getAll();
    setAgenciesDir(next);
    if (selectId) setAgencyPick(selectId);
  }

  function addAgencyExtra() {
    if (!agencyPick) return alert("관계기관을 선택하세요.");
    const a = agenciesDir.find((x) => x.id === agencyPick);
    if (!a) return alert("선택한 관계기관을 찾을 수 없습니다.");

    const row: OfficeExtraAgency = {
      id: makeId("EA"),
      agencyId: a.id,
      agencyLabel: agencyLabel(a),
      title: agencyTitle.trim(),
      details: agencyDetails.trim(),
    };

    persist({
      ...draft,
      extraAgencies: [row, ...(draft.extraAgencies || [])],
    });

    setAgencyTitle("");
    setAgencyDetails("");
  }

  function removeAgencyExtra(id: string) {
    persist({
      ...draft,
      extraAgencies: (draft.extraAgencies || []).filter((x) => x.id !== id),
    });
  }

  function addEtcExtra() {
    const row: OfficeExtraEtc = {
      id: makeId("ET"),
      title: etcTitle.trim(),
      details: etcDetails.trim(),
    };
    if (!row.title && !row.details) return alert("기타 내용을 입력하세요.");

    persist({
      ...draft,
      extraEtc: [row, ...(draft.extraEtc || [])],
    });

    setEtcTitle("");
    setEtcDetails("");
  }

  function removeEtcExtra(id: string) {
    persist({
      ...draft,
      extraEtc: (draft.extraEtc || []).filter((x) => x.id !== id),
    });
  }

  function submit() {
    const vr = validateOfficeDraft(draft);
    if (!vr.ok) return alert(vr.errors[0]?.message || "입력값을 확인하세요.");

    const rec: OfficeRecord = toOfficeRecord(draft);

    const prev = repo.officeDaily<OfficeRecord>().getAll();
    const next = [rec, ...(prev || [])];
    repo.officeDaily<OfficeRecord>().setAll(next);
    setList(next);

    clear();
    reset();
    setRaw(defaultOfficeDraft());

    setAddMode("none");
    setAgencyPick("");
    setAgencyTitle("");
    setAgencyDetails("");
    setEtcTitle("");
    setEtcDetails("");
    setShowAgencyForm(false);

    alert("저장되었습니다.");
  }

  function removeEntry(id: string) {
    const prev = repo.officeDaily<OfficeRecord>().getAll();
    const next = (prev || []).filter((x) => x.id !== id);
    repo.officeDaily<OfficeRecord>().setAll(next);
    setList(next);
  }

  const recent = useMemo(() => (list || []).slice(0, 50), [list]);

  return (
    <div className="card">
      <h1 className="h1">사무기록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>기록날짜</div>
          <input className="input" type="date" value={draft.recordDate} onChange={(e) => persist({ ...draft, recordDate: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>작성자</div>
          <input className="input" value={draft.writerName} onChange={(e) => persist({ ...draft, writerName: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
          <div className="p" style={{ marginTop: 0 }}>제목</div>
          <input className="input" value={draft.title} onChange={(e) => persist({ ...draft, title: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>내용</div>
          <textarea className="textarea" rows={4} value={draft.details} onChange={(e) => persist({ ...draft, details: e.target.value })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
          <div className="p" style={{ marginTop: 0 }}>태그</div>
          <div>
            <TagInputText value={draft.tagsText} onChange={(next) => persist({ ...draft, tagsText: next })} scope="office" />
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>추가입력</div>

        <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          <button type="button" className={`selBtn ${addMode === "agency" ? "active" : ""}`} onClick={() => toggleMode("agency")}>관계기관</button>
          <button type="button" className={`selBtn ${addMode === "etc" ? "active" : ""}`} onClick={() => toggleMode("etc")}>기타</button>
        </div>

        {addMode === "agency" ? (
          <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
                <div className="p" style={{ marginTop: 0 }}>관계기관</div>
                <div className="row" style={{ marginTop: 0 }}>
                  <select className="input" value={agencyPick} onChange={(e) => setAgencyPick(e.target.value)}>
                    <option value="">선택</option>
                    {agenciesDir.map((x) => (
                      <option key={x.id} value={x.id}>{agencyLabel(x)}</option>
                    ))}
                  </select>
                  <button type="button" className="btn" onClick={() => setShowAgencyForm((v) => !v)}>
                    기관추가/수정
                  </button>
                </div>
              </div>

              {showAgencyForm ? (
                <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <AgencyForm
                    draftKey="draft_agency_inline_office_v1"
                    hideHeader
                    hideList
                    onSaved={(a) => {
                      refreshAgencies(a.id);
                      setShowAgencyForm(false);
                    }}
                  />
                  <div className="row">
                    <button type="button" className="btn" onClick={() => { refreshAgencies(); setShowAgencyForm(false); }}>
                      닫기
                    </button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
                <div className="p" style={{ marginTop: 0 }}>제목</div>
                <input className="input" value={agencyTitle} onChange={(e) => setAgencyTitle(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
                <div className="p" style={{ marginTop: 0 }}>내용</div>
                <textarea className="textarea" rows={3} value={agencyDetails} onChange={(e) => setAgencyDetails(e.target.value)} />
              </div>
            </div>

            <div className="row">
              <button type="button" className="btn primary" onClick={addAgencyExtra}>추가</button>
            </div>

            {(draft.extraAgencies || []).length ? (
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {(draft.extraAgencies || []).map((x) => (
                  <div key={x.id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontWeight: 900 }}>{x.agencyLabel}</div>
                    {x.title ? <div className="p" style={{ marginTop: 6 }}>제목: {x.title}</div> : null}
                    {x.details ? <div className="p" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{x.details}</div> : null}
                    <div className="row">
                      <button type="button" className="btn danger" onClick={() => removeAgencyExtra(x.id)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {addMode === "etc" ? (
          <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
                <div className="p" style={{ marginTop: 0 }}>제목</div>
                <input className="input" value={etcTitle} onChange={(e) => setEtcTitle(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
                <div className="p" style={{ marginTop: 0 }}>내용</div>
                <textarea className="textarea" rows={3} value={etcDetails} onChange={(e) => setEtcDetails(e.target.value)} />
              </div>
            </div>

            <div className="row">
              <button type="button" className="btn primary" onClick={addEtcExtra}>추가</button>
            </div>

            {(draft.extraEtc || []).length ? (
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {(draft.extraEtc || []).map((x) => (
                  <div key={x.id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontWeight: 900 }}>{x.title || "(제목없음)"}</div>
                    {x.details ? <div className="p" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{x.details}</div> : null}
                    <div className="row">
                      <button type="button" className="btn danger" onClick={() => removeEtcExtra(x.id)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>저장</button>
        <button type="button" className="btn" onClick={() => { clear(); reset(); setRaw(defaultOfficeDraft()); setAddMode("none"); }}>
          초기화
        </button>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>최근 기록</div>

        {recent.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          recent.map((x) => (
            <div key={x.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{x.recordDate} · {x.title}</div>
                  {x.createdAt ? <div className="p" style={{ marginTop: 6, opacity: 0.8 }}>{x.createdAt}</div> : null}
                  {x.tags?.length ? <div className="p" style={{ marginTop: 6 }}>#{x.tags.join(" #")}</div> : null}
                  {x.details ? <div className="p" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{x.details}</div> : null}
                </div>
                <button type="button" className="btn danger" onClick={() => removeEntry(x.id)}>삭제</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}