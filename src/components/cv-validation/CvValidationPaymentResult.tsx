"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { IconAlertCircle, IconCheck, IconLoader2, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getApiError, useLazyVerifyCvValidationPaymentQuery } from "@/redux/features/cvValidation/cvValidationApi";
import { getDashboardPathForRole, getUserRole, normalizeRole } from "@/helpers/SessionHelper";

/**
 * Stripe return for `type=CV_VALIDATION`: confirms the $24 payment with the server.
 * Verifying twice is safe, so "Check again" just repeats the same call.
 */
const CvValidationPaymentResult = ({ sessionId }: { sessionId: string }) => {
  const [verify, { data, isFetching, isError, error }] = useLazyVerifyCvValidationPaymentQuery();
  const startedRef = useRef(false);

  const role = useMemo(() => normalizeRole(getUserRole() || ""), []);
  const dashboardPath = useMemo(() => getDashboardPathForRole(role), [role]);
  // Where the "choose another coach" banner lives for this role.
  const cvPath = role === "parent" ? "/dashboard/parent/profiles" : "/dashboard/player/my-cv";

  const runVerify = useCallback(() => {
    if (sessionId) verify(sessionId, false);
  }, [sessionId, verify]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runVerify();
  }, [runVerify]);

  const isPaid = !isFetching && !isError && data?.data?.success === true;
  const needsNewCoach = isPaid && data?.data?.needsCoachReassignment === true;
  const errorMessage = isError ? getApiError(error, "We couldn't confirm your payment.").message : "";

  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D0D0D]/70 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col items-center gap-6 text-center">
        {!sessionId ? (
          <>
            <IconAlertCircle className="size-12 text-destructive" />
            <p className="text-sm text-muted-foreground">Missing payment reference. Please return to your dashboard.</p>
          </>
        ) : isFetching ? (
          <>
            <IconLoader2 className="size-12 animate-spin text-primary" />
            <h1 className="text-2xl font-black uppercase font-orbitron">Verifying payment...</h1>
          </>
        ) : needsNewCoach ? (
          <>
            <IconAlertCircle className="size-12 text-amber-400" />
            <h1 className="text-2xl font-black uppercase font-orbitron">Payment received</h1>
            <p className="text-sm text-muted-foreground">
              Your coach is no longer with an academy. Your payment is kept — choose another coach.
            </p>
            <Button asChild className="w-full">
              <Link href={cvPath}>Choose another coach</Link>
            </Button>
          </>
        ) : isPaid ? (
          <>
            <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-primary">
              <IconCheck className="size-10" stroke={3} />
            </div>
            <h1 className="text-2xl font-black uppercase font-orbitron">Payment received</h1>
            <p className="text-sm text-muted-foreground">Your coach has been notified.</p>
          </>
        ) : (
          <>
            <IconAlertCircle className="size-12 text-destructive" />
            <h1 className="text-2xl font-black uppercase font-orbitron">Payment not completed yet</h1>
            <p className="text-sm text-muted-foreground">
              {errorMessage || "Stripe hasn't confirmed the payment yet. This can take a few moments."}
            </p>
            <Button type="button" onClick={runVerify} className="gap-2">
              <IconRefresh className="size-4" /> Check again
            </Button>
          </>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href={dashboardPath}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default CvValidationPaymentResult;
