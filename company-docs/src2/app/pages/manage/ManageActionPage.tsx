import { ManageInfoNotice, type ManageInfoNoticeItem } from "@kernel/components";
import { useNavigate } from "react-router-dom";
import ManagePageCard from "./components/ManagePageCard";
import { useManageActionPage } from "./hooks/useManageActionPage";

type ManageActionPageProps = {
  onBack?: () => void;
};

const NOTICE_ITEMS: ManageInfoNoticeItem[] = [
  {
    label: "조치 등록",
    to: "/register/daily/action",
    text: "등록 > 일일기록 > 조치",
  },
  {
    label: "데이터 이관",
    text: "최초 진입 시 legacy local_action_docs_v1을 repo:action으로 1회 이관한다.",
  },
];

export default function ManageActionPage({ onBack }: ManageActionPageProps) {
  const navigate = useNavigate();
  const resolvedOnBack = onBack ?? (() => navigate("/manage/daily"));
  const { loading, docs, removeDoc } = useManageActionPage();

  return (
    <ManagePageCard title="조치 관리" onAction={resolvedOnBack}>
      <ManageInfoNotice items={NOTICE_ITEMS} />
      <div className="divider" />

      {loading ? <p className="p">데이터를 불러오는 중...</p> : null}

      {!loading && docs.length === 0 ? <p className="p">조치 문서가 아직 없다.</p> : null}

      {!loading && docs.length > 0
        ? docs.map((doc) => (
            <div key={doc.id} className="card manage-card manage-list-card">
              <div className="manage-list-row">
                <div>
                  <div className="manage-list-title">{doc.recordDate} 조치 문서</div>
                  <div className="manage-list-meta">작성자: {doc.writerName || "-"}</div>
                  <div className="manage-list-meta">조치 항목 {doc.items.length}건</div>
                </div>
                <div className="manage-action-group">
                  <button
                    type="button"
                    className="btn manage-action-btn manage-action-btn--danger"
                    onClick={() => {
                      if (!confirm(`조치 문서(${doc.recordDate})를 삭제하시겠습니까?`)) return;
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
