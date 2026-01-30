set -e

# 0) 백업(선택: safe_apply가 백업하긴 하지만, 여기서도 한 번 더)
tools/backup.sh src/hooks/usePdfPreview.ts src/App.tsx || true

# 1) usePdfPreview 통째 교체
cat > src/hooks/usePdfPreview.ts <<'EOT'
import { useEffect, useRef, useState } from "react";
import type { FileItem } from "../types/fileTypes";
import { loadPdf, renderPdfPageToDataUrl } from "../utils/pdf";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

/**
 * === ANCHORS INDEX (src/hooks/usePdfPreview.ts) ===
 * PDFP:STATE
 * PDFP:LOAD
 * PDFP:RENDER
 * PDFP:CONTROLS
 */

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
    isPdf,
    page,
    totalPages,
    loading,
    rendering,
    error,
    dataUrl,
    fitMode,
    zoom,
    setPage,
    prev,
    next,
    canPrev,
    canNext,
    fitPage,
    fitWidth,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
  };
}
EOT

# 2) App.tsx: print 직전에 printOnly 이미지 로드 완료 대기
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/App.tsx")
s = p.read_text(encoding="utf-8")

if "async function waitForPrintImages" not in s:
    s = s.replace(
        "export default function App() {",
        "async function waitForPrintImages(timeoutMs = 2000) {\n"
        "  const start = Date.now();\n"
        "  while (Date.now() - start < timeoutMs) {\n"
        "    const imgs = Array.from(document.querySelectorAll(\".printOnly img\"));\n"
        "    if (imgs.length === 0) return;\n"
        "    const allReady = imgs.every((img) => img.complete && img.naturalWidth > 0);\n"
        "    if (allReady) return;\n"
        "    await new Promise((r) => setTimeout(r, 30));\n"
        "  }\n"
        "}\n\n"
        "export default function App() {",
        1
    )

# onPrint가 async 아니면 async로
s = re.sub(r"const onPrint\s*=\s*\(\)\s*=>\s*{", "const onPrint = async () => {", s, count=1)

# 첫 번째 window.print만 교체
s = s.replace("window.print();", "await waitForPrintImages();\n    window.print();", 1)

p.write_text(s, encoding="utf-8")
print("OK: App.tsx patched")
PY

# 3) 종점 확인
npm run lint
npm run build
