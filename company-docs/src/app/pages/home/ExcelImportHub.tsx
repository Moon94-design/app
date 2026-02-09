/**
 * ExcelImportHub.tsx
 * 엑셀 일괄 등록 통합 허브
 * - 거래처 업로드
 * - 계량현황 업로드
 * - (placeholder) 차량 업로드
 * - (placeholder) 기타 기준정보 업로드
 */

import { useState, useMemo } from "react";
import { repo } from "../../../data/repo";
import type { PartnerV2 } from "../register/partner/partnerV2Types";
import PartnerExcelUploadPanel from "../manage/master/excel/PartnerExcelUploadPanel";
import type { PartnerParseResult } from "../manage/master/excel/partnerExcelTypes";
import WeighingUploadPanel from "./excel/weighing/WeighingUploadPanel";
import type { WeighingTransaction } from "./excel/weighing/weighingTypes";
import type { WeighingParseResult } from "./excel/weighing/weighingTypes";
import VehicleUploadPanel from "./excel/vehicle/VehicleUploadPanel";
import type { Vehicle } from "./excel/vehicle/vehicleTypes";
import type { VehicleParseResult } from "./excel/vehicle/vehicleExcelTypes";

type TabType = "partner" | "weighing" | "vehicle" | "other";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `PV2_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export default function ExcelImportHub() {
  const [activeTab, setActiveTab] = useState<TabType>("partner");

  return (
    <div className="card">
      <h1 className="h1">엑셀등록 (Excel Import Hub)</h1>
      <p className="p" style={{ marginTop: 8, marginBottom: 20, opacity: 0.7 }}>
        엑셀 파일을 업로드하여 대량 데이터를 일괄 등록합니다.
      </p>

      {/* 탭 네비게이션 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          className={`btn ${activeTab === "partner" ? "primary" : ""}`}
          onClick={() => setActiveTab("partner")}
        >
          📋 거래처 업로드
        </button>
        <button
          className={`btn ${activeTab === "weighing" ? "primary" : ""}`}
          onClick={() => setActiveTab("weighing")}
        >
          ⚖️ 계량현황 업로드
        </button>
        <button
          className={`btn ${activeTab === "vehicle" ? "primary" : ""}`}
          onClick={() => setActiveTab("vehicle")}
        >
          🚛 차량 업로드
        </button>
        <button
          className={`btn ${activeTab === "other" ? "primary" : ""}`}
          onClick={() => setActiveTab("other")}
          disabled
        >
          📦 기타 기준정보 (준비중)
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {activeTab === "partner" && <PartnerUploadSection />}
        {activeTab === "weighing" && <WeighingUploadSection />}
        {activeTab === "vehicle" && <VehicleUploadSection />}
        {activeTab === "other" && <PlaceholderSection title="기타 기준정보 업로드" />}
      </div>
    </div>
  );
}

// ---------- 거래처 업로드 섹션 ----------
function PartnerUploadSection() {
  const [partners, setPartners] = useState<PartnerV2[]>(() => repo.partners_v2<PartnerV2>().getAll());
  const [applying, setApplying] = useState(false);

  const existingCodes = useMemo(() => partners.map((p) => p.base.partnerCode), [partners]);

  function handleExcelApply(result: PartnerParseResult) {
    console.log("=== 엑셀 적용 시작 ===");
    console.log(`총: ${result.total}건, OK: ${result.ok}건, FAIL: ${result.fail}건`);
    
    setApplying(true);
    
    setTimeout(() => {
      try {
        const now = new Date().toISOString();
        console.log("신규 거래처 생성 중...");
        
        const newPartners: PartnerV2[] = result.rows
          .filter((r) => r.status === "OK" && r.data)
          .map((r) => ({
            id: newId(),
            base: r.data!,
            extra: {
              status: "incomplete",
              note: "",
              contactMemo: "",
              bankAccount: "",
              importance: "중",
              relationshipStatus: "중",
              tradeProfiles: [],
              custom: {},
            },
            createdAt: now,
            updatedAt: now,
          }));

        console.log(`생성된 객체 수: ${newPartners.length}건`);
        
        const allPartners = [...newPartners, ...partners];
        console.log(`전체 목록 크기: ${allPartners.length}건`);
        
        console.log("DB 저장 중...");
        repo.partners_v2<PartnerV2>().setAll(allPartners);
        
        console.log("UI 업데이트 중...");
        setPartners(allPartners);
        
        console.log("✅ 등록 완료!");
        
        if (result.fail > 0) {
          const failedNames = result.rows
            .filter((r) => r.status === "FAIL" && r.data)
            .map((r) => r.data!.partnerName)
            .filter(Boolean);
          
          console.log("⚠️ 중복 제외된 항목 (처음 10건):");
          failedNames.slice(0, 10).forEach((name, idx) => {
            console.log(`  ${idx + 1}. ${name}`);
          });
          if (failedNames.length > 10) {
            console.log(`  ... 외 ${failedNames.length - 10}건`);
          }
          
          alert(`✅ ${newPartners.length}건 등록 완료\n\n⚠️ 중복 제외: ${result.fail}건\n(콘솔에서 상세 확인)`);
        } else {
          alert(`✅ ${newPartners.length}건 등록 완료`);
        }
      } catch (error) {
        console.error("❌ 등록 중 오류:", error);
        alert(`❌ 등록 실패: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setApplying(false);
      }
    }, 100);
  }

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <h3 style={{ marginTop: 0 }}>📋 거래처 업로드</h3>
      <p className="p" style={{ marginBottom: 16, opacity: 0.7 }}>
        거래처 정보를 엑셀 파일로 일괄 등록합니다.
      </p>

      {applying && (
        <div style={{
          padding: 16,
          background: "rgba(25, 118, 210, 0.1)",
          borderRadius: 4,
          marginBottom: 16,
          textAlign: "center",
          color: "#1976d2",
          fontWeight: 700,
        }}>
          ⏳ 등록 중... 잠시만 기다려주세요 (콘솔에서 진행 상황 확인)
        </div>
      )}

      <PartnerExcelUploadPanel existingCodes={existingCodes} onApply={handleExcelApply} />
    </div>
  );
}

