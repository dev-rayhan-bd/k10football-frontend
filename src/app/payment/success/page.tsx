"use client";

import React, { useEffect, useRef, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconArrowLeft,
  IconReceipt,
  IconCreditCard,
} from "@tabler/icons-react";
import { useLazyVerifyFeePaymentQuery } from "@/redux/features/parent/parentApi";
import CvValidationPaymentResult from "@/components/cv-validation/CvValidationPaymentResult";

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const hasInitiatedRef = useRef(false);

  const sessionId = useMemo(() => {
    const fromParam = searchParams.get("session_id") || searchParams.get("sessionId");
    if (fromParam) return fromParam;
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_fee_session_id") || "";
    }
    return "";
  }, [searchParams]);

  const invoiceId = useMemo(() => {
    const fromParam = searchParams.get("invoiceId") || searchParams.get("invoice_id");
    if (fromParam) return fromParam;
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_fee_invoice_id") || "";
    }
    return "";
  }, [searchParams]);

  const [verifyFeePayment, { data: verifyResponse, isLoading, isSuccess, isError, error }] =
    useLazyVerifyFeePaymentQuery();

  useEffect(() => {
    if (hasInitiatedRef.current) return;

    if (!sessionId && !invoiceId) {
      hasInitiatedRef.current = true;
      return;
    }

    hasInitiatedRef.current = true;

    verifyFeePayment({ session_id: sessionId, invoiceId })
      .unwrap()
      .then(() => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("last_fee_session_id");
          localStorage.removeItem("last_fee_invoice_id");
          localStorage.removeItem("last_fee_invoice_number");
        }
      })
      .catch(() => {});
  }, [sessionId, invoiceId, verifyFeePayment]);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const invoiceData = verifyResponse?.data as any;
  const displayInvoiceNumber =
    invoiceData?.invoiceNumber ||
    (typeof window !== "undefined" ? localStorage.getItem("last_fee_invoice_number") : null) ||
    "ACADEMY-INVOICE";
  const displayAmount = invoiceData?.amountFormatted || (invoiceData?.amount ? `$${invoiceData.amount.toFixed(2)}` : null);

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-40 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col items-center gap-8 relative z-10 py-10">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 rounded-3xl p-10 sm:p-14 w-full flex flex-col items-center justify-center gap-6 shadow-2xl backdrop-blur-md text-center">
            <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(227,27,35,0.25)]">
              <IconLoader2 size={36} className="animate-spin" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-orbitron tracking-tight">
                Verifying Payment...
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Please wait while we confirm your Stripe fee payment with the academy.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 rounded-3xl p-8 sm:p-12 w-full flex flex-col items-center justify-center gap-6 shadow-2xl backdrop-blur-md text-center">
            <div className="size-20 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center text-destructive shadow-[0_0_30px_rgba(239,68,68,0.25)]">
              <IconAlertCircle size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-orbitron tracking-tight">
                Verification Note
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(error as any)?.data?.message ||
                  "Your transaction was received, but payment confirmation is still pending. You can check your updated invoices in your dashboard."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Link href="/dashboard/parent/fees" className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <IconArrowLeft size={16} /> Return to Fees
                </Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-orbitron font-bold text-xs uppercase tracking-wider">
                <Link href="/dashboard/parent">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && (isSuccess || (!isError && Boolean(verifyResponse))) && (
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
                  Thank you! Your academy fee payment has been confirmed and updated in your account.
                </p>
              </div>
            </div>

            {/* Receipt Card */}
            <div className="bg-[#0D0D0D]/70 border border-white/10 rounded-3xl p-6 sm:p-8 w-full flex flex-col gap-6 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <IconReceipt className="size-5 text-primary" />
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Invoice Reference
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-orbitron">
                      {displayInvoiceNumber}
                    </span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-orbitron font-bold text-xs">
                  PAID
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Payment Gateway
                  </span>
                  <span className="text-white font-medium flex items-center gap-1.5">
                    <IconCreditCard size={14} className="text-primary" /> Stripe Checkout
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Status
                  </span>
                  <span className="text-emerald-400 font-bold uppercase font-orbitron">
                    Confirmed
                  </span>
                </div>
              </div>

              {displayAmount && (
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-xs uppercase font-bold text-muted-foreground font-orbitron">
                    Amount Paid
                  </span>
                  <span className="text-2xl font-black text-white font-orbitron">
                    {displayAmount}
                  </span>
                </div>
              )}
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
        )}
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

// CV validation checkouts return here with `type=CV_VALIDATION`; everything else is an academy fee.
const PaymentSuccessRouter = () => {
  const searchParams = useSearchParams();
  if (searchParams.get("type") === "CV_VALIDATION") {
    return <CvValidationPaymentResult sessionId={searchParams.get("session_id") || ""} />;
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

