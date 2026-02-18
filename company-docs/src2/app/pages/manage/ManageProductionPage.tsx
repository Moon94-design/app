import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import { useManageProductionPage } from "./hooks/useManageProductionPage";

type ManageProductionPageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "생산기록 등록",
    to: "/register/daily/production",
    text: "등록 > 일일기록 > 생산",
  },
  {
    label: "데이터 이관",
    text: "최초 진입 시 legacy 생산문서를 repo:daily(kind=production)로 1회 이관합니다.",
  },
];

export default function ManageProductionPage({ onBack }: ManageProductionPageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/daily"));
  const { loading, records, removeRecord } = useManageProductionPage();

  return (
    <ManagePageCard title="생산기록 관리" onAction={resolvedOnBack}>
      <ManageInfoNotice items={NOTICE_ITEMS} />
      <div className="divider" />

      {loading ? <p className="p">데이터를 불러오는 중입니다...</p> : null}

      {!loading && records.length === 0 ? <p className="p">생산기록이 아직 없습니다.</p> : null}

      {!loading && records.length > 0
        ? records.map((record) => (
            <div key={record.id} className="card manage-card manage-list-card">
              <div className="manage-list-row">
                <div>
                  <div className="manage-list-title">{record.recordDate} 생산기록</div>
                  <div className="manage-list-meta">
                    {record.recordDate} | {record.site || "-"} | {(record.writerName || "-").trim()} {(record.writerRole || "").trim()}
                  </div>
                  <div className="manage-list-meta">
                    생산 항목 {(record.lines || []).length}건
                    {record.tags.length > 0 ? ` | 태그 ${record.tags.length}개` : ""}
                  </div>
                </div>
                <div className="manage-action-group">
                  <button
                    type="button"
                    className="btn manage-action-btn manage-action-btn--danger"
                    onClick={() => {
                      if (!confirm(`생산기록(${record.recordDate})을 삭제하시겠습니까?`)) return;
                      removeRecord(record.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        : null}
    </ManagePageCard>
  );
}
