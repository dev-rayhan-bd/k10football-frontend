"use client";

import { usePlayerCvView } from "./PlayerCvViewContext";

export const ViewAdditionalNotesSection = () => {
  const { playerData } = usePlayerCvView();

  return (
    <div className="mt-10 sm:mt-20 w-full min-w-0 overflow-hidden">
      <div className="container bg-cardBg p-6 sm:p-10 rounded-2xl border border-white/5 w-full min-w-0">
        <div className="flex items-center justify-between w-full min-w-0 mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary tracking-wide">
            Additional Scout Notes
          </h3>
        </div>
        <div className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
          {playerData.additionalNotes}
        </div>
      </div>
    </div>
  );
};
