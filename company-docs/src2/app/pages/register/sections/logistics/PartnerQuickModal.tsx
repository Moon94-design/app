import type { Dispatch, SetStateAction } from "react";
import {
  createDefaultTradeProfile,
  mergeTradeProfiles,
  type PartnerV2Draft,
  type TradeProfileItem,
} from "@kernel/schema/partner";
import { formatPhoneInput } from "@kernel/utils";
import PartnerCreateFlow from "@app2/pages/partner/sections/PartnerCreateFlow";
import LayerModal from "./LayerModal";

type DuplicatePartnerCandidate = {
  id: string;
  label: string;
};

type PartnerQuickModalProps = {
  open: boolean;
  onClose: () => void;
  draft: PartnerV2Draft;
  setDraft: Dispatch<SetStateAction<PartnerV2Draft>>;
  duplicatePartners: DuplicatePartnerCandidate[];
  onSaveDuplicate: (input: {
    id: string;
    partnerName: string;
    partnerDetailTag: string;
  }) => Promise<{ ok: boolean; message: string }>;
  onSave: () => void;
};

export default function PartnerQuickModal({
  open,
  onClose,
  draft,
  setDraft,
  duplicatePartners,
  onSaveDuplicate,
  onSave,
}: PartnerQuickModalProps) {
  if (!open) return null;

  return (
    <LayerModal title="거래처 기준정보 빠른 추가" onClose={onClose}>
      <PartnerCreateFlow
        draft={draft}
        onUpdateBase={(patch) => setDraft((prev) => ({ ...prev, base: { ...prev.base, ...patch } }))}
        onUpdateExtra={(patch) => setDraft((prev) => ({ ...prev, extra: { ...prev.extra, ...patch } }))}
        onAddProfile={() =>
          setDraft((prev) => ({
            ...prev,
            extra: {
              ...prev.extra,
              tradeProfiles: mergeTradeProfiles(prev.extra.tradeProfiles, [createDefaultTradeProfile()], "append"),
            },
          }))
        }
        onUpdateProfile={(index, patch) =>
          setDraft((prev) => ({
            ...prev,
            extra: {
              ...prev.extra,
              tradeProfiles: prev.extra.tradeProfiles.map((profile, profileIndex) =>
                profileIndex === index ? ({ ...profile, ...patch } as TradeProfileItem) : profile
              ),
            },
          }))
        }
        onRemoveProfile={(index) =>
          setDraft((prev) => ({
            ...prev,
            extra: {
              ...prev.extra,
              tradeProfiles: prev.extra.tradeProfiles.filter((_, profileIndex) => profileIndex !== index),
            },
          }))
        }
        formatPhone={formatPhoneInput}
        duplicatePartners={duplicatePartners}
        onSaveDuplicate={onSaveDuplicate}
      />

      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" className="btn primary" onClick={onSave}>
          거래처 저장
        </button>
        <button type="button" className="btn" onClick={onClose}>
          취소
        </button>
      </div>
    </LayerModal>
  );
}
