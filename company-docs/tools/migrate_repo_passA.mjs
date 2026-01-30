import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PAGES = path.join(ROOT, "src", "app", "pages");

const BACKUP_DIR = path.join(ROOT, "tools", ".backups_repo_passA");
fs.mkdirSync(BACKUP_DIR, { recursive: true });

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function backup(file, content) {
  const rel = path.relative(ROOT, file).replace(/[\/\\]/g, "__");
  fs.writeFileSync(path.join(BACKUP_DIR, rel), content, "utf8");
}

function ensureRepoImport(src) {
  // 이미 있으면 패스
  if (src.includes('from "../../../data/repo"')) return src;

  const importLine = `import { repo } from "../../../data/repo";`;

  const lines = src.split("\n");
  let insertAt = 0;
  for (let i = 0; i < Math.min(lines.length, 60); i++) {
    if (lines[i].startsWith("import ")) insertAt = i + 1;
  }
  lines.splice(insertAt, 0, importLine);
  return lines.join("\n");
}

// 대표적인 키 변수명 -> repo setAll 매핑 (쓰기만)
const KEY_TO_REPO = [
  { key: "KEY_PARTNERS", call: "repo.partners().setAll" },
  { key: "KEY_VEHICLES", call: "repo.vehicles().setAll" },
  { key: "KEY_VENDORS", call: "repo.vendors().setAll" },
  { key: "KEY_AGENCIES", call: "repo.agencies().setAll" },
  { key: "KEY_EMPLOYEES", call: "repo.employees().setAll" },
  { key: "KEY_EQUIP", call: "repo.equipments().setAll" },
  { key: "KEY_CONS", call: "repo.consumables().setAll" },

  { key: "KEY_LINES", call: "repo.logisticsLines().setAll" },
  { key: "KEY_PRICE_EVENTS", call: "repo.priceEvents().setAll" },
  { key: "KEY_EQUIP_EVENTS", call: "repo.equipmentEvents().setAll" },
];

function replaceSaveJson(src) {
  let out = src;
  let changed = false;

  for (const m of KEY_TO_REPO) {
    const re = new RegExp(`\\bsaveJson\\(\\s*${m.key}\\s*,\\s*([^\\)]+)\\)\\s*;`, "g");
    out = out.replace(re, (_all, arg) => {
      changed = true;
      return `${m.call}(${arg});`;
    });
  }
  return { out, changed };
}

function main() {
  const files = walk(PAGES);
  let changedFiles = 0;

  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    if (!before.includes("saveJson(")) continue;

    let src = before;
    const r1 = replaceSaveJson(src);
    src = r1.out;

    if (r1.changed) {
      src = ensureRepoImport(src);
      backup(file, before);
      fs.writeFileSync(file, src, "utf8");
      changedFiles++;
    }
  }

  console.log(`[PASS A] changed files: ${changedFiles}`);
  console.log(`[PASS A] backups: ${path.relative(ROOT, BACKUP_DIR)}`);
}

main();
