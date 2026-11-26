"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getDashboardPathForRole, getUserRole, normalizeRole } from "@/helpers/SessionHelper";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { apiSlice } from "@/redux/features/api/apiSlice";
import TagTypes from "@/constants/tagType.constant";

/**
 * Stripe return for `type=CV_VALIDATION`. The payment is confirmed by the Stripe webhook, so no
 * verify call is made here: show the result and refresh the CV, whose revalidation state
 * (AWAITING_COACH / CHOOSE_NEW_COACH / …) drives what the player sees next.
 */
const CvValidationPaymentResult = ({ playerId }: { sessionId?: string; playerId?: string }) => {
  const dispatch = useAppDispatch();
  const role = useMemo(() => normalizeRole(getUserRole() || ""), []);
  const dashboardPath = useMemo(() => getDashboardPathForRole(role), [role]);
  // Where the CV validation card / "choose a new coach" banner lives for this role.
  const cvPath = role === "parent" ? "/dashboard/parent/profiles" : "/dashboard/player/my-cv";

  // The webhook may land a moment after the redirect: refresh now and once more shortly after.
  useEffect(() => {
    const refresh = () => dispatch(apiSlice.util.invalidateTags([TagTypes.PLAYERS]));
    refresh();
    const timer = setTimeout(refresh, 4000);
    return () => clearTimeout(timer);
  }, [dispatch, playerId]);

  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D0D0D]/70 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-6 text-center">
        <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-primary">
          <IconCheck className="size-10" stroke={3} />
        </div>
        <h1 className="text-2xl font-black uppercase font-orbitron">Payment received</h1>
        <p className="text-sm text-muted-foreground">
          Your coach has been notified. It can take a few seconds for your CV to show the new status.
        </p>

        <div className="flex w-full flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={cvPath}>View my CV</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={dashboardPath}>Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CvValidationPaymentResult;
