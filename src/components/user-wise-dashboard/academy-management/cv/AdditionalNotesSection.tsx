/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from "react";
import CMSField from "@/components/shared/CMSField";
import { usePlayer } from "@/hooks/usePlayer";

const DEFAULT_NOTES = `Marcus Silva is a highly skilled attacking midfielder ⚽ with exceptional vision 👀, precise passing 🎯, and strong tactical intelligence 🧠.

Versatile across multiple midfield positions, he remains a reliable asset to any squad.

Calm under pressure and consistent in chance creation, he has maintained top-level performance throughout his career.

Currently open to transfer opportunities with top European clubs 🌍 and available for immediate first-team integration.

Medical reports indicate excellent physical condition 💪 with no recurring injuries.`;

const AdditionalNotesSection = ({
  editable = false,
}: {
  editable?: boolean;
}) => {
  const { playerData, handleUpdate: updatePlayerData } = usePlayer();
  const currentNotes = (playerData as any).additionalNotes || DEFAULT_NOTES;
  const [notes, setNotes] = useState(currentNotes);

  useEffect(() => {
    if ((playerData as any).additionalNotes) {
      setNotes((playerData as any).additionalNotes);
    }
  }, [(playerData as any).additionalNotes]);

  const handleUpdate = async (val: string) => {
    setNotes(val);
    updatePlayerData("additionalNotes", val);
  };

  return (
    <div className="mt-10 sm:mt-20 w-full min-w-0 overflow-hidden">
      <div className="container bg-cardBg p-4 sm:p-8 rounded-xl w-full min-w-0">
        <div className="flex items-center justify-between w-full min-w-0">
          <h4 className="text-lg sm:text-xl text-primary lg:text-2xl mb-4 sm:mb-5 truncate">
            Additional Notes
          </h4>
        </div>
        <div className="space-y-4 sm:space-y-5 w-full min-w-0">
          <CMSField
            value={notes}
            onUpdate={(val) => handleUpdate(String(val))}
            canEdit={editable}
            type="textarea"
            showEmojis={true}
            className="whitespace-pre-wrap leading-relaxed w-full min-w-0 wrap-break-word"
            inputClassName="w-full min-w-0 break-words"
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalNotesSection;
