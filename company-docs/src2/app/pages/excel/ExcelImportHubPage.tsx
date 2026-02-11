import { useExcelImportHubPage } from "./hooks/useExcelImportHubPage";
import ExcelHubLayoutSection from "./sections/ExcelHubLayoutSection";
import ExcelPartnerUploadSection from "./sections/ExcelPartnerUploadSection";
import ExcelVehicleUploadSection from "./sections/ExcelVehicleUploadSection";
import ExcelWeighingUploadSection from "./sections/ExcelWeighingUploadSection";

export default function ExcelImportHubPage() {
  const {
    activeTab,
    setActiveTab,
    selectedSite,
    setSelectedSite,
    existingKeys,
    applyPartner,
    applyVehicle,
    applyWeighing,
  } = useExcelImportHubPage();

  return (
    <ExcelHubLayoutSection
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedSite={selectedSite}
      onSiteChange={setSelectedSite}
    >
      {activeTab === "partner" && (
        <ExcelPartnerUploadSection existingCodes={existingKeys.partnerCodes} onApply={applyPartner} />
      )}
      {activeTab === "weighing" && (
        <ExcelWeighingUploadSection
          selectedSite={selectedSite}
          existingTicketKeys={existingKeys.ticketKeys}
          onApply={applyWeighing}
        />
      )}
      {activeTab === "vehicle" && (
        <ExcelVehicleUploadSection existingVehicleNos={existingKeys.vehicleNos} onApply={applyVehicle} />
      )}
      {activeTab === "other" && (
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="p" style={{ margin: 0, opacity: 0.7 }}>
            기타 엑셀 포맷은 통합 정책(mergePolicy) 확정 후 순차 연결할 예정.
          </p>
        </div>
      )}
    </ExcelHubLayoutSection>
  );
}
