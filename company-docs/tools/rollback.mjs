#!/usr/bin/env node
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: node tools/rollback.mjs <snapshotId>");
  process.exit(1);
}

const id = args[0];
const ROOT = process.cwd();
const snapDir = path.join(ROOT, ".backups", id);

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function copyRecursive(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    ensureDir(dst);
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dst, name));
    }
  } else {
    ensureDir(path.dirname(dst));
    fs.copyFileSync(src, dst);
  }
}

if (!fs.existsSync(snapDir)) {
  console.error(`ERROR: snapshot not found: ${snapDir}`);
  process.exit(1);
}

const metaPath = path.join(snapDir, "meta.json");
let meta = null;
if (fs.existsSync(metaPath)) meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

console.log("\n=== ROLLBACK ===");
console.log(`Snapshot: ${id}`);

if (meta?.files?.length) {
  for (const f of meta.files) {
    const src = path.join(snapDir, f.file);
    const dst = path.join(ROOT, f.file);

    if (f.existed) {
      copyRecursive(src, dst);
      console.log(`restored: ${f.file}`);
    } else {
      if (fs.existsSync(dst)) {
        fs.rmSync(dst, { force: true });
        console.log(`removed new: ${f.file}`);
      }
    }
  }
} else {
  console.log("(no meta) restoring by copying snapshot tree");
  for (const name of fs.readdirSync(snapDir)) {
    if (name === "meta.json") continue;
    copyRecursive(path.join(snapDir, name), path.join(ROOT, name));
  }
}

console.log("\nRollback done.");
