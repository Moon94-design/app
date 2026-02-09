import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function nowStamp() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yy}${mm}${dd}_${hh}${mi}${ss}`;
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 4) {
  die(
    "usage: node tools/safe_anchor_apply.mjs <file> <startAnchor> <endAnchor> <replacementFile> [--check-build]"
  );
}

const [filePath, startAnchor, endAnchor, replacementFile, maybeCheck] = args;
const checkBuild = maybeCheck === "--check-build";

const ROOT = process.cwd();
const absFile = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
const absRepl = path.isAbsolute(replacementFile) ? replacementFile : path.join(ROOT, replacementFile);

if (!fs.existsSync(absFile)) die(`file not found: ${absFile}`);
if (!fs.existsSync(absRepl)) die(`replacement not found: ${absRepl}`);

const src = fs.readFileSync(absFile, "utf-8");
const repl = fs.readFileSync(absRepl, "utf-8");

const start = src.indexOf(startAnchor);
const end = src.indexOf(endAnchor);

if (start < 0) die(`start anchor not found: ${startAnchor}`);
if (end < 0) die(`end anchor not found: ${endAnchor}`);
if (end <= start) die("anchor order invalid");

const before = src.slice(0, start + startAnchor.length);
const after = src.slice(end);

const next = `${before}\n${repl}\n${after}`;

const backupDir = path.join(ROOT, "tools", ".backups_anchor");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = nowStamp();
const backupPath = path.join(backupDir, `${stamp}__${path.basename(absFile).replace(/[^a-zA-Z0-9_.-]/g, "_")}`);
fs.writeFileSync(backupPath, src, "utf-8");

fs.writeFileSync(absFile, next, "utf-8");

console.log(`[anchor] applied: ${filePath}`);
console.log(`[anchor] backup: ${path.relative(ROOT, backupPath)}`);

if (checkBuild) {
  try {
    execSync("npm run build", { stdio: "inherit" });
    console.log("[anchor] build OK");
  } catch (e) {
    console.error("[anchor] build FAILED -> restoring backup...");
    fs.writeFileSync(absFile, src, "utf-8");
    console.log("[anchor] restored.");
    process.exit(1);
  }
}