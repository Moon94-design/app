import { useMemo, useState } from "react";

type Direction = "매입" | "출고";
type Kind = "압축품" | "분쇄품" | "펠렛";
type Item = "PP" | "PE";

type PriceEvent = {
  eventId: string;
  occurredAt: string; // ISO
  partnerId: string;
  partnerName: string;
  vehicleNo: string;
  direction: Direction;
  kind: Kind;
  item: Item;
  unitPricePerKg: number;
  qtyKg: number;
  totalAmount: number;
  sourceDailyId: string;
};

const KEY_PRICE_EVENTS = "price_events_v1";

function loadEvents(): PriceEvent[] {
  try {
    const raw = localStorage.getItem(KEY_PRICE_EVENTS);
    if (!raw) return [];
    return JSON.parse(raw) as PriceEvent[];
  } catch {
    return [];
  }
}

function allowedKinds(direction: "전체" | Direction): Kind[] {
  if (direction === "매입") return ["압축품", "분쇄품"];
  if (direction === "출고") return ["분쇄품", "펠렛"];
  return ["압축품", "분쇄품", "펠렛"];
}

function toMonthKey(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}

function withinDays(iso: string, days: number) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return now - t <= days * 24 * 60 * 60 * 1000;
}

function stat(values: number[]) {
  if (values.length === 0) return { n: 0, min: 0, max: 0, avg: 0, range: 0 };
  let min = values[0];
  let max = values[0];
  let sum = 0;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  const avg = sum / values.length;
  return { n: values.length, min, max, avg, range: max - min };
}

export default function BrowsePrice() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [direction, setDirection] = useState<"전체" | Direction>("전체");
  const [kind, setKind] = useState<"전체" | Kind>("전체");
  const [item, setItem] = useState<"전체" | Item>("전체");
  const [partnerPick, setPartnerPick] = useState<string>("");

  const all = useMemo(() => loadEvents(), []);

  const kindOptions = useMemo(() => {
    const allowed = allowedKinds(direction);
    return ["전체" as const, ...allowed];
  }, [direction]);

  const filtered = useMemo(() => {
    const allowed = allowedKinds(direction);

    return all.filter((e) => {
      if (!withinDays(e.occurredAt, days)) return false;
      if (direction !== "전체" && e.direction !== direction) return false;

      if (direction !== "전체" && !allowed.includes(e.kind)) return false;

      if (kind !== "전체" && e.kind !== kind) return false;
      if (kind === "전체" && direction !== "전체" && !allowed.includes(e.kind)) return false;

      if (item !== "전체" && e.item !== item) return false;
      return true;
    });
  }, [all, days, direction, kind, item]);

  const overall = useMemo(() => {
    const prices = filtered.map((e) => Number(e.unitPricePerKg) || 0).filter((x) => x > 0);
    return stat(prices);
  }, [filtered]);

  const monthAgg = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const e of filtered) {
      const k = toMonthKey(e.occurredAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e.unitPricePerKg);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? -1 : 1))
      .slice(0, 3)
      .map(([k, arr]) => ({ month: k, ...stat(arr) }));
  }, [filtered]);

  const partners = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of filtered) {
      if (!m.has(e.partnerId)) m.set(e.partnerId, e.partnerName || e.partnerId);
    }
    return Array.from(m.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered]);

  const partnerEvents = useMemo(() => {
    if (!partnerPick) return [];
    return filtered
      .filter((e) => e.partnerId === partnerPick)
      .sort((a, b) => (a.occurredAt > b.occurredAt ? -1 : 1))
      .slice(0, 30);
  }, [filtered, partnerPick]);

  return (
    <div className="card">
      <h1 className="h1">단가 조회</h1>
      <p className="p">유통 기록 저장 시 자동 생성된 단가 이벤트(price_events_v1) 기반</p>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>필터</div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div>
            <div className="p" style={{ marginTop: 0 }}>기간</div>
            <div className="row" style={{ marginTop: 8 }}>
              {[7, 30, 90].map((d) => (
                <button key={d} type="button" className={`selBtn ${days === d ? "active" : ""}`} onClick={() => setDays(d as any)}>
                  최근 {d}일
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>방향</div>
            <div className="row" style={{ marginTop: 8 }}>
              {(["전체", "매입", "출고"] as const).map((d) => (
                <button key={d} type="button" className={`selBtn ${direction === d ? "active" : ""}`} onClick={() => { setDirection(d); setKind("전체"); }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>종류</div>
            <div className="row" style={{ marginTop: 8 }}>
              {kindOptions.map((k) => (
                <button key={k} type="button" className={`selBtn ${kind === k ? "active" : ""}`} onClick={() => setKind(k as any)}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>품목</div>
            <div className="row" style={{ marginTop: 8 }}>
              {(["전체", "PP", "PE"] as const).map((it) => (
                <button key={it} type="button" className={`selBtn ${item === it ? "active" : ""}`} onClick={() => setItem(it)}>
                  {it}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="row" style={{ marginTop: 0 }}>
          <div className="pill">표본 수: {overall.n}</div>
          <div className="pill">최저: {overall.n ? Math.round(overall.min).toLocaleString() : "-"} 원/Kg</div>
          <div className="pill">최고: {overall.n ? Math.round(overall.max).toLocaleString() : "-"} 원/Kg</div>
          <div className="pill">평균: {overall.n ? Math.round(overall.avg).toLocaleString() : "-"} 원/Kg</div>
          <div className="pill">변동폭: {overall.n ? Math.round(overall.range).toLocaleString() : "-"} 원/Kg</div>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>월별 요약(최근 3개월)</div>

        {monthAgg.length === 0 ? (
          <p className="p">데이터 없음</p>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {monthAgg.map((m) => (
              <div key={m.month} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontWeight: 900 }}>{m.month}</div>
                <div className="row" style={{ marginTop: 10 }}>
                  <div className="pill">표본: {m.n}</div>
                  <div className="pill">최저: {Math.round(m.min).toLocaleString()}</div>
                  <div className="pill">최고: {Math.round(m.max).toLocaleString()}</div>
                  <div className="pill">평균: {Math.round(m.avg).toLocaleString()}</div>
                  <div className="pill">변동폭: {Math.round(m.range).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>거래처별 보기</div>

        {partners.length === 0 ? (
          <p className="p">필터 결과에 거래처가 없습니다.</p>
        ) : (
          <>
            <div style={{ marginTop: 10 }}>
              <div className="p" style={{ marginTop: 0 }}>거래처 선택</div>
              <select className="input" value={partnerPick} onChange={(e) => setPartnerPick(e.target.value)}>
                <option value="">선택</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {partnerPick ? (
              <div style={{ marginTop: 12 }}>
                <div className="p">최근 단가 이벤트(최신 30개)</div>
                {partnerEvents.length === 0 ? (
                  <p className="p">해당 거래처 데이터 없음</p>
                ) : (
                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {partnerEvents.map((e) => (
                      <div key={e.eventId} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ fontWeight: 800 }}>
                          {e.occurredAt.slice(0, 19).replace("T", " ")}
                        </div>
                        <div className="p" style={{ marginTop: 6 }}>
                          {e.direction} · {e.kind} · {e.item} · {Math.round(e.unitPricePerKg).toLocaleString()}원/Kg · {Math.round(e.qtyKg).toLocaleString()}Kg
                        </div>
                        <div className="p" style={{ marginTop: 6 }}>
                          차량: {e.vehicleNo || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
