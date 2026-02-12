type DateLikeRecord = {
  recordDate: string;
  updatedAt?: number;
};

export function sortByRecordDateUpdated<T extends DateLikeRecord>(records: T[]): T[] {
  return records
    .slice()
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}
