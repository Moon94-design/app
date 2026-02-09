import { useMemo, useState } from "react";
import { repo } from "../../../data/repo";
import { loadJson, saveJson, loadString, saveString } from "../../../base/utils/pageStorage";

type Direction = "매입" | "출고";
type Kind = "압축품" | "분쇄품" | "펠렛";
type Item = "PP" | "PE";

type PriceRow = {
  id: string;
  direction: Direction;
  kind: Kind;
  item: Item;
  pricePerKg: number;
};

type Partner = {
  id: string;
  name: string;
  address: string;
  status: "거래중" | "보류" | "중단";
  tags: string[];
  contacts: any[];
  vehicles: any[];
  prices: PriceRow[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type Vehicle = {
  id: string;
  vehicleNo: string;
  carrier: string;
  driverName: string;
  driverPhone: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type LogisticsLine = {
  id: string;
  occurredAt: string;

  partnerId: string;
  partnerName: string;

  vehicleId: string;
  vehicleNo: string;

  direction: Direction;
  kind: Kind;
  item: Item;

  qtyKg: number;
  unitPricePerKg: number;
  totalAmount: number;

  hasIssue: boolean;
  issueNote: string;
};

type DailyLogisticsLine = LogisticsLine & {
  createdAt: string;
  createdBy: string;
};

type PriceEvent = {
  eventId: string;
  occurredAt: string;
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

const KEY_AUTHOR = "local_author_name_v1";
const DRAFT_KEY = "draft_logistics_v1";

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `ID_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function nowIso() {
  return new Date().toISOString();
}

function allowedKinds(direction: Direction): Kind[] {
  return direction === "매입" ? ["압축품", "분쇄품"] : ["분쇄품", "펠렛"];
}

function defaultLine(): LogisticsLine {
  return {
    id: newId(),
    occurredAt: nowIso(),
    partnerId: "",
    partnerName: "",
    vehicleId: "",
    vehicleNo: "",
    direction: "출고",
    kind: "분쇄품",
    item: "PP",
    qtyKg: 0,
    unitPricePerKg: 0,
    totalAmount: 0,
    hasIssue: false,
    issueNote: "",
  };
}

type Draft = {
  author: string;
  line: LogisticsLine;
};

export default function RegisterLogisticsDaily() {
  // ✅ repo에서 읽기
  const [partners, setPartners] = useState<Partner[]>(() => repo.partners<Partner>().getAll());
  const vehicles = useMemo(() => repo.vehicles<Vehicle>().getAll(), []);
  const [savedLines, setSavedLines] = useState<DailyLogisticsLine[]>(() => repo.logisticsLines<DailyLogisticsLine>().getAll());

  const initDraft = useMemo(() => {
    return loadJson<Draft>(DRAFT_KEY, { author: loadString(KEY_AUTHOR) || "", line: defaultLine() });
  }, []);

  const [author, setAuthor] = useState<string>(() => initDraft.author);
  const [line, setLine] = useState<LogisticsLine>(() => initDraft.line);

  function persist(nextAuthor: string, nextLine: LogisticsLine) {
    setAuthor(nextAuthor);
    setLine(nextLine);
    saveString(KEY_AUTHOR, nextAuthor);
    saveJson(DRAFT_KEY, { author: nextAuthor, line: nextLine });
  }

  function recalc(next: LogisticsLine): LogisticsLine {
    const qty = Number(next.qtyKg) || 0;
    const unit = Number(next.unitPricePerKg) || 0;
    return { ...next, totalAmount: Math.round(qty * unit) };
  }

  function update(patch: Partial<LogisticsLine>) {
    let next = { ...line, ...patch };

    if (patch.direction) {
      const kinds = allowedKinds(patch.direction);
      if (!kinds.includes(next.kind)) next.kind = kinds[0];
    }

    if (patch.partnerId !== undefined) {
      const p = partners.find((pp) => pp.id === patch.partnerId);
      next.partnerName = p ? p.name : "";
    }

    if (patch.vehicleId !== undefined) {
      const v = vehicles.find((vv) => vv.id === patch.vehicleId);
      next.vehicleNo = v ? v.vehicleNo : "";
    }

    next = recalc(next);
    persist(author, next);
  }

  function submit() {
    const by = author.trim() ? author.trim() : "작성자 미설정";
    if (!line.partnerId) return alert("거래처를 선택하세요.");
    if (!line.vehicleNo.trim()) return alert("차량번호를 입력/선택하세요.");
    if ((Number(line.qtyKg) || 0) <= 0) return alert("수량(Kg)은 0보다 커야 합니다.");
    if ((Number(line.unitPricePerKg) || 0) <= 0) return alert("단가(원/Kg)은 0보다 커야 합니다.");

    const dailyId = newId();
    const createdAt = nowIso();

    const saved: DailyLogisticsLine = {
      ...recalc({
        ...line,
        qtyKg: Number(line.qtyKg) || 0,
        unitPricePerKg: Number(line.unitPricePerKg) || 0,
      }),
      createdAt,
      createdBy: by,
    };

    const nextLines = [saved, ...savedLines];
    setSavedLines(nextLines);
    repo.logisticsLines<DailyLogisticsLine>().setAll(nextLines);

    // price event 누적(repo)
    const prevEvents = repo.priceEvents<PriceEvent>().getAll();
    const ev: PriceEvent = {
      eventId: newId(),
      occurredAt: saved.occurredAt,
      partnerId: saved.partnerId,
      partnerName: saved.partnerName,
      vehicleNo: saved.vehicleNo,
      direction: saved.direction,
      kind: saved.kind,
      item: saved.item,
      unitPricePerKg: saved.unitPricePerKg,
      qtyKg: saved.qtyKg,
      totalAmount: saved.totalAmount,
      sourceDailyId: dailyId,
    };
    repo.priceEvents<PriceEvent>().setAll([ev, ...prevEvents]);

    // 거래처 단가 자동 업데이트(repo)
    const partnersNext = partners.map((p) => {
      if (p.id !== saved.partnerId) return p;

      let nextPrices = Array.isArray(p.prices) ? [...p.prices] : [];
      const idx = nextPrices.findIndex(
        (r) => r.direction === saved.direction && r.kind === saved.kind && r.item === saved.item
      );
      if (idx >= 0) {
        nextPrices[idx] = { ...nextPrices[idx], pricePerKg: saved.unitPricePerKg };
      } else {
        nextPrices.push({
          id: newId(),
          direction: saved.direction,
          kind: saved.kind,
          item: saved.item,
          pricePerKg: saved.unitPricePerKg,
        });
      }

      return { ...p, prices: nextPrices, updatedAt: nowIso() };
    });

    setPartners(partnersNext);
    repo.partners<Partner>().setAll(partnersNext);

    alert("저장되었습니다.");

    const fresh = defaultLine();
    persist(author, fresh);
  }

  const kinds = allowedKinds(line.direction);

  return (
    <div className="card">
      <h1 className="h1">유통 기록</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>작성자(로컬)</div>
          <input className="input" value={author} onChange={(e) => persist(e.target.value, line)} />
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div>
            <div className="p" style={{ marginTop: 0 }}>거래처</div>
            <select className="input" value={line.partnerId} onChange={(e) => update({ partnerId: e.target.value })}>
              <option value="">선택</option>
              {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>차량(선택)</div>
            <select className="input" value={line.vehicleId} onChange={(e) => update({ vehicleId: e.target.value })}>
              <option value="">선택</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
            </select>

            <div className="p" style={{ marginTop: 8, opacity: 0.9 }}>차량번호</div>
            <input className="input" value={line.vehicleNo} onChange={(e) => update({ vehicleNo: e.target.value })} />
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>방향</div>
            <div className="row" style={{ marginTop: 8 }}>
              {(["매입", "출고"] as const).map((d) => (
                <button key={d} type="button" className={`selBtn ${line.direction === d ? "active" : ""}`} onClick={() => update({ direction: d })}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>종류</div>
            <div className="row" style={{ marginTop: 8 }}>
              {kinds.map((k) => (
                <button key={k} type="button" className={`selBtn ${line.kind === k ? "active" : ""}`} onClick={() => update({ kind: k })}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>품목</div>
            <div className="row" style={{ marginTop: 8 }}>
              {(["PP", "PE"] as const).map((it) => (
                <button key={it} type="button" className={`selBtn ${line.item === it ? "active" : ""}`} onClick={() => update({ item: it })}>
                  {it}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>수량(Kg)</div>
            <input className="input" inputMode="numeric" value={String(line.qtyKg)} onChange={(e) => update({ qtyKg: Number(e.target.value || 0) })} />
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>단가(원/Kg)</div>
            <input className="input" inputMode="numeric" value={String(line.unitPricePerKg)} onChange={(e) => update({ unitPricePerKg: Number(e.target.value || 0) })} />
          </div>

          <div>
            <div className="p" style={{ marginTop: 0 }}>총금액(자동)</div>
            <input className="input" value={String(line.totalAmount)} readOnly />
          </div>
        </div>

        <div className="row">
          <button type="button" className="btn primary" onClick={submit}>저장</button>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 유통 기록(최근 20개)</div>

        {savedLines.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          savedLines.slice(0, 20).map((s) => (
            <div key={s.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontWeight: 900 }}>{s.partnerName}</div>
              <div className="p" style={{ marginTop: 6 }}>
                {s.direction} · {s.kind} · {s.item} · {Math.round(s.unitPricePerKg).toLocaleString()}원/Kg
              </div>
              <div className="p" style={{ marginTop: 6 }}>차량: {s.vehicleNo || "-"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}