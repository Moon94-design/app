import { MasterFormHeader } from "@kernel/components/master";
import IssueRegisterForm from "./components/IssueRegisterForm";
import {
  buildDailyRecordTitle,
  compactCardStyle,
  compactDangerButtonStyle,
  compactSubCardStyle,
} from "./sections/common/dailyRecordView";
import { useRegisterIssuePage } from "./hooks/useRegisterIssuePage";

export default function RegisterIssuePage() {
  const {
    draft,
    docs,
    lineOptions,
    suggestionCandidates,
    linkTypeOptions,
    siteOptions,
    writerLocked,
    updateDraft,
    selectLinkedReference,
    addSuggestionCandidate,
    removeLinkedReference,
    resetDraft,
    submit,
    removeDoc,
  } = useRegisterIssuePage();

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
        linkTypeOptions={linkTypeOptions}
        lineOptions={lineOptions}
        suggestionCandidates={suggestionCandidates}
        onChange={updateDraft}
        onSelectLinkedReference={selectLinkedReference}
        onAddSuggestionCandidate={addSuggestionCandidate}
        onRemoveLinkedReference={removeLinkedReference}
        onSubmit={handleSubmit}
        lockSite={false}
        lockWriterName={writerLocked}
        lockWriterRole={writerLocked}
      />

      <div className="divider" />

      <h2 className="h1" style={{ fontSize: 16 }}>
        저장된 이슈 문서
      </h2>
      {docs.length === 0 ? <p className="p">아직 저장된 문서가 없습니다.</p> : null}

      {docs.map((doc) => (
        <div key={doc.id} style={compactCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14 }}>
                {buildDailyRecordTitle("이슈", doc.writerName, doc.writerRole || "", doc.recordDate)}
              </div>
              <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                {doc.recordDate} · {doc.site || "-"} · 이슈 항목 {doc.items.length}건
              </div>
            </div>
            <button
              type="button"
              style={compactDangerButtonStyle}
              onClick={async () => {
                if (!confirm(`이슈 문서(${doc.recordDate})를 삭제하시겠습니까?`)) return;
                const result = await removeDoc(doc.id);
                alert(result.message);
              }}
            >
              삭제
            </button>
          </div>
          {(doc.items || []).map((item) => (
            <div key={item.id} style={compactSubCardStyle}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
              {item.details ? (
                <div className="p" style={{ marginTop: 4, fontSize: 12, whiteSpace: "pre-wrap" }}>
                  {item.details}
                </div>
              ) : null}
              {item.linkedReferences?.length ? (
                <div className="p" style={{ marginTop: 4, fontSize: 11 }}>
                  연계: {item.linkedReferences.map((ref) => ref.label).join(", ")}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
