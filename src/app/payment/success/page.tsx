"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCheck, IconReceipt, IconCreditCard } from "@tabler/icons-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { apiSlice } from "@/redux/features/api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import CvValidationPaymentResult from "@/components/cv-validation/CvValidationPaymentResult";
import { EventPaymentSuccess } from "@/components/extra-events/public/EventPaymentResult";

// Academy fee checkouts. The Stripe webhook confirms the payment and updates the invoice, so no
// verify call is made here: show the receipt and refresh the fee data.
const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Read once: the stored invoice details are cleared right after.
  const [invoiceNumber] = useState(() => {
    const fromParam = searchParams.get("invoiceNumber") || searchParams.get("invoice_number");
    if (fromParam) return fromParam;
    if (typeof window === "undefined") return null;
    return localStorage.getItem("last_fee_invoice_number");
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("last_fee_session_id");
      localStorage.removeItem("last_fee_invoice_id");
      localStorage.removeItem("last_fee_invoice_number");
    }
    // The webhook may land a moment after the redirect: refresh now and once more shortly after.
    const refresh = () => dispatch(apiSlice.util.invalidateTags([TagTypes.FEES, TagTypes.PARENTS, TagTypes.DASHBOARD]));
    refresh();
    const timer = setTimeout(refresh, 4000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-40 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col items-center gap-8 relative z-10 py-10">
        <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Success Header */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <IconCheck size={44} stroke={3} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-orbitron tracking-tight">
                Payment <span className="text-emerald-400 italic">Successful!</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-2 max-w-md">
                Thank you! Your academy fee payment was received. Your invoices update automatically in a few seconds.
              </p>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#0D0D0D]/70 border border-white/10 rounded-3xl p-6 sm:p-8 w-full flex flex-col gap-6 shadow-2xl backdrop-blur-md">
            {invoiceNumber && (
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                <IconReceipt className="size-5 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Invoice Reference
                  </span>
                  <span className="text-base sm:text-lg font-black text-white font-orbitron">{invoiceNumber}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Payment Gateway</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <IconCreditCard size={14} className="text-primary" /> Stripe Checkout
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status</span>
                <span className="text-emerald-400 font-bold uppercase font-orbitron">Received</span>
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-wrap gap-4 justify-center w-full">
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 px-6">
              <Link href="/dashboard/parent/fees" className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <IconReceipt size={16} /> Fees & Payments
              </Link>
            </Button>
            <Button
              asChild
              className="bg-[#E31B23] hover:bg-[#C2181F] text-white font-orbitron font-bold text-xs uppercase tracking-wider px-8 shadow-lg shadow-[#E31B23]/20"
            >
              <Link href="/dashboard/parent">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccessSkeleton = () => (
  <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-4">
    <div className="bg-[#0D0D0D]/60 border border-white/10 rounded-3xl p-10 max-w-md w-full flex flex-col items-center gap-4">
      <Skeleton className="size-20 rounded-full bg-white/10" />
      <Skeleton className="h-6 w-48 bg-white/10" />
      <Skeleton className="h-4 w-64 bg-white/5" />
    </div>
  </div>
);

// CV validation checkouts return here with `type=CV_VALIDATION`, event registrations with
// `type=EXTRA_EVENT` / `TOURNAMENT_CLUB`; everything else is an academy fee.
const PaymentSuccessRouter = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  // Event registrations (individual / tournament club): the webhook confirms; no verify call here.
  if (type === "EXTRA_EVENT" || type === "TOURNAMENT_CLUB") {
    return <EventPaymentSuccess eventId={searchParams.get("eventId") || ""} kind={type} />;
  }
  if (type === "CV_VALIDATION") {
    return <CvValidationPaymentResult
        sessionId={searchParams.get("session_id") || ""}
        playerId={searchParams.get("playerId") || undefined}
      />;
  }
  return <PaymentSuccessContent />;
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessRouter />
    </Suspense>
  );
}

