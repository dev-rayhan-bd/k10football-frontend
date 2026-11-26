"use client";

import { useState } from "react";
import { IconBuildingStadium, IconCheck, IconLoader2, IconMailOpened, IconMapPin, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ChatAvatar from "@/components/chat/ChatAvatar";
import {
  useGetMyAcademyAffiliationsQuery,
  useRespondAcademyCoachAffiliationMutation,
} from "@/redux/features/academy/academyApi";
import { getApiError } from "@/redux/features/cvValidation/cvValidationApi";
import type { ICoachAffiliation } from "@/types/academy.type";
import { cn } from "@/lib/utils";

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const isPendingInvitation = (a: ICoachAffiliation) =>
  String(a.status).toUpperCase() === "PENDING" && a.requestedBy === "ACADEMY";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  PENDING: { label: "Request pending", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  REJECTED: { label: "Declined", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  REMOVED: { label: "Removed", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

interface CoachAcademyInvitationsProps {
  /** Dashboard widget: render only pending invitations, and nothing at all when there are none. */
  compact?: boolean;
}

/**
 * Academy invitations for the logged-in coach (GET /academies/coaches/my-affiliations).
 * Accepting makes the coach an approved, academy-verified coach of that academy.
 */
const CoachAcademyInvitations = ({ compact = false }: CoachAcademyInvitationsProps) => {
  const { data, isLoading, error } = useGetMyAcademyAffiliationsQuery();
  const [respond] = useRespondAcademyCoachAffiliationMutation();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const affiliations = Array.isArray(data?.data) ? data.data : [];
  const invitations = affiliations.filter(isPendingInvitation);
  const history = affiliations.filter((a) => !isPendingInvitation(a));

  const handleRespond = async (affiliation: ICoachAffiliation, action: "APPROVE" | "REJECT") => {
    if (busyKey) return;
    const academyName = affiliation.academyId?.name || "the academy";
    setBusyKey(`${action}:${affiliation._id}`);
    try {
      await respond({ affiliationId: affiliation._id, action }).unwrap();
      toast.success(
        action === "APPROVE" ? `You're now an approved coach of ${academyName}` : `Invitation from ${academyName} declined`
      );
    } catch (err) {
      const { status, message } = getApiError(err, "Failed to respond to the invitation");
      if (status !== 401) toast.error(message);
    } finally {
      setBusyKey(null);
    }
  };

  if (compact && (isLoading || invitations.length === 0)) return null;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconMailOpened className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-orbitron text-xl font-black uppercase tracking-tight text-white">
            Academy invitations
          </h2>
          <p className="text-xs text-muted-foreground">
            Accept an invitation to become an academy-verified coach and validate player CVs.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{getApiError(error, "Failed to load your invitations").message}</p>
      ) : invitations.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-white/2 p-6 text-center text-sm text-muted-foreground">
          No pending invitations.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {invitations.map((invitation) => {
            const academy = invitation.academyId;
            const location = [academy?.city, academy?.country].filter(Boolean).join(", ");
            const busy = busyKey?.endsWith(invitation._id);
            return (
              <div
                key={invitation._id}
                className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center"
              >
                <ChatAvatar src={academy?.logo} name={academy?.name || "Academy"} className="size-12" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-sm font-bold text-white">
                    {academy?.name || "An academy"} invited you as{" "}
                    <span className="text-primary">{invitation.role || "Coach"}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {location && (
                      <span className="flex items-center gap-1">
                        <IconMapPin className="size-3.5" /> {location}
                      </span>
                    )}
                    {formatDate(invitation.createdAt) && <span>{formatDate(invitation.createdAt)}</span>}
                  </div>
                  {invitation.requestMessage && (
                    <p className="mt-1 text-xs italic text-white/70">“{invitation.requestMessage}”</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(busyKey)}
                    onClick={() => handleRespond(invitation, "REJECT")}
                    className="gap-1.5"
                  >
                    {busyKey === `REJECT:${invitation._id}` ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconX className="size-4" />
                    )}
                    Decline
                  </Button>
                  <Button
                    type="button"
                    disabled={Boolean(busyKey)}
                    onClick={() => handleRespond(invitation, "APPROVE")}
                    className={cn("gap-1.5", busy && "opacity-80")}
                  >
                    {busyKey === `APPROVE:${invitation._id}` ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconCheck className="size-4" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!compact && history.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            My academies
          </span>
          {history.map((affiliation) => {
            const style = STATUS_STYLES[String(affiliation.status).toUpperCase()] ?? {
              label: String(affiliation.status || "—"),
              className: "border-white/15 bg-white/5 text-white/60",
            };
            return (
              <div
                key={affiliation._id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/2 p-3"
              >
                {affiliation.academyId?.logo ? (
                  <ChatAvatar src={affiliation.academyId.logo} name={affiliation.academyId.name || "Academy"} className="size-9" />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
                    <IconBuildingStadium className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{affiliation.academyId?.name || "Academy"}</p>
                  <p className="truncate text-xs text-muted-foreground">{affiliation.role || "Coach"}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                    style.className
                  )}
                >
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachAcademyInvitations;
