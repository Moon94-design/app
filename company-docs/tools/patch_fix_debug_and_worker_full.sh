set -e

# (1) pdf worker를 Vite 번들 URL로 고정 (node_modules fetch 탈출)
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

export async function renderPdfAllPagesToDataUrls(
  url: string,
  scale = 1.2,
  maxPages = 10
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

# (2) DebugPanel: 인쇄에 절대 끼지 않게, printMode일 때 렌더 자체를 끄도록 App.tsx 패치
python3 - <<'PY'
from pathlib import Path
import re

p=Path("src/App.tsx")
s=p.read_text(encoding="utf-8")

# printMode state가 있으면 그걸로 DebugPanel 렌더를 꺼버림.
# <DebugPanel ... /> 를 {!printMode && <DebugPanel ... />} 로 감싸기.
s = re.sub(r'^\s*<DebugPanel\b([\s\S]*?)\/>\s*$',
           r'      {!printMode && <DebugPanel\1/>}',
           s, flags=re.MULTILINE)

# 만약 위 정규식이 안 맞으면(포맷 다름) 두번째 방식으로 강제 치환
if "<DebugPanel" in s and "{!printMode" not in s:
    s = s.replace("<DebugPanel", "{!printMode && <DebugPanel", 1)
    s = s.replace("/>", "/>}", 1)

# print CSS에 debugNoPrint도 추가(혹시라도 대비)
if ".debugNoPrint" not in s:
    s = s.replace("@media print {", "@media print {\n          .debugNoPrint { display:none !important; }\n", 1)

p.write_text(s, encoding="utf-8")
print("OK: App.tsx DebugPanel gated by printMode")
PY

# (3) DebugPanel 루트에 className을 달아둠(2중 안전)
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

npm run lint
npm run build