// ---------- 계량현황 업로드 섹션 ----------
function WeighingUploadSection() {
  const [transactions, setTransactions] = useState<WeighingTransaction[]>(() => repo.weighingTransactions<WeighingTransaction>().getAll());
  const [applying, setApplying] = useState(false);

  const existingTicketNos = useMemo(() => transactions.map((t) => t.ticketNo), [transactions]);

  function handleExcelApply(result: WeighingParseResult) {
    console.log("=== 계량현황 엑셀 적용 시작 ===");
    console.log(`총: ${result.total}건, OK: ${result.ok}건, FAIL: ${result.fail}건, 미완료: ${result.incomplete}건`);
    
    // 디버그 정보 출력 (대사)
    if (result.debug) {
      console.log(`\n[대사 정보]`);
      console.log(`- 시트: ${result.debug.sheetName}`);
      console.log(`- 헤더 행: ${result.debug.headerRowIndex + 1}행 (고정)`);
      console.log(`- 시트 전체: ${result.debug.totalSheetRows}행`);
      console.log(`- JSON 변환 후: ${result.debug.rawRowsCount}행`);
      console.log(`- 데이터 행 필터: ${result.debug.afterFilterCount}행`);
      console.log(`- 매핑된 필드: ${result.debug.mappedFields.join(", ")}`);
    }
    
    setApplying(true);
    
    setTimeout(() => {
      try {
        const now = new Date().toISOString();
        console.log("\n신규/덮어쓰기 거래 생성 중...");
        
        // OK + INCOMPLETE 모두 포함 (FAIL 제외)
        const incomingTransactions: WeighingTransaction[] = result.rows
          .filter((r) => (r.status === "OK" || r.status === "INCOMPLETE") && r.data)
          .map((r) => ({
            id: newId(),
            ticketNo: r.data!.ticketNo || "",
            dateRaw: r.data!.dateRaw || "",
            date: r.data!.date || "",
            seq: r.data!.seq || 0,
            directionRaw: r.data!.directionRaw || "",
            direction: r.data!.direction || "",
            inOut: r.data!.inOut || "",
            partnerCode: r.data!.partnerCode || "",
            partnerId: r.data!.partnerId,
            partnerName: r.data!.partnerName || "",
            vehicleNo: r.data!.vehicleNo || "",
            itemCode: r.data!.itemCode || "",
            itemName: r.data!.itemName || "",
            gross: r.data!.gross || 0,
            tare: r.data!.tare || 0,
            net: r.data!.net || 0,
            handover: r.data!.handover || 0,
            unitPrice: r.data!.unitPrice || 0,
            amount: r.data!.amount || 0,
            note: r.data!.note || "",
            isIncomplete: r.data!.isIncomplete || false,
            isPriceIncomplete: r.data!.isPriceIncomplete || false,
            createdAt: now,
            updatedAt: now,
          }));

        console.log(`생성된 객체 수: ${incomingTransactions.length}건 (OK: ${result.ok}, INCOMPLETE: ${result.incomplete})`);
        
        // 업서트: ticketNo 기준으로 덮어쓰기
        const incomingTicketNos = new Set(incomingTransactions.map(t => t.ticketNo));
        const existingWithoutIncoming = transactions.filter(t => !incomingTicketNos.has(t.ticketNo));
        const overwrittenCount = transactions.length - existingWithoutIncoming.length;
        
        const allTransactions = [...incomingTransactions, ...existingWithoutIncoming];
        
        console.log(`\n[적용 결과]`);
        console.log(`- 신규 추가: ${incomingTransactions.length - overwrittenCount}건`);
        console.log(`- 덮어쓰기 (교체): ${overwrittenCount}건`);
        console.log(`- 기존 유지: ${existingWithoutIncoming.length}건`);
        console.log(`- 전체: ${allTransactions.length}건`);
        
        if (overwrittenCount > 0) {
          const overwrittenTicketNos = incomingTransactions
            .filter(t => existingTicketNos.includes(t.ticketNo))
            .map(t => t.ticketNo)
            .slice(0, 10);
          console.log(`\n덮어쓴 ticketNo (처음 10개): ${overwrittenTicketNos.join(", ")}`);
        }
        
        console.log("\nDB 저장 중...");
        repo.weighingTransactions<WeighingTransaction>().setAll(allTransactions);
        
        console.log("UI 업데이트 중...");
        setTransactions(allTransactions);
        
        console.log("✅ 등록 완료!");
        
        if (result.fail > 0) {
          const failedRows = result.rows
            .filter((r) => r.status === "FAIL")
            .slice(0, 20);
          
          console.log(`\n⚠️ FAIL 행 (처음 20건):`);
          failedRows.forEach((r, idx) => {
            console.log(`  ${idx + 1}. Row ${r.rowIndex}: ${r.errors.join(", ")}`);
          });
          if (result.fail > 20) {
            console.log(`  ... 외 ${result.fail - 20}건`);
          }
          
          alert(`✅ ${incomingTransactions.length}건 적용 완료 (신규: ${incomingTransactions.length - overwrittenCount}, 덮어쓰기: ${overwrittenCount})\n\n⚠️ FAIL (제외): ${result.fail}건\n(콘솔에서 상세 확인)`);
        } else {
          alert(`✅ ${incomingTransactions.length}건 적용 완료 (신규: ${incomingTransactions.length - overwrittenCount}, 덮어쓰기: ${overwrittenCount})`);
        }
      } catch (error) {
        console.error("❌ 등록 중 오류:", error);
        alert(`❌ 등록 실패: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setApplying(false);
      }
    }, 100);
  }

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <h3 style={{ marginTop: 0 }}>⚖️ 계량현황 업로드</h3>
      <p className="p" style={{ marginBottom: 16, opacity: 0.7 }}>
        계량현황(유통/회계) 데이터를 엑셀 파일로 일괄 등록합니다.
      </p>

      {applying && (
        <div style={{
          padding: 16,
          background: "rgba(25, 118, 210, 0.1)",
          borderRadius: 4,
          marginBottom: 16,
          textAlign: "center",
          color: "#1976d2",
          fontWeight: 700,
        }}>
          ⏳ 등록 중... 잠시만 기다려주세요 (콘솔에서 진행 상황 확인)
        </div>
      )}

      <WeighingUploadPanel existingTicketNos={existingTicketNos} onApply={handleExcelApply} />
    </div>
  );
}

// ---------- 차량 업로드 섹션 ----------
function VehicleUploadSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => repo.vehicles<Vehicle>().getAll());
  const [applying, setApplying] = useState(false);

  const existingVehicleNos = useMemo(() => vehicles.map((v) => v.vehicleNo), [vehicles]);

  function handleExcelApply(result: VehicleParseResult) {
    console.log("=== 차량 엑셀 적용 시작 ===");
    console.log(`총: ${result.total}건, OK: ${result.ok}건, INCOMPLETE: ${result.incomplete}건, FAIL: ${result.fail}건`);
    
    setApplying(true);
    
    setTimeout(() => {
      try {
        const now = new Date().toISOString();
        console.log("신규 차량 생성 중...");
        
        // FAIL 제외, OK + INCOMPLETE만 등록
        const newVehicles: Vehicle[] = result.rows
          .filter((r) => (r.status === "OK" || r.status === "INCOMPLETE") && r.data)
          .map((r) => ({
            id: newId(),
            vehicleNo: r.data.vehicleNo || "",
            tonClass: r.data.tonClass || "",
            bodyType: r.data.bodyType || "",
            source: "excel",
            createdAt: now,
            updatedAt: now,
          }));

        console.log(`✅ 등록할 차량 수: ${newVehicles.length}건`);
        console.log("미리보기 (최대 10건):");
        newVehicles.slice(0, 10).forEach((v, i) => {
          console.log(`  ${i + 1}. ${v.vehicleNo} / ${v.tonClass || "미완성"} / ${v.bodyType || "미완성"}`);
        });
        if (newVehicles.length > 10) {
          console.log(`  ... 외 ${newVehicles.length - 10}건`);
        }

        // DB 저장
        const updated = [...newVehicles, ...vehicles];
        repo.vehicles<Vehicle>().setAll(updated);
        setVehicles(updated);

        console.log("✅ DB 저장 완료");
        
        // FAIL 건 로그
        const failedRows = result.rows.filter((r) => r.status === "FAIL");
        if (failedRows.length > 0) {
          console.warn(`⚠️ FAIL (제외된 건): ${failedRows.length}건`);
          failedRows.slice(0, 20).forEach((r) => {
            console.warn(`  - Row ${r.rowIndex}: ${r.data.vehicleNo || "(번호없음)"} → ${r.errors.join(", ")}`);
          });
          if (failedRows.length > 20) {
            console.warn(`  ... 외 ${failedRows.length - 20}건`);
          }
          
          alert(`✅ ${newVehicles.length}건 적용 완료\n(OK: ${result.ok}, INCOMPLETE: ${result.incomplete})\n\n⚠️ FAIL (제외): ${result.fail}건\n(콘솔에서 상세 확인)`);
        } else {
          alert(`✅ ${newVehicles.length}건 적용 완료\n(OK: ${result.ok}, INCOMPLETE: ${result.incomplete})`);
        }
      } catch (error) {
        console.error("❌ 등록 중 오류:", error);
        alert(`❌ 등록 실패: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setApplying(false);
      }
    }, 100);
  }

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <h3 style={{ marginTop: 0 }}>🚛 차량 업로드</h3>
      <p className="p" style={{ marginBottom: 16, opacity: 0.7 }}>
        차량 기준정보를 엑셀 파일로 일괄 등록합니다.
      </p>

      {applying && (
        <div style={{
          padding: 16,
          background: "rgba(25, 118, 210, 0.1)",
          borderRadius: 4,
          marginBottom: 16,
          textAlign: "center",
          color: "#1976d2",
          fontWeight: 700,
        }}>
          ⏳ 등록 중... 잠시만 기다려주세요 (콘솔에서 진행 상황 확인)
        </div>
      )}

      <VehicleUploadPanel existingVehicleNos={existingVehicleNos} onApply={handleExcelApply} />
    </div>
  );
}

// ---------- Placeholder 섹션 ----------
function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p className="p" style={{ opacity: 0.5 }}>
        ℹ️ 준비 중입니다. 추후 확장 예정입니다.
      </p>
    </div>
  );
}
