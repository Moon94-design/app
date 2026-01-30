set -e

# (A) usePdfPreview.ts: 통째 교체(=useMemo 없음, lint 0)
cat > src/hooks/usePdfPreview.ts <<'EOT'
import { useEffect, useRef, useState } from "react";
import type { FileItem } from "../types/fileTypes";
import { loadPdf, renderPdfPageToDataUrl } from "../utils/pdf";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

export type PdfFitMode = "page" | "width";

export function usePdfPreview(file: FileItem | null) {
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [docTick, setDocTick] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const [fitMode, setFitMode] = useState<PdfFitMode>("page");
  const [zoom, setZoom] = useState(1);

  const isPdf = file?.kind === "pdf";

  useEffect(() => {
    if (!isPdf || !file) {
      docRef.current = null;
      setPdfId(null);
      setDocTick((t) => t + 1);
      setPage(1);
      setTotalPages(1);
      setLoading(false);
      setRendering(false);
      setError(null);
      setDataUrl(null);
      setFitMode("page");
      setZoom(1);
      return;
    }

    if (pdfId === file.id) return;

    let cancelled = false;
    setPdfId(file.id);
    setPage(1);
    setTotalPages(1);
    setError(null);
    setDataUrl(null);
    setLoading(true);

    (async () => {
      try {
        const pdf = await loadPdf(file.url);
        if (cancelled) return;
        docRef.current = pdf;
        setTotalPages(pdf.numPages || 1);
        setDocTick((t) => t + 1);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [file, isPdf, pdfId]);

  useEffect(() => {
    if (!isPdf || !file) return;
    const pdf = docRef.current;
    if (!pdf) return;

    let cancelled = false;
    setRendering(true);
    setError(null);

    (async () => {
      try {
        const p = Math.max(1, Math.min(page, totalPages || 1));
        const img = await renderPdfPageToDataUrl(pdf, p, 1.35);
        if (!cancelled) setDataUrl(img);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => { cancelled = true; };
  }, [docTick, page, totalPages, file, isPdf]);

  const canPrev = Boolean(isPdf && page > 1);
  const canNext = Boolean(isPdf && page < totalPages);

  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(totalPages, p + 1));

  const fitPage = () => setFitMode("page");
  const fitWidth = () => setFitMode("width");

  const zoomIn = () => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10));
  const zoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));
  const resetZoom = () => setZoom(1);

  return {
    isPdf, page, totalPages, loading, rendering, error, dataUrl,
    fitMode, zoom, setPage, prev, next, canPrev, canNext,
    fitPage, fitWidth, zoomIn, zoomOut, resetZoom, setZoom,
  };
}
EOT

# (B) App.tsx: waitForPrintImages helper + onPrint에 호출 보장(=unused-vars 제거)
python3 - <<'PY'
from pathlib import Path
import re

p=Path("src/App.tsx")
s=p.read_text(encoding="utf-8")

# helper 없으면 삽입 (타입 포함)
if "async function waitForPrintImages" not in s:
    s = s.replace(
        "export default function App() {",
        "async function waitForPrintImages(timeoutMs = 2000) {\n"
        "  const start = Date.now();\n"
        "  while (Date.now() - start < timeoutMs) {\n"
        "    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(\".printOnly img\"));\n"
        "    if (imgs.length === 0) return;\n"
        "    const allReady = imgs.every((img) => img.complete && img.naturalWidth > 0);\n"
        "    if (allReady) return;\n"
        "    await new Promise((r) => setTimeout(r, 30));\n"
        "  }\n"
        "}\n\n"
        "export default function App() {",
        1
    )

# onPrint를 async로 강제
s = re.sub(r"const\s+onPrint\s*=\s*\(\)\s*=>\s*{", "const onPrint = async () => {", s, count=1)

# requestAnimationFrame 체인 안의 window.print() 앞에 wait 삽입
# 패턴: requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
s = s.replace(
    "requestAnimationFrame(() => requestAnimationFrame(() => window.print()));",
    "requestAnimationFrame(() => requestAnimationFrame(async () => { await waitForPrintImages(); window.print(); }));",
    1
)

p.write_text(s, encoding="utf-8")
print("OK: App.tsx print wait wired")
PY

npm run lint
npm run build
