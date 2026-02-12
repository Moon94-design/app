import { MasterFormHeader } from "@kernel/components/master";
import { DailyMetaFields } from "@kernel/components/record";
import { useRegisterOfficePage } from "./hooks/useRegisterOfficePage";

export default function RegisterOfficeDailyPage() {
  const {
    draft,
    siteOptions,
    records,
    agencies,
    agencyPick,
    setAgencyPick,
    agencyTitle,
    setAgencyTitle,
    agencyDetails,
    setAgencyDetails,
    etcTitle,
    setEtcTitle,
    etcDetails,
    setEtcDetails,
    updateDraft,
    addAgencyExtra,
    removeAgencyExtra,
    addEtcExtra,
    removeEtcExtra,
    resetDraft,
    submit,
    removeRecord,
  } = useRegisterOfficePage();

  return (
    <div className="card menu-page">
      <MasterFormHeader title="사무 기록 등록" onReset={resetDraft} />
      <div className="divider" />

      <div className="form-grid">
        <DailyMetaFields
          recordDate={draft.recordDate}
          site={draft.site}
          writerName={draft.writerName}
          writerRole={draft.writerRole}
          siteOptions={siteOptions}
          onChangeRecordDate={(next) => updateDraft({ recordDate: next })}
          onChangeSite={(next) => updateDraft({ site: next })}
          onChangeWriterName={(next) => updateDraft({ writerName: next })}
          onChangeWriterRole={(next) => updateDraft({ writerRole: next })}
        />

        <div className="form-field">
          <p className="form-label">제목</p>
          <input
            className="input"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="업무 제목"
          />
        </div>

        <div className="form-field">
          <p className="form-label">내용</p>
          <textarea
            className="textarea"
            rows={4}
            value={draft.details}
            onChange={(e) => updateDraft({ details: e.target.value })}
            placeholder="상세 내용"
          />
        </div>

        <div className="form-field">
          <p className="form-label">태그(쉼표 구분)</p>
          <input
            className="input"
            value={draft.tagsText}
            onChange={(e) => updateDraft({ tagsText: e.target.value })}
            placeholder="예: 긴급,지부,지자체"
          />
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h2 className="h1" style={{ fontSize: 16 }}>
          추가 입력 · 관공기관
        </h2>
        <div className="form-grid" style={{ marginTop: 10 }}>
          <div className="form-field">
            <p className="form-label">관공기관</p>
            <select className="input" value={agencyPick} onChange={(e) => setAgencyPick(e.target.value)}>
              <option value="">선택</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <p className="form-label">제목</p>
            <input className="input" value={agencyTitle} onChange={(e) => setAgencyTitle(e.target.value)} />
          </div>

          <div className="form-field">
            <p className="form-label">내용</p>
            <textarea
              className="textarea"
              rows={3}
              value={agencyDetails}
              onChange={(e) => setAgencyDetails(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <button type="button" className="btn" onClick={addAgencyExtra}>
            관공기관 항목 추가
          </button>
        </div>

        {draft.extraAgencies?.map((item) => (
          <div key={item.id} className="card" style={{ marginTop: 8, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontWeight: 900 }}>{item.agencyLabel}</div>
            {item.title ? <div className="p" style={{ marginTop: 6 }}>{item.title}</div> : null}
            {item.details ? (
              <div className="p" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                {item.details}
              </div>
            ) : null}
            <div className="row">
              <button type="button" className="btn danger" onClick={() => removeAgencyExtra(item.id)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <h2 className="h1" style={{ fontSize: 16 }}>
          추가 입력 · 기타
        </h2>
        <div className="form-grid" style={{ marginTop: 10 }}>
          <div className="form-field">
            <p className="form-label">제목</p>
            <input className="input" value={etcTitle} onChange={(e) => setEtcTitle(e.target.value)} />
          </div>
          <div className="form-field">
            <p className="form-label">내용</p>
            <textarea
              className="textarea"
              rows={3}
              value={etcDetails}
              onChange={(e) => setEtcDetails(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <button type="button" className="btn" onClick={addEtcExtra}>
            기타 항목 추가
          </button>
        </div>

        {draft.extraEtc?.map((item) => (
          <div key={item.id} className="card" style={{ marginTop: 8, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontWeight: 900 }}>{item.title || "(제목없음)"}</div>
            {item.details ? (
              <div className="p" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                {item.details}
              </div>
            ) : null}
            <div className="row">
              <button type="button" className="btn danger" onClick={() => removeEtcExtra(item.id)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <button type="button" className="btn primary" onClick={submit}>
          저장
        </button>
      </div>

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>
        최근 기록
      </h2>
      {records.length === 0 ? <p className="p">아직 저장한 기록이 없습니다.</p> : null}
      {records.slice(0, 20).map((record) => (
        <div key={record.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontWeight: 900 }}>
              {record.recordDate} · {record.site || "-"} · {record.title}
            </div>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (!confirm(`사무기록 "${record.title}"를 삭제하시겠습니까?`)) return;
                removeRecord(record.id);
              }}
            >
              삭제
            </button>
          </div>
          <div className="p" style={{ marginTop: 6 }}>
            작성자: {record.writerName || "-"} {record.writerRole || ""}
          </div>
          {record.tags?.length ? <div className="p" style={{ marginTop: 6 }}>#{record.tags.join(" #")}</div> : null}
          {record.details ? (
            <div className="p" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
              {record.details}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
