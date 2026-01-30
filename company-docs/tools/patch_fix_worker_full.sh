set -e

# 1) src/utils/pdf.ts (worker 고정 + load + render page + render all)
cat > src/utils/pdf.ts <<'EOT'
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

export async function loadPdf(url: string): Promise<PDFDocumentProxy> {
  const task = getDocument({
    url,
    cMapUrl: "/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/standard_fonts/",
    useSystemFonts: true,
  });
  return task.promise;
}

export async function renderPdfPageToDataUrl(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 1.35
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

export async function renderPdfAllPagesToDataUrls(
  url: string,
  scale = 1.6,
  maxPages = 30
): Promise<{ urls: string[]; totalPages: number; truncated: boolean }> {
  const pdf = await loadPdf(url);
  const total = pdf.numPages || 1;
  const count = Math.min(total, maxPages);

  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    out.push(await renderPdfPageToDataUrl(pdf, i, scale));
  }

  return { urls: out, totalPages: total, truncated: total > maxPages };
}
EOT

# 2) src/print/printEngine.ts (implicit any 제거 + pdf util 계약 맞춤)
cat > src/print/printEngine.ts <<'EOT'
import type { FileItem } from "../types/fileTypes";
import { renderPdfAllPagesToDataUrls } from "../utils/pdf";

export type PrintPage = { key: string; dataUrl: string; name: string };

export async function buildPrintPages(queue: FileItem[]): Promise<{ pages: PrintPage[]; warnings: string[] }> {
  const pages: PrintPage[] = [];
  const warnings: string[] = [];

  for (const f of queue) {
    if (f.kind === "image") {
      pages.push({ key: f.id, dataUrl: f.url, name: f.name });
      continue;
    }

    const res = await renderPdfAllPagesToDataUrls(f.url, 1.6, 30);
    res.urls.forEach((u: string, idx: number) => {
      pages.push({ key: `${f.id}#${idx + 1}`, dataUrl: u, name: `${f.name} (${idx + 1})` });
    });

    if (res.truncated) {
      warnings.push(`PDF 페이지가 많아서 ${res.totalPages}페이지 중 30페이지만 처리했습니다: ${f.name}`);
    }
  }

  return { pages, warnings };
}
EOT

npm run lint
npm run build
