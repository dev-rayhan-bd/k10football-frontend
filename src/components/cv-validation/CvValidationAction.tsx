"use client";

import { IconAlertTriangle, IconClock, IconRosetteDiscountCheck } from "@tabler/icons-react";
import { useGetMyPlayerCvQuery, useGetPlayerCvByIdQuery } from "@/redux/features/player/playerApi";
import type { ICvRevalidation } from "@/types/cvValidation.type";
import { cn } from "@/lib/utils";
import RequestCvValidationButton from "./RequestCvValidationButton";

type CvLike = {
  revalidation?: ICvRevalidation | null;
  tierStatus?: {
    revalidationState?: string;
    validationValidUntil?: string | null;
  } | null;
  coachVerification?: {
    isActive?: boolean;
    coachName?: string;
    validUntil?: string | null;
    needsCoachReassignment?: boolean;
  } | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/** revalidation.state, falling back to the tierStatus mirror. */
export const getRevalidationState = (cv?: CvLike | null) =>
  String(cv?.revalidation?.state || cv?.tierStatus?.revalidationState || "").toUpperCase();

interface CvValidationActionProps {
  /** Parent flow: the linked child's player id. Omit for the logged-in player. */
  playerId?: string;
  className?: string;
  buttonClassName?: string;
  /** Hide the inline CHOOSE_NEW_COACH notice when the page already shows CvCoachReassignmentBanner. */
  hideReassignNotice?: boolean;
}

/**
 * CV validation status + action, rendered purely from data.revalidation.state of the CV
 * (GET /players/me/cv, or /players/:id/cv for a parent's child).
 */
const CvValidationAction = ({ playerId, className, buttonClassName, hideReassignNotice }: CvValidationActionProps) => {
  const { data: myCv, isLoading: isMyLoading } = useGetMyPlayerCvQuery(undefined, { skip: Boolean(playerId) });
  const { data: childCv, isLoading: isChildLoading } = useGetPlayerCvByIdQuery(playerId ?? "", { skip: !playerId });
  const cv = (playerId ? childCv?.data : myCv?.data) as CvLike | undefined;
  const isLoading = playerId ? isChildLoading : isMyLoading;

  if (isLoading && !cv) {
    return <div className={cn("h-11 w-full animate-pulse rounded-xl bg-white/5", className)} />;
  }

  const state = getRevalidationState(cv) || "NOT_VALIDATED";
  const verification = cv?.coachVerification ?? undefined;
  const coachName = verification?.coachName || null;
  const validUntil = formatDate(
    cv?.revalidation?.validUntil ?? cv?.tierStatus?.validationValidUntil ?? verification?.validUntil
  );

  const seal = verification?.isActive && coachName && (
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
      <IconRosetteDiscountCheck className="size-4 shrink-0" />
      <span className="truncate">Officially verified by {coachName}</span>
    </div>
  );

  const button = (label: string, mode: "request" | "reassign" = "request") => (
    <RequestCvValidationButton playerId={playerId} mode={mode} label={label} className={buttonClassName} />
  );

  let body: React.ReactNode;
  switch (state) {
    case "VALID":
      body = (
        <>
          {validUntil && <p className="text-xs font-bold text-white/70">Valid until {validUntil}</p>}
          {button("Request Re-validation ($24)")}
        </>
      );
      break;
    case "EXPIRED":
      body = (
        <>
          <p className="text-xs font-black uppercase tracking-wider text-destructive">Validation expired</p>
          {button("Request Re-validation ($24)")}
        </>
      );
      break;
    case "PAYMENT_PENDING":
      body = (
        <>
          <p className="text-xs font-bold text-amber-400">Payment pending</p>
          {button("Complete payment")}
        </>
      );
      break;
    case "AWAITING_COACH":
      body = (
        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground",
            buttonClassName
          )}
          aria-disabled
        >
          <IconClock className="size-4 shrink-0" />
          <span className="truncate">Waiting for {coachName || "your coach"} to validate</span>
        </div>
      );
      break;
    case "CHOOSE_NEW_COACH":
      body = (
        <>
          {!hideReassignNotice && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
              Your coach is no longer with an academy. Your payment is kept. Choose a new coach.
            </div>
          )}
          {button("Choose new coach", "reassign")}
        </>
      );
      break;
    default: // NOT_VALIDATED (or unknown)
      body = button("Request Validation ($24)");
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {seal}
      {body}
    </div>
  );
};

export default CvValidationAction;
