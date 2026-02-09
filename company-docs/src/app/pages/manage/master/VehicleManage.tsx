/**
 * VehicleManage.tsx
 * 차량 관리 페이지 (리스트 + 필터 + 수정 + 보류 + 삭제)
 * 
 * 거래처 관리와 UI 통일
 * - 카드 형식 리스트
 * - 필터: 전체/미입력/보류/완료
 * - 버튼: 보류 상태면 수정+삭제, 나머지는 수정+보류+삭제
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { repo } from "../../../../data/repo";
import type { Vehicle } from "../../home/excel/vehicle/vehicleTypes";
import { isVehicleComplete, isVehicleIncomplete, isVehiclePending } from "../../home/excel/vehicle/vehicleTypes";

export default function VehicleManage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => repo.vehicles<Vehicle>().getAll());
  const [filter, setFilter] = useState<"all" | "incomplete" | "pending" | "complete">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "incomplete") return vehicles.filter((v) => isVehicleIncomplete(v));
    if (filter === "pending") return vehicles.filter((v) => isVehiclePending(v));
    if (filter === "complete") return vehicles.filter((v) => isVehicleComplete(v));
    return vehicles;
  }, [vehicles, filter]);

  const incompleteCount = vehicles.filter((v) => isVehicleIncomplete(v)).length;
  const pendingCount = vehicles.filter((v) => isVehiclePending(v)).length;
  const completeCount = vehicles.filter((v) => isVehicleComplete(v)).length;

  // 보류 처리
  function handlePending(id: string, vehicleNo: string) {
    if (!confirm(`차량 "${vehicleNo}"을(를) 보류 처리하시겠습니까?`)) return;
    
    const all = repo.vehicles<Vehicle>().getAll();
    const next = all.map((v) => {
      if (v.id === id) {
        return { ...v, status: "pending" as const, updatedAt: new Date().toISOString() };
      }
      return v;
    });
    repo.vehicles<Vehicle>().setAll(next);
    setVehicles(next);
    alert("보류 처리되었습니다.");
  }

  // 삭제
  function handleDelete(id: string, vehicleNo: string) {
    if (!confirm(`차량 "${vehicleNo}"을(를) 삭제하시겠습니까?`)) return;
    
    repo.vehicles<Vehicle>().removeById(id);
    setVehicles(repo.vehicles<Vehicle>().getAll());
    alert("삭제되었습니다.");
  }

  // 편집 (간편 모드)
  if (editingId) {
    const vehicle = vehicles.find((v) => v.id === editingId);
    if (!vehicle) {
      setEditingId(null);
      return null;
    }

    return (
      <div className="card">
        <h1 className="h1">차량 수정</h1>
        <VehicleEditForm
          vehicle={vehicle}
          onSave={(updated) => {
            const all = repo.vehicles<Vehicle>().getAll();
            const next = all.map((v) => (v.id === updated.id ? updated : v));
            repo.vehicles<Vehicle>().setAll(next);
            setVehicles(next);
            setEditingId(null);
            alert("수정되었습니다.");
          }}
          onCancel={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="h1">차량 관리</h1>

      {/* 엑셀 업로드 안내 */}
      <div style={{
        padding: 16,
        background: "rgba(25, 118, 210, 0.08)",
        borderRadius: 4,
        marginBottom: 20,
        border: "1px solid rgba(25, 118, 210, 0.3)",
      }}>
        <p className="p" style={{ margin: 0, marginBottom: 4, fontSize: 14 }}>
          💡 <strong>차량 엑셀 일괄 등록</strong>은 <Link to="/excel" style={{ color: "#1976d2", textDecoration: "underline" }}>홈 &gt; 엑셀등록 &gt; 차량 업로드</Link>에서 하실 수 있습니다.
        </p>
        <p className="p" style={{ margin: 0, fontSize: 14 }}>
          💡 <strong>신규 차량 등록</strong>은 <Link to="/register/vehicle" style={{ color: "#1976d2", textDecoration: "underline" }}>기준정보 등록 &gt; 차량 등록</Link>에서 하실 수 있습니다.
        </p>
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className={`btn ${filter === "all" ? "primary" : ""}`} onClick={() => setFilter("all")}>
          전체 ({vehicles.length})
        </button>
        <button className={`btn ${filter === "incomplete" ? "primary" : ""}`} onClick={() => setFilter("incomplete")}>
          미입력 ({incompleteCount})
        </button>
        <button className={`btn ${filter === "pending" ? "primary" : ""}`} onClick={() => setFilter("pending")}>
          보류 ({pendingCount})
        </button>
        <button className={`btn ${filter === "complete" ? "primary" : ""}`} onClick={() => setFilter("complete")}>
          완료 ({completeCount})
        </button>
      </div>

      <div className="divider" />

      {/* 리스트 (카드 형식) */}
      {filtered.length === 0 ? (
        <p className="p">항목이 없습니다.</p>
      ) : (
        filtered.map((v) => {
          const pending = isVehiclePending(v);
          const complete = isVehicleComplete(v);
          const statusLabel = complete ? "완료" : pending ? "보류" : "미입력";
          const statusBg = complete ? "#1976d2" : pending ? "#ff9800" : "#d32f2f";

          return (
            <div
              key={v.id}
              className="card"
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, display: "flex", gap: 8, alignItems: "center" }}>
                    {v.vehicleNo}
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: statusBg,
                        color: "white",
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="p" style={{ marginTop: 6, fontSize: 12 }}>
                    {v.tonClass || "-"} | {v.bodyType || "-"} | {v.carrierName || "-"} | {v.driverName || "-"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn"
                    onClick={() => setEditingId(v.id)}
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    수정
                  </button>
                  {!pending && (
                    <button
                      className="btn"
                      onClick={() => handlePending(v.id, v.vehicleNo)}
                      style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,152,0,0.2)" }}
                    >
                      보류
                    </button>
                  )}
                  <button
                    className="btn"
                    onClick={() => handleDelete(v.id, v.vehicleNo)}
                    style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,100,100,0.2)" }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ---------- 간편 수정 폼 ----------
interface VehicleEditFormProps {
  vehicle: Vehicle;
  onSave: (updated: Vehicle) => void;
  onCancel: () => void;
}

function VehicleEditForm({ vehicle, onSave, onCancel }: VehicleEditFormProps) {
  const [form, setForm] = useState<Vehicle>({ ...vehicle });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // 필수 검증
    if (!form.vehicleNo.trim()) {
      alert("차량번호는 필수입니다.");
      return;
    }

    // 완료 상태 자동 판정
    const canComplete = Boolean(
      form.tonClass &&
      form.bodyType &&
      form.carrierName?.trim() &&
      form.driverName?.trim() &&
      form.driverPhone?.trim()
    );

    // 현재 보류가 아니고, 완료 조건을 만족하면 완료로 변경
    let finalStatus = form.status || "incomplete";
    if (finalStatus !== "pending" && canComplete) {
      finalStatus = "complete";
    } else if (finalStatus !== "pending" && !canComplete) {
      finalStatus = "incomplete";
    }

    onSave({
      ...form,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 차량번호 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">차량번호 *</label>
        <input
          type="text"
          className="input"
          value={form.vehicleNo}
          onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })}
          required
        />
      </div>

      {/* 톤수 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">톤수</label>
        <select
          className="input"
          value={form.tonClass}
          onChange={(e) => setForm({ ...form, tonClass: e.target.value as any })}
        >
          <option value="">미완성</option>
          <option value="1t">1t</option>
          <option value="5t">5t</option>
          <option value="25t">25t</option>
        </select>
      </div>

      {/* 형태 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">형태</label>
        <select
          className="input"
          value={form.bodyType}
          onChange={(e) => setForm({ ...form, bodyType: e.target.value as any })}
        >
          <option value="">미완성</option>
          <option value="카고">카고</option>
          <option value="윙">윙</option>
          <option value="방통">방통</option>
        </select>
      </div>

      {/* 운송사 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">운송사</label>
        <input
          type="text"
          className="input"
          value={form.carrierName || ""}
          onChange={(e) => setForm({ ...form, carrierName: e.target.value })}
        />
      </div>

      {/* 기사명 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">기사명</label>
        <input
          type="text"
          className="input"
          value={form.driverName || ""}
          onChange={(e) => setForm({ ...form, driverName: e.target.value })}
        />
      </div>

      {/* 연락처 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">기사 연락처</label>
        <input
          type="text"
          className="input"
          value={form.driverPhone || ""}
          onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
        />
      </div>

      {/* 태그 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">태그</label>
        <input
          type="text"
          className="input"
          value={form.tagsText || ""}
          onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
          placeholder="예: #냉동 #대형"
        />
      </div>

      {/* 참고사항 */}
      <div style={{ marginBottom: 14 }}>
        <label className="label">참고사항</label>
        <textarea
          className="input"
          value={form.memo || ""}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          rows={3}
        />
      </div>

      {/* 상태 수동 변경 (보류 해제용) */}
      {form.status === "pending" && (
        <div style={{ marginBottom: 14, padding: 12, background: "rgba(255,152,0,0.1)", borderRadius: 4 }}>
          <p className="p" style={{ marginTop: 0, fontSize: 13, color: "#ff9800" }}>
            ⚠️ 현재 <strong>보류</strong> 상태입니다.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => setForm({ ...form, status: "incomplete" })}
            style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,152,0,0.2)" }}
          >
            보류 해제 (미입력으로 변경)
          </button>
        </div>
      )}

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button type="submit" className="btn primary">
          저장
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}
