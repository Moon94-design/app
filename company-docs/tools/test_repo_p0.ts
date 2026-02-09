import { createDailyRepo } from "../src2/kernel/repo/domain/dailyRepo";
import { createPartnerRepo } from "../src2/kernel/repo/domain/partnerRepo";

function logStep(label: string, value: unknown): void {
  console.log(`\n[${label}]`);
  console.log(JSON.stringify(value, null, 2));
}

async function runRepoChecks(name: string, repo: ReturnType<typeof createPartnerRepo>): Promise<void> {
  const seed = [
    { id: `${name}-1`, updatedAt: 1, payload: `${name}-alpha` },
    { id: `${name}-2`, updatedAt: 2, payload: `${name}-beta` },
  ];

  const upserted = await repo.upsertMany(seed);
  logStep(`${name} upsertMany`, upserted);

  const all = await repo.getAll();
  logStep(`${name} getAll`, all);

  const byId = await repo.getById(`${name}-1`);
  logStep(`${name} getById`, byId);

  await repo.remove(`${name}-2`);
  const afterRemove = await repo.getAll();
  logStep(`${name} after remove`, afterRemove);
}

async function main(): Promise<void> {
  console.log("Repo P0 smoke test start");
  await runRepoChecks("partner", createPartnerRepo());
  await runRepoChecks("daily", createDailyRepo());
  console.log("Repo P0 smoke test done");
}

main().catch((error) => {
  console.error("Repo P0 smoke test failed", error);
  process.exit(1);
});
