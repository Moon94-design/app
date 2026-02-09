import { useEffect, useRef, useState } from "react";

type BBox = { x: number; y: number; w: number; h: number };

type UiLogEntry = {
  id: string;
  ts: string;
  page: { href: string; path: string };
  target: { selector: string; tag: string; text: string; bbox: BBox };
  note: string;
};

type UiLogDoc = { version: 1; createdAt: string; entries: UiLogEntry[] };

const STORAGE_KEY = "ui_change_log_v1";
const ENABLE_KEY = "ui_edit_enabled_v1";

function nowIso() {
  return new Date().toISOString();
}
function newId(prefix = "U") {
  // @ts-ignore
  const uuid = (globalThis.crypto?.randomUUID?.() as string | undefined) || "";
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
function safeText(s: string) {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, 160);
}

function loadDoc(): UiLogDoc {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, createdAt: nowIso(), entries: [] };
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      createdAt: typeof parsed?.createdAt === "string" ? parsed.createdAt : nowIso(),
      entries: Array.isArray(parsed?.entries) ? parsed.entries : [],
    };
  } catch {
    return { version: 1, createdAt: nowIso(), entries: [] };
  }
}
function saveDoc(doc: UiLogDoc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc, null, 2));
}

export function isUiEditEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setUiEditEnabled(v: boolean) {
  try {
    localStorage.setItem(ENABLE_KEY, v ? "1" : "0");
  } catch {}
}

function cssEscapeLite(s: string) {
  return (s || "").replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
function nthOfType(el: Element) {
  const parent = el.parentElement;
  if (!parent) return 1;
  const tag = el.tagName.toLowerCase();
  const siblings = Array.from(parent.children).filter((c) => c.tagName.toLowerCase() === tag);
  return siblings.indexOf(el) + 1;
}
function buildSelector(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;

  for (let depth = 0; cur && depth < 8; depth++) {
    const tag = cur.tagName.toLowerCase();
    const id = (cur as HTMLElement).id ? `#${cssEscapeLite((cur as HTMLElement).id)}` : "";
    const clsRaw = (cur as HTMLElement).className;
    const cls =
      typeof clsRaw === "string" && clsRaw.trim()
        ? "." +
          clsRaw
            .split(/\s+/g)
            .filter(Boolean)
            .slice(0, 3)
            .map(cssEscapeLite)
            .join(".")
        : "";
    const nth = `:nth-of-type(${nthOfType(cur)})`;

    parts.unshift(`${tag}${id || cls}${id ? "" : nth}`);
    if (id) break;

    cur = cur.parentElement;
    if (cur && cur.tagName.toLowerCase() === "body") {
      parts.unshift("body");
      break;
    }
  }

  return parts.join(" > ");
}
function bboxOf(el: Element): BBox {
  const r = (el as HTMLElement).getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Props = {
  enabled: boolean;
  onClose: () => void;
};

export default function UiEditOverlay({ enabled, onClose }: Props) {
  const [doc, setDoc] = useState<UiLogDoc>(() => loadDoc());
  const [last, setLast] = useState<UiLogEntry | null>(() => (doc.entries[0] ? doc.entries[0] : null));
  const [note, setNote] = useState<string>("");

  const hoverRef = useRef<HTMLDivElement | null>(null);
  const [hoverBox, setHoverBox] = useState<BBox | null>(null);
  const [hoverText, setHoverText] = useState<string>("");

  useEffect(() => {
    if (!enabled) {
      if (hoverRef.current) hoverRef.current.style.display = "none";
      setHoverBox(null);
      setHoverText("");
      return;
    }

    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.zIndex = "2147483647";
    div.style.pointerEvents = "none";
    div.style.border = "2px solid rgba(255,255,255,0.65)";
    div.style.background = "rgba(255,255,255,0.06)";
    div.style.borderRadius = "8px";
    div.style.display = "none";
    document.body.appendChild(div);
    hoverRef.current = div;

    return () => {
      div.remove();
      hoverRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    function onMove(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      if ((el as HTMLElement).closest("[data-ui-edit-panel]")) {
        if (hoverRef.current) hoverRef.current.style.display = "none";
        setHoverBox(null);
        setHoverText("");
        return;
      }

      const box = bboxOf(el);
      setHoverBox(box);
      setHoverText(safeText((el as HTMLElement).innerText || (el as HTMLElement).textContent || ""));

      if (hoverRef.current) {
        hoverRef.current.style.display = "block";
        hoverRef.current.style.left = `${box.x}px`;
        hoverRef.current.style.top = `${box.y}px`;
        hoverRef.current.style.width = `${box.w}px`;
        hoverRef.current.style.height = `${box.h}px`;
      }
    }

    function onClick(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      if ((el as HTMLElement).closest("[data-ui-edit-panel]")) return;

      e.preventDefault();
      e.stopPropagation();

      const entry: UiLogEntry = {
        id: newId("LOG"),
        ts: nowIso(),
        page: { href: window.location.href, path: window.location.pathname },
        target: {
          selector: buildSelector(el),
          tag: el.tagName.toLowerCase(),
          text: safeText((el as HTMLElement).innerText || (el as HTMLElement).textContent || ""),
          bbox: bboxOf(el),
        },
        note: note.trim(),
      };

      const next: UiLogDoc = { ...doc, entries: [entry, ...doc.entries] };
      setDoc(next);
      setLast(entry);
      setNote("");
      saveDoc(next);
    }

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("click", onClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, doc, note]);

  if (!enabled) return null;

  const total = doc.entries.length;

  return (
    <div
      data-ui-edit-panel
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 2147483647,
        width: 360,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(10px)",
        padding: 12,
        color: "rgba(255,255,255,0.92)",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ fontWeight: 900 }}>UI 기록 모드</div>
        <div style={{ opacity: 0.75 }}>logs: {total}</div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {hoverBox ? (
          <div style={{ opacity: 0.8 }}>
            hover: ({hoverBox.x},{hoverBox.y}) {hoverBox.w}×{hoverBox.h}
            {hoverText ? <div style={{ marginTop: 4, opacity: 0.75 }}>“{hoverText}”</div> : null}
          </div>
        ) : (
          <div style={{ opacity: 0.6 }}>hover: -</div>
        )}

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="메모(선택): 예) 텍스트 변경, 간격 줄이기"
          style={{
            width: "100%",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            padding: "10px 10px",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const payload = JSON.stringify(doc, null, 2);
              downloadJson(`ui-change-log_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.json`, payload);
            }}
          >
            JSON 다운로드
          </button>

          <button
            type="button"
            className="btn danger"
            onClick={() => {
              const empty: UiLogDoc = { version: 1, createdAt: nowIso(), entries: [] };
              setDoc(empty);
              setLast(null);
              saveDoc(empty);
            }}
          >
            로그 비우기
          </button>

          <button type="button" className="btn" onClick={onClose}>
            종료
          </button>
        </div>

        {last ? (
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            <div style={{ fontWeight: 900 }}>최근 기록</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              {last.target.tag} · {last.target.selector}
            </div>
            {last.target.text ? <div style={{ marginTop: 6, opacity: 0.75 }}>“{last.target.text}”</div> : null}
            {last.note ? <div style={{ marginTop: 6, opacity: 0.75 }}>note: {last.note}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
