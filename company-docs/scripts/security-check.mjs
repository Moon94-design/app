import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src2");
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

const checks = [
  {
    id: "kernel_no_legacy_import",
    message: "kernel 계층에서 @legacy import 금지",
    test: (file, text) =>
      file.includes(`${path.sep}kernel${path.sep}`) &&
      /from\s+["']@legacy\//.test(text),
  },
  {
    id: "no_repo_impl_direct_import",
    message: "UI/페이지에서 @kernel/repo/impl 직접 import 금지",
    test: (file, text) =>
      file.includes(`${path.sep}app${path.sep}pages${path.sep}`) &&
      /from\s+["'][^"']*repo\/impl\//.test(text),
  },
  {
    id: "no_direct_localstorage",
    message: "src2에서 localStorage 직접 접근 금지",
    test: (file, text) =>
      !file.includes(`${path.sep}kernel${path.sep}repo${path.sep}storage${path.sep}`) &&
      /\blocalStorage\.(getItem|setItem|removeItem|clear)\b/.test(text),
  },
  {
    id: "no_eval",
    message: "eval/new Function 사용 금지",
    test: (_file, text) => /\beval\s*\(|\bnew\s+Function\s*\(/.test(text),
  },
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const check of checks) {
    if (check.test(file, text)) {
      violations.push({
        check: check.id,
        message: check.message,
        file: path.relative(process.cwd(), file),
      });
    }
  }
}

if (violations.length === 0) {
  console.log("[security-check] PASS (no violations)");
  process.exit(0);
}

console.error(`[security-check] FAIL (${violations.length} violations)`);
for (const v of violations) {
  console.error(`- [${v.check}] ${v.file} :: ${v.message}`);
}
process.exit(1);
