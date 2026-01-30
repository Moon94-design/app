#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: node tools/apply_from_txt.mjs patch.txt [--dry-run] [--no-build]");
  process.exit(1);
}

const patchPath = path.resolve(args[0]);
const DRY = args.includes("--dry-run");
const NO_BUILD = args.includes("--no-build");

const ROOT = process.cwd();
const BACKUPS_DIR = path.join(ROOT, ".backups");
const INDEX_PATH = path.join(BACKUPS_DIR, "index.json");

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
}

function loadIndex() {
  try {
    return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  } catch {
    return { ringMax: 5, ring: [], entries: {} };
  }
}

function saveIndex(idx) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(idx, null, 2));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// patch parser
function parsePatch(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  const sep = "-".repeat(94);

  while (i < lines.length) {
    if (lines[i] === sep && (lines[i+1] || "").startsWith("FILE: ")) {
      const filePath = lines[i+1].replace("FILE:", "").trim();
      i += 3;
      const contentLines = [];
      while (i < lines.length) {
        if (lines[i] === sep && (lines[i+1] || "").startsWith("FILE: ")) break;
        contentLines.push(lines[i]);
        i++;
      }
      blocks.push({ filePath, content: contentLines.join("\n") });
    } else {
      i++;
    }
  }
  return blocks;
}

function writeFile(dst, content) {
  ensureDir(path.dirname(dst));
  fs.writeFileSync(dst, content);
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function runBuild() {
  execSync("npm run build", { stdio: "inherit" });
}

function main() {
  if (!fs.existsSync(patchPath)) {
    console.error(`ERROR: patch file not found: ${patchPath}`);
    process.exit(1);
  }

  const patchText = fs.readFileSync(patchPath, "utf-8");
  const blocks = parsePatch(patchText);

  if (blocks.length === 0) {
    console.error("ERROR: No FILE blocks found in patch.txt");
    process.exit(1);
  }

  const stamp = nowStamp();
  const id = `S${stamp}_${sha1(patchText)}`;
  const snapDir = path.join(BACKUPS_DIR, id);

  const idx = loadIndex();

  console.log("\n=== APPLY PATCH ===");
  console.log(`Patch: ${path.relative(ROOT, patchPath)}`);
  console.log(`Snapshot: ${id}`);
  console.log(`Files: ${blocks.length}`);

  if (DRY) {
    blocks.forEach((b) => console.log(` - ${b.filePath}`));
    console.log("\n(DRY RUN) No files were changed.");
    process.exit(0);
  }

  ensureDir(snapDir);
  const meta = { id, createdAt: new Date().toISOString(), files: [] };

  for (const b of blocks) {
    const dst = path.join(ROOT, b.filePath);
    const bak = path.join(snapDir, b.filePath);

    if (fs.existsSync(dst)) {
      copyFile(dst, bak);
      meta.files.push({ file: b.filePath, existed: true });
    } else {
      meta.files.push({ file: b.filePath, existed: false });
    }
  }

  fs.writeFileSync(path.join(snapDir, "meta.json"), JSON.stringify(meta, null, 2));

  idx.ringMax = idx.ringMax || 5;
  idx.ring = idx.ring || [];
  idx.entries = idx.entries || {};
  idx.ring.push(id);
  idx.entries[id] = meta;

  while (idx.ring.length > idx.ringMax) {
    const old = idx.ring.shift();
    if (old) {
      try { fs.rmSync(path.join(BACKUPS_DIR, old), { recursive: true, force: true }); } catch { /* noop */ }
      delete idx.entries[old];
      console.log(`(ring) removed old snapshot: ${old}`);
    }
  }
  saveIndex(idx);

  for (const b of blocks) {
    writeFile(path.join(ROOT, b.filePath), b.content);
  }

  console.log("\nApplied. Running build check...");
  if (!NO_BUILD) {
    try {
      runBuild();
      console.log("\n✅ build OK");
    } catch {
      console.error("\n❌ build FAILED. Rolling back to snapshot...");
      execSync(`node tools/rollback.mjs ${id}`, { stdio: "inherit" });
      console.error("\nRolled back due to build failure.");
      process.exit(1);
    }
  } else {
    console.log("(skipped) build check");
  }

  console.log(`\nDone. Current snapshot: .backups/${id}`);
  console.log(`Rollback: node tools/rollback.mjs ${id}`);
}

main();
