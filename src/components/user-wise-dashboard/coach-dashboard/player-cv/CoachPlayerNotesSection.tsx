/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import { IconNotes, IconClipboardCheck, IconEdit } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export const CoachPlayerNotesSection = () => {
  const { playerData, openValidateModal } = useCoachPlayerCv();

  return (
    <div className="mt-10 sm:mt-20 w-full min-w-0 overflow-hidden mb-12">
      <div className="bg-cardBg p-6 sm:p-10 rounded-2xl border border-white/10 w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <IconNotes size={20} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white uppercase tracking-wider">
                Coach & Scout Evaluation Notes
              </h3>
              <p className="text-xs text-muted-foreground">
                Official tactical assessment, behavioral report, and potential projection.
              </p>
            </div>
          </div>
          {openValidateModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={openValidateModal}
              className="gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase"
            >
              <IconEdit className="size-4 text-primary" />
              Update Evaluation
            </Button>
          )}
        </div>

        <div className="bg-black/30 border border-white/10 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
          {playerData.additionalNotes}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <IconClipboardCheck className="size-4 text-primary" />
            <span>Assessing Coach: <strong className="text-white">{playerData.coachName}</strong></span>
          </div>
          <div>
            <span>Academy / Club: <strong className="text-white">{playerData.academyName}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
