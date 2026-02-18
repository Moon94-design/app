import assert from "node:assert/strict";
import { formatDailyLogisticsTitle } from "../src2/kernel/schema/daily/titleTemplates.ts";
import { mergeRecordsByDate } from "../src2/app/pages/register/hooks/logistics/merge.ts";
import { createActionRepo } from "../src2/kernel/repo/domain/actionRepo.ts";
import { createIssueRepo } from "../src2/kernel/repo/domain/issueRepo.ts";
import { STORAGE_KEYS } from "../src2/kernel/repo/keys.ts";
import { createJsonStorage } from "../src2/kernel/repo/storage/jsonStorage.ts";

const storage = createJsonStorage();

function clearKeys(keys: string[]) {
  for (const key of keys) {
    storage.removeItem(key);
  }
}

async function testIssueLegacyMigrationOneTime() {
  clearKeys([STORAGE_KEYS.issue, STORAGE_KEYS.issueDocsLegacyV1, STORAGE_KEYS.issueLegacyMigratedMeta]);

  storage.setItem(STORAGE_KEYS.issueDocsLegacyV1, [
    {
      recordDate: "2026-02-13",
      writerName: "홍길동",
      writerRole: "대리",
      site: "대구",
      items: [],
      updatedAt: 100,
    },
  ]);

  const repo = createIssueRepo();
  const first = await repo.getAll();
  assert.equal(first.length, 1, "issue: first migration should create one doc");
  assert.match(first[0].id, /^ISSUE_DOC_/, "issue: missing deterministic legacy fallback id");
  assert.equal(storage.getItem<boolean>(STORAGE_KEYS.issueLegacyMigratedMeta), true);

  storage.setItem(STORAGE_KEYS.issueDocsLegacyV1, [
    {
      recordDate: "2026-02-13",
      writerName: "홍길동",
      items: [],
      updatedAt: 100,
    },
    {
      recordDate: "2026-02-14",
      writerName: "추가유입",
      items: [],
      updatedAt: 200,
    },
  ]);

  const second = await repo.getAll();
  assert.equal(second.length, 1, "issue: same repo instance must not re-sync legacy after migrated");

  const newRepoInstance = createIssueRepo();
  const third = await newRepoInstance.getAll();
  assert.equal(third.length, 1, "issue: new repo instance must respect migrated meta");
}

async function testActionLegacyMigrationOneTimeAndFieldPreserve() {
  clearKeys([STORAGE_KEYS.action, STORAGE_KEYS.actionDocsLegacyV1, STORAGE_KEYS.actionLegacyMigratedMeta]);

  storage.setItem(STORAGE_KEYS.actionDocsLegacyV1, [
    {
      recordDate: "2026-02-13",
      writerName: "김조치",
      writerRole: "과장",
      site: "경주",
      items: [
        {
          title: "조치 제목",
          details: "조치 내용",
          issueId: "ISSUE_1",
          issueLabel: "이슈 라벨",
          vendorId: "V001",
          vendorLabel: "업체A",
          vendorCost: "1234",
          writerRole: "과장",
          site: "성주",
          tags: ["긴급", " 현장 ", ""],
          updatedAt: 1,
        },
      ],
      updatedAt: 100,
    },
  ]);

  const repo = createActionRepo();
  const first = await repo.getAll();
  assert.equal(first.length, 1, "action: first migration should create one doc");
  assert.match(first[0].id, /^ACTION_DOC_/, "action: missing deterministic legacy fallback id");
  assert.equal(first[0].writerRole, "과장");
  assert.equal(first[0].site, "성주", "action: legacy site normalization should keep normalized branch");
  assert.equal(first[0].items[0].vendorId, "V001");
  assert.equal(first[0].items[0].vendorCost, 1234);
  assert.deepEqual(first[0].items[0].tags, ["긴급", "현장"]);
  assert.equal(storage.getItem<boolean>(STORAGE_KEYS.actionLegacyMigratedMeta), true);

  storage.setItem(STORAGE_KEYS.actionDocsLegacyV1, [
    {
      recordDate: "2026-02-13",
      writerName: "김조치",
      items: [],
      updatedAt: 100,
    },
    {
      recordDate: "2026-02-14",
      writerName: "추가유입",
      items: [],
      updatedAt: 200,
    },
  ]);

  const second = await repo.getAll();
  assert.equal(second.length, 1, "action: same repo instance must not re-sync legacy after migrated");

  const newRepoInstance = createActionRepo();
  const third = await newRepoInstance.getAll();
  assert.equal(third.length, 1, "action: new repo instance must respect migrated meta");
}

async function testLogisticsMergeSeparatesBySiteAndActor() {
  const commonLine = {
    direction: "매입",
    kind: "분쇄품",
    item: "PP",
    detailItem: "",
    kg: 100,
    unitPricePerKg: 200,
    partner: { id: "P1", label: "거래처A" },
    vehicle: { id: "V1", label: "12가3456" },
  };

  const input = [
    {
      id: "LOG_1",
      kind: "logistics",
      recordDate: "2026-02-13",
      title: "",
      details: "",
      tags: [],
      writerName: "A",
      writerRole: "사원",
      createdAt: "2026-02-13T01:00:00.000Z",
      updatedAt: 100,
      lines: [{ ...commonLine, site: "daegu" }],
    },
    {
      id: "LOG_2",
      kind: "logistics",
      recordDate: "2026-02-13",
      title: "",
      details: "",
      tags: [],
      writerName: "B",
      writerRole: "대리",
      createdAt: "2026-02-13T02:00:00.000Z",
      updatedAt: 200,
      lines: [{ ...commonLine, site: "seongju" }],
    },
  ];

  const merged = mergeRecordsByDate(input as never);
  assert.equal(
    merged.records.length,
    2,
    "logistics: records with different site/actor must remain split for online minimum line"
  );
  assert.equal(merged.records[0].lines.length, 1, "logistics: each split record should keep its own line");
  assert.equal(merged.records[1].lines.length, 1, "logistics: each split record should keep its own line");
}

function testLogisticsTitleRemovesWriterRoleLabelParens() {
  const title = formatDailyLogisticsTitle({
    writerName: "홍길동(작성자)",
    writerRole: "대리(직책)",
    recordDate: "2026-02-13",
  });
  assert.equal(
    title,
    "[일일][유통] 홍길동 대리 작성. 2026-02-13",
    "logistics title should remove label-style parentheses from writer tokens"
  );
}

async function main() {
  await testIssueLegacyMigrationOneTime();
  console.log("[p0-consistency] issue legacy one-time migration: PASS");

  await testActionLegacyMigrationOneTimeAndFieldPreserve();
  console.log("[p0-consistency] action legacy one-time migration and field preserve: PASS");

  await testLogisticsMergeSeparatesBySiteAndActor();
  console.log("[p0-consistency] logistics merge separates by site/actor key: PASS");

  testLogisticsTitleRemovesWriterRoleLabelParens();
  console.log("[p0-consistency] logistics title strips writer label parentheses: PASS");
}

main().catch((error) => {
  console.error("[p0-consistency] FAIL");
  console.error(error);
  process.exit(1);
});
