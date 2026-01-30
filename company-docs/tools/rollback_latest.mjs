#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const BACKUPS = path.join(ROOT, ".backups");
const idxPath = path.join(BACKUPS, "index.json");

if (!fs.existsSync(idxPath)) {
  console.error("ERROR: .backups/index.json not found (스냅샷이 아직 없을 수 있음)");
  process.exit(1);
}

const idx = JSON.parse(fs.readFileSync(idxPath, "utf-8"));
const ring = idx.ring || [];
if (ring.length === 0) {
  console.error("ERROR: 스냅샷이 0개야. 먼저 patch 적용을 1번 해야 함.");
  process.exit(1);
}

const latest = ring[ring.length - 1];
console.log(`Rollback latest snapshot: ${latest}`);
execSync(`node tools/rollback.mjs ${latest}`, { stdio: "inherit" });
