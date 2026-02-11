import { spawn } from "node:child_process";

const HOST = "127.0.0.1";
const PORT = "4173";
const BASE_URL = `http://${HOST}:${PORT}`;
const ROUTES = [
  "/",
  "/register",
  "/register/master",
  "/register/master/partner",
  "/register/master/vehicle",
  "/register/master/vendor",
  "/register/master/agency",
  "/register/master/employee",
  "/register/master/equipment",
  "/register/master/consumable",
  "/manage",
  "/manage/master",
  "/manage/master/partner",
  "/manage/master/vehicle",
  "/manage/master/vendor",
  "/manage/master/agency",
  "/manage/master/employee",
  "/manage/master/equipment",
  "/manage/master/consumable",
  "/manage/daily",
  "/manage/daily/logistics",
  "/browse",
];

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const previewCommand =
  process.platform === "win32"
    ? ["cmd.exe", ["/d", "/s", "/c", `${npmCmd} run preview -- --host ${HOST} --port ${PORT}`]]
    : [npmCmd, ["run", "preview", "--", "--host", HOST, "--port", PORT]];

const preview = spawn(previewCommand[0], previewCommand[1], {
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});

preview.stdout.on("data", (chunk) => {
  process.stdout.write(String(chunk));
});
preview.stderr.on("data", (chunk) => process.stderr.write(String(chunk)));

async function waitForServer(timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.ok) return;
    } catch {
      // keep waiting
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("preview server did not start in time");
}

async function run() {
  const failures = [];
  try {
    await waitForServer();
    for (const route of ROUTES) {
      try {
        const res = await fetch(`${BASE_URL}${route}`);
        console.log(`[smoke] ${route} -> ${res.status}`);
        if (res.status !== 200) failures.push({ route, status: res.status });
      } catch (error) {
        failures.push({ route, status: "network_error", error: String(error) });
      }
    }
  } finally {
    preview.kill();
  }

  if (failures.length > 0) {
    console.error("\n[smoke] FAILURES");
    for (const f of failures) {
      console.error(`- ${f.route}: ${f.status}`);
    }
    process.exit(1);
  }

  console.log("\n[smoke] all routes returned 200");
}

run().catch((error) => {
  console.error("[smoke] fatal:", error);
  preview.kill();
  process.exit(1);
});
