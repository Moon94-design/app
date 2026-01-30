import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDraftState } from "../../../base/utils/useDraftState";
import { repo } from "../../../data/repo";

type Branch = "대구" | "성주";
type ShiftPreset = "주간" | "오후" | "야간";
type Product = "분쇄품" | "펠렛";
type Item = "PP" | "PE";
type FaultStatus = "해결" | "진행중" | "미해결";

type Equipment = { id: string; name: string };

type ProductionEntry = {
  id: string;
  createdAt: string;
  createdBy: string;

  branch: Branch;

  shiftPreset: ShiftPreset;
  startHHMM: string; // 숫자 4자리
  endHHMM: string;   // 숫자 4자리

  product: Product;
  item: Item;

  outputBags: number;

  hasFault: boolean;
  faultEquipmentId: string;
  faultEquipmentName: string;
  faultTime: string;
  faultContent: string;
  faultCause: string;
  faultAction: string;
  faultPrevention: string;
  faultStatus: FaultStatus;
};

type EquipmentEvent = {
  eventId: string;
  createdAt: string;
  createdBy: string;

  category: "고장";
  status: FaultStatus;

  equipmentId: string;
  equipmentName: string;
  occurredAt: string;

  content: string;
  cause: string;
  action: string;
  prevention: string;

  sourceType: "production";
  sourceId: string;
};

const KEY_AUTHOR = "local_author_name_v1";
const KEY_LIST = "daily_production_v1";
const KEY_DRAFT = "draft_production_v1";
const KEY_EQUIP_EVENTS = "equipment_events_v1";
const KEY_EQUIP = "local_equipments_v1";

/**
 * 지부(2) x 시간대(3) = 6개
 * 마지막 입력한 시간대를 개인 로컬에 저장
 */
const KEY_SHIFT_MEM = "shift_mem_production_v1";

type ShiftMem = Record<string, { start: string; end: string }>;

