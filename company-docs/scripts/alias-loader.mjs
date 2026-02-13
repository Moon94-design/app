import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const ALIASES = [
  { prefix: "@kernel", targetDir: path.join(root, "src2", "kernel") },
  { prefix: "@app2", targetDir: path.join(root, "src2", "app") },
  { prefix: "@legacy", targetDir: path.join(root, "src") },
];

const FILE_SUFFIXES = ["", ".ts", ".tsx", ".js", ".mjs", ".json"];
const INDEX_FILES = ["index.ts", "index.tsx", "index.js", "index.mjs", "index.json"];

function tryResolveExistingPath(basePath) {
  for (const suffix of FILE_SUFFIXES) {
    const candidate = `${basePath}${suffix}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const indexFile of INDEX_FILES) {
      const candidate = path.join(basePath, indexFile);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
  }

  return null;
}

function resolveAliasSpecifier(specifier) {
  for (const alias of ALIASES) {
    if (specifier === alias.prefix) {
      const resolved = tryResolveExistingPath(alias.targetDir);
      if (resolved) return resolved;
      continue;
    }
    if (specifier.startsWith(`${alias.prefix}/`)) {
      const subPath = specifier.slice(alias.prefix.length + 1);
      const resolved = tryResolveExistingPath(path.join(alias.targetDir, subPath));
      if (resolved) return resolved;
    }
  }
  return null;
}

function resolveRelativeSpecifier(specifier, parentURL) {
  if (!parentURL) return null;
  if (!(specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/"))) {
    return null;
  }

  const parentDir = path.dirname(fileURLToPath(parentURL));
  const basePath = specifier.startsWith("/")
    ? path.join(root, specifier.slice(1))
    : path.resolve(parentDir, specifier);

  return tryResolveExistingPath(basePath);
}

export async function resolve(specifier, context, nextResolve) {
  const aliasPath = resolveAliasSpecifier(specifier);
  if (aliasPath) {
    return {
      url: pathToFileURL(aliasPath).href,
      shortCircuit: true,
    };
  }
  const relativePath = resolveRelativeSpecifier(specifier, context.parentURL);
  if (relativePath) {
    return {
      url: pathToFileURL(relativePath).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
