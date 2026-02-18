import { MasterFormHeader } from "@kernel/components/master";
import ActionRegisterForm from "./components/ActionRegisterForm";
import {
  buildDailyRecordTitle,
  compactCardStyle,
  compactDangerButtonStyle,
  compactSubCardStyle,
} from "./sections/common/dailyRecordView";
import { useRegisterActionPage } from "./hooks/useRegisterActionPage";

export default function RegisterActionPage() {
  const { draft, docs, siteOptions, writerLocked, pendingIssues, vendors, updateDraft, resetDraft, submit, removeItem } =
    useRegisterActionPage();

  async function handleSubmit() {
    const result = await submit();
    if (!result.ok) {
      alert(result.message);
      return;
    }
    alert(result.message);
  }

  return (
    <div className="card menu-page">
      <MasterFormHeader title="조치 기록 등록" onReset={resetDraft} />
      <div className="divider" />

      <ActionRegisterForm
        draft={draft}
        pendingIssues={pendingIssues}
        vendors={vendors}
        siteOptions={siteOptions}
        onChange={updateDraft}
        onSubmit={handleSubmit}
        lockSite={false}
        lockWriterName={writerLocked}
        lockWriterRole={writerLocked}
      />

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>
        오늘 등록한 조치
      </h2>
      {docs.length === 0 ? <p className="p">아직 저장한 조치 문서가 없습니다.</p> : null}

      {docs.map((doc) => (
        <div key={doc.id} style={compactCardStyle}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>
            {buildDailyRecordTitle("조치", doc.writerName, doc.writerRole || "", doc.recordDate)}
          </div>
          <div className="p" style={{ marginTop: 3, fontSize: 12 }}>
            {doc.recordDate} · {doc.site || "-"}
          </div>
          {(doc.items || []).map((item) => (
            <div key={item.id} style={compactSubCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
                <button
                  type="button"
                  style={compactDangerButtonStyle}
                  onClick={async () => {
                    if (!confirm(`조치 항목 "${item.title}"를 삭제하시겠습니까?`)) return;
                    const result = await removeItem(doc.id, item.id);
                    alert(result.message);
                  }}
                >
                  삭제
                </button>
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                {item.details}
              </div>
              {item.issueLabel ? <div className="p" style={{ marginTop: 2, fontSize: 11 }}>이슈: {item.issueLabel}</div> : null}
              {item.vendorLabel ? <div className="p" style={{ marginTop: 2, fontSize: 11 }}>업체: {item.vendorLabel}</div> : null}
              {item.tags?.length ? <div className="p" style={{ marginTop: 2, fontSize: 11 }}>#{item.tags.join(" #")}</div> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
