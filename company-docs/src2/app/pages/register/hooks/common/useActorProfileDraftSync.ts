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
    if (
      draft.writerName === profile.writerName &&
      draft.writerRole === profile.writerRole &&
      draft.site === profile.site
    ) {
      return;
    }

    const next = {
      ...draft,
      writerName: profile.writerName,
      writerRole: profile.writerRole,
      site: profile.site,
    };
    setDraft(next);
    saveDraft(next);
  }, [draft, profile, saveDraft, setDraft]);

  return {
    actorProfile: profile,
    writerLocked: Boolean(profile),
  };
}
