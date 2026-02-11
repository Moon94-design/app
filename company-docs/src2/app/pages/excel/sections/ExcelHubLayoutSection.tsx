import type { ReactNode } from "react";
import type { ExcelSite } from "../types/excelUploadTypes";

export type ExcelTab = "partner" | "weighing" | "vehicle" | "other";

type Props = {
  activeTab: ExcelTab;
  onTabChange: (tab: ExcelTab) => void;
  selectedSite: ExcelSite;
  onSiteChange: (site: ExcelSite) => void;
  children: ReactNode;
};

export default function ExcelHubLayoutSection({
  activeTab,
  onTabChange,
  selectedSite,
  onSiteChange,
  children,
}: Props) {
  return (
    <div className="card">
      <h1 className="h1">엑셀등록</h1>
      <p className="p" style={{ marginTop: 8, marginBottom: 20, opacity: 0.7 }}>
        KORA 형식(거래처/계량현황/차량)을 우선 지원하고, 기타 포맷은 2열에서 순차 확장한다.
      </p>

      <div
        className="card"
        style={{ background: "rgba(255,255,255,0.02)", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}
      >
        <span style={{ fontSize: 13, opacity: 0.8 }}>작업 지점</span>
        <select
          value={selectedSite}
          onChange={(event) => onSiteChange(event.target.value as ExcelSite)}
          style={{ padding: "6px 8px", borderRadius: 4 }}
        >
          <option value="daegu">대구</option>
          <option value="seongju">성주</option>
        </select>
        <span style={{ fontSize: 12, opacity: 0.6 }}>
          한번 선택하면 변경 전까지 유지
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ background: "rgba(76, 175, 80, 0.08)" }}>
          <div style={{ fontWeight: 800, color: "#2e7d32", marginBottom: 10 }}>KORA</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={`btn ${activeTab === "partner" ? "primary" : ""}`} onClick={() => onTabChange("partner")}>
              거래처
            </button>
            <button className={`btn ${activeTab === "weighing" ? "primary" : ""}`} onClick={() => onTabChange("weighing")}>
              계량현황
            </button>
            <button className={`btn ${activeTab === "vehicle" ? "primary" : ""}`} onClick={() => onTabChange("vehicle")}>
              차량
            </button>
          </div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>기타 포맷</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={`btn ${activeTab === "other" ? "primary" : ""}`} onClick={() => onTabChange("other")}>
              준비중
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
