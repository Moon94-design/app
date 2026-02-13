import { MasterFormHeader } from "@kernel/components/master";
import IssueRegisterForm from "./components/IssueRegisterForm";
import { useRegisterIssuePage } from "./hooks/useRegisterIssuePage";

export default function RegisterIssuePage() {
  const { draft, docs, siteOptions, writerLocked, updateDraft, resetDraft, submit, removeDoc } = useRegisterIssuePage();

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
      <MasterFormHeader title="이슈 기록 등록" onReset={resetDraft} />
      <div className="divider" />

      <IssueRegisterForm
        draft={draft}
        siteOptions={siteOptions}
        onChange={updateDraft}
        onSubmit={handleSubmit}
        lockSite={writerLocked}
        lockWriterName={writerLocked}
        lockWriterRole={writerLocked}
      />

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>
        저장된 이슈 문서
      </h2>
      {docs.length === 0 ? <p className="p">아직 저장된 문서가 없습니다.</p> : null}

      {docs.map((doc) => (
        <div key={doc.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>
                {doc.recordDate} · {doc.site || "-"} · {doc.writerName}
              </div>
              <div className="p" style={{ marginTop: 6 }}>
                직책: {doc.writerRole || "-"}
              </div>
              <div className="p" style={{ marginTop: 6 }}>이슈 항목 {doc.items.length}건</div>
            </div>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (!confirm(`이슈 문서(${doc.recordDate})를 삭제하시겠습니까?`)) return;
                removeDoc(doc.id);
              }}
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
