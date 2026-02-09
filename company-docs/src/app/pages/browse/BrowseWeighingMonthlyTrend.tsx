/**
 * BrowseWeighingMonthlyTrend.tsx
 * 계량현황 월간 물량 추세 + 자금 흐름 조회 (MVP)
 */

import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import type { WeighingTransaction } from "../home/excel/weighing/weighingTypes";
import { aggregateByDay, aggregateByMonth, calculateOverallStats } from "./weighing/weighingAggregation";

/**
 * 간단한 SVG 라인 차트 (단일 라인)
 */
function SimpleLineChart({
  data,
  height,
  color,
}: {
  data: { label: string; value: number }[];
  height: number;
  color: string;
}) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", textAlign: "center", marginTop: 10 }}>
        데이터 없음
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 800;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={{ marginTop: 10, overflowX: "auto" }}>
      <svg width={width} height={height} style={{ background: "rgba(255,255,255,0.02)" }}>
        {/* y축 그리드 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
              <text x={padding.left - 10} y={y + 5} fill="rgba(255,255,255,0.6)" fontSize={12} textAnchor="end">
                {Math.round(maxValue * ratio).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* 라인 */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} />

        {/* 점 */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
        ))}

        {/* x축 레이블 */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - padding.bottom + 20}
            fill="rgba(255,255,255,0.6)"
            fontSize={11}
            textAnchor="middle"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * 간단한 SVG 라인 차트 (2개 라인)
 */
function DualLineChart({
  data,
  height,
  color1,
  color2,
  label1,
  label2,
}: {
  data: { label: string; value1: number; value2: number }[];
  height: number;
  color1: string;
  color2: string;
  label1: string;
  label2: string;
}) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", textAlign: "center", marginTop: 10 }}>
        데이터 없음
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.value1, d.value2)), 1);
  const width = 800;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points1 = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.value1 / maxValue) * chartHeight;
    return { x, y };
  });

  const points2 = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.value2 / maxValue) * chartHeight;
    return { x, y };
  });

  const pathD1 = points1.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const pathD2 = points2.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={{ marginTop: 10, overflowX: "auto" }}>
      <svg width={width} height={height} style={{ background: "rgba(255,255,255,0.02)" }}>
        {/* y축 그리드 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
              <text x={padding.left - 10} y={y + 5} fill="rgba(255,255,255,0.6)" fontSize={12} textAnchor="end">
                {Math.round(maxValue * ratio).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* 라인 1 */}
        <path d={pathD1} fill="none" stroke={color1} strokeWidth={2} />
        {points1.map((p, i) => (
          <circle key={`1-${i}`} cx={p.x} cy={p.y} r={4} fill={color1} />
        ))}

        {/* 라인 2 */}
        <path d={pathD2} fill="none" stroke={color2} strokeWidth={2} />
        {points2.map((p, i) => (
          <circle key={`2-${i}`} cx={p.x} cy={p.y} r={4} fill={color2} />
        ))}

        {/* x축 레이블 */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - padding.bottom + 20}
              fill="rgba(255,255,255,0.6)"
              fontSize={11}
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}

        {/* 범례 */}
        <g transform={`translate(${width - padding.right - 150}, ${padding.top})`}>
          <rect x={0} y={0} width={12} height={12} fill={color1} />
          <text x={18} y={10} fill="rgba(255,255,255,0.8)" fontSize={12}>
            {label1}
          </text>
          <rect x={70} y={0} width={12} height={12} fill={color2} />
          <text x={88} y={10} fill="rgba(255,255,255,0.8)" fontSize={12}>
            {label2}
          </text>
        </g>
      </svg>
    </div>
  );
}

