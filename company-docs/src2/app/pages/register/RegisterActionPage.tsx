import { MasterFormHeader } from "@kernel/components/master";
import ActionRegisterForm from "./components/ActionRegisterForm";
import { useRegisterActionPage } from "./hooks/useRegisterActionPage";

export default function RegisterActionPage() {
  const { draft, docs, siteOptions, pendingIssues, vendors, updateDraft, resetDraft, submit, removeItem } =
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
      />

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>
        오늘 등록한 조치
      </h2>
      {docs.length === 0 ? <p className="p">아직 저장한 조치 문서가 없습니다.</p> : null}

      {docs.map((doc) => (
        <div key={doc.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontWeight: 900 }}>
            {doc.recordDate} · {doc.site || "-"} · {doc.writerName}
          </div>
          {doc.writerRole ? <div className="p" style={{ marginTop: 4 }}>직책: {doc.writerRole}</div> : null}
          {(doc.items || []).map((item) => (
            <div
              key={item.id}
              style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>{item.title}</div>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => {
                    if (!confirm(`조치 항목 "${item.title}"를 삭제하시겠습니까?`)) return;
                    removeItem(doc.id, item.id);
                  }}
                >
                  삭제
                </button>
              </div>
              <div className="p" style={{ marginTop: 6 }}>
                {item.details}
              </div>
              {item.issueLabel ? <div className="p" style={{ marginTop: 4 }}>이슈: {item.issueLabel}</div> : null}
              {item.vendorLabel ? <div className="p" style={{ marginTop: 4 }}>업체: {item.vendorLabel}</div> : null}
              {item.tags?.length ? <div className="p" style={{ marginTop: 4 }}>#{item.tags.join(" #")}</div> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
