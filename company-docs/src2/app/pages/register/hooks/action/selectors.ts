import type { IssueDocRecord, RepoEntity } from "@kernel/repo";
import type { PendingIssue, VendorOption } from "./types";

function asText(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export function toVendorOption(row: RepoEntity & Record<string, unknown>): VendorOption | null {
  const id = asText(row.id);
  const name = asText(row.name);
  if (!id || !name) return null;
  return { id, name };
}

export function toPendingIssues(docs: IssueDocRecord[]): PendingIssue[] {
  const out: PendingIssue[] = [];
  for (const doc of docs) {
    for (const item of doc.items || []) {
      const status = (item.status || "진행중").trim();
      if (status === "완료") continue;
      out.push({
        id: item.id,
        title: item.title || "(제목없음)",
        category: item.category || "",
        date: item.recordDate || doc.recordDate,
        writerName: item.writerName || doc.writerName,
      });
    }
  }
  out.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}