function newId() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() as string) || `P_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function nowIso() {
  return new Date().toISOString();
}
function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function saveJson(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function digits4(raw: string): string {
  return (raw || "").replace(/\D/g, "").slice(0, 4);
}
function hhmmLabel(hhmm: string): string {
  const d = digits4(hhmm);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

function memKey(branch: Branch, shift: ShiftPreset) {
  return `${branch}_${shift}`;
}

function defaultTimes(shift: ShiftPreset): { start: string; end: string } {
  if (shift === "주간") return { start: "0800", end: "1700" };
  if (shift === "오후") return { start: "1600", end: "2400" }; // 표시/관행용
  return { start: "0000", end: "0800" };
}

function ensureShiftMem() {
  const mem = loadJson<ShiftMem>(KEY_SHIFT_MEM, {});
  // 기본값이 없으면 기본 채움(6개)
  const branches: Branch[] = ["대구", "성주"];
  const shifts: ShiftPreset[] = ["주간", "오후", "야간"];
  let changed = false;

  for (const b of branches) {
    for (const s of shifts) {
      const k = memKey(b, s);
      if (!mem[k]) {
        mem[k] = defaultTimes(s);
        changed = true;
      }
    }
  }
  if (changed) saveJson(KEY_SHIFT_MEM, mem);
  return mem;
}

function getShiftTimes(branch: Branch, shift: ShiftPreset): { start: string; end: string } {
  const mem = ensureShiftMem();
  const k = memKey(branch, shift);
  return mem[k] || defaultTimes(shift);
}

function setShiftTimes(branch: Branch, shift: ShiftPreset, start: string, end: string) {
  const mem = ensureShiftMem();
  const k = memKey(branch, shift);
  mem[k] = { start: digits4(start), end: digits4(end) };
  saveJson(KEY_SHIFT_MEM, mem);
}

function defaultDraft(): ProductionEntry {
  const t = getShiftTimes("대구", "주간");
  return {
    id: "",
    createdAt: "",
    createdBy: "",

    branch: "대구",

    shiftPreset: "주간",
    startHHMM: t.start,
    endHHMM: t.end,

    product: "분쇄품",
    item: "PP",

    outputBags: 0,

    hasFault: false,
    faultEquipmentId: "",
    faultEquipmentName: "",
    faultTime: "",
    faultContent: "",
    faultCause: "",
    faultAction: "",
    faultPrevention: "",
    faultStatus: "진행중",
  };
}

export default function RegisterProductionDaily() {
  const equipments = useMemo(() => {
    const eqs = loadJson<any[]>(KEY_EQUIP, []);
    return eqs.map((e) => ({ id: e.id, name: e.name })) as Equipment[];
  }, []);

  const list = useMemo(() => loadJson<ProductionEntry[]>(KEY_LIST, [] as ProductionEntry[]), []);
  const { state: form, setState: setForm, reset: resetForm } =
    useDraftState<ProductionEntry>(KEY_DRAFT, defaultDraft());

  function patch(p: Partial<ProductionEntry>) {
    setForm({ ...form, ...p });
  }

  function changeBranch(b: Branch) {
    // 지부 바꾸면, 해당 지부+현재 시간대의 마지막 값을 즉시 로드
    const t = getShiftTimes(b, form.shiftPreset);
    patch({ branch: b, startHHMM: t.start, endHHMM: t.end });
  }

  function changeShift(s: ShiftPreset) {
    // 시간대 바꾸면, 현재 지부+그 시간대의 마지막 값 로드
    const t = getShiftTimes(form.branch, s);
    patch({ shiftPreset: s, startHHMM: t.start, endHHMM: t.end });
  }

  function updateStart(raw: string) {
    const start = digits4(raw);
    const next = { ...form, startHHMM: start };
    setForm(next);
    setShiftTimes(next.branch, next.shiftPreset, next.startHHMM, next.endHHMM);
  }

  function updateEnd(raw: string) {
    const end = digits4(raw);
    const next = { ...form, endHHMM: end };
    setForm(next);
    setShiftTimes(next.branch, next.shiftPreset, next.startHHMM, next.endHHMM);
  }

  function pickEquip(id: string) {
    const e = equipments.find((x) => x.id === id);
    patch({ faultEquipmentId: id, faultEquipmentName: e ? e.name : "" });
  }

  function submit() {
    const by = (localStorage.getItem(KEY_AUTHOR) || "").trim() || "작성자 미설정";

    if (!form.branch) return alert("지부를 선택하세요.");
    if ((Number(form.outputBags) || 0) <= 0) return alert("생산수량(자루)은 0보다 커야 합니다.");

    if (digits4(form.startHHMM).length < 4) return alert("시작 시간을 4자리로 입력하세요.");
    if (digits4(form.endHHMM).length < 4) return alert("종료 시간을 4자리로 입력하세요.");

    if (form.hasFault) {
      if (!form.faultEquipmentId) return alert("설비를 선택하세요.");
      if (!form.faultTime.trim()) return alert("발생시간을 입력하세요.");
      if (!form.faultContent.trim()) return alert("내용을 입력하세요.");
      if (!form.faultCause.trim()) return alert("원인을 입력하세요.");
      if (!form.faultAction.trim()) return alert("조치를 입력하세요.");
      if (!form.faultPrevention.trim()) return alert("재발방지를 입력하세요.");
    }

    const saved: ProductionEntry = {
      ...form,
      id: newId(),
      createdAt: nowIso(),
      createdBy: by,
      startHHMM: digits4(form.startHHMM),
      endHHMM: digits4(form.endHHMM),
      outputBags: Number(form.outputBags) || 0,
    };

    const next = [saved, ...list];
    saveJson(KEY_LIST, next);

    if (saved.hasFault) {
      const prevEvents = loadJson<EquipmentEvent[]>(KEY_EQUIP_EVENTS, [] as EquipmentEvent[]);
      const ev: EquipmentEvent = {
        eventId: newId(),
        createdAt: saved.createdAt,
        createdBy: saved.createdBy,

        category: "고장",
        status: saved.faultStatus,

        equipmentId: saved.faultEquipmentId,
        equipmentName: saved.faultEquipmentName,
        occurredAt: saved.faultTime.trim(),

        content: saved.faultContent.trim(),
        cause: saved.faultCause.trim(),
        action: saved.faultAction.trim(),
        prevention: saved.faultPrevention.trim(),

        sourceType: "production",
        sourceId: saved.id,
      };
      repo.equipmentEvents().setAll([ev, ...prevEvents]);
    }

    resetForm();
    alert("저장되었습니다.");
  }

  const recent = useMemo(
    () => loadJson<ProductionEntry[]>(KEY_LIST, [] as ProductionEntry[]).slice(0, 20),
    [form]
  );

  return (
    <div className="card">
      <h1 className="h1">생산 기록</h1>

      <div className="divider" />

      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div className="p" style={{ marginTop: 0 }}>지부</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["대구", "성주"] as const).map((b) => (
              <button key={b} type="button" className={`selBtn ${form.branch === b ? "active" : ""}`} onClick={() => changeBranch(b)}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>시간대</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["주간", "오후", "야간"] as const).map((s) => (
              <button key={s} type="button" className={`selBtn ${form.shiftPreset === s ? "active" : ""}`} onClick={() => changeShift(s)}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div>
              <div className="p" style={{ marginTop: 0 }}>시작</div>
              <input
                className="input"
                inputMode="numeric"
                value={hhmmLabel(form.startHHMM)}
                onChange={(e) => updateStart(e.target.value)}
                placeholder="HHMM"
              />
            </div>

            <div>
              <div className="p" style={{ marginTop: 0 }}>종료</div>
              <input
                className="input"
                inputMode="numeric"
                value={hhmmLabel(form.endHHMM)}
                onChange={(e) => updateEnd(e.target.value)}
                placeholder="HHMM"
              />
            </div>

            <div className="pill">
              표시: {hhmmLabel(form.startHHMM)} ~ {hhmmLabel(form.endHHMM)}
            </div>
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>제품 구분</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["분쇄품", "펠렛"] as const).map((p) => (
              <button key={p} type="button" className={`selBtn ${form.product === p ? "active" : ""}`} onClick={() => patch({ product: p })}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>품목</div>
          <div className="row" style={{ marginTop: 8 }}>
            {(["PP", "PE"] as const).map((it) => (
              <button key={it} type="button" className={`selBtn ${form.item === it ? "active" : ""}`} onClick={() => patch({ item: it })}>
                {it}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="p" style={{ marginTop: 0 }}>생산수량(자루)</div>
          <input className="input" inputMode="numeric" value={String(form.outputBags)} onChange={(e) => patch({ outputBags: Number(e.target.value || 0) })} />
        </div>

        <div className="divider" />

        <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="h1" style={{ fontSize: 15 }}>불량/이상</div>

          <div className="row">
            <button type="button" className={`selBtn ${!form.hasFault ? "active" : ""}`} onClick={() => patch({ hasFault: false })}>
              없음
            </button>
            <button type="button" className={`selBtn ${form.hasFault ? "active" : ""}`} onClick={() => patch({ hasFault: true })}>
              있음
            </button>
          </div>

          {form.hasFault ? (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div>
                <div className="p" style={{ marginTop: 0 }}>설비</div>
                <select className="input" value={form.faultEquipmentId} onChange={(e) => pickEquip(e.target.value)}>
                  <option value="">선택</option>
                  {equipments.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <div className="row">
                  <Link className="btn" to="/register/master/equipment">설비 추가</Link>
                </div>
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>발생시간</div>
                <input className="input" value={form.faultTime} onChange={(e) => patch({ faultTime: e.target.value })} placeholder="예: 14:30" />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>내용</div>
                <textarea className="textarea" rows={3} value={form.faultContent} onChange={(e) => patch({ faultContent: e.target.value })} />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>원인</div>
                <textarea className="textarea" rows={3} value={form.faultCause} onChange={(e) => patch({ faultCause: e.target.value })} />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>조치</div>
                <textarea className="textarea" rows={3} value={form.faultAction} onChange={(e) => patch({ faultAction: e.target.value })} />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>재발방지</div>
                <textarea className="textarea" rows={3} value={form.faultPrevention} onChange={(e) => patch({ faultPrevention: e.target.value })} />
              </div>

              <div>
                <div className="p" style={{ marginTop: 0 }}>상태</div>
                <div className="row" style={{ marginTop: 8 }}>
                  {(["해결", "진행중", "미해결"] as const).map((s) => (
                    <button key={s} type="button" className={`selBtn ${form.faultStatus === s ? "active" : ""}`} onClick={() => patch({ faultStatus: s })}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="row">
          <button type="button" className="btn primary" onClick={submit}>저장</button>
          <button type="button" className="btn" onClick={() => resetForm()}>초기화</button>
        </div>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="h1" style={{ fontSize: 15 }}>저장된 생산 기록(최근 20개)</div>

        {recent.length === 0 ? (
          <p className="p">아직 없음</p>
        ) : (
          recent.map((r) => (
            <div key={r.id} className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontWeight: 900 }}>{r.branch} · {r.createdBy}</div>
              <div className="p" style={{ marginTop: 6 }}>{r.createdAt.slice(0, 19).replace("T", " ")}</div>
              <div className="p" style={{ marginTop: 6 }}>
                {r.shiftPreset} · {hhmmLabel(r.startHHMM)}~{hhmmLabel(r.endHHMM)} · {r.product} · {r.item} · {r.outputBags}자루
              </div>
              {r.hasFault ? <div className="pill" style={{ marginTop: 10 }}>불량/이상: {r.faultStatus}</div> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}