import { MasterFormHeader } from "@kernel/components/master";
import { DailyMetaFields } from "@kernel/components/record";
import { useRegisterOfficePage } from "./hooks/useRegisterOfficePage";
import OfficeLineDraftPanel from "./sections/office/OfficeLineDraftPanel";
import OfficeUnifiedHistoryPanel from "./sections/office/OfficeUnifiedHistoryPanel";

export default function RegisterOfficeDailyPage() {
  const {
    draft,
    lineOptions,
    suggestionCandidates,
    linkTypeOptions,
    siteOptions,
    mergedHistoryLines,
    historyLineEditTarget,
    writerLocked,
    updateDraft,
    updateLineDraft,
    commitLineDraft,
    selectLinkedReference,
    addSuggestionCandidate,
    removeLinkedReference,
    beginHistoryLineEdit,
    cancelHistoryLineEdit,
    removeHistoryLine,
    resetDraft,
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
          lockSite={false}
          lockWriterName={writerLocked}
          lockWriterRole={writerLocked}
        />
      </div>

      <div className="divider" />

      <OfficeLineDraftPanel
        draft={draft}
        lineOptions={lineOptions}
        suggestionCandidates={suggestionCandidates}
        linkTypeOptions={linkTypeOptions}
        isHistoryLineEditing={Boolean(historyLineEditTarget)}
        onUpdateLineDraft={updateLineDraft}
        onSelectLinkedReference={selectLinkedReference}
        onAddSuggestionCandidate={addSuggestionCandidate}
        onRemoveLinkedReference={removeLinkedReference}
        onCommitLineDraft={async () => {
          const result = await commitLineDraft();
          if (!result.ok) {
            alert(result.message);
            return;
          }
          if (result.message) alert(result.message);
        }}
        onCancelHistoryLineEdit={cancelHistoryLineEdit}
      />

      <div className="divider" />

      <OfficeUnifiedHistoryPanel
        items={mergedHistoryLines}
        linkTypeOptions={linkTypeOptions}
        onEditItem={beginHistoryLineEdit}
        onRemoveItem={removeHistoryLine}
      />
    </div>
  );
}
