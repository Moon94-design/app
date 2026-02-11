import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import { useManageIssuePage } from "./hooks/useManageIssuePage";

type ManageIssuePageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "이슈 등록",
    to: "/register/daily/issue",
    text: "등록 > 일일기록 > 이슈",
  },
  {
    label: "데이터 이관",
    text: "최초 진입 시 legacy issue_docs_v1을 repo:issue로 1회 이관한다.",
  },
];

export default function ManageIssuePage({ onBack }: ManageIssuePageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/daily"));
  const { loading, docs, removeDoc } = useManageIssuePage();

  return (
    <ManagePageCard title="이슈 관리" onAction={resolvedOnBack}>
      <ManageInfoNotice items={NOTICE_ITEMS} />
      <div className="divider" />

      {loading ? <p className="p">데이터를 불러오는 중...</p> : null}

      {!loading && docs.length === 0 ? <p className="p">이슈 문서가 아직 없다.</p> : null}

      {!loading && docs.length > 0
        ? docs.map((doc) => (
            <div key={doc.id} className="card manage-card manage-list-card">
              <div className="manage-list-row">
                <div>
                  <div className="manage-list-title">{doc.recordDate} 이슈 문서</div>
                  <div className="manage-list-meta">작성자: {doc.writerName || "-"}</div>
                  <div className="manage-list-meta">이슈 항목 {doc.items.length}건</div>
                </div>
                <div className="manage-action-group">
                  <button
                    type="button"
                    className="btn manage-action-btn manage-action-btn--danger"
                    onClick={() => {
                      if (!confirm(`이슈 문서(${doc.recordDate})를 삭제하시겠습니까?`)) return;
                      removeDoc(doc.id);
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
