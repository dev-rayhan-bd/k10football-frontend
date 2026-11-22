/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams } from "next/navigation";
import CoachBioSection from "./CoachBioSection";
import CoachClubsSection from "./CoachClubsSection";
import ComplementaryCoursesSection from "./ComplementaryCoursesSection";
import TestimonialSection from "./TestimonialSection";
import Top3Formation from "./Top3Formation";
import { CoachDocSection } from "./CoachDocSection";
import { CoachImagesSection } from "./CoachImagesSection";
import { CoachVideosSection } from "./CoachVideosSection";
import { CoachStorySection } from "./CoachStorySection";
import { useCoach } from "@/hooks/useCoach";
import { useAppSelector } from "@/hooks/reduxHooks";
import { AuthState } from "@/redux/features/auth";

interface FullEditableCvProps {
  editable?: boolean;
  coachId?: string;
}

export const FullEditableCv = ({
  editable = true,
  coachId: propCoachId,
}: FullEditableCvProps) => {
  const searchParams = useSearchParams();
  const queryCoachId = searchParams?.get("coachId") || "";
  const coachId = propCoachId || queryCoachId;

  const { isViewingSpecificCoach, coachUserId } = useCoach(coachId);
  const { user, accessToken } = useAppSelector((state) => state.auth as AuthState);

  const role = user?.role ? String(user.role).toLowerCase() : "";
  const isOwner = Boolean(
    user && coachUserId && (user._id === coachUserId || user.id === coachUserId || user.userId === coachUserId)
  );
  const isPrivileged = role === "coach" || role === "admin" || role === "super_admin";

  // When viewing a specific public coach CV, it is read-only unless the user is an admin or the coach owner
  const canEdit = Boolean(
    editable &&
      accessToken &&
      (!isViewingSpecificCoach || isOwner || role === "admin" || role === "super_admin") &&
      isPrivileged
  );

  return (
    <>
      <CoachBioSection editable={canEdit} />
      <CoachClubsSection editable={canEdit} />
      <ComplementaryCoursesSection editable={canEdit} coachId={coachId} />
      <Top3Formation editable={canEdit} coachId={coachId} />
      <TestimonialSection editable={canEdit} />
      <CoachDocSection editable={canEdit} coachId={coachId} />
      <CoachImagesSection editable={canEdit} coachId={coachId} />
      <CoachVideosSection editable={canEdit} coachId={coachId} />
      <CoachStorySection editable={canEdit} coachId={coachId} />
    </>
  );
};

export default FullEditableCv;
