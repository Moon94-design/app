import type { IssueDoc, IssueItem } from "../domain/schema/daily/issue";
import { makeIssueDocId, normalizeIssueDoc } from "../domain/schema/daily/issue";

const KEY = "issue_docs_v1";

function loadAll(): IssueDoc[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const docs = arr.map(normalizeIssueDoc).filter(Boolean) as IssueDoc[];
    return docs;
  } catch {
    return [];
  }
}

function saveAll(next: IssueDoc[]) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getIssueDoc(recordDate: string, writerName: string): IssueDoc | null {
  const id = makeIssueDocId(recordDate, writerName);
  const all = loadAll();
  return all.find((d) => d.id === id) || null;
}

export function upsertIssueDoc(doc: IssueDoc): IssueDoc {
  const all = loadAll();
  const next = [doc, ...all.filter((d) => d.id !== doc.id)];
  saveAll(next);
  return doc;
}

export function addIssueItem(recordDate: string, writerName: string, item: IssueItem): IssueDoc {
  const id = makeIssueDocId(recordDate, writerName);
  const all = loadAll();
  const prev = all.find((d) => d.id === id);

  const doc: IssueDoc = prev
    ? { ...prev, items: [item, ...(prev.items || [])], updatedAt: new Date().toISOString() }
    : { id, recordDate, writerName, items: [item], updatedAt: new Date().toISOString() };

  const next = [doc, ...all.filter((d) => d.id !== id)];
  saveAll(next);
  return doc;
}

export function listIssueItems(recordDate: string, writerName: string): IssueItem[] {
  const doc = getIssueDoc(recordDate, writerName);
  return doc?.items || [];
}

export function removeIssueItem(recordDate: string, writerName: string, issueId: string): IssueDoc | null {
  const id = makeIssueDocId(recordDate, writerName);
  const all = loadAll();
  const prev = all.find((d) => d.id === id);
  if (!prev) return null;

  const doc: IssueDoc = { ...prev, items: (prev.items || []).filter((x) => x.id !== issueId), updatedAt: new Date().toISOString() };
  const next = [doc, ...all.filter((d) => d.id !== id)];
  saveAll(next);
  return doc;
}

/**
 * 전체 이슈 목록 조회
 */
export function listAllIssues(): IssueItem[] {
  const all = loadAll();
  return all.flatMap((doc) => doc.items || []);
}

/**
 * 진행중인 이슈만 조회 (status === "진행중")
 * 조치기록에서 연계할 이슈 선택 시 사용
 */
export function listPendingIssues(): Array<{
  id: string;
  title: string;
  category: string;
  date: string;
  writerName: string;
}> {
  const all = loadAll();
  const pending: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    writerName: string;
  }> = [];

  for (const doc of all) {
    for (const item of doc.items || []) {
      // status가 없는 기존 데이터는 진행중으로 간주
      const status = item.status || (item.equipment?.status) || "진행중";
      if (status === "진행중") {
        pending.push({
          id: item.id,
          title: item.title,
          category: item.categoryLabel || item.category,
          date: item.recordDate,
          writerName: item.writerName,
        });
      }
    }
  }

  return pending;
}

/**
 * 이슈 상태 변경 + 히스토리 기록
 */
export function updateIssueStatus(
  issueId: string,
  newStatus: "진행중" | "완료",
  by: string,
  linkedActionId?: string
): IssueItem | null {
  const all = loadAll();
  let found: IssueItem | null = null;

  const next = all.map((doc) => {
    const items = (doc.items || []).map((item) => {
      if (item.id === issueId) {
        const now = new Date().toISOString();
        const history = item.history || [];
        history.push({
          timestamp: now,
          action: linkedActionId ? "action_linked" : "status_changed",
          by,
          details: `상태 변경: ${item.status || "진행중"} → ${newStatus}`,
          linkedActionId,
        });
        found = {
          ...item,
          status: newStatus,
          linkedActionId: linkedActionId || item.linkedActionId,
          history,
          updatedAt: now,
        };
        return found;
      }
      return item;
    });
    return { ...doc, items, updatedAt: new Date().toISOString() };
  });

  if (found) {
    saveAll(next);
  }
  return found;
}