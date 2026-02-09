/**
 * BrowseWeighingUnitPrice.tsx
 * 계량현황 단가 조회 페이지
 */

import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import type { WeighingTransaction } from "../home/excel/weighing/weighingTypes";

type UnitPriceData = {
  date: string; // YYYY-MM-DD
  ticketNo: string;
  partnerCode: string;
  partnerName: string; // 거래처명
  direction: "BUY" | "SELL" | "";
  itemName: string; // 품목명
  itemCategory: "PP" | "PE"; // 품목 카테고리 (단가 기준 자동 분류)
  unitPrice: number;
  net: number; // 실중량
  amount: number; // 금액
};

/**
 * 단가 기준 품목 자동 분류 (임시)
 * - 400원 이하: PP압축품 매입
 * - 400~600원: PP분쇄품 매출
 * - 600원 이상: PE분쇄품 매출
 */
function getItemByPrice(unitPrice: number): { category: "PP" | "PE"; name: string } {
  if (unitPrice <= 400) {
    return { category: "PP", name: "PP압축 매입" };
  } else if (unitPrice < 600) {
    return { category: "PP", name: "PP분쇄 매출" };
  } else {
    return { category: "PE", name: "PE분쇄 매출" };
  }
}

export default function BrowseWeighingUnitPrice() {
  const transactions = useMemo<WeighingTransaction[]>(() => {
    return repo.weighingTransactions<WeighingTransaction>().getAll();
  }, []);

  const [days, setDays] = useState(30);
  const [partnerCode, setPartnerCode] = useState<string>("");
  const [itemCategory, setItemCategory] = useState<"전체" | "PP압축매입" | "PP분쇄매출" | "PE분쇄매출">("전체");

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

  // 날짜 추출 유틸
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

  function getValidDate(tx: WeighingTransaction): string {
    if (tx.date && tx.date.length >= 10) return tx.date;
    return extractDateFromTicketNo(tx.ticketNo) || "";
  }

  // 유효 데이터 필터링 (단가 조회용)
  const priceData = useMemo<UnitPriceData[]>(() => {
    const now = Date.now();
    const validTxs = transactions.filter((tx) => {
      // 날짜 필터
      const validDate = getValidDate(tx);
      if (!validDate) return false;
      const t = new Date(validDate).getTime();
      if (isNaN(t)) return false;
      if (now - t > days * 24 * 60 * 60 * 1000) return false;

      // 미완료/단가 없음 제외
      if (tx.isIncomplete === true) return false;
      if ((tx.unitPrice || 0) <= 0) return false;
      if ((tx.net || 0) <= 0) return false;

      // 거래처 필터
      if (partnerCode && tx.partnerCode !== partnerCode) return false;

      return true;
    });

    const mapped = validTxs.map((tx) => {
      const itemInfo = getItemByPrice(tx.unitPrice || 0);
      return {
        date: getValidDate(tx),
        ticketNo: tx.ticketNo,
        partnerCode: tx.partnerCode,
        partnerName: tx.partnerName || tx.partnerCode,
        direction: tx.direction,
        itemName: itemInfo.name,
        itemCategory: itemInfo.category,
        unitPrice: tx.unitPrice || 0,
        net: tx.net || 0,
        amount: tx.amount || 0,
      };
    });

    // 품목 카테고리 필터
    if (itemCategory === "PP압축매입") {
      return mapped.filter((d) => d.unitPrice <= 400);
    } else if (itemCategory === "PP분쇄매출") {
      return mapped.filter((d) => d.unitPrice > 400 && d.unitPrice < 600);
    } else if (itemCategory === "PE분쇄매출") {
      return mapped.filter((d) => d.unitPrice >= 600);
    }
    return mapped;
  }, [transactions, days, partnerCode, itemCategory]);

  // 단가 통계
  const priceStats = useMemo(() => {
    if (priceData.length === 0) {
      return { avg: 0, max: 0, min: 0, count: 0 };
    }
    
    const prices = priceData.map((d) => d.unitPrice);
    const totalAmount = priceData.reduce((sum, d) => sum + d.amount, 0);
    const totalNet = priceData.reduce((sum, d) => sum + d.net, 0);
    const avg = totalNet > 0 ? totalAmount / totalNet : 0;
    const max = Math.max(...prices);
    const min = Math.min(...prices);

    return { avg, max, min, count: prices.length };
  }, [priceData]);

  // 거래처별 평균 단가
  const partnerAvg = useMemo(() => {
    const partnerMap = new Map<string, { name: string; amounts: number[]; nets: number[] }>();
    for (const d of priceData) {
      if (!partnerMap.has(d.partnerCode)) {
        partnerMap.set(d.partnerCode, { name: d.partnerName, amounts: [], nets: [] });
      }
      partnerMap.get(d.partnerCode)!.amounts.push(d.amount);
      partnerMap.get(d.partnerCode)!.nets.push(d.net);
    }

    const result: { partnerCode: string; partnerName: string; avg: number; count: number }[] = [];
    for (const [code, data] of partnerMap.entries()) {
      const totalAmount = data.amounts.reduce((a, b) => a + b, 0);
      const totalNet = data.nets.reduce((a, b) => a + b, 0);
      const avg = totalNet > 0 ? totalAmount / totalNet : 0;
      result.push({ partnerCode: code, partnerName: data.name, avg, count: data.amounts.length });
    }

    result.sort((a, b) => b.avg - a.avg);
    return result;
  }, [priceData]);

  return (
    <div className="card">
      <h1 className="h1">계량현황 단가 조회</h1>

      {/* 필터 */}
      <div style={{ marginTop: 14 }}>
        <div className="p" style={{ marginTop: 0, marginBottom: 8 }}>
          기간: 최근 <strong>{days}일</strong>
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
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 품목 필터 */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, opacity: 0.8, marginRight: 8 }}>품목:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-sm"
              style={{
                background: itemCategory === "전체" ? "rgba(100,150,255,0.3)" : "rgba(255,255,255,0.05)",
                border: itemCategory === "전체" ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setItemCategory("전체")}
            >
              전체
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: itemCategory === "PP압축매입" ? "rgba(100,150,255,0.3)" : "rgba(255,255,255,0.05)",
                border: itemCategory === "PP압축매입" ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setItemCategory("PP압축매입")}
            >
              PP압축 매입
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: itemCategory === "PP분쇄매출" ? "rgba(100,150,255,0.3)" : "rgba(255,255,255,0.05)",
                border: itemCategory === "PP분쇄매출" ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setItemCategory("PP분쇄매출")}
            >
              PP분쇄 매출
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: itemCategory === "PE분쇄매출" ? "rgba(100,150,255,0.3)" : "rgba(255,255,255,0.05)",
                border: itemCategory === "PE분쇄매출" ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setItemCategory("PE분쇄매출")}
            >
              PE분쇄 매출
            </button>
          </div>
        </div>

        <div className="p" style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
          ※ 미완료 또는 단가=0 건은 제외됩니다.
        </div>
      </div>

      <div className="divider" />

      {/* 단가 통계 */}
      <div style={{ marginTop: 14 }}>
        <h2 className="h2">단가 통계</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 14 }}>
          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
              평균 단가
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900 }}>
              {priceStats.avg.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
              <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>원/kg</span>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
              최고 단가
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(100,255,150,1)" }}>
              {priceStats.max.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
              <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>원/kg</span>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
              최저 단가
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: "rgba(255,150,100,1)" }}>
              {priceStats.min.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
              <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>원/kg</span>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="p" style={{ marginTop: 0, fontSize: 13, opacity: 0.7 }}>
              건수
            </div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900 }}>
              {priceStats.count.toLocaleString("ko-KR")}
              <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>건</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 단가 변동 그래프 */}
      <div style={{ marginTop: 14 }}>
        <h2 className="h2">단가 변동 추이</h2>
        {priceData.length === 0 ? (
          <div className="p" style={{ marginTop: 14, opacity: 0.5 }}>
            데이터 없음
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            {(() => {
              // 날짜별 평균 단가 계산 (가중평균)
              const dailyMap = new Map<string, { amounts: number[]; nets: number[] }>();
              for (const d of priceData) {
                if (!dailyMap.has(d.date)) dailyMap.set(d.date, { amounts: [], nets: [] });
                dailyMap.get(d.date)!.amounts.push(d.amount);
                dailyMap.get(d.date)!.nets.push(d.net);
              }
              const dailyAvg = Array.from(dailyMap.entries())
                .map(([date, data]) => {
                  const totalAmount = data.amounts.reduce((a, b) => a + b, 0);
                  const totalNet = data.nets.reduce((a, b) => a + b, 0);
                  return {
                    date,
                    avg: totalNet > 0 ? totalAmount / totalNet : 0,
                  };
                })
                .sort((a, b) => a.date.localeCompare(b.date));

              if (dailyAvg.length === 0) {
                return <div className="p" style={{ opacity: 0.5 }}>데이터 없음</div>;
              }

              const maxPrice = Math.max(...dailyAvg.map((d) => d.avg));
              const minPrice = Math.min(...dailyAvg.map((d) => d.avg));
              const priceRange = maxPrice - minPrice || 1;

              const width = 800;
              const height = 200;
              const padding = { top: 20, right: 20, bottom: 40, left: 60 };
              const chartWidth = width - padding.left - padding.right;
              const chartHeight = height - padding.top - padding.bottom;

              const points = dailyAvg.map((d, i) => {
                const x = padding.left + (i / (dailyAvg.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((d.avg - minPrice) / priceRange) * chartHeight;
                return { x, y, date: d.date, avg: d.avg };
              });

              const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

              return (
                <svg width={width} height={height} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 4 }}>
                  {/* 배경 그리드 */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padding.top + chartHeight * (1 - ratio);
                    const price = minPrice + priceRange * ratio;
                    return (
                      <g key={ratio}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={padding.left + chartWidth}
                          y2={y}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={1}
                        />
                        <text x={padding.left - 10} y={y + 4} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="end">
                          {price.toFixed(0)}
                        </text>
                      </g>
                    );
                  })}

                  {/* 꺾은선 */}
                  <path d={pathData} stroke="rgba(100,200,255,1)" strokeWidth={2} fill="none" />

                  {/* 점 */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgba(100,200,255,1)" />
                  ))}

                  {/* X축 레이블 (일부만 표시) */}
                  {points
                    .filter((_, i) => i % Math.ceil(points.length / 8) === 0 || i === points.length - 1)
                    .map((p, i) => (
                      <text
                        key={i}
                        x={p.x}
                        y={padding.top + chartHeight + 20}
                        fill="rgba(255,255,255,0.6)"
                        fontSize={9}
                        textAnchor="middle"
                      >
                        {p.date.slice(5)}
                      </text>
                    ))}
                </svg>
              );
            })()}
          </div>
        )}
      </div>

      <div className="divider" />

      {/* 거래처별 평균 단가 비교 (막대 그래프) */}
      <div style={{ marginTop: 14 }}>
        <h2 className="h2">거래처별 평균 단가 비교</h2>
        {partnerAvg.length === 0 ? (
          <div className="p" style={{ marginTop: 14, opacity: 0.5 }}>
            데이터 없음
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            {(() => {
              const maxAvg = Math.max(...partnerAvg.map((p) => p.avg));
              const barHeight = 30;
              const barGap = 10;
              const width = 800;
              const displayCount = Math.min(partnerAvg.length, 15);
              const height = displayCount * (barHeight + barGap) + 40;
              const padding = { top: 20, right: 100, bottom: 20, left: 150 };
              const chartWidth = width - padding.left - padding.right;

              return (
                <svg width={width} height={height} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 4 }}>
                  {partnerAvg.slice(0, displayCount).map((p, i) => {
                    const barWidth = (p.avg / maxAvg) * chartWidth;
                    const y = padding.top + i * (barHeight + barGap);

                    return (
                      <g key={p.partnerCode}>
                        {/* 거래처명 */}
                        <text x={padding.left - 10} y={y + barHeight / 2 + 4} fill="rgba(255,255,255,0.8)" fontSize={12} textAnchor="end">
                          {p.partnerName.length > 10 ? p.partnerName.slice(0, 10) + "..." : p.partnerName}
                        </text>

                        {/* 막대 */}
                        <rect
                          x={padding.left}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={`rgba(100, ${150 + (i % 3) * 30}, ${200 + (i % 2) * 30}, 0.7)`}
                          rx={4}
                        />

                        {/* 단가 표시 */}
                        <text
                          x={padding.left + barWidth + 10}
                          y={y + barHeight / 2 + 4}
                          fill="rgba(255,255,255,0.9)"
                          fontSize={12}
                          fontWeight={700}
                        >
                          {p.avg.toFixed(0)}원/kg ({p.count}건)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </div>
        )}
      </div>

      <div className="divider" />

      {/* 상세 내역 */}
      <div style={{ marginTop: 14 }}>
        <h2 className="h2">상세 내역 (최근 50건)</h2>
        {priceData.length === 0 ? (
          <div className="p" style={{ marginTop: 14, opacity: 0.5 }}>
            데이터 없음
          </div>
        ) : (
          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <table className="table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>번호</th>
                  <th>거래처</th>
                  <th>방향</th>
                  <th>품목</th>
                  <th style={{ textAlign: "right" }}>단가 (원/kg)</th>
                  <th style={{ textAlign: "right" }}>실중량 (kg)</th>
                  <th style={{ textAlign: "right" }}>금액 (원)</th>
                </tr>
              </thead>
              <tbody>
                {priceData.slice(0, 50).map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.date}</td>
                    <td>{d.ticketNo}</td>
                    <td>{d.partnerName}</td>
                    <td>{d.direction === "BUY" ? "매입" : d.direction === "SELL" ? "매출" : "-"}</td>
                    <td>{d.itemName}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {d.unitPrice.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {d.net.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {d.amount.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
                    </td>
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
