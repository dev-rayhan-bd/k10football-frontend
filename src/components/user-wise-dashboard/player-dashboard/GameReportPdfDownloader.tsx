"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import { toast } from "sonner";
import ReportPdfPreview from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/ReportPdfPreview";
import { mapSavedReportForPreview } from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/reportHelpers";
import {
  useGetMyGameReportByIdQuery,
  useGetMyPlayerProfileQuery,
} from "@/redux/features/player/playerApi";

interface GameReportPdfDownloaderProps {
  reportId: string;
  onDone: () => void;
}

/**
 * Downloads the "Player Analysis Profile" PDF for a saved report — the same
 * design as the report page — without leaving the current page. It loads the
 * report from GET /players/me/game-reports/:reportId, renders the report
 * off-screen and exports it.
 */
const GameReportPdfDownloader = ({ reportId, onDone }: GameReportPdfDownloaderProps) => {
  const { data: reportRes, isError } = useGetMyGameReportByIdQuery(reportId);
  // Reports don't store a photo; the player's own photo is used on the card.
  const { data: profileRes, isLoading: isProfileLoading } = useGetMyPlayerProfileQuery(undefined);

  const apiReport = reportRes?.data ?? null;
  const mapped = useMemo(
    () => (apiReport ? mapSavedReportForPreview(apiReport, profileRes?.data) : null),
    [apiReport, profileRes]
  );

  useEffect(() => {
    if (isError) {
      toast.error("Couldn't load this game report. Please try again.");
      onDone();
    }
  }, [isError, onDone]);

  if (!mapped || isProfileLoading) return null;

  return (
    // Rendered off-screen at full PDF width so the export matches the report page.
    <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] w-[900px]">
      <Suspense fallback={null}>
        <ReportPdfPreview
          viewOnly
          autoDownload
          onAutoDownloadDone={onDone}
          formData={mapped.formData}
          characteristics={mapped.characteristics}
          stats={mapped.stats}
          goalMarkers={mapped.goalMarkers}
          pitchMarkers={mapped.pitchMarkers}
          coachFeedback={mapped.coachFeedback}
          onSave={() => {}}
          onBack={() => {}}
        />
      </Suspense>
    </div>
  );
};

export default GameReportPdfDownloader;
