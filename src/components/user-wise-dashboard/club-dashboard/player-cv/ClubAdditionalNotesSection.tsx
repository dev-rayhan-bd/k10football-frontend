"use client";

import React from "react";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import { IconNotes } from "@tabler/icons-react";

export const ClubAdditionalNotesSection = () => {
  const { playerData } = useClubPlayerCv();

  return (
    <div className="mt-10 mb-12 w-full min-w-0 overflow-hidden">
      <div className="bg-cardBg p-6 sm:p-10 rounded-2xl border border-white/10 w-full min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <IconNotes size={20} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary tracking-wide">
              Scouting Assessment Notes
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct technical observation commentary recorded by accredited club scout.
            </p>
          </div>
        </div>
        <div className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap bg-black/20 p-5 rounded-xl border border-white/5">
          {playerData.additionalNotes}
        </div>
      </div>
    </div>
  );
};

