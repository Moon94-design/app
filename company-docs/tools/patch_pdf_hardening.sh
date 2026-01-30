set -e

# 0) worker 파일을 public에 고정 배치(동적 import 꼬임/인증꼬임 방지)
mkdir -p public
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs

# 1) src/utils/pdf.ts 통째 교체: worker를 public 경로로 고정 + 최소 옵션(일단 로드 우선)
cat > src/utils/pdf.ts <<'EOT'
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function loadPdf(url: string): Promise<PDFDocumentProxy> {
  // 로드가 멈추는 케이스를 피하려고 옵션을 최소화(로드 우선)
  const task = getDocument({ url });
  return task.promise;
}

export async function renderPdfPageToDataUrl(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.2
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context missing");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas.toDataURL("image/png");
}
EOT

# 2) src/hooks/usePdfPreview.ts 통째 교체: 1페이지/다음페이지 + 진행 로그(console.warn) + 타임아웃 폴백
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

    console.warn(`[pdf] load start: ${file.name}`);

    const timer = setTimeout(() => {
      if (!cancelled) {
        setError("PDF 로딩이 지연되고 있습니다. 네트워크/워커 문제일 수 있습니다.");
        console.warn("[pdf] load timeout (5s)");
      }
    }, 5000);

    (async () => {
      try {
        const pdf = await loadPdf(file.url);
        if (cancelled) return;
        docRef.current = pdf;
        setTotalPages(pdf.numPages || 1);
        setDocTick((t) => t + 1);
        console.warn(`[pdf] load ok: pages=${pdf.numPages || 1}`);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        console.error("[pdf] load fail", e);
      } finally {
        clearTimeout(timer);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; clearTimeout(timer); };
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
        console.warn(`[pdf] render start: page=${p}`);
        const img = await renderPdfPageToDataUrl(pdf, p, 1.2);
        if (!cancelled) setDataUrl(img);
        console.warn(`[pdf] render ok: page=${p}`);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        console.error("[pdf] render fail", e);
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
    fitMode, zoom, prev, next, canPrev, canNext,
    fitPage, fitWidth, zoomIn, zoomOut, resetZoom, setZoom,
  };
}
EOT

# 3) src/components/PreviewStage.tsx 통째 교체: PDF 실패 시 "PDF 열기" 폴백 버튼 노출
cat > src/components/PreviewStage.tsx <<'EOT'
import type { FileItem, OverlayMode, Css } from "../types/fileTypes";
import type { PdfFitMode } from "../hooks/usePdfPreview";