export default function BrowseWeighingMonthlyTrend() {
  const transactions = useMemo<WeighingTransaction[]>(() => {
    return repo.weighingTransactions<WeighingTransaction>().getAll();
  }, []);

  const [days, setDays] = useState(30); // 기본 30일
  const [partnerCode, setPartnerCode] = useState<string>(""); // 거래처 필터 (전체="")

  // 디버그 정보 수집
  const debugInfo = useMemo(() => {
    const totalAll = transactions.length;
    
    // ticketNo 날짜 추출 유틸
    function extractDateFromTicketNo(ticketNo: string): string | null {
      if (!ticketNo || ticketNo.length < 8) return null;
      if (ticketNo.startsWith("CW")) {
        const datePart = ticketNo.substring(2, 8);
        if (/^\d{6}$/.test(datePart)) {
          const yy = datePart.substring(0, 2);
          const mm = datePart.substring(2, 4);
          const dd = datePart.substring(4, 6);
          return `20${yy}-${mm}-${dd}`;
        }
      }
      return null;
    }
    
    // 유효 날짜 가져오기 (fallback 포함)
    function getValidDate(tx: any): string {
      if (tx.date && tx.date.length >= 10) return tx.date;
      return extractDateFromTicketNo(tx.ticketNo) || "";
    }
    
    // 날짜 필터 후 (fallback 사용)
    const afterDateFilter = transactions.filter((tx) => {
      const validDate = getValidDate(tx);
      if (!validDate) return false;
      const t = new Date(validDate).getTime();
      if (isNaN(t)) return false;
      const now = Date.now();
      return now - t <= days * 24 * 60 * 60 * 1000;
    });
    
    // 완료 필터 후 (미완료 + 가격 미완료 제외)
    const afterCompleteFilter = afterDateFilter.filter((tx) => {
      if (tx.isIncomplete === true) return false; // 총중량/공차중량 미완료
      if (tx.isPriceIncomplete === true) return false; // 단가 미완료
      if ((tx.unitPrice || 0) <= 0) return false;
      if ((tx.amount || 0) <= 0) return false;
      return true;
    });
    
    // 미완료 카운트 (총중량/공차중량)
    const incompleteCount = transactions.filter((tx) => tx.isIncomplete === true).length;
    
    // 가격 미완료 카운트
    const priceIncompleteCount = transactions.filter((tx) => {
      if (tx.isIncomplete === true) return false; // 이미 미완료면 제외
      return tx.isPriceIncomplete === true;
    }).length;
    
    // 날짜 null/invalid 카운트 (원본 date 필드)
    const dateNullCount = transactions.filter((tx) => {
      return !tx.date || tx.date.length < 10;
    }).length;
    
    // fallback 사용 건수
    const fallbackCount = transactions.filter((tx) => {
      if (tx.date && tx.date.length >= 10) return false;
      return extractDateFromTicketNo(tx.ticketNo) !== null;
    }).length;
    
    // direction UNKNOWN 카운트
    const directionUnknownCount = transactions.filter((tx) => {
      if (tx.direction === "BUY" || tx.direction === "SELL") return false;
      if (tx.inOut === "입고" || tx.inOut === "출고") return false;
      return true;
    }).length;
    
    // 샘플 3건
    const sample = transactions.slice(0, 3).map((tx) => ({
      ticketNo: tx.ticketNo,
      dateRaw: tx.dateRaw || "",
      date: tx.date,
      extractedDate: extractDateFromTicketNo(tx.ticketNo),
      validDate: getValidDate(tx),
      gross: tx.gross,
      tare: tx.tare,
      unitPrice: tx.unitPrice,
      amount: tx.amount,
      isIncomplete: tx.isIncomplete,
      isPriceIncomplete: tx.isPriceIncomplete,
      direction: tx.direction,
      inOut: tx.inOut,
    }));
    
    return {
      totalAll,
      afterDateFilter: afterDateFilter.length,
      afterCompleteFilter: afterCompleteFilter.length,
      incompleteCount,
      priceIncompleteCount,
      dateNullCount,
      fallbackCount,
      directionUnknownCount,
      sample,
    };
  }, [transactions, days]);

  // 거래처 목록 추출 (code + name)
  const partnerList = useMemo(() => {
    const partners = new Map<string, { code: string; name: string }>();
    for (const tx of transactions) {
      if (tx.partnerCode && tx.partnerCode.trim()) {
        partners.set(tx.partnerCode, {
          code: tx.partnerCode,
          name: tx.partnerName || tx.partnerCode,
        });
      }
    }
    return Array.from(partners.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  const overallStats = useMemo(() => {
    return calculateOverallStats(transactions, days, partnerCode || undefined);
  }, [transactions, days, partnerCode]);

  // 일별/월별 집계 선택 (90일 이상은 월별)
  const useMonthly = days >= 90;

  const dailyData = useMemo(() => {
    if (useMonthly) {
      // 월별 집계를 일별 형식으로 변환 (차트 재사용)
      const monthlyData = aggregateByMonth(transactions, days, partnerCode || undefined);
      return monthlyData.map((m) => ({
        date: m.month + "-01", // YYYY-MM-01로 변환 (차트용)
        netWeight: m.netWeight,
        amountSell: m.amountSell,
        amountBuy: m.amountBuy,
        netCashFlow: m.netCashFlow,
        count: m.count,
      }));
    }
    return aggregateByDay(transactions, days, partnerCode || undefined);
  }, [transactions, days, partnerCode, useMonthly]);

  return (
    <div className="card">
      <h1 className="h1">물량/자금 추세</h1>

      {/* 디버그 박스 (DEV 전용) */}
      <div className="card" style={{ marginTop: 14, background: "rgba(255,200,100,0.1)", border: "1px solid rgba(255,200,100,0.3)" }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>🔍 DEBUG INFO (개발용)</div>
        <div style={{ marginTop: 8, fontSize: 12, fontFamily: "monospace" }}>
          <div>totalAll: {debugInfo.totalAll}건</div>
          <div>afterDateFilter (최근 {days}일, fallback 포함): {debugInfo.afterDateFilter}건</div>
          <div>afterCompleteFilter (미완료 제외): {debugInfo.afterCompleteFilter}건</div>
          <div style={{ color: "orange" }}>incompleteCount (총중량/공차중량 미완료): {debugInfo.incompleteCount}건</div>
          <div style={{ color: "orange" }}>priceIncompleteCount (단가 미완료): {debugInfo.priceIncompleteCount}건</div>
          <div>dateNullCount (원본 date 필드 비어있음): {debugInfo.dateNullCount}건</div>
          <div>fallbackCount (ticketNo에서 날짜 추출): {debugInfo.fallbackCount}건</div>
          <div>directionUnknownCount: {debugInfo.directionUnknownCount}건</div>
          <div style={{ marginTop: 8 }}>Sample (처음 3건):</div>
          <pre style={{ marginTop: 4, fontSize: 11, overflow: "auto", maxHeight: 200 }}>
            {JSON.stringify(debugInfo.sample, null, 2)}
          </pre>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ marginTop: 14 }}>
        <div className="p" style={{ marginTop: 0, marginBottom: 8 }}>
          기간: 최근 <strong>{days}일</strong> {useMonthly && "(월별 집계)"}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            className="btn btn-sm"
            style={{
              background: days === 30 ? "rgba(100,150,255,0.3)" : "rgba(255,255,255,0.05)",
              border: days === 30 ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={() => setDays(30)}
          >
            최근 30일
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: days === 365 ? "rgba(100,150,255,0.3)" : "rgba(255,255,255,0.05)",
              border: days === 365 ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={() => setDays(365)}
          >
            최근 1년
          </button>
        </div>
        
        {/* 거래처 필터 */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, opacity: 0.8, marginRight: 8 }}>거래처:</label>
          <select 
            className="input" 
            style={{ width: 200, padding: "4px 8px", fontSize: 13 }}
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
          >
            <option value="">전체</option>
            {partnerList.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>
        
        <div className="p" style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
          ※ 미완료(총중량/공차중량=0) 또는 단가=0 건은 통계에서 제외됩니다.
        </div>
      </div>

      <div className="divider" />

      {/* KPI 카드 4개 */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            기간 총 물량
          </div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>
            {Math.round(overallStats.totalNetWeight).toLocaleString()} kg
          </div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            기간 총 매출
          </div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: "#4caf50" }}>
            {Math.round(overallStats.totalAmountSell).toLocaleString()}원
          </div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            기간 총 매입
          </div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: "#f44336" }}>
            {Math.round(overallStats.totalAmountBuy).toLocaleString()}원
          </div>
        </div>

        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
            순현금흐름
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              fontWeight: 900,
              color: overallStats.netCashFlow >= 0 ? "#4caf50" : "#f44336",
            }}
          >
            {overallStats.netCashFlow >= 0 ? "+" : ""}
            {Math.round(overallStats.netCashFlow).toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 제외 건수 표시 */}
      <div style={{ marginTop: 14 }}>
        <div className="p" style={{ marginTop: 0, fontSize: 13 }}>
          포함: <strong>{overallStats.includedCount}건</strong> / 제외:{" "}
          <strong>{overallStats.excludedCount}건</strong> (미완료/0원) / 전체:{" "}
          <strong>{overallStats.totalCount}건</strong>
        </div>
      </div>

      <div className="divider" />

      {/* 추세 차트 */}
      <div style={{ marginTop: 14 }}>
        <div className="p" style={{ marginTop: 0, fontSize: 15, fontWeight: 700 }}>
          일별 물량 추세 (kg)
        </div>
        <SimpleLineChart
          data={dailyData.map((d) => ({ label: d.date.slice(5), value: d.netWeight }))}
          height={200}
          color="#2196f3"
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="p" style={{ marginTop: 0, fontSize: 15, fontWeight: 700 }}>
          일별 금액 추세 (원)
        </div>
        <DualLineChart
          data={dailyData.map((d) => ({
            label: d.date.slice(5),
            value1: d.amountSell,
            value2: d.amountBuy,
          }))}
          height={200}
          color1="#4caf50"
          color2="#f44336"
          label1="매출"
          label2="매입"
        />
      </div>

      <div className="divider" />

      {/* 일별 테이블 */}
      <div style={{ marginTop: 14 }}>
        <div className="p" style={{ marginTop: 0, fontSize: 15, fontWeight: 700 }}>
          일별 상세 ({dailyData.length}일)
        </div>

        {dailyData.length === 0 ? (
          <div className="p" style={{ marginTop: 10 }}>
            최근 {days}일 이내 데이터가 없습니다.
          </div>
        ) : (
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th style={{ textAlign: "right" }}>물량 (kg)</th>
                  <th style={{ textAlign: "right" }}>매출 (원)</th>
                  <th style={{ textAlign: "right" }}>매입 (원)</th>
                  <th style={{ textAlign: "right" }}>순흐름 (원)</th>
                  <th style={{ textAlign: "right" }}>건수</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day) => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td style={{ textAlign: "right" }}>{Math.round(day.netWeight).toLocaleString()}</td>
                    <td style={{ textAlign: "right", color: "#4caf50" }}>
                      {Math.round(day.amountSell).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right", color: "#f44336" }}>
                      {Math.round(day.amountBuy).toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: day.netCashFlow >= 0 ? "#4caf50" : "#f44336",
                        fontWeight: 700,
                      }}
                    >
                      {day.netCashFlow >= 0 ? "+" : ""}
                      {Math.round(day.netCashFlow).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>{day.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
