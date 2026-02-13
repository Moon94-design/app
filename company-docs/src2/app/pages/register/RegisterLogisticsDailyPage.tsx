import { useEffect, useMemo, useState } from "react";
import { MasterFormHeader } from "@kernel/components/master";
import { defaultPartnerV2Draft, type PartnerV2Draft } from "@kernel/schema/partner";
import { defaultVehicleDraft, type VehicleDraft } from "@kernel/schema/vehicle";
import { useRegisterActionPage } from "./hooks/useRegisterActionPage";
import { useRegisterIssuePage } from "./hooks/useRegisterIssuePage";
import { useRegisterLogisticsPage } from "./hooks/useRegisterLogisticsPage";
  import {
    IssueActionModal,
    LogisticsFormSection,
    LogisticsToast,
    PartnerQuickModal,
    ReturnSourcePanel,
    SelectedDateLogisticsList,
    VehicleQuickModal,
  } from "./sections/logistics";

export default function RegisterLogisticsDailyPage() {
  const {
    draft,
    siteOptions,
    partners,
    vehicles,
    records,
    kinds,
    directionOptions,
    categoryOptions,
    hasCategorySelection,
    hasPriceSelection,
    showScrapDetailSelection,
    isReturnMode,
    isReturnSourceLocked,
    scrapDetailOptions,
    customDetailInput,
    setCustomDetailInput,
    selectScrapDetail,
    applyCustomScrapDetail,
    returnSourceDateFilter,
    activeReturnSourceCandidates,
    selectedReturnSource,
    toggleReturnMode,
    setReturnSourceDateFilter,
    selectReturnSource,
    editingLineTarget,
    vehicleSuggestions,
    writerLocked,
    updateDraft,
    resetDraft,
    submit,
    startEditLine,
    removeLine,
    createPartnerQuick,
    createVehicleQuick,
    updatePartnerQuickName,
  } = useRegisterLogisticsPage();

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCustomDetailInput, setShowCustomDetailInput] = useState(false);
  const [partnerDraft, setPartnerDraft] = useState<PartnerV2Draft>(() => defaultPartnerV2Draft());
  const [vehicleDraft, setVehicleDraft] = useState<VehicleDraft>(() => defaultVehicleDraft());
  const [toastMessage, setToastMessage] = useState("");

  const {
    draft: issueDraft,
    siteOptions: issueSiteOptions,
    updateDraft: updateIssueDraft,
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

  const selectedDateRecord = records.find((record) => record.recordDate === draft.recordDate);
  const selectedDateTitle = selectedDateRecord?.title || "";
  const selectedDateLines = selectedDateRecord?.lines ?? [];

  const duplicatePartnerCandidates = useMemo(() => {
    const baseName = (partnerDraft.base.partnerName || "").trim().toLocaleLowerCase();
    if (!baseName) return [];

    return partners
      .filter((partner) => {
        const partnerBase = partner.label.split(/·|쨌/)[0]?.trim().toLocaleLowerCase() || "";
        return partnerBase === baseName;
      })
      .map((partner) => ({ id: partner.id, label: partner.label }));
  }, [partnerDraft.base.partnerName, partners]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  async function handleSubmit() {
    const result = await submit();
    if (!result.ok) {
      alert(result.message);
      return;
    }
    setToastMessage(result.message);
  }

  function handleEditLine(lineIndex: number) {
    if (!selectedDateRecord) return;
    const result = startEditLine(selectedDateRecord.id, lineIndex);
    if (!result.ok) {
      alert(result.message);
      return;
    }
    setToastMessage(result.message);
  }

  async function handleDeleteLine(lineIndex: number) {
    if (!selectedDateRecord) return;
    const line = selectedDateLines[lineIndex];
    const itemLabel = line?.partner?.label?.trim() || "선택 항목";
    if (!confirm(`"${itemLabel}" 항목을 삭제하시겠습니까?`)) return;

    const result = await removeLine(selectedDateRecord.id, lineIndex);
    if (!result.ok) {
      alert(result.message);
      return;
    }
    setToastMessage(result.message);
  }

  function openIssueModal() {
    applyIssuePreset({
      recordDate: draft.recordDate,
      site: draft.site,
      writerName: draft.writerName,
      writerRole: draft.writerRole,
      title: "",
      details: "",
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
      titleTemplate: "issue-daily-logistics",
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
      setToastMessage(`${issueResult.message} 조치기록 입력을 계속해 주세요.`);
      return;
    }

    setToastMessage(issueResult.message);
    setShowIssueModal(false);
  }

  async function handleActionSubmit() {
    const result = await submitAction({
      enforceRecordDate: draft.recordDate,
      enforceSite: draft.site,
      enforceWriterName: draft.writerName,
      enforceWriterRole: draft.writerRole,
      titleTemplate: "action-daily-logistics",
    });
    if (!result.ok) {
      alert(result.message);
      return;
    }
    setToastMessage(result.message);
    setShowIssueModal(false);
  }

  async function handlePartnerQuickSave() {
    const result = await createPartnerQuick(partnerDraft);
    const selectedPartnerLabel = (result.selectedText || partnerDraft.base.partnerName || "").trim();
    if (!result.ok) {
      if (result.id) {
        updateDraft({ partnerId: result.id, partnerLabel: selectedPartnerLabel });
        setShowPartnerModal(false);
        setToastMessage(result.message);
        return;
      }
      alert(result.message);
      return;
    }

    if (result.id) {
      updateDraft({ partnerId: result.id, partnerLabel: selectedPartnerLabel });
    }

    setPartnerDraft(defaultPartnerV2Draft());
    setShowPartnerModal(false);
    setToastMessage(result.message);
  }

  async function handleVehicleQuickSave() {
    const result = await createVehicleQuick(vehicleDraft);
    const selectedVehicleNo = (result.selectedText || vehicleDraft.vehicleNo || "").trim();
    if (!result.ok) {
      if (result.id) {
        updateDraft({ vehicleId: result.id, vehicleNo: selectedVehicleNo });
        setShowVehicleModal(false);
        setToastMessage(result.message);
        return;
      }
      alert(result.message);
      return;
    }

    if (result.id) {
      updateDraft({ vehicleId: result.id, vehicleNo: selectedVehicleNo });
    }

    setVehicleDraft(defaultVehicleDraft());
    setShowVehicleModal(false);
    setToastMessage(result.message);
  }

  return (
    <div className="card menu-page">
      <MasterFormHeader title="유통 기록 등록" onReset={resetDraft} />
      <div className="divider" />

      <LogisticsFormSection
        draft={draft}
        siteOptions={siteOptions}
        partners={partners}
        vehicles={vehicles}
        kinds={kinds}
        directionOptions={directionOptions}
        categoryOptions={categoryOptions}
        hasCategorySelection={hasCategorySelection}
        hasPriceSelection={hasPriceSelection}
        showScrapDetailSelection={showScrapDetailSelection}
        isReturnSourceLocked={isReturnSourceLocked}
        scrapDetailOptions={scrapDetailOptions}
        customDetailInput={customDetailInput}
        setCustomDetailInput={setCustomDetailInput}
        showCustomDetailInput={showCustomDetailInput}
        setShowCustomDetailInput={setShowCustomDetailInput}
        vehicleSuggestions={vehicleSuggestions}
        writerLocked={writerLocked}
        updateDraft={updateDraft}
        selectScrapDetail={selectScrapDetail}
        applyCustomScrapDetail={applyCustomScrapDetail}
        onOpenPartnerModal={() => setShowPartnerModal(true)}
        onOpenVehicleModal={() => setShowVehicleModal(true)}
        onOpenIssueModal={openIssueModal}
        onSubmit={handleSubmit}
        submitLabel={editingLineTarget ? "수정 저장" : "저장"}
      />

      <ReturnSourcePanel
        isReturnMode={isReturnMode}
        returnSourceDateFilter={returnSourceDateFilter}
        selectedReturnSource={selectedReturnSource}
        activeReturnSourceCandidates={activeReturnSourceCandidates}
        onToggleReturnMode={toggleReturnMode}
        onChangeReturnSourceDateFilter={setReturnSourceDateFilter}
        onSelectReturnSource={selectReturnSource}
      />

      <SelectedDateLogisticsList
        recordDate={draft.recordDate}
        recordId={selectedDateRecord?.id}
        recordTitle={selectedDateTitle}
        lines={selectedDateLines}
        onEditLine={selectedDateRecord ? handleEditLine : undefined}
        onDeleteLine={selectedDateRecord ? handleDeleteLine : undefined}
      />

      <PartnerQuickModal
        open={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        draft={partnerDraft}
        setDraft={setPartnerDraft}
        duplicatePartners={duplicatePartnerCandidates}
        onSaveDuplicate={updatePartnerQuickName}
        onSave={handlePartnerQuickSave}
      />

      <VehicleQuickModal
        open={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        draft={vehicleDraft}
        setDraft={setVehicleDraft}
        onSave={handleVehicleQuickSave}
      />

      <IssueActionModal
        open={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        issueDraft={issueDraft}
        issueSiteOptions={issueSiteOptions}
        updateIssueDraft={updateIssueDraft}
        onIssueSubmit={handleIssueSubmit}
        actionDraft={actionDraft}
        actionSiteOptions={actionSiteOptions}
        pendingIssues={pendingIssues}
        vendors={vendors}
        updateActionDraft={updateActionDraft}
        onActionSubmit={handleActionSubmit}
      />

      <LogisticsToast message={toastMessage} />
    </div>
  );
}