export default function PreviewStage(props: {
  file: FileItem | null;
  overlayMode: OverlayMode;

  pdfDataUrl?: string | null;
  pdfLoading?: boolean;
  pdfRendering?: boolean;
  pdfError?: string | null;

  pdfPage?: number;
  pdfTotalPages?: number;
  pdfCanPrev?: boolean;
  pdfCanNext?: boolean;
  onPdfPrev?: () => void;
  onPdfNext?: () => void;

  pdfFitMode?: PdfFitMode;
  onPdfFitPage?: () => void;
  onPdfFitWidth?: () => void;

  pdfZoom?: number;
  onPdfZoomIn?: () => void;
  onPdfZoomOut?: () => void;
  onPdfZoomReset?: () => void;
  onPdfWheelZoom?: (deltaY: number) => void;
}) {
  const { file, overlayMode } = props;
  const isPdf = file?.kind === "pdf";

  return (
    <div style={S.preview}>
      {!file && (
        <div style={S.emptyHint}>
          <div>
            <div style={S.emptyTitle}>미리보기</div>
            <div style={S.emptySub}>파일을 선택하면 여기에 표시됩니다.</div>
          </div>
        </div>
      )}

      {file?.kind === "image" && (
        <div style={S.frame}>
          <img src={file.url} alt={file.name} style={S.mediaContain} />
        </div>
      )}

      {isPdf && (
        <div style={S.pdfFrame} onWheel={(e) => { e.preventDefault(); props.onPdfWheelZoom?.(e.deltaY); }}>
          <div style={S.pdfToolbar}>
            <button type="button" style={props.pdfCanPrev ? S.tbBtn : S.tbBtnDis} onClick={props.onPdfPrev} disabled={!props.pdfCanPrev}>‹</button>
            <div style={S.tbText}>{props.pdfPage ?? 1} / {props.pdfTotalPages ?? 1}</div>
            <button type="button" style={props.pdfCanNext ? S.tbBtn : S.tbBtnDis} onClick={props.onPdfNext} disabled={!props.pdfCanNext}>›</button>
            <div style={S.tbSpacer} />
            <button type="button" style={props.pdfFitMode === "width" ? S.tbBtnOn : S.tbBtn} onClick={props.onPdfFitWidth}>폭맞춤</button>
            <button type="button" style={props.pdfFitMode === "page" ? S.tbBtnOn : S.tbBtn} onClick={props.onPdfFitPage}>페이지</button>
            <button type="button" style={S.tbBtn} onClick={props.onPdfZoomOut}>-</button>
            <div style={S.tbText}>{props.pdfZoom?.toFixed(1) ?? "1.0"}x</div>
            <button type="button" style={S.tbBtn} onClick={props.onPdfZoomIn}>+</button>
            <button type="button" style={S.tbBtn} onClick={props.onPdfZoomReset}>리셋</button>
          </div>

          <div style={S.pdfBody}>
            {props.pdfLoading && <div style={S.pdfText}>PDF 불러오는 중…</div>}
            {!props.pdfLoading && props.pdfError && (
              <div style={S.pdfText}>
                PDF 미리보기 실패\n{props.pdfError}
                <div style={{ marginTop: 10 }}>
                  <button type="button" style={S.openBtn} onClick={() => { window.location.href = file!.url; }}>
                    PDF 열기(폴백)
                  </button>
                </div>
              </div>
            )}
            {!props.pdfLoading && !props.pdfError && props.pdfDataUrl && (
              <div style={S.pdfCanvas}>
                <img
                  src={props.pdfDataUrl}
                  alt={file?.name || "pdf"}
                  style={{
                    ...(props.pdfFitMode === "width" ? S.pdfFitWidth : S.pdfFitPage),
                    transform: `scale(${props.pdfZoom ?? 1})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            )}
          </div>

          {props.pdfRendering && <div style={S.pdfBusy}>렌더링 중…</div>}
        </div>
      )}

      {overlayMode !== "none" && (
        <div style={overlayMode === "blur" ? S.overlayBlur : S.overlayDim} />
      )}
    </div>
  );
}

const S: Css = {
  preview: { position: "absolute", inset: 0, background: "#000" },

  emptyHint: { position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: 16, color: "rgba(255,255,255,0.75)" },
  emptyTitle: { fontSize: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, lineHeight: 1.4, color: "rgba(255,255,255,0.65)" },

  frame: { position: "absolute", inset: 0, padding: 28, boxSizing: "border-box" },
  mediaContain: { width: "100%", height: "100%", objectFit: "contain" },

  pdfFrame: { position: "absolute", inset: 0, padding: 16, boxSizing: "border-box", overflow: "hidden" },
  pdfToolbar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(10,10,14,0.65)", marginBottom: 10 },
  tbSpacer: { flex: 1 },
  tbText: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  tbBtn: { borderRadius: 10, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.9)", padding: "6px 10px", fontSize: 12 },
  tbBtnOn: { borderRadius: 10, border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.95)", padding: "6px 10px", fontSize: 12 },
  tbBtnDis: { borderRadius: 10, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.35)", padding: "6px 10px", fontSize: 12 },

  pdfBody: { position: "relative", height: "calc(100% - 58px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.25)", overflow: "auto", padding: 16, boxSizing: "border-box" },
  pdfCanvas: { position: "relative" },
  pdfFitPage: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" },
  pdfFitWidth: { width: "100%", height: "auto", display: "block" },
  pdfText: { color: "rgba(255,255,255,0.75)", fontSize: 13, whiteSpace: "pre-wrap" },
  pdfBusy: { position: "absolute", right: 12, bottom: 12, fontSize: 12, color: "rgba(255,255,255,0.6)" },

  openBtn: { borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)", padding: "8px 10px", fontSize: 12 },

  overlayDim: { position: "absolute", inset: 0, pointerEvents: "none", background: "rgba(0,0,0,0.18)" },
  overlayBlur: { position: "absolute", inset: 0, pointerEvents: "none", background: "rgba(0,0,0,0.22)", backdropFilter: "blur(6px)" },
};
EOT

npm run lint
npm run build
