import { useEffect, useMemo, useRef, useState } from "react";

export type NameItem = {
  id: string;
  baseName: string;
  detailTag?: string;
};

type Match = { item: NameItem; rank: 0 | 1 | 2 };

function norm(s: any) {
  return (typeof s === "string" ? s : "").trim().toLowerCase().replace(/\s+/g, "");
}

function display(item: NameItem) {
  const base = typeof item.baseName === "string" ? item.baseName : "";
  const tag = (typeof item.detailTag === "string" ? item.detailTag : "").trim();
  return tag ? `${base} · ${tag}` : base;
}

function matchList(items: NameItem[], q: string, limit = 8): Match[] {
  const qq = norm(q);
  if (!qq) return [];

  const out: Match[] = [];
  for (const it of items || []) {
    const d = display(it);
    const dn = norm(d);
    const bn = norm(it?.baseName);

    let rank: 0 | 1 | 2 | null = null;
    if (dn === qq || bn === qq) rank = 0;
    else if (dn.startsWith(qq) || bn.startsWith(qq)) rank = 1;
    else if (dn.includes(qq) || bn.includes(qq)) rank = 2;

    if (rank !== null) out.push({ item: it, rank });
  }

  out.sort((a, b) => (a.rank - b.rank) || display(a.item).length - display(b.item).length);
  return out.slice(0, limit);
}

type Props = {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  items: NameItem[];
  placeholder?: string;

  onPick?: (picked: NameItem) => void;
  onRename?: (id: string, nextBaseName: string, nextDetailTag: string) => void;
};

export default function NameAutocomplete({ label, value, onChange, items, placeholder, onPick, onRename }: Props) {
  // ✅ value가 undefined로 들어와도 절대 안 터지게 방어
  const safeValue = typeof value === "string" ? value : "";

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editBase, setEditBase] = useState("");
  const [editTag, setEditTag] = useState("");

  const ref = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => matchList(items || [], safeValue), [items, safeValue]);

  useEffect(() => {
    setOpen(!!safeValue.trim());
  }, [safeValue]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function startEdit(m: NameItem) {
    setEditId(m.id);
    setEditBase(typeof m.baseName === "string" ? m.baseName : "");
    setEditTag(typeof m.detailTag === "string" ? m.detailTag : "");
  }

  function commitEdit() {
    if (!onRename) return;
    const base = (editBase || "").trim();
    if (!base) return;
    onRename(editId, base, (editTag || "").trim());
    setEditId("");
    setEditBase("");
    setEditTag("");
    setOpen(false);
  }

  return (
    <div ref={ref}>
      {label ? <div className="p" style={{ marginTop: 0 }}>{label}</div> : null}

      <input
        className="input"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "이름 입력"}
      />

      {open && matches.length ? (
        <div style={{ marginTop: 8, borderRadius: 12, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden" }}>
          {matches.map(({ item, rank }) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, justifyContent: "flex-start", background: "transparent" }}
                onClick={() => { onPick?.(item); setOpen(false); }}
              >
                <span style={{ fontWeight: 900 }}>{item.baseName}</span>
                {(item.detailTag || "").trim() ? <span style={{ marginLeft: 8, opacity: 0.7 }}>· {item.detailTag}</span> : null}
                <span style={{ marginLeft: 10, opacity: 0.55, fontSize: 12 }}>{rank === 0 ? "일치" : rank === 1 ? "접두" : "포함"}</span>
              </button>

              {onRename ? <button type="button" className="btn" onClick={() => startEdit(item)}>수정</button> : null}
            </div>
          ))}

          {editId ? (
            <div style={{ padding: 12, display: "grid", gap: 10 }}>
              <div className="p" style={{ marginTop: 0 }}>이름 수정(즉시 반영)</div>

              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
                <div className="p" style={{ marginTop: 0 }}>메인</div>
                <input className="input" value={editBase} onChange={(e) => setEditBase(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
                <div className="p" style={{ marginTop: 0 }}>세부태그</div>
                <input className="input" value={editTag} onChange={(e) => setEditTag(e.target.value)} placeholder="선택" />
              </div>

              <div className="row" style={{ marginTop: 0 }}>
                <button type="button" className="btn primary" onClick={commitEdit}>적용</button>
                <button type="button" className="btn" onClick={() => { setEditId(""); setEditBase(""); setEditTag(""); }}>닫기</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}