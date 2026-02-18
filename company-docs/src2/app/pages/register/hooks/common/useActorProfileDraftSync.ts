import { useEffect } from "react";
import { type DailyBranch } from "@kernel/schema/daily";
import { useMyInfoProfile } from "@kernel/user";

type DraftWithActor = {
  writerName: string;
  writerRole: string;
  site: DailyBranch;
};

type SetDraftFn<T> = (next: T) => void;
type SaveDraftFn<T> = (next: T) => void;

export function useActorProfileDraftSync<T extends DraftWithActor>(args: {
  draft: T;
  setDraft: SetDraftFn<T>;
  saveDraft: SaveDraftFn<T>;
}) {
  const { draft, setDraft, saveDraft } = args;
  const { profile } = useMyInfoProfile();

  useEffect(() => {
    if (!profile) return;

    const nextWriterName = draft.writerName?.trim() ? draft.writerName : profile.writerName;
    const nextWriterRole = draft.writerRole?.trim() ? draft.writerRole : profile.writerRole;
    const nextSite = draft.site || profile.site;
    if (nextWriterName === draft.writerName && nextWriterRole === draft.writerRole && nextSite === draft.site) {
      return;
    }

    const next = {
      ...draft,
      writerName: nextWriterName,
      writerRole: nextWriterRole,
      site: nextSite,
    };
    setDraft(next);
    saveDraft(next);
  }, [draft, profile, saveDraft, setDraft]);

  return {
    actorProfile: profile,
    writerLocked: Boolean(profile),
  };
}
