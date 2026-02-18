import { useState } from "react";
import { MasterFormHeader } from "@kernel/components/master";
import { DailyMetaFields } from "@kernel/components/record";
import { useRegisterActionPage } from "./hooks/useRegisterActionPage";
import { useRegisterIssuePage } from "./hooks/useRegisterIssuePage";
import { useRegisterProductionPage } from "./hooks/useRegisterProductionPage";
import { IssueActionModal } from "./sections/logistics";
import {
  buildDailyRecordTitle,
  compactCardStyle,
  compactDangerButtonStyle,
  compactPrimaryButtonStyle,
  compactSubCardStyle,
} from "./sections/common/dailyRecordView";

export default function RegisterProductionDailyPage() {
  const {
    draft,
    docs,
    lineDraft,
    setLineDraft,
    shiftOptions,
    productOptions,
    itemOptions,
    siteOptions,
    writerLocked,
    updateDraft,
    addLine,
    removeLine,
    resetDraft,
    submit,
    removeDoc,
  } = useRegisterProductionPage();

  const {
    draft: issueDraft,
    lineOptions: issueLineOptions,
    suggestionCandidates: issueSuggestionCandidates,
    linkTypeOptions: issueLinkTypeOptions,
    siteOptions: issueSiteOptions,
    updateDraft: updateIssueDraft,
    selectLinkedReference: selectIssueLinkedReference,
    addSuggestionCandidate: addIssueSuggestionCandidate,
    removeLinkedReference: removeIssueLinkedReference,
    applyPreset: applyIssuePreset,
    submit: submitIssue,
  } = useRegisterIssuePage();

  const {
    draft: actionDraft,
    siteOptions: actionSiteOptions,
    pendingIssues,
    vendors,
    updateDraft: updateActionDraft,
    applyPreset: applyActionPreset,
    submit: submitAction,
  } = useRegisterActionPage();

  const [showIssueModal, setShowIssueModal] = useState(false);

  function openIssueModal() {
    applyIssuePreset({
      recordDate: draft.recordDate,
      site: draft.site,
      writerName: draft.writerName,
      writerRole: draft.writerRole,
      title: "",
      details: "",
      linkType: "partner",
      linkId: "",
      linkedReferences: [],
      status: "진행중",
      category: "현장",
    });
    applyActionPreset({
      recordDate: draft.recordDate,
      site: draft.site,
      writerName: draft.writerName,
      writerRole: draft.writerRole,
      title: "",
      details: "",
      issueId: "",
      issueLabel: "",
      vendorId: "",
      vendorLabel: "",
      vendorCost: 0,
      tagsText: "",
    });
    setShowIssueModal(true);
  }

  async function handleIssueSubmit() {
    const issueResult = await submitIssue({
      enforceRecordDate: draft.recordDate,
      enforceSite: draft.site,
      enforceWriterName: draft.writerName,
      enforceWriterRole: draft.writerRole,
      titleTemplate: "issue-daily-production",
    });
    if (!issueResult.ok) {
      alert(issueResult.message);
      return;
    }

    if (issueResult.status === "완료") {
      applyActionPreset({
        recordDate: draft.recordDate,
        site: draft.site,
        writerName: draft.writerName,
        writerRole: draft.writerRole,
        issueId: issueResult.itemId || "",
        issueLabel: issueResult.itemTitle || "",
      });
      alert(`${issueResult.message} 조치기록 입력을 계속해 주세요.`);
      return;
    }

    alert(issueResult.message);
    setShowIssueModal(false);
  }

  async function handleActionSubmit() {
    const result = await submitAction({
      enforceRecordDate: draft.recordDate,
      enforceSite: draft.site,
      enforceWriterName: draft.writerName,
      enforceWriterRole: draft.writerRole,
      titleTemplate: "action-daily-production",
    });
    alert(result.message);
    if (!result.ok) return;
    setShowIssueModal(false);
  }

  return (
    <div className="card menu-page">
      <MasterFormHeader title="생산 기록 등록" onReset={resetDraft} />
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

      <div style={compactCardStyle}>
        <h2 className="h1" style={{ fontSize: 16 }}>
          생산 항목 추가
        </h2>
        <div className="form-grid" style={{ marginTop: 10 }}>
          <div className="form-two-col">
            <div className="form-field">
              <p className="form-label">근무조</p>
              <select
                className="input"
                value={lineDraft.shift}
                onChange={(e) =>
                  setLineDraft((prev) => ({ ...prev, shift: e.target.value as (typeof shiftOptions)[number] }))
                }
              >
                {shiftOptions.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <p className="form-label">종류</p>
              <select
                className="input"
                value={lineDraft.product}
                onChange={(event) =>
                  setLineDraft((prev) => ({
                    ...prev,
                    product: event.target.value as (typeof productOptions)[number],
                  }))
                }
              >
                {productOptions.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-two-col">
            <div className="form-field">
              <p className="form-label">품목</p>
              <select
                className="input"
                value={lineDraft.item}
                onChange={(event) =>
                  setLineDraft((prev) => ({ ...prev, item: event.target.value as (typeof itemOptions)[number] }))
                }
              >
                {itemOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <p className="form-label">생산수량(자루)</p>
              <input
                className="input"
                inputMode="numeric"
                value={String(lineDraft.bags)}
                onChange={(e) => setLineDraft((prev) => ({ ...prev, bags: Number(e.target.value || 0) }))}
              />
            </div>
          </div>

          <div className="form-field">
            <p className="form-label">비고</p>
            <input
              className="input"
              value={lineDraft.memo}
              onChange={(e) => setLineDraft((prev) => ({ ...prev, memo: e.target.value }))}
            />
          </div>
        </div>

        <div className="row">
          <button type="button" style={compactPrimaryButtonStyle} onClick={addLine}>
            생산 항목 추가
          </button>
          <button type="button" style={compactPrimaryButtonStyle} onClick={openIssueModal}>
            이슈 등록
          </button>
        </div>

        {(draft.lines || []).map((line) => (
          <div key={line.id} style={compactSubCardStyle}>
            <div style={{ fontWeight: 900 }}>
              {line.shift} · {line.product} · {line.item}
            </div>
            <div className="p" style={{ marginTop: 6 }}>
              {line.bags.toLocaleString()} 자루
            </div>
            {line.memo ? <div className="p" style={{ marginTop: 6 }}>{line.memo}</div> : null}
            <div className="row">
              <button type="button" style={compactDangerButtonStyle} onClick={() => removeLine(line.id)}>
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
        최근 문서
      </h2>
      {docs.length === 0 ? <p className="p">아직 저장한 문서가 없습니다.</p> : null}

      {docs.slice(0, 30).map((doc) => (
        <div key={doc.id} style={compactCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14 }}>
                {buildDailyRecordTitle("생산", doc.writerName, doc.writerRole || "", doc.recordDate)}
              </div>
              <div className="p" style={{ marginTop: 6 }}>
                {doc.recordDate} · {doc.site || "-"}
              </div>
              <div className="p" style={{ marginTop: 6 }}>
                작성자 {(doc.writerName || "-").trim()} {(doc.writerRole || "").trim()}
              </div>
              <div className="p" style={{ marginTop: 6 }}>항목 {(doc.lines || []).length}건</div>
            </div>
            <button
              type="button"
              style={compactDangerButtonStyle}
              onClick={() => {
                if (!confirm(`생산기록(${doc.recordDate})을 삭제하시겠습니까?`)) return;
                removeDoc(doc.id);
              }}
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <IssueActionModal
        open={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        issueDraft={issueDraft}
        issueSiteOptions={issueSiteOptions}
        issueLinkTypeOptions={issueLinkTypeOptions}
        issueLineOptions={issueLineOptions}
        issueSuggestionCandidates={issueSuggestionCandidates}
        updateIssueDraft={updateIssueDraft}
        selectIssueLinkedReference={selectIssueLinkedReference}
        addIssueSuggestionCandidate={addIssueSuggestionCandidate}
        removeIssueLinkedReference={removeIssueLinkedReference}
        onIssueSubmit={handleIssueSubmit}
        actionDraft={actionDraft}
        actionSiteOptions={actionSiteOptions}
        pendingIssues={pendingIssues}
        vendors={vendors}
        updateActionDraft={updateActionDraft}
        onActionSubmit={handleActionSubmit}
      />
    </div>
  );
}
