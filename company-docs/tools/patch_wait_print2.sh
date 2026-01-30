set -e

# 1) App.tsx에 들어갈 waitForPrintImages helper를 "HTMLImageElement 타입"으로 고정(complete/naturalWidth 오류 제거)
python3 - <<'PY'
from pathlib import Path
import re

p=Path("src/App.tsx")
s=p.read_text(encoding="utf-8")

# helper 함수가 이미 있으면, querySelectorAll 부분만 타입 지정으로 교체
if "async function waitForPrintImages" in s:
    s = re.sub(
        r'const imgs = Array\.from\(document\.querySelectorAll\("([^"]+)"\)\);',
        r'const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("\1"));',
        s
    )
    s = re.sub(
        r'const imgs = Array\.from\(document\.querySelectorAll\("([^"]+)"\)\);',
        r'const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("\1"));',
        s
    )
else:
    # 없으면 삽입(타입 포함)
    s=s.replace(
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

p.write_text(s, encoding="utf-8")
print("OK: App.tsx helper typed")
PY

# 2) usePdfPreview.ts: useMemo 의존성 warning(react-hooks/exhaustive-deps) 제거(=useMemo 자체 제거)
python3 - <<'PY'
from pathlib import Path
import re

p=Path("src/hooks/usePdfPreview.ts")
s=p.read_text(encoding="utf-8")

# useMemo import 제거
s = re.sub(r'import\s+\{\s*([^}]*)\buseMemo\b([^}]*)\}\s+from\s+"react";',
           lambda m: 'import { ' + (m.group(1)+m.group(2)).replace(',,',',').strip(' ,') + ' } from "react";',
           s)

# useMemo로 감싸진 return을 일반 return으로 바꿈(파일 구조는 너 코드에 따라 조금 달라도 최대한 안전하게)
# 패턴: return useMemo(() => ({ ... }), [ ... ]);
s = re.sub(
    r'return\s+useMemo\(\s*\(\)\s*=>\s*\(\s*\{\s*([\s\S]*?)\}\s*\)\s*,\s*\[[\s\S]*?\]\s*\)\s*;\s*',
    r'return {\n\1\n};\n',
    s
)

p.write_text(s, encoding="utf-8")
print("OK: usePdfPreview useMemo removed")
PY

# 3) lint/build 종점 체크
npm run lint
npm run build
