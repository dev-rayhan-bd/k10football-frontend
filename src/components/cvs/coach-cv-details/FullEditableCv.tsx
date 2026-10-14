"use client";

import DocSection from "@/components/cvs/player-cv-details/DocSection";
import CoachBioSection from "./CoachBioSection";
import CoachClubsSection from "./CoachClubsSection";
import ComplementaryCoursesSection from "./ComplementaryCoursesSection";
import TestimonialSection from "./TestimonialSection";
import Top3Formation from "./Top3Formation";
import MyImagesSection from "@/components/cvs/player-cv-details/MyImageSection";
import MyVideosSection from "@/components/cvs/player-cv-details/MyVideoSection";
import AdditionalNotesSection from "@/components/cvs/player-cv-details/AdditionalNotesSection";
import {
  PlayerStatsProvider,
  usePlayerStats,
} from "@/components/cvs/player-cv-details/FullEditablePage";
import { useAppSelector } from "@/hooks/reduxHooks";
import { AuthState } from "@/redux/features/auth";

const FullEditableCv = ({ editable = true }: { editable?: boolean }) => {
  const { role } = usePlayerStats() || { role: "player" };
  const { accessToken } = useAppSelector((state) => state.auth as AuthState);

  const isActuallyEditable = editable && !!accessToken;
  const canEdit = isActuallyEditable && role === "coach";

  return (
    <>
      <CoachBioSection editable={canEdit} />
      <CoachClubsSection editable={canEdit} />
      <ComplementaryCoursesSection editable={canEdit} />
      <Top3Formation editable={canEdit} />
      <TestimonialSection editable={canEdit} />
      <DocSection editable={canEdit} />
      <MyImagesSection editable={canEdit} />
      <MyVideosSection editable={canEdit} />
      <AdditionalNotesSection editable={canEdit} />
    </>
  );
};

const FullEditableCvWrapper = ({ editable = true }: { editable?: boolean }) => (
  <PlayerStatsProvider>
    <FullEditableCv editable={editable} />
  </PlayerStatsProvider>
);

export default FullEditableCvWrapper;