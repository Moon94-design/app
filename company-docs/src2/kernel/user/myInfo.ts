import { useCallback, useEffect, useState } from "react";
import { DAILY_BRANCH_OPTIONS, normalizeDailyBranch, type DailyBranch } from "@kernel/schema/daily";
import { STORAGE_KEYS } from "@kernel/repo/keys";
import { createJsonStorage } from "@kernel/repo/storage/jsonStorage";

export type MyInfoProfile = {
  id: string;
  writerName: string;
  writerRole: string;
  site: DailyBranch;
  updatedAt: number;
};

export type SaveMyInfoInput = {
  writerName: string;
  writerRole: string;
  site: DailyBranch;
};

const storage = createJsonStorage();
const listeners = new Set<() => void>();

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProfile(raw: unknown): MyInfoProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const writerName = normalizeText(source.writerName);
  const writerRole = normalizeText(source.writerRole);
  const site = normalizeDailyBranch(source.site);
  if (!writerName || !writerRole || !site) return null;

  const id = normalizeText(source.id) || `MYINFO_${Date.now()}`;
  const updatedAt =
    typeof source.updatedAt === "number" && Number.isFinite(source.updatedAt) ? source.updatedAt : Date.now();

  return {
    id,
    writerName,
    writerRole,
    site,
    updatedAt,
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function readMyInfoProfile(): MyInfoProfile | null {
  return normalizeProfile(storage.getItem<unknown>(STORAGE_KEYS.uiMyInfoProfile));
}

export function saveMyInfoProfile(input: SaveMyInfoInput): MyInfoProfile {
  const writerName = normalizeText(input.writerName);
  const writerRole = normalizeText(input.writerRole);
  const site = normalizeDailyBranch(input.site) || DAILY_BRANCH_OPTIONS[0];
  const previous = readMyInfoProfile();

  const next: MyInfoProfile = {
    id: previous?.id || `MYINFO_${Date.now()}`,
    writerName,
    writerRole,
    site,
    updatedAt: Date.now(),
  };

  storage.setItem(STORAGE_KEYS.uiMyInfoProfile, next);
  notify();
  return next;
}

export function clearMyInfoProfile() {
  storage.removeItem(STORAGE_KEYS.uiMyInfoProfile);
  notify();
}

export function subscribeMyInfo(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMyInfoProfile() {
  const [profile, setProfile] = useState<MyInfoProfile | null>(() => readMyInfoProfile());

  useEffect(() => {
    return subscribeMyInfo(() => {
      setProfile(readMyInfoProfile());
    });
  }, []);

  const saveProfile = useCallback((input: SaveMyInfoInput) => saveMyInfoProfile(input), []);
  const clearProfile = useCallback(() => clearMyInfoProfile(), []);

  return {
    profile,
    hasProfile: Boolean(profile),
    saveProfile,
    clearProfile,
  };
}
