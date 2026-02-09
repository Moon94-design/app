// 조치기록 저장소 (actionRepo.ts)
import { loadJson, saveJson } from "../base/utils/pageStorage";
import type { ActionItem, ActionDoc } from "../domain/schema/daily/action";

const STORAGE_KEY = "local_action_docs_v1";

function stableId(date: string, writer: string) {
  return `ACTION_${date}_${(writer || "").trim()}`;
}

export function listActionDocs(): ActionDoc[] {
  return loadJson<ActionDoc[]>(STORAGE_KEY, []);
}

export function getActionDoc(date: string, writer: string): ActionDoc | undefined {
  const docs = listActionDocs();
  const id = stableId(date, writer);
  return docs.find((d) => d.id === id);
}

export function listActionItems(date: string, writer: string): ActionItem[] {
  const doc = getActionDoc(date, writer);
  return doc?.items || [];
}

export function addActionItem(date: string, writer: string, item: ActionItem): void {
  const docs = listActionDocs();
  const id = stableId(date, writer);
  const idx = docs.findIndex((d) => d.id === id);

  const now = new Date().toISOString();

  if (idx >= 0) {
    docs[idx].items.push(item);
    docs[idx].updatedAt = now;
  } else {
    const newDoc: ActionDoc = {
      id,
      recordDate: date,
      writerName: writer,
      items: [item],
      updatedAt: now,
    };
    docs.unshift(newDoc);
  }

  saveJson(STORAGE_KEY, docs);
}

export function removeActionItem(date: string, writer: string, itemId: string): void {
  const docs = listActionDocs();
  const id = stableId(date, writer);
  const idx = docs.findIndex((d) => d.id === id);

  if (idx < 0) return;

  docs[idx].items = docs[idx].items.filter((it) => it.id !== itemId);
  docs[idx].updatedAt = new Date().toISOString();

  if (docs[idx].items.length === 0) {
    docs.splice(idx, 1);
  }

  saveJson(STORAGE_KEY, docs);
}

// 모든 이슈 가져오기 (조치기록에서 이슈 선택용)
export function listAllIssueItems(): Array<{ id: string; date: string; writer: string; title: string; category: string }> {
  const issueDocsRaw = loadJson<any[]>("issue_docs_v1", []);
  const result: Array<{ id: string; date: string; writer: string; title: string; category: string }> = [];

  for (const doc of issueDocsRaw) {
    const items = doc.items || [];
    for (const it of items) {
      result.push({
        id: it.id,
        date: it.recordDate || doc.recordDate,
        writer: it.writerName || doc.writerName,
        title: it.title || "(제목없음)",
        category: it.category || "",
      });
    }
  }

  // 최신순 정렬
  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}
