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

const PDF_PAGE_CLASS = "w-full min-w-0";

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

  // Each group is exported as one page of the coach CV PDF (see
  // `data-cv-pdf-page` in coach-dashboard/GenerateCv). Plain block wrappers,
  // so the on-screen layout is unchanged.
  return (
    <>
      {/* Page 1 — personal info, photo, styles, stats, transfer status */}
      <div data-cv-pdf-page="1" className={PDF_PAGE_CLASS}>
        <CoachBioSection editable={canEdit} />
      </div>
      {/* Page 2 — clubs and courses */}
      <div data-cv-pdf-page="2" className={PDF_PAGE_CLASS}>
        <CoachClubsSection editable={canEdit} />
        <ComplementaryCoursesSection editable={canEdit} coachId={coachId} />
      </div>
      {/* Page 3 — formations and testimonials */}
      <div data-cv-pdf-page="3" className={PDF_PAGE_CLASS}>
        <Top3Formation editable={canEdit} coachId={coachId} />
        <TestimonialSection editable={canEdit} />
      </div>
      {/* Page 4 — documents, images & videos (3 each), story */}
      <div data-cv-pdf-page="4" className={PDF_PAGE_CLASS}>
        <CoachDocSection editable={canEdit} coachId={coachId} />
        <CoachImagesSection editable={canEdit} coachId={coachId} />
        <CoachVideosSection editable={canEdit} coachId={coachId} />
        <CoachStorySection editable={canEdit} coachId={coachId} />
      </div>
    </>
  );
};

export default FullEditableCv;
