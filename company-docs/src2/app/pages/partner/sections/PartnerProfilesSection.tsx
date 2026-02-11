import { ProfilesEditor } from "@kernel/components/profiles";
import type { TradeProfileItem } from "@kernel/schema/partner";
import {
  TRADE_PROFILE_DIRECTION_OPTIONS,
  TRADE_PROFILE_ITEM_OPTIONS,
  TRADE_PROFILE_KIND_OPTIONS,
} from "@kernel/schema/partner";

type PartnerProfilesSectionProps = {
  profiles: TradeProfileItem[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<TradeProfileItem>) => void;
  onRemove: (index: number) => void;
};

export default function PartnerProfilesSection({
  profiles,
  onAdd,
  onUpdate,
  onRemove,
}: PartnerProfilesSectionProps) {
  return (
    <ProfilesEditor
      label="거래 프로필"
      profiles={profiles}
      directionOptions={TRADE_PROFILE_DIRECTION_OPTIONS}
      itemOptions={TRADE_PROFILE_ITEM_OPTIONS}
      kindOptions={TRADE_PROFILE_KIND_OPTIONS}
      onAdd={onAdd}
      onUpdate={(index, patch) => onUpdate(index, patch as Partial<TradeProfileItem>)}
      onRemove={onRemove}
      addLabel="프로필 추가"
      emptyLabel="프로필 없음"
    />
  );
}
