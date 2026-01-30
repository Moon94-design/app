set -e

python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/App.tsx")
s = p.read_text(encoding="utf-8")

# 1) onPrint를 async로
s = re.sub(r"const onPrint\s*=\s*\(\)\s*=>\s*{", "const onPrint = async () => {", s, count=1)

# 2) onPrint 안에서 window.print() 앞에 await waitForPrintImages() 넣기
m = re.search(r"const onPrint\s*=\s*async\s*\(\)\s*=>\s*{", s)
if not m:
    raise SystemExit("NO onPrint")

start = m.end()
end = s.find("};", start)
if end == -1:
    raise SystemExit("NO onPrint end")

block = s[start:end]

if "await waitForPrintImages();" not in block:
    if "window.print();" in block:
        block = block.replace("window.print();", "await waitForPrintImages();\n    window.print();", 1)
    else:
        raise SystemExit("NO window.print in onPrint")

s = s[:start] + block + s[end:]

# 3) waitForPrintImages가 없으면(혹시 롤백으로 사라졌다면) 다시 삽입
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

p.write_text(s, encoding="utf-8")
print("OK: onPrint uses waitForPrintImages")
PY

npm run lint
npm run build
