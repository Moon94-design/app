set -e

# (A) worker를 public에 고정 배치 (node_modules로 fetch하지 않게)
mkdir -p public
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs

# (B) src/utils/pdf.ts 통째 교체: workerSrc를 public 경로로 고정 + 기존 API 유지
cat > src/utils/pdf.ts <<'EOT'
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

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

# (C) src/print/printEngine.ts 통째 교체: 이미지도 dataURL로 변환(빈페이지 방지)
cat > src/print/printEngine.ts <<'EOT'
import type { FileItem } from "../types/fileTypes";
import { renderPdfAllPagesToDataUrls } from "../utils/pdf";

export type PrintPage = { key: string; dataUrl: string; name: string };

async function blobUrlToDataUrl(url: string): Promise<string> {
  const blob = await fetch(url).then((r) => r.blob());
  return await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("FileReader failed"));
    fr.readAsDataURL(blob);
  });
}

export async function buildPrintPages(queue: FileItem[]): Promise<{ pages: PrintPage[]; warnings: string[] }> {
  const pages: PrintPage[] = [];
  const warnings: string[] = [];

  for (const f of queue) {
    if (f.kind === "image") {
      const dataUrl = await blobUrlToDataUrl(f.url);
      pages.push({ key: f.id, dataUrl, name: f.name });
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

# (D) DebugPanel이 인쇄에 끼는 문제: DebugPanel 전체를 debugNoPrint로 감싸기
python3 - <<'PY'
from pathlib import Path
p=Path("src/components/DebugPanel.tsx")
s=p.read_text(encoding="utf-8")
if 'className="debugNoPrint"' not in s:
    s = s.replace("return (", "return (\n    <div className=\"debugNoPrint\">", 1)
    s = s.replace("</>", "</>\n    </div>", 1)
p.write_text(s, encoding="utf-8")
print("OK: DebugPanel wrapped")
PY

# (E) App.tsx: print CSS에 debugNoPrint 숨김 + print 전에 이미지 로드 대기(빈페이지 2장 방지)
python3 - <<'PY'
from pathlib import Path
import re

p=Path("src/App.tsx")
s=p.read_text(encoding="utf-8")

# waitForPrintImages helper 삽입(없으면)
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

# requestAnimationFrame(() => requestAnimationFrame(() => window.print())); 패턴을 안전하게 교체
s = s.replace(
  "requestAnimationFrame(() => requestAnimationFrame(() => window.print()));",
  "requestAnimationFrame(() => requestAnimationFrame(async () => { await waitForPrintImages(); window.print(); }));",
  1
)

# print CSS에 debugNoPrint 숨김 추가(없으면)
if ".debugNoPrint" not in s:
    s = s.replace("@media print {", "@media print {\n          .debugNoPrint { display:none !important; }\n", 1)

p.write_text(s, encoding="utf-8")
print("OK: App.tsx print patched")
PY

npm run lint
npm run build
