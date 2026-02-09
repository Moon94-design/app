import { useState } from "react";
import LogisticsManage from "./daily/LogisticsManage";

export default function ManageDaily() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 하위 메뉴 표시
  if (activeMenu === "logistics") {
    return <LogisticsManage />;
  }

  return (
    <div className="card">
      <h1 className="h1">일일기록 관리</h1>
      <p className="p">관리할 일일기록을 선택하세요.</p>

      <div className="divider" />

      {/* 메뉴 목록 */}
      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {/* 유통기록 관리 */}
        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            padding: 16,
          }}
          onClick={() => setActiveMenu("logistics")}
        >
          <div style={{ fontWeight: 900, fontSize: 15 }}>유통기록 관리</div>
          <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
            계량현황에서 자동 생성된 일자별 유통기록 조회/수정
          </div>
        </div>

        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.02)",
            opacity: 0.5,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 15 }}>생산기록 관리</div>
          <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
            (추후 구현 예정)
          </div>
        </div>

        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.02)",
            opacity: 0.5,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 15 }}>이슈/조치 관리</div>
          <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
            (추후 구현 예정)
          </div>
        </div>
      </div>
    </div>
  );
}
