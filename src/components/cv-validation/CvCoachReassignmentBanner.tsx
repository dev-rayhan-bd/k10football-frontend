"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { useGetMyPlayerCvQuery, useGetPlayerCvByIdQuery } from "@/redux/features/player/playerApi";
import { cn } from "@/lib/utils";
import RequestCvValidationButton from "./RequestCvValidationButton";

type CvLike = {
  revalidation?: { state?: string } | null;
  tierStatus?: { revalidationState?: string } | null;
  validationPaymentStatus?: string;
  coachId?: unknown;
  coachVerification?: {
    needsCoachReassignment?: boolean;
    validationPaymentStatus?: string;
    coachId?: unknown;
  } | null;
};

/**
 * True when a PAID CV validation lost its coach (the coach left their academy).
 * Primary signal: coachVerification.needsCoachReassignment. Fallback: paid, and the
 * coach id is present in the response but empty.
 */
export const needsCoachReassignment = (cv?: CvLike | null) => {
  if (!cv) return false;
  const state = String(cv.revalidation?.state || cv.tierStatus?.revalidationState || "").toUpperCase();
  if (state) return state === "CHOOSE_NEW_COACH";
  const verification = cv.coachVerification ?? undefined;
  if (verification?.needsCoachReassignment === true) return true;

  const paymentStatus = String(cv.validationPaymentStatus ?? verification?.validationPaymentStatus ?? "").toUpperCase();
  if (paymentStatus !== "PAID") return false;
  const hasCoachField = (verification && "coachId" in verification) || "coachId" in cv;
  const coachId = verification?.coachId ?? cv.coachId;
  return Boolean(hasCoachField && !coachId);
};

interface CvCoachReassignmentBannerProps {
  /** Parent flow: the linked child's player id. Omit for the logged-in player. */
  playerId?: string;
  className?: string;
}

/** "Your coach left — your payment is kept, choose another coach." Renders nothing otherwise. */
const CvCoachReassignmentBanner = ({ playerId, className }: CvCoachReassignmentBannerProps) => {
  const { data: myCv } = useGetMyPlayerCvQuery(undefined, { skip: Boolean(playerId) });
  const { data: childCv } = useGetPlayerCvByIdQuery(playerId ?? "", { skip: !playerId });
  const cv = (playerId ? childCv?.data : myCv?.data) as CvLike | undefined;

  if (!needsCoachReassignment(cv)) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <p className="text-sm font-semibold text-white">
          Your coach is no longer with an academy. Your payment is kept. Choose a new coach.
        </p>
      </div>
      <RequestCvValidationButton
        mode="reassign"
        playerId={playerId}
        className="h-auto w-full shrink-0 px-5 py-2.5 sm:w-auto"
      />
    </div>
  );
};

export default CvCoachReassignmentBanner;
