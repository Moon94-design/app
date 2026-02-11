import { useNavigate } from "react-router-dom";
import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import ManagePageCard from "./components/ManagePageCard";
import ManageLogisticsEditFormSection from "./sections/ManageLogisticsEditFormSection";
import ManageLogisticsListSection from "./sections/ManageLogisticsListSection";
import { useManageLogisticsPage } from "./hooks/useManageLogisticsPage";

type ManageLogisticsPageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "유통기록 변환",
    text: "계량현황 데이터를 일자별 유통기록으로 변환해 보여준다.",
  },
  {
    label: "데이터 저장",
    text: "데이터가 없으면 계량현황에서 자동 시드되고, 이후 수정은 repo:daily에 저장된다.",
  },
];

export default function ManageLogisticsPage({ onBack }: ManageLogisticsPageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/daily"));
  const {
    loading,
    records,
    rawRecords,
    expandedIds,
    editingRecord,
    editingScope,
    siteFilter,
    setSiteFilter,
    missingFilter,
    setMissingFilter,
    toggleExpand,
    startEdit,
    cancelEdit,
    saveRecord,
  } = useManageLogisticsPage();

  if (loading) {
    return (
      <ManagePageCard title="유통기록 관리">
        <p className="p">데이터를 불러오는 중...</p>
      </ManagePageCard>
    );
  }

  if (editingRecord) {
    return (
      <ManagePageCard title="유통기록 수정" actionLabel="목록으로" onAction={cancelEdit}>
        <ManageLogisticsEditFormSection
          record={editingRecord}
          editScope={editingScope}
          onSave={saveRecord}
          onCancel={cancelEdit}
        />
      </ManagePageCard>
    );
  }

  return (
    <ManagePageCard title="유통기록 관리" onAction={resolvedOnBack}>
      <ManageInfoNotice items={NOTICE_ITEMS} />

      <div className="divider" />
      <ManageLogisticsListSection
        records={records}
        totalCount={rawRecords.length}
        siteFilter={siteFilter}
        missingFilter={missingFilter}
        onSiteFilterChange={setSiteFilter}
        onMissingFilterChange={setMissingFilter}
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
        onEdit={startEdit}
      />
    </ManagePageCard>
  );
}
