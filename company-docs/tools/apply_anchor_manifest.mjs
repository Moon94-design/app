/**
 * Apply multiple safe_anchor_apply operations from a manifest file.
 *
 * Usage:
 *   node tools/apply_anchor_manifest.mjs docs/ANCHOR_MANIFEST.txt
 *
 * Manifest format (pipe separated):
 *   file | startAnchor | endAnchor | replFile | options
 *
 * - Lines starting with # are ignored.
 * - options is optional, default: --check-build
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("Usage: node tools/apply_anchor_manifest.mjs docs/ANCHOR_MANIFEST.txt");
  process.exit(2);
}

if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(2);
}

const raw = readFileSync(manifestPath, "utf8");
const lines = raw
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

if (lines.length === 0) {
  console.error("Manifest is empty (no actionable lines).");
  process.exit(2);
}

for (let i = 0; i < lines.length; i++) {
  const lineNo = i + 1;
  const parts = lines[i].split("|").map((p) => p.trim());

  if (parts.length < 4) {
    console.error(`Invalid line ${lineNo}: expected 4+ fields, got ${parts.length}\n${lines[i]}`);
    process.exit(2);
  }

  const file = parts[0];
  const startAnchor = parts[1];
  const endAnchor = parts[2];
  const replFile = parts[3];
  const options = (parts[4] && parts[4].length ? parts[4] : "--check-build")
    .split(" ")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!existsSync(file)) {
    console.error(`Line ${lineNo}: target file not found: ${file}`);
    process.exit(2);
  }
  if (!existsSync(replFile)) {
    console.error(`Line ${lineNo}: replacement file not found: ${replFile}`);
    process.exit(2);
  }

  console.log(`\n==[${lineNo}/${lines.length}] Applying anchor patch==`);
  console.log(`file: ${file}`);
  console.log(`start: ${startAnchor}`);
  console.log(`end:   ${endAnchor}`);
  console.log(`repl:  ${replFile}`);
  console.log(`opts:  ${options.join(" ")}`);

  const args = [
    "tools/safe_anchor_apply.mjs",
    file,
    startAnchor,
    endAnchor,
    replFile,
    ...options,
  ];

  const r = spawnSync("node", args, { stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\nFAILED at manifest line ${lineNo}. Stopping.`);
    process.exit(r.status ?? 1);
  }
}

console.log("\nALL DONE.");
