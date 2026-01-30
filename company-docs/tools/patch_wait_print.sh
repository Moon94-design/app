set -e
python3 - <<'PY'
import re
from pathlib import Path

p=Path("src/App.tsx")
s=p.read_text(encoding="utf-8")

# helper 삽입(없으면)
if "async function waitForPrintImages" not in s:
    s=s.replace(
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

# onPrint 찾기
m=re.search(r"const\s+onPrint\s*=\s*(async\s*)?\(\)\s*=>\s*{", s)
if not m:
    raise SystemExit("NO onPrint found")

# onPrint를 async로 강제
s = re.sub(r"const\s+onPrint\s*=\s*\(\)\s*=>\s*{", "const onPrint = async () => {", s, count=1)

start=m.end()
end=s.find("};", start)
if end==-1:
    raise SystemExit("NO onPrint end")

block=s[start:end]

# 후보: window.print / print() / onPrintInner / printFile 등
candidates=[
  "window.print();",
  "print();",
  "await window.print();",
]
hit=None
for c in candidates:
    i=block.find(c)
    if i!=-1:
        hit=c
        break

# 못 찾으면 "print" 문자열 포함 줄을 찾아 마지막으로 훅
if hit is None:
    lines=block.splitlines()
    for ln in lines:
        if "print" in ln:
            hit=ln.strip()
            break

if hit is None:
    raise SystemExit("NO print call found in onPrint")

if "await waitForPrintImages();" not in block:
    block=block.replace(hit, "await waitForPrintImages();\n    "+hit, 1)

s=s[:start]+block+s[end:]
p.write_text(s, encoding="utf-8")
print("OK: inserted wait before print")
PY

npm run lint
npm run build
