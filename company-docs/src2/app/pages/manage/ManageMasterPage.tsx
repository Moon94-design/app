import { useState } from "react";
import PartnerManagePage from "../partner/PartnerManagePage";
import VehicleManage from "@legacy/app/pages/manage/master/VehicleManage";

type MasterMenu = "partner" | "vehicle" | null;

export default function ManageMasterPage() {
  const [activeMenu, setActiveMenu] = useState<MasterMenu>(null);

  if (activeMenu === "partner") {
    return <PartnerManagePage onBack={() => setActiveMenu(null)} />;
  }
  if (activeMenu === "vehicle") {
    return <VehicleManage />;
  }

  return (
    <div className="card">
      <h1 className="h1">기준정보 관리</h1>
      <p className="p">관리할 기준정보를 선택하세요.</p>

      <div className="divider" />

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            padding: 16,
          }}
          onClick={() => setActiveMenu("partner")}
        >
          <div style={{ fontWeight: 900, fontSize: 15 }}>거래처 관리</div>
          <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
            거래처 목록 조회/수정, 엑셀 업로드
          </div>
        </div>

        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            padding: 16,
          }}
          onClick={() => setActiveMenu("vehicle")}
        >
          <div style={{ fontWeight: 900, fontSize: 15 }}>차량 관리</div>
          <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
            차량 목록 조회/수정/삭제, 엑셀 업로드
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
          <div style={{ fontWeight: 900, fontSize: 15 }}>직원 관리</div>
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
          <div style={{ fontWeight: 900, fontSize: 15 }}>설비 관리</div>
          <div className="p" style={{ marginTop: 4, fontSize: 13 }}>
            (추후 구현 예정)
          </div>
        </div>
      </div>
    </div>
  );
}
